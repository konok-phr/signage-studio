# Self-Hosted Digital Signage Setup Guide

Complete guide to deploy the digital signage application on your own VPS with local PostgreSQL.

## Prerequisites

- VPS with Ubuntu 22.04+ (or similar Linux distribution)
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Nginx (recommended for reverse proxy)
- Domain name (optional, for HTTPS)

---

## 1. Server Preparation

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

---

## 2. Database Setup

### Create Database User and Database

```bash
sudo -u postgres psql
```

```sql
-- In psql
CREATE USER signage_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE signage_db OWNER signage_user;
GRANT ALL PRIVILEGES ON DATABASE signage_db TO signage_user;
\q
```

### Run Schema Setup

```bash
# Copy the complete setup script from docs/query.md
sudo -u postgres psql -d signage_db -f /path/to/setup.sql
```

Or run manually:

```bash
sudo -u postgres psql -d signage_db
```

Then paste the complete setup script from `docs/query.md`.

---

## 3. Application Setup

### Clone Repository

```bash
cd /opt
git clone https://github.com/your-repo/digital-signage.git
cd digital-signage
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit `.env` with your settings:

```env
# Backend Provider Options
DATABASE_PROVIDER=postgres
AUTH_PROVIDER=local
STORAGE_PROVIDER=local

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=signage_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DATABASE=signage_db

# JWT Configuration
JWT_SECRET=your-very-long-secret-key-at-least-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Storage Configuration
STORAGE_PATH=./uploads
STORAGE_URL=https://your-domain.com/uploads

# Application
PORT=3000
NODE_ENV=production
APP_URL=https://your-domain.com
```

### Create Upload Directory

```bash
mkdir -p uploads/images uploads/videos
chmod -R 755 uploads
```

### Build Application

```bash
npm run build
```

---

## 4. Process Manager (PM2)

### Install PM2

```bash
npm install -g pm2
```

### Start Application

```bash
pm2 start npm --name "signage" -- start
pm2 save
pm2 startup
```

### Monitor

```bash
pm2 status
pm2 logs signage
```

---

## 5. Nginx Configuration

### Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/signage
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static files (uploads)
    location /uploads {
        alias /opt/digital-signage/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/signage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

### Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## 7. Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 8. Backup Strategy

### Database Backup Script

Create `/opt/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="signage_db_${TIMESTAMP}.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U signage_user signage_db | gzip > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${FILENAME}"
```

### Media Backup Script

Create `/opt/scripts/backup-media.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/media"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="media_${TIMESTAMP}.tar.gz"

mkdir -p $BACKUP_DIR

tar -czf "${BACKUP_DIR}/${FILENAME}" -C /opt/digital-signage uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Media backup completed: ${FILENAME}"
```

### Schedule Backups (Cron)

```bash
crontab -e
```

Add:

```cron
# Database backup daily at 2 AM
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1

# Media backup daily at 3 AM
0 3 * * * /opt/scripts/backup-media.sh >> /var/log/backup-media.log 2>&1

# Clean expired sessions daily at 4 AM
0 4 * * * psql -U signage_user -d signage_db -c "SELECT public.cleanup_expired_sessions();"
```

---

## 9. Monitoring

### Basic Health Check Script

Create `/opt/scripts/health-check.sh`:

```bash
#!/bin/bash

# Check if app is running
if ! pm2 show signage > /dev/null 2>&1; then
    echo "App is down, restarting..."
    pm2 restart signage
fi

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down, restarting..."
    sudo systemctl restart nginx
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "PostgreSQL is down, restarting..."
    sudo systemctl restart postgresql
fi
```

Add to cron (every 5 minutes):

```cron
*/5 * * * * /opt/scripts/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## 10. S3-Compatible Storage (Optional)

If you prefer S3-compatible storage (MinIO):

### Install MinIO

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Create data directory
sudo mkdir -p /data/minio
```

### Run MinIO

```bash
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=your_password minio server /data/minio --console-address ":9001"
```

### Update .env for S3

```env
STORAGE_PROVIDER=s3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=admin
S3_SECRET_KEY=your_password
S3_BUCKET=signage-media
S3_REGION=us-east-1
```

---

## 11. Docker Deployment (Alternative)

See `docker-compose.yml` for containerized deployment:

```bash
docker-compose up -d
```

---

## Troubleshooting

### App Won't Start

```bash
pm2 logs signage --lines 50
```

### Database Connection Failed

```bash
# Test connection
psql -h localhost -U signage_user -d signage_db

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Permission Issues

```bash
# Fix upload directory permissions
sudo chown -R www-data:www-data /opt/digital-signage/uploads
chmod -R 755 /opt/digital-signage/uploads
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Security Checklist

- [ ] Strong database password
- [ ] JWT secret at least 32 characters
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] PostgreSQL only listening on localhost
- [ ] Nginx security headers configured
- [ ] Rate limiting on API endpoints
- [ ] Regular security updates

---

## Performance Tips

1. **Database**: Add connection pooling with PgBouncer for high traffic
2. **Caching**: Add Redis for session caching
3. **CDN**: Use CloudFlare for static assets
4. **Images**: Implement image optimization/resizing
5. **Monitoring**: Set up Prometheus + Grafana for metrics
