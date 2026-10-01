# School ERP Setup Guide

## Quick Start (5 Minutes)

### Prerequisites Check
```bash
node --version   # Should be 18+
pnpm --version   # Or npm/yarn
psql --version   # PostgreSQL 14+
```

### Step 1: Database Setup

**Option A: Local PostgreSQL**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Create database
psql -U postgres
CREATE DATABASE edu_erp;
\q
```

**Option B: Docker**
```bash
docker run --name edu-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=edu_erp \
  -p 5432:5432 \
  -d postgres:14
```

### Step 2: Project Setup
```bash
# Navigate to project
cd ~/Desktop/projects/edu

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### Step 3: Database Migration & Seed
```bash
# Run migrations
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### Step 4: Start Development Server
```bash
pnpm dev
```

Visit: **http://localhost:3000**

### Default Login
```
Email: admin@school.com
Password: admin123
```

## Detailed Setup

### Environment Variables

Edit `.env`:
```env
# Database - Update with your credentials
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/edu_erp?schema=public"

# NextAuth - Generate a secure secret
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Commands

```bash
# View database in browser
pnpm db:studio

# Create migration
pnpm db:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Re-seed database
pnpm db:seed
```

### Production Deployment

#### Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Deploy!

#### VPS/Server

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

**Using PM2**
```bash
npm install -g pm2
pm2 start npm --name "edu-erp" -- start
pm2 save
pm2 startup
```

### Database Backup

```bash
# Backup
pg_dump edu_erp > backup.sql

# Restore
psql edu_erp < backup.sql
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error
1. Verify PostgreSQL is running
2. Check credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### Prisma Errors
```bash
# Regenerate client
npx prisma generate

# Reset and re-migrate
npx prisma migrate reset
pnpm db:seed
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Production Checklist

- [ ] Change default admin password
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Setup SSL/HTTPS
- [ ] Configure proper database backups
- [ ] Setup error monitoring (Sentry)
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Setup CDN for static assets
- [ ] Enable database connection pooling
- [ ] Configure rate limiting
- [ ] Setup monitoring (New Relic/DataDog)
- [ ] Document custom configurations
- [ ] Setup automated backups
- [ ] Configure log rotation

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│   Next.js   │ (App Router)
│   Server    │
└──────┬──────┘
       │
       ├─────► Prisma ORM
       │           │
       │           ▼
       │    ┌──────────────┐
       │    │ PostgreSQL   │
       │    │  Database    │
       │    └──────────────┘
       │
       └─────► NextAuth.js
               (Authentication)
```

## Support

- Documentation: [README.md](README.md)
- Issues: GitHub Issues
- Email: support@school-erp.com

## License

MIT License - See LICENSE file
