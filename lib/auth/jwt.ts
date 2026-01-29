import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-minimum-32-characters-long'
);

const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
  userId: string;
  email?: string;
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 86400; // default 1 day in seconds

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 86400;
  }
}

/**
 * Create an access token
 */
export async function createToken(payload: TokenPayload): Promise<string> {
  const expirySeconds = parseExpiry(ACCESS_TOKEN_EXPIRY);
  
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expirySeconds}s`)
    .sign(JWT_SECRET);
}

/**
 * Create a refresh token
 */
export async function createRefreshToken(payload: { userId: string }): Promise<string> {
  const expirySeconds = parseExpiry(REFRESH_TOKEN_EXPIRY);
  
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expirySeconds}s`)
    .sign(JWT_SECRET);
}

/**
 * Verify an access token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'refresh') {
      return null;
    }
    return {
      userId: payload.userId as string,
    };
  } catch {
    return null;
  }
}
