# Environment Variables Setup

Copy the following content to `.env.local` in your project root:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_PROVIDER=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DATABASE=signage_db
POSTGRES_SSL=false

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# FILE STORAGE
# ============================================
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads
STORAGE_URL=http://localhost:3000/uploads
STORAGE_MAX_FILE_SIZE=104857600

# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Setup Commands

```bash
# 1. Create PostgreSQL database
createdb signage_db

# 2. Create database user
psql -c "CREATE USER signage_user WITH PASSWORD 'your_secure_password_here';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE signage_db TO signage_user;"

# 3. Run database schema
psql -U signage_user -d signage_db -f docs/query.sql

# 4. Create uploads directory
mkdir -p uploads

# 5. Generate JWT secret
openssl rand -base64 32

# 6. Install dependencies and run
npm install
npm run dev
```

## Production Settings

For production, update these values:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
STORAGE_URL=https://your-domain.com/uploads
JWT_SECRET=<use openssl rand -base64 32>
POSTGRES_SSL=true
```
