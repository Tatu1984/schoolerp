# Quick Start Guide

Get your School ERP system up and running in 5 minutes!

## Prerequisites

Make sure you have these installed:
- Node.js 18+ or pnpm
- PostgreSQL 14+
- Git

## Step-by-Step Setup

### 1. Navigate to Project Directory
```bash
cd /Users/sudipto/Desktop/projects/edu
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Setup PostgreSQL Database

**Option A: Create database locally**
```bash
psql -U postgres
CREATE DATABASE edu_erp;
\q
```

**Option B: Use Docker**
```bash
docker run --name edu-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=edu_erp \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Configure Environment Variables

The `.env` file already exists. Update the DATABASE_URL if needed:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/edu_erp?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret key:
```bash
openssl rand -base64 32
```

### 5. Setup Database Schema

Push the schema to your database:
```bash
npx prisma db push
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 6. (Optional) Seed Sample Data

Create initial data:
```bash
pnpm db:seed
# or
node prisma/seed.js
```

### 7. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at: **http://localhost:3000**

## Default Login Credentials

```
Email: admin@school.com
Password: admin123
```

⚠️ **Important**: Change these credentials in production!

## What's Available

Once logged in, you can access:

### Core Administration
- `/dashboard/school-setup` - Configure school
- `/dashboard/branches` - Manage branches
- `/dashboard/academic-years` - Academic years
- `/dashboard/classes` - Classes
- `/dashboard/sections` - Sections
- `/dashboard/subjects` - Subjects
- `/dashboard/roles` - Roles & permissions

### Student Management
- `/dashboard/students` - All students
- `/dashboard/students/add` - Add student
- `/dashboard/students/promotions` - Bulk promotions
- `/dashboard/students/bulk` - CSV upload

### LMS (Learning Management)
- `/dashboard/lms/courses` - Courses
- `/dashboard/lms/assignments` - Assignments
- `/dashboard/lms/examinations` - Exams
- `/dashboard/lms/report-cards` - Report cards

### Communication
- `/dashboard/communication/announcements` - Announcements
- `/dashboard/communication/messages` - Messages
- `/dashboard/communication/events` - Events

### Finance
- `/dashboard/finance/fees` - Fee structure
- `/dashboard/finance/collection` - Fee collection
- `/dashboard/finance/expenses` - Expenses

### Staff (HRMS)
- `/dashboard/staff` - Staff list
- `/dashboard/staff/attendance` - Attendance
- `/dashboard/staff/leave` - Leave management

### Transport
- `/dashboard/transport/routes` - Routes
- `/dashboard/transport/vehicles` - Vehicles
- `/dashboard/transport/tracking` - GPS tracking

### Hostel
- `/dashboard/hostel/list` - Hostels
- `/dashboard/hostel/rooms` - Rooms
- `/dashboard/hostel/occupancy` - Occupancy

### Library
- `/dashboard/library/books` - Books catalog
- `/dashboard/library/issue` - Issue/Return

### Inventory
- `/dashboard/inventory/assets` - Assets
- `/dashboard/inventory/purchase-orders` - Purchase orders
- `/dashboard/inventory/vendors` - Vendors

### Canteen & Wallet
- `/dashboard/canteen/menu` - Menu management
- `/dashboard/canteen/orders` - Orders
- `/dashboard/canteen/wallet` - Smart wallet

### Marketplace
- `/dashboard/marketplace/products` - Products
- `/dashboard/marketplace/orders` - Orders

### Analytics
- `/dashboard/analytics/overview` - Analytics dashboard
- `/dashboard/analytics/students` - Student analytics
- `/dashboard/analytics/finance` - Financial analytics

### Security
- `/dashboard/security/audit-logs` - Audit trail
- `/dashboard/security/backup` - Data backups

## Troubleshooting

### Database Connection Error
1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo service postgresql start
   ```

2. Check your DATABASE_URL in `.env`

3. Verify the database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Prisma Errors
```bash
# Reset and regenerate
npx prisma generate
npx prisma db push --force-reset
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Next Steps

1. **Create a School**: Go to School Setup and create your first school
2. **Add Academic Year**: Set up the current academic year
3. **Create Classes**: Define your class structure
4. **Add Students**: Start adding student records
5. **Configure Roles**: Set up custom roles for staff
6. **Explore Modules**: Check out all the features!

## Useful Commands

```bash
# View database in browser
pnpm db:studio

# Create a migration
pnpm db:migrate

# Build for production
pnpm build

# Start production server
pnpm start
```

## Documentation

- Full feature list: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Setup guide: [SETUP.md](SETUP.md)
- API docs: [app/api/mobile/README.md](app/api/mobile/README.md)

## Need Help?

- Check the [README.md](README.md) for detailed information
- Review [SETUP.md](SETUP.md) for troubleshooting
- See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for complete feature list

---

**Happy Managing! 🎓**
