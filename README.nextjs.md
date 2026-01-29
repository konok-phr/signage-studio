# Next.js Self-Hosted Digital Signage

This is the Next.js version of the Digital Signage Builder, designed for self-hosted deployment with local PostgreSQL, JWT authentication, and filesystem storage.

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 14+
- (Optional) Redis for session caching
- (Optional) MinIO for S3-compatible storage

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Set Up Environment

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=signage_db

# JWT Authentication
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

# File Storage
STORAGE_PATH=./uploads
STORAGE_URL=http://localhost:3000/uploads
STORAGE_MAX_FILE_SIZE=104857600

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up Database

Run the database schema from `docs/query.md`:

```bash
psql -U postgres -f docs/query.sql
```

Or execute the SQL manually in your PostgreSQL client.

### 4. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project CRUD endpoints
│   │   └── upload/        # File upload endpoints
│   ├── auth/              # Auth page
│   ├── display/[id]/      # Public display player
│   ├── editor/            # Signage editor
│   ├── projects/          # Project management
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Utilities and adapters
│   ├── auth/              # JWT, password hashing
│   └── database/          # PostgreSQL adapter
├── types/                 # TypeScript definitions
├── uploads/               # Local file storage
├── docs/                  # Documentation
│   ├── query.md           # Database schema
│   └── SELF_HOSTED_SETUP.md
└── middleware.ts          # Route protection
```

## API Routes

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in with email/password |
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/logout` | Sign out and clear session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/[id]` | Get single project |
| PATCH | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| GET | `/api/projects/published/[id]` | Get published project (public) |
| GET | `/api/projects/by-code/[code]` | Get project by publish code (public) |
| GET | `/api/projects/check-code` | Check if publish code is unique |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file |
| GET | `/api/upload/[...path]` | List files or check existence |
| DELETE | `/api/upload/[...path]` | Delete file |

## Production Deployment

### Using Docker

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables for Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Use strong JWT secret
JWT_SECRET=<generate with: openssl rand -base64 32>

# Use external PostgreSQL
POSTGRES_HOST=your-db-host.com
POSTGRES_SSL=true

# Use external storage (optional)
STORAGE_URL=https://cdn.your-domain.com/uploads
```

## Security Considerations

1. **JWT Secret**: Generate a strong secret for production
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Consider adding rate limiting middleware
5. **File Validation**: All uploads are validated for type and size

## Migrating from Lovable Cloud

1. Export your database from Lovable Cloud
2. Run the schema on your local PostgreSQL
3. Import the data
4. Update the display URLs if needed
5. Transfer media files to your storage

## License

MIT
