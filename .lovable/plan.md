

# Self-Hosted Digital Signage Builder with Configurable Backend

## Overview
Transform the current Lovable Cloud-based digital signage application into a self-hosted solution that can run on your own VPS with local PostgreSQL, with the option to migrate to Next.js and make all backend integrations configurable via environment variables.

## Important Considerations

This is a **major architectural change** that involves:
1. Replacing Supabase-specific features (Auth, Storage, RLS) with generic alternatives
2. Creating abstraction layers for database and authentication
3. Optionally migrating from Vite/React to Next.js
4. Creating comprehensive documentation and SQL files

---

## Phase 1: Database Schema Export (query.md)

Create a `query.md` file with all PostgreSQL queries needed to set up your local database:

```text
Contents will include:
- signage_projects table creation
- Indexes for performance
- Functions for public project access
- Trigger for updated_at timestamp
- User authentication table (if not using external auth)
```

**Key SQL Components:**
- Main `signage_projects` table with JSONB elements storage
- `users` table for authentication (replacing Supabase Auth)
- `sessions` table for session management
- Helper functions like `get_published_project_by_id`

---

## Phase 2: Abstraction Layer Architecture

Create a provider-agnostic architecture with three backend options:

```text
+---------------------+
|    Environment      |
|    Variables        |
+----------+----------+
           |
           v
+----------+----------+
|   Backend Adapter   |
|     Interface       |
+----------+----------+
           |
     +-----+-----+
     |     |     |
     v     v     v
+------+ +------+ +--------+
|Supa- | |Local | |Custom  |
|base  | |PG    | |API     |
+------+ +------+ +--------+
```

### New Files to Create:

1. **`src/lib/config.ts`** - Environment configuration
   ```
   DATABASE_PROVIDER: 'supabase' | 'postgres' | 'custom'
   AUTH_PROVIDER: 'supabase' | 'local' | 'custom'
   STORAGE_PROVIDER: 'supabase' | 'local' | 's3'
   ```

2. **`src/lib/database/index.ts`** - Database abstraction
3. **`src/lib/database/supabase.ts`** - Supabase implementation
4. **`src/lib/database/postgres.ts`** - Direct PostgreSQL (pg library)
5. **`src/lib/auth/index.ts`** - Auth abstraction
6. **`src/lib/auth/local.ts`** - JWT-based local auth
7. **`src/lib/storage/index.ts`** - Storage abstraction
8. **`src/lib/storage/local.ts`** - Local filesystem storage

---

## Phase 3: Local PostgreSQL Implementation

### Authentication (Without Supabase)
- JWT-based authentication with bcrypt password hashing
- Session management with refresh tokens
- Replace `supabase.auth.signIn()` with custom login endpoint

### Database Access
- Use `pg` or `postgres` npm package for direct connections
- Implement connection pooling
- Create typed query helpers matching current Supabase patterns

### File Storage
- Local filesystem storage with Express static serving
- Or S3-compatible storage (MinIO for self-hosted)
- API endpoints for upload/download

---

## Phase 4: Environment Configuration

**New `.env.example` file:**
```
# Backend Provider Options
DATABASE_PROVIDER=postgres    # supabase | postgres
AUTH_PROVIDER=local           # supabase | local
STORAGE_PROVIDER=local        # supabase | local | s3

# PostgreSQL (when DATABASE_PROVIDER=postgres)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=signage_db

# JWT (when AUTH_PROVIDER=local)
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Storage (when STORAGE_PROVIDER=local)
STORAGE_PATH=./uploads
STORAGE_URL=http://localhost:3000/uploads

# Storage (when STORAGE_PROVIDER=s3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=signage-media

# Supabase (when using Supabase providers)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

---

## Phase 5: Next.js Migration (Optional)

If you want to migrate to Next.js, this involves:

### Changes Required:
1. **Routing**: React Router to Next.js App Router
2. **Build System**: Vite to Next.js
3. **API Routes**: Create `/api/*` endpoints for backend
4. **SSR**: Server-side rendering for Display page (SEO)
5. **Environment**: Different env var patterns

### File Structure (Next.js):
```
app/
├── layout.tsx
├── page.tsx                 # Landing (Index)
├── auth/page.tsx            # Login/Signup
├── admin/page.tsx           # Editor
├── projects/page.tsx        # Project list
├── display/[id]/page.tsx    # Public display
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── logout/route.ts
│   ├── projects/
│   │   ├── route.ts         # CRUD
│   │   └── [id]/route.ts
│   └── upload/route.ts
```

### Migration Effort:
- Most React components remain unchanged
- Hooks need minor adjustments
- Add API routes for backend operations
- Update imports and routing

---

## Phase 6: Deliverables

### Files to Generate:

1. **`docs/query.md`** - Complete PostgreSQL setup queries
2. **`docs/SELF_HOSTED_SETUP.md`** - VPS deployment guide
3. **`.env.example`** - All configuration options
4. **`docker-compose.yml`** - Optional containerized deployment

### query.md Contents:
```sql
-- 1. Create database and user
-- 2. Users table (for local auth)
-- 3. Sessions table (for JWT refresh)
-- 4. signage_projects table
-- 5. Indexes
-- 6. Functions (get_published_project_by_id, etc.)
-- 7. Triggers (updated_at)
```

---

## Technical Details

### Current Supabase Dependencies:
| Feature | Current | Self-Hosted Alternative |
|---------|---------|------------------------|
| Database | Supabase PostgreSQL | Local PostgreSQL |
| Auth | Supabase Auth | JWT + bcrypt |
| Storage | Supabase Storage | Local FS / MinIO |
| RLS | Supabase RLS | Application-level checks |
| Realtime | Not used | N/A |

### Required npm Packages (Self-Hosted):
```
pg                  # PostgreSQL client
bcryptjs            # Password hashing
jsonwebtoken        # JWT handling
multer              # File uploads (if Express)
```

### For Next.js:
```
next
@vercel/postgres    # Optional: Vercel Postgres
next-auth           # Optional: NextAuth.js
```

---

## Recommendation

Given the scope of this request, I recommend a **phased approach**:

1. **Phase A** (Immediate): Generate `query.md` with full database schema
2. **Phase B** (Short-term): Create abstraction layers for configurable backends
3. **Phase C** (Medium-term): Implement local PostgreSQL + JWT auth
4. **Phase D** (Optional): Migrate to Next.js if needed

**My suggestion**: Start with Phase A (the query.md file) since that's immediately useful for understanding and setting up your database. Then we can tackle the abstraction layers incrementally.

Would you like me to proceed with generating the complete `query.md` file with all PostgreSQL queries first, or would you prefer to start with the full abstraction layer implementation?

