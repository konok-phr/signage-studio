# Next.js Migration Guide

This guide explains how to migrate from the Lovable Cloud (Vite + React + Supabase) version to the self-hosted Next.js version.

## Overview

The Next.js version provides:
- **Local PostgreSQL** instead of Supabase Database
- **JWT Authentication** instead of Supabase Auth
- **Local File Storage** instead of Supabase Storage
- **Server-Side Rendering** for better SEO
- **API Routes** for secure backend operations

## File Mapping

### Configuration Files

| Vite Version | Next.js Version |
|--------------|-----------------|
| `vite.config.ts` | `next.config.js` |
| `tsconfig.json` | `tsconfig.nextjs.json` → `tsconfig.json` |
| `tailwind.config.ts` | `tailwind.config.nextjs.js` → `tailwind.config.js` |
| `package.json` | `package.nextjs.json` → `package.json` |
| `.env` | `.env.local` |

### Pages

| Vite Route | Next.js Route | File |
|------------|---------------|------|
| `/` | `/` | `app/page.tsx` |
| `/auth` | `/auth` | `app/auth/page.tsx` |
| `/admin` | `/editor` | `app/editor/page.tsx` |
| `/projects` | `/projects` | `app/projects/page.tsx` |
| `/display/:id` | `/display/[id]` | `app/display/[id]/page.tsx` |

### API Routes (New in Next.js)

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/login` | User login |
| `/api/auth/register` | User registration |
| `/api/auth/logout` | User logout |
| `/api/auth/me` | Get current user |
| `/api/auth/refresh` | Refresh JWT tokens |
| `/api/projects` | List/create projects |
| `/api/projects/[id]` | Get/update/delete project |
| `/api/projects/published/[id]` | Public project access |
| `/api/projects/by-code/[code]` | Public project by code |
| `/api/upload` | File upload |

## Migration Steps

### Step 1: Prepare Your Environment

1. Set up PostgreSQL database:
   ```bash
   createdb signage_db
   psql signage_db < docs/query.sql
   ```

2. Create upload directory:
   ```bash
   mkdir -p uploads
   ```

### Step 2: Install Next.js Dependencies

Rename the package file and install:
```bash
cp package.nextjs.json package.json
npm install
```

### Step 3: Configure Environment

Create `.env.local`:
```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=signage_db

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

# Storage
STORAGE_PATH=./uploads
STORAGE_URL=http://localhost:3000/uploads

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Rename Configuration Files

```bash
# Backup Vite configs
mv tsconfig.json tsconfig.vite.json
mv tailwind.config.ts tailwind.config.vite.ts

# Use Next.js configs
mv tsconfig.nextjs.json tsconfig.json
mv tailwind.config.nextjs.js tailwind.config.js
```

### Step 5: Copy Components

The existing React components can be reused with minimal changes:

1. Copy `src/components/ui/*` to `components/ui/`
2. Copy `src/components/signage/*` to `components/signage/`
3. Update imports from `@/src/...` to `@/...`

### Step 6: Migrate Hooks

The hooks need to be updated to use the new API routes:

```typescript
// Old (Supabase)
const { data } = await supabase.from('signage_projects').select();

// New (API Route)
const response = await fetch('/api/projects');
const data = await response.json();
```

### Step 7: Update Auth Usage

```typescript
// Old (useAuth with Supabase)
import { useAuth } from '@/hooks/useAuth';
const { signIn } = useAuth();
await signIn(email, password);

// New (useAuth with API routes)
import { useAuth } from '@/lib/auth/auth-context';
const { signIn } = useAuth();
await signIn(email, password);
```

### Step 8: Update Storage Usage

```typescript
// Old (Supabase Storage)
const { data } = await supabase.storage
  .from('signage-media')
  .upload(path, file);

// New (API Route)
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
const { url } = await response.json();
```

### Step 9: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to verify the migration.

## Data Migration

### Export from Lovable Cloud

1. Contact Lovable support or use the Supabase dashboard to export your data
2. Export the `signage_projects` table as SQL or CSV

### Import to Local PostgreSQL

```bash
# If you have SQL dump
psql signage_db < exported_data.sql

# If you have CSV
psql signage_db -c "\copy signage_projects FROM 'projects.csv' WITH CSV HEADER"
```

### Migrate Media Files

1. Download all files from Supabase Storage
2. Place them in the `uploads/` directory
3. Update URLs in the database if needed

## Troubleshooting

### "Module not found" errors

Make sure all imports use the correct paths:
```typescript
// Use
import { Button } from '@/components/ui/button';
// Not
import { Button } from '@/src/components/ui/button';
```

### Database connection errors

1. Check PostgreSQL is running
2. Verify credentials in `.env.local`
3. Ensure the database exists

### JWT errors

1. Make sure `JWT_SECRET` is at least 32 characters
2. Clear browser cookies and try again

### File upload errors

1. Check `uploads/` directory exists and is writable
2. Verify `STORAGE_URL` matches your server URL

## Keeping Both Versions

You can keep both Vite and Next.js versions in the same repository:

- Vite files: `src/`, `vite.config.ts`, `tsconfig.json`
- Next.js files: `app/`, `lib/`, `next.config.js`, `tsconfig.nextjs.json`

Use different scripts:
```json
{
  "scripts": {
    "dev:vite": "vite",
    "dev:next": "next dev",
    "build:vite": "vite build",
    "build:next": "next build"
  }
}
```
