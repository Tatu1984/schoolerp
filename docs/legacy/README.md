# School ERP System

A complete School Management System built with Next.js, PostgreSQL, Prisma, and TailwindCSS.

## Features

### Core Administration
- ✅ School Setup & Configuration
- ✅ Multi-branch Management
- ✅ Academic Year Management
- ✅ Class & Section Management
- ✅ Subject Management
- ✅ Role-based Access Control

### Student Management
- ✅ Complete Student Profiles
- ✅ Multiple Guardian Support
- ✅ Sibling Mapping
- ✅ Bulk Student Upload
- ✅ Class Promotions
- ✅ Custom Fields Support

### Admissions
- ✅ Inquiry Management
- ✅ Prospect Tracking
- ✅ Entrance Test Scheduling
- ✅ Interview Management
- ✅ Application Processing
- ✅ Approval Workflows

### Staff Management
- ✅ Employee Records
- ✅ Department Management
- ✅ Attendance Tracking
- ✅ Leave Management

### Transport Management
- ✅ Route Management
- ✅ Stop Configuration
- ✅ Vehicle Management
- ✅ Driver Database
- ✅ Student Transport Assignment

### Hostel Management
- ✅ Hostel/Building Setup
- ✅ Floor & Room Management
- ✅ Bed Allocation
- ✅ Mess Plans
- ✅ Occupancy Tracking

### Library Management
- ✅ Book Cataloging (ISBN/Barcode)
- ✅ Issue & Return System
- ✅ Overdue Tracking
- ✅ Fine Management
- ✅ Digital Resources

### Inventory & Assets
- ✅ Purchase Orders
- ✅ Vendor Management
- ✅ Asset Tracking
- ✅ Stock Management

### Finance & Accounts
- ✅ Fee Structure Setup
- ✅ Fee Collection
- ✅ Multiple Payment Modes
- ✅ Receipt Generation
- ✅ Expense Tracking
- ✅ Financial Reports

## Tech Stack

- **Frontend**: Next.js 15, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: Lucide React Icons
- **Forms**: React Hook Form
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ or pnpm
- PostgreSQL 14+
- Git

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd edu
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup PostgreSQL Database**
```bash
# Create a new PostgreSQL database
createdb edu_erp

# Or using psql
psql -U postgres
CREATE DATABASE edu_erp;
\q
```

4. **Configure Environment Variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/edu_erp?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Run Database Migrations**
```bash
npx prisma migrate dev --name init
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

7. **Seed Database (Optional)**
```bash
node prisma/seed.js
```

8. **Start Development Server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The system includes the following main models:

- **School** - Main school entity
- **Branch** - Multiple branches per school
- **AcademicYear** - Academic session management
- **Class & Section** - Class hierarchy
- **Subject** - Subject management
- **Student** - Student records with guardians
- **Staff** - Staff management
- **Admission** - Admission workflow
- **Route, Vehicle** - Transport management
- **Hostel, HostelRoom, HostelBed** - Hostel management
- **Library, Book, LibraryIssue** - Library system
- **Fee, FeePayment** - Finance management
- **PurchaseOrder, Asset** - Inventory management

## Project Structure

```
edu/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/           # Authentication
│   └── layout.js        # Root layout
├── components/          # Reusable components
├── lib/                # Utilities
│   ├── prisma.js       # Prisma client
│   └── auth.js         # Auth configuration
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static assets
```

## Usage

### Default Login
```
Email: admin@school.com
Password: admin123
```

*Note: Change these credentials in production*

### Common Tasks

**Add a new student:**
1. Go to Students → Add Student
2. Fill in required information
3. Add guardian details
4. Assign class and section
5. Save

**Create fee structure:**
1. Go to Finance → Fees
2. Add fee types (Tuition, Transport, etc.)
3. Set amounts and frequency
4. Activate fees

**Setup transport:**
1. Go to Transport → Routes
2. Create routes with stops
3. Add vehicles
4. Assign students to routes

## API Endpoints

### Schools
- `GET /api/schools` - List all schools
- `POST /api/schools` - Create school
- `PUT /api/schools/[id]` - Update school
- `DELETE /api/schools/[id]` - Delete school

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

*See code for complete API documentation*

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t school-erp .
docker run -p 3000:3000 school-erp
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens

## Performance

- Server-side rendering with Next.js
- Database indexing on key fields
- Optimized queries with Prisma
- Lazy loading of components
- Image optimization

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@school-erp.com or create an issue in the repository.

## 🎉 Project Status: COMPLETE!

All core features and modules have been fully implemented! See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for details.

## ✅ Completed Features

- ✅ Learning Management System (LMS)
- ✅ Online Examination System
- ✅ Parent Portal & Mobile App APIs
- ✅ Advanced Analytics Dashboard
- ✅ Report Card Generation
- ✅ Canteen Management with Smart Wallet
- ✅ Events & Calendar
- ✅ Marketplace Module
- ✅ Security & Audit Logging
- ✅ HRMS with Attendance & Leave Management
- ✅ Transport Safety with GPS Tracking

## 📋 Additional Features Implemented

- Staff attendance and leave management
- Payroll system
- GPS tracking for transport
- Smart wallet for canteen
- Marketplace for uniforms and supplies
- Comprehensive analytics
- Audit logs and compliance
- Mobile app API endpoints

## Acknowledgments

- Next.js Team
- Prisma Team
- TailwindCSS Team
- All contributors
