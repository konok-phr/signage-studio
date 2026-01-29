import { Pool, PoolClient } from 'pg';

// Database connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'signage_user',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DATABASE || 'signage_db',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.POSTGRES_POOL_MIN || '2', 10),
  max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
});

// User types
interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserData {
  id: string;
  email: string;
  password_hash: string;
}

// Session types
interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

// Project types
interface SignageProject {
  id: string;
  user_id: string;
  name: string;
  ratio: string;
  canvas_width: number;
  canvas_height: number;
  elements: unknown[];
  is_published: boolean;
  publish_code: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateProjectData {
  id?: string;
  user_id: string;
  name?: string;
  ratio?: string;
  canvas_width?: number;
  canvas_height?: number;
  elements?: unknown[];
}

interface UpdateProjectData {
  name?: string;
  ratio?: string;
  canvas_width?: number;
  canvas_height?: number;
  elements?: unknown[];
  is_published?: boolean;
  publish_code?: string | null;
  published_at?: string | null;
}

// Database operations
export const db = {
  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (id, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.id, data.email, data.password_hash]
    );
    return result.rows[0];
  },

  // Session operations
  async createSession(userId: string, refreshToken: string): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const result = await pool.query<Session>(
      `INSERT INTO sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, refreshToken, expiresAt.toISOString()]
    );
    return result.rows[0];
  },

  async getSessionByToken(refreshToken: string): Promise<Session | null> {
    const result = await pool.query<Session>(
      `SELECT * FROM sessions 
       WHERE refresh_token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );
    return result.rows[0] || null;
  },

  async deleteSession(refreshToken: string): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
  },

  async deleteExpiredSessions(): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  },

  // Project operations
  async getProjectsByUser(userId: string): Promise<SignageProject[]> {
    const result = await pool.query<SignageProject>(
      `SELECT * FROM signage_projects 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getProjectById(id: string, userId: string): Promise<SignageProject | null> {
    const result = await pool.query<SignageProject>(
      `SELECT * FROM signage_projects 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async createProject(data: CreateProjectData): Promise<SignageProject> {
    const result = await pool.query<SignageProject>(
      `INSERT INTO signage_projects (id, user_id, name, ratio, canvas_width, canvas_height, elements)
       VALUES (
         COALESCE($1, gen_random_uuid()),
         $2,
         COALESCE($3, 'Untitled Project'),
         COALESCE($4, '16:9'),
         COALESCE($5, 1920),
         COALESCE($6, 1080),
         COALESCE($7, '[]'::jsonb)
       )
       RETURNING *`,
      [
        data.id || null,
        data.user_id,
        data.name,
        data.ratio,
        data.canvas_width,
        data.canvas_height,
        JSON.stringify(data.elements || []),
      ]
    );
    return result.rows[0];
  },

  async updateProject(id: string, userId: string, data: UpdateProjectData): Promise<SignageProject | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.ratio !== undefined) {
      fields.push(`ratio = $${paramIndex++}`);
      values.push(data.ratio);
    }
    if (data.canvas_width !== undefined) {
      fields.push(`canvas_width = $${paramIndex++}`);
      values.push(data.canvas_width);
    }
    if (data.canvas_height !== undefined) {
      fields.push(`canvas_height = $${paramIndex++}`);
      values.push(data.canvas_height);
    }
    if (data.elements !== undefined) {
      fields.push(`elements = $${paramIndex++}`);
      values.push(JSON.stringify(data.elements));
    }
    if (data.is_published !== undefined) {
      fields.push(`is_published = $${paramIndex++}`);
      values.push(data.is_published);
    }
    if (data.publish_code !== undefined) {
      fields.push(`publish_code = $${paramIndex++}`);
      values.push(data.publish_code);
    }
    if (data.published_at !== undefined) {
      fields.push(`published_at = $${paramIndex++}`);
      values.push(data.published_at);
    }

    if (fields.length === 0) {
      return this.getProjectById(id, userId);
    }

    values.push(id, userId);

    const result = await pool.query<SignageProject>(
      `UPDATE signage_projects 
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM signage_projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  // Public project access (no auth required)
  async getPublishedProjectById(id: string): Promise<SignageProject | null> {
    const result = await pool.query<SignageProject>(
      `SELECT id, name, ratio, canvas_width, canvas_height, elements, 
              is_published, publish_code, published_at
       FROM signage_projects 
       WHERE id = $1 AND is_published = true`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getPublishedProjectByCode(code: string): Promise<SignageProject | null> {
    const result = await pool.query<SignageProject>(
      `SELECT id, name, ratio, canvas_width, canvas_height, elements, 
              is_published, publish_code, published_at
       FROM signage_projects 
       WHERE UPPER(publish_code) = UPPER($1) AND is_published = true`,
      [code]
    );
    return result.rows[0] || null;
  },

  async isPublishCodeUnique(code: string, excludeProjectId?: string): Promise<boolean> {
    const query = excludeProjectId
      ? 'SELECT 1 FROM signage_projects WHERE UPPER(publish_code) = UPPER($1) AND id != $2'
      : 'SELECT 1 FROM signage_projects WHERE UPPER(publish_code) = UPPER($1)';
    
    const params = excludeProjectId ? [code, excludeProjectId] : [code];
    const result = await pool.query(query, params);
    return result.rows.length === 0;
  },

  // Utility
  async query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
    const result = await pool.query(text, params);
    return result.rows as T[];
  },

  async getClient(): Promise<PoolClient> {
    return pool.connect();
  },

  async end(): Promise<void> {
    await pool.end();
  },
};

export default db;
