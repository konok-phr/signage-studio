/**
 * Environment-based configuration for backend providers
 * 
 * This allows switching between Supabase (cloud) and local (self-hosted) providers
 * via environment variables without changing application code.
 */

export type DatabaseProvider = 'supabase' | 'postgres';
export type AuthProvider = 'supabase' | 'local';
export type StorageProvider = 'supabase' | 'local' | 's3';

interface AppConfig {
  database: {
    provider: DatabaseProvider;
    postgres?: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
      ssl: boolean;
    };
  };
  auth: {
    provider: AuthProvider;
    jwt?: {
      secret: string;
      expiresIn: string;
      refreshExpiresIn: string;
    };
  };
  storage: {
    provider: StorageProvider;
    local?: {
      path: string;
      url: string;
      maxFileSize: number;
    };
    s3?: {
      endpoint: string;
      accessKey: string;
      secretKey: string;
      bucket: string;
      region: string;
      useSsl: boolean;
    };
  };
  app: {
    url: string;
    port: number;
    env: 'development' | 'production';
  };
}

// Helper to get env vars with fallback
const getEnv = (key: string, fallback: string = ''): string => {
  // Support both Vite (VITE_) and standard env vars
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || import.meta.env[`VITE_${key}`] || fallback;
  }
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || process.env[`VITE_${key}`] || fallback;
  }
  return fallback;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = getEnv(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = getEnv(key).toLowerCase();
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return fallback;
};

// Build configuration from environment
export const config: AppConfig = {
  database: {
    provider: (getEnv('DATABASE_PROVIDER', 'supabase') as DatabaseProvider),
    postgres: {
      host: getEnv('POSTGRES_HOST', 'localhost'),
      port: getEnvNumber('POSTGRES_PORT', 5432),
      user: getEnv('POSTGRES_USER', 'signage_user'),
      password: getEnv('POSTGRES_PASSWORD', ''),
      database: getEnv('POSTGRES_DATABASE', 'signage_db'),
      ssl: getEnvBoolean('POSTGRES_SSL', false),
    },
  },
  auth: {
    provider: (getEnv('AUTH_PROVIDER', 'supabase') as AuthProvider),
    jwt: {
      secret: getEnv('JWT_SECRET', ''),
      expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
      refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
    },
  },
  storage: {
    provider: (getEnv('STORAGE_PROVIDER', 'supabase') as StorageProvider),
    local: {
      path: getEnv('STORAGE_PATH', './uploads'),
      url: getEnv('STORAGE_URL', 'http://localhost:3000/uploads'),
      maxFileSize: getEnvNumber('STORAGE_MAX_FILE_SIZE', 104857600), // 100MB
    },
    s3: {
      endpoint: getEnv('S3_ENDPOINT', 'http://localhost:9000'),
      accessKey: getEnv('S3_ACCESS_KEY', ''),
      secretKey: getEnv('S3_SECRET_KEY', ''),
      bucket: getEnv('S3_BUCKET', 'signage-media'),
      region: getEnv('S3_REGION', 'us-east-1'),
      useSsl: getEnvBoolean('S3_USE_SSL', false),
    },
  },
  app: {
    url: getEnv('APP_URL', 'http://localhost:3000'),
    port: getEnvNumber('PORT', 3000),
    env: (getEnv('NODE_ENV', 'development') as 'development' | 'production'),
  },
};

// Helper to check which provider is active
export const isSupabase = {
  database: () => config.database.provider === 'supabase',
  auth: () => config.auth.provider === 'supabase',
  storage: () => config.storage.provider === 'supabase',
};

export const isLocal = {
  database: () => config.database.provider === 'postgres',
  auth: () => config.auth.provider === 'local',
  storage: () => config.storage.provider === 'local' || config.storage.provider === 's3',
};

export default config;
