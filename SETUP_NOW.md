# Setup Instructions - Start Here!

## Prerequisites

Make sure PostgreSQL is installed and running on your system.

### Check if PostgreSQL is running:

**macOS:**
```bash
brew services list | grep postgresql
# If not running:
brew services start postgresql@14
```

**Linux:**
```bash
sudo service postgresql status
# If not running:
sudo service postgresql start
```

**Windows:**
Check Services app for "postgresql" service

---

## Quick Setup (5 Steps)

### Step 1: Update Database Credentials

Edit the `.env` file in the project root with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/edu_erp?schema=public"
NEXTAUTH_SECRET="dev-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

Replace:
- `postgres` with your PostgreSQL username
- `yourpassword` with your PostgreSQL password

### Step 2: Create Database

Open terminal and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE edu_erp;

# Exit
\q
```

**Or use the createdb command:**
```bash
createdb edu_erp
```

### Step 3: Push Schema to Database

```bash
cd /Users/sudipto/Desktop/projects/edu
npx prisma db push
```

This will create all 50+ tables in your database.

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Seed Initial Data

```bash
pnpm db:seed
```

This creates:
- Demo school
- Admin user (admin@school.com / admin123)
- Academic year
- 12 classes
- Sample sections
- Sample subjects

---

## Start the Application

```bash
pnpm dev
```

Visit: **http://localhost:3000**

---

## Login Credentials

```
Email: admin@school.com
Password: admin123
```

---

## Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify database exists: `psql -U postgres -l`

### Issue: "Module not found"

**Solution:**
```bash
# Restart dev server (Ctrl+C then)
pnpm dev
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

---

## What's Next?

Once logged in:

1. **Create a new school** at `/dashboard/school-setup`
2. **Add academic year** at `/dashboard/academic-years`
3. **Create classes** at `/dashboard/classes`
4. **Add students** at `/dashboard/students/add`
5. **Explore all features** - see IMPLEMENTATION_SUMMARY.md

---

## Database Management

### View database in browser:
```bash
pnpm db:studio
```

### Reset database (WARNING: Deletes all data):
```bash
npx prisma migrate reset
pnpm db:seed
```

### Backup database:
```bash
pg_dump edu_erp > backup.sql
```

---

## Need Help?

- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for complete feature list
- Check [QUICK_START.md](QUICK_START.md) for detailed guide
- All API endpoints: [app/api/mobile/README.md](app/api/mobile/README.md)

---

**Ready to go! 🚀**
