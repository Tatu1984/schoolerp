const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  ShadingType,
  VerticalAlign,
  TableOfContents,
  StyleLevel,
} = require("docx");
const fs = require("fs");

// Helper function to create styled heading
function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

// Helper function to create normal paragraph
function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: options.size || 24,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
    spacing: { after: 120 },
    alignment: options.alignment || AlignmentType.LEFT,
  });
}

// Helper function to create bullet point
function createBullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text: text, size: 22 })],
    bullet: { level: level },
    spacing: { after: 80 },
  });
}

// Helper function to create a styled table
function createTable(headers, rows, widths = null) {
  const defaultWidth = Math.floor(100 / headers.length);
  const columnWidths = widths || headers.map(() => defaultWidth);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (header, i) =>
            new TableCell({
              width: { size: columnWidths[i], type: WidthType.PERCENTAGE },
              shading: { fill: "1a56db", type: ShadingType.SOLID },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                      color: "FFFFFF",
                      size: 22,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell, i) =>
                new TableCell({
                  width: { size: columnWidths[i], type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20 })],
                      spacing: { before: 50, after: 50 },
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                })
            ),
          })
      ),
    ],
  });
}

// Helper for sub-section heading
function createSubHeading(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26,
        color: "1a56db",
      }),
    ],
    spacing: { before: 300, after: 150 },
  });
}

// Create the document
const doc = new Document({
  creator: "School ERP Development Team",
  title: "School ERP System - Statement of Work",
  description: "Comprehensive Statement of Work for School ERP System",
  styles: {
    paragraphStyles: [
      {
        id: "Normal",
        name: "Normal",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 24 },
        paragraph: { spacing: { after: 120 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "School ERP System - Statement of Work",
                  italics: true,
                  size: 18,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Confidential | Page ",
                  size: 18,
                  color: "666666",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                }),
                new TextRun({
                  text: " of ",
                  size: 18,
                  color: "666666",
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 18,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        // ==================== COVER PAGE ====================
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "STATEMENT OF WORK",
              bold: true,
              size: 72,
              color: "1a56db",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "School ERP System",
              bold: true,
              size: 56,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Comprehensive School Management Platform",
              italics: true,
              size: 28,
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 1500 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Version 1.0",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "CONFIDENTIAL",
              bold: true,
              size: 20,
              color: "FF0000",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),

        // Page break
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== TABLE OF CONTENTS ====================
        createHeading("Table of Contents", HeadingLevel.HEADING_1),
        new Paragraph({ spacing: { before: 200 } }),
        createParagraph("1. Executive Summary"),
        createParagraph("2. Feature List"),
        createParagraph("3. Technology Stack"),
        createParagraph("4. Data Flow Diagram"),
        createParagraph("5. Software Architecture"),
        createParagraph("6. Plan of Action (Phase-wise Development)"),
        createParagraph("7. Required Team Setup"),
        createParagraph("8. Timeline"),
        createParagraph("9. API Documentation"),
        createParagraph("10. Database Schema"),
        createParagraph("11. Appendix"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 1. EXECUTIVE SUMMARY ====================
        createHeading("1. Executive Summary", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System is a comprehensive, enterprise-grade school management platform designed to digitize and streamline all aspects of educational institution operations. This full-stack web application provides a unified solution for managing students, staff, academics, finance, transport, hostel, library, canteen, and more."
        ),
        new Paragraph({ spacing: { before: 200 } }),
        createSubHeading("1.1 Project Overview"),
        createParagraph(
          "This system is built to serve educational institutions ranging from small private schools to large multi-branch school networks. It supports multi-tenancy, allowing different schools to operate independently while sharing the same infrastructure."
        ),
        new Paragraph({ spacing: { before: 200 } }),
        createSubHeading("1.2 Key Highlights"),
        createBullet("Multi-school, multi-branch architecture with centralized management"),
        createBullet("Role-based access control with 13 predefined roles and custom role support"),
        createBullet("60+ database models covering all school operations"),
        createBullet("210+ API endpoints with comprehensive CRUD operations"),
        createBullet("72 dashboard pages for complete administrative control"),
        createBullet("Real-time GPS tracking for transport management"),
        createBullet("Smart wallet system for cashless canteen transactions"),
        createBullet("Complete audit logging for security and compliance"),
        createBullet("Learning Management System (LMS) with assignments and examinations"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 2. FEATURE LIST ====================
        createHeading("2. Feature List", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System comprises 20+ integrated modules covering every aspect of school management:"
        ),

        createSubHeading("2.1 Core Administration"),
        createBullet("Multi-school management with independent configurations"),
        createBullet("Multi-branch support within schools"),
        createBullet("Academic year management with current year tracking"),
        createBullet("Class and section management with capacity limits"),
        createBullet("Subject management with class-wise assignment"),
        createBullet("Custom role and permission management"),

        createSubHeading("2.2 Student Management"),
        createBullet("Complete student profiles with demographics, contact, and medical info"),
        createBullet("Guardian management (primary and secondary)"),
        createBullet("Sibling relationship tracking"),
        createBullet("Photo upload and document management"),
        createBullet("Bulk student upload via CSV"),
        createBullet("Class promotion with bulk operations"),
        createBullet("Custom fields support for school-specific data"),

        createSubHeading("2.3 Admissions Module"),
        createBullet("Full admission funnel: Inquiry → Prospect → Test → Interview → Approval"),
        createBullet("Online application form management"),
        createBullet("Entrance test scheduling and scoring"),
        createBullet("Interview management with notes and feedback"),
        createBullet("Document verification and management"),
        createBullet("Follow-up tracking and notifications"),
        createBullet("Waitlist management"),

        createSubHeading("2.4 Staff & HRMS"),
        createBullet("Complete employee records with qualifications"),
        createBullet("Department and designation management"),
        createBullet("Daily attendance with check-in/check-out"),
        createBullet("Leave management with approval workflow"),
        createBullet("Payroll processing with allowances and deductions"),
        createBullet("Salary payment tracking"),
        createBullet("Bank details and document storage"),

        createSubHeading("2.5 Transport Management"),
        createBullet("Route management with multiple stops and timings"),
        createBullet("Vehicle fleet management with driver assignment"),
        createBullet("Real-time GPS tracking"),
        createBullet("Transport alerts and safety notifications"),
        createBullet("Student assignment to routes/stops"),
        createBullet("Fare management per route/stop"),

        createSubHeading("2.6 Hostel Management"),
        createBullet("Multi-building, multi-floor structure"),
        createBullet("Room and bed allocation"),
        createBullet("Occupancy tracking and reporting"),
        createBullet("Mess plan management"),
        createBullet("Student hostel assignment with dates"),

        createSubHeading("2.7 Library Management"),
        createBullet("Book cataloging with ISBN and barcode"),
        createBullet("Issue and return tracking"),
        createBullet("Overdue monitoring with automatic fine calculation"),
        createBullet("Library reports and statistics"),
        createBullet("Reserved books management"),

        createSubHeading("2.8 Finance Module"),
        createBullet("Flexible fee structure (11 fee types)"),
        createBullet("Fee frequency: one-time, monthly, quarterly, half-yearly, yearly"),
        createBullet("Multiple payment modes: Cash, Cheque, Card, UPI, Net Banking"),
        createBullet("Fee payment tracking with receipt generation"),
        createBullet("Fee due reports and reminders"),
        createBullet("Expense tracking and categorization"),
        createBullet("Financial reports and analytics"),

        createSubHeading("2.9 Learning Management System (LMS)"),
        createBullet("Course management with teacher assignment"),
        createBullet("Assignment creation with due dates and scoring"),
        createBullet("Student submission tracking"),
        createBullet("Online examination system"),
        createBullet("Exam results management"),
        createBullet("Report card generation per term"),
        createBullet("Performance analytics"),

        createSubHeading("2.10 Canteen & Smart Wallet"),
        createBullet("Digital menu management with pricing"),
        createBullet("Student order placement and tracking"),
        createBullet("Smart wallet with balance management"),
        createBullet("Transaction history (credit, debit, refund)"),
        createBullet("Canteen reports and analytics"),

        createSubHeading("2.11 Marketplace"),
        createBullet("Product catalog (uniforms, books, stationery, sports)"),
        createBullet("Online ordering system"),
        createBullet("Order tracking and delivery management"),
        createBullet("Inventory management"),

        createSubHeading("2.12 Communication"),
        createBullet("School announcements with priority levels"),
        createBullet("Event calendar management"),
        createBullet("Direct messaging between users"),
        createBullet("In-app notifications"),
        createBullet("Push notification support"),

        createSubHeading("2.13 Security & Compliance"),
        createBullet("Comprehensive audit logging of all actions"),
        createBullet("Data backup and restore functionality"),
        createBullet("Compliance record tracking"),
        createBullet("User activity monitoring"),
        createBullet("IP address and user-agent logging"),

        createSubHeading("2.14 Inventory & Assets"),
        createBullet("Vendor management with GST details"),
        createBullet("Purchase order workflow with approvals"),
        createBullet("Stock tracking and management"),
        createBullet("Asset tracking by category (Furniture, Equipment, Electronics, etc.)"),

        createSubHeading("2.15 Analytics & Reporting"),
        createBullet("Dashboard with key metrics"),
        createBullet("Student analytics and performance tracking"),
        createBullet("Attendance reports"),
        createBullet("Financial analytics"),
        createBullet("Custom report generation"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 3. TECHNOLOGY STACK ====================
        createHeading("3. Technology Stack", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System is built on modern, industry-standard technologies ensuring scalability, security, and maintainability."
        ),

        createSubHeading("3.1 Frontend Technologies"),
        createTable(
          ["Technology", "Version", "Purpose"],
          [
            ["Next.js", "14.1.0", "React framework for server-side rendering and routing"],
            ["React", "18.3.1", "UI component library"],
            ["TypeScript", "5.3.3", "Type-safe JavaScript development"],
            ["TailwindCSS", "3.4.15", "Utility-first CSS framework"],
            ["Lucide React", "0.400.0", "Icon library"],
            ["React Hook Form", "7.53.2", "Form state management and validation"],
            ["Recharts", "2.12.7", "Data visualization and charts"],
            ["React Hot Toast", "2.6.0", "Toast notifications"],
          ]
        ),

        createSubHeading("3.2 Backend Technologies"),
        createTable(
          ["Technology", "Version", "Purpose"],
          [
            ["Node.js", "18+", "JavaScript runtime"],
            ["Next.js API Routes", "14.1.0", "RESTful API endpoints"],
            ["Prisma ORM", "5.20.0", "Database ORM and migrations"],
            ["NextAuth.js", "4.24.10", "Authentication and session management"],
            ["Bcryptjs", "2.4.3", "Password hashing"],
            ["Zod", "3.23.8", "Schema validation"],
            ["date-fns", "3.0.6", "Date manipulation utilities"],
          ]
        ),

        createSubHeading("3.3 Database"),
        createTable(
          ["Technology", "Purpose"],
          [
            ["PostgreSQL", "Primary relational database"],
            ["Prisma Migrations", "Database schema versioning"],
            ["Database Indexes", "Performance optimization on frequently queried fields"],
          ],
          [50, 50]
        ),

        createSubHeading("3.4 Development & DevOps"),
        createTable(
          ["Technology", "Purpose"],
          [
            ["pnpm", "Package manager"],
            ["ESLint", "Code linting"],
            ["Git", "Version control"],
            ["Vercel", "Deployment platform"],
            ["Docker", "Containerization (optional)"],
          ],
          [50, 50]
        ),

        createSubHeading("3.5 Security"),
        createTable(
          ["Technology", "Purpose"],
          [
            ["JWT Tokens", "Secure session management"],
            ["bcryptjs", "Password hashing with salt"],
            ["CSRF Protection", "NextAuth.js built-in protection"],
            ["SQL Injection Prevention", "Prisma ORM parameterized queries"],
            ["XSS Protection", "Next.js built-in sanitization"],
          ],
          [50, 50]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 4. DATA FLOW DIAGRAM ====================
        createHeading("4. Data Flow Diagram", HeadingLevel.HEADING_1),
        createParagraph(
          "The following diagrams illustrate the data flow within the School ERP System:"
        ),

        createSubHeading("4.1 High-Level System Data Flow"),
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fs.readFileSync("data-flow-diagram.png"),
              transformation: {
                width: 550,
                height: 367,
              },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 100 } }),

        createSubHeading("4.2 Authentication Flow"),
        createBullet("1. User enters credentials on login page"),
        createBullet("2. Credentials sent to /api/auth/callback/credentials"),
        createBullet("3. NextAuth validates credentials against database"),
        createBullet("4. Password verified using bcryptjs"),
        createBullet("5. JWT token generated with user role and school ID"),
        createBullet("6. Session cookie set with 8-hour expiration"),
        createBullet("7. User redirected to role-appropriate dashboard"),

        createSubHeading("4.3 API Request Flow"),
        createBullet("1. Client sends request with session token"),
        createBullet("2. Middleware validates token and extracts user info"),
        createBullet("3. Request headers enriched with x-user-id, x-user-role, x-school-id"),
        createBullet("4. API route handler receives request"),
        createBullet("5. Authorization checked against role permissions"),
        createBullet("6. Zod schema validates request body"),
        createBullet("7. Prisma executes database operations"),
        createBullet("8. Response returned with standardized format"),
        createBullet("9. Audit log entry created for tracking"),

        createSubHeading("4.4 Module Data Flow Example: Admission Process"),
        createBullet("1. Inquiry received and stored in Admission table (status: INQUIRY)"),
        createBullet("2. Prospect converted after initial screening (status: PROSPECT)"),
        createBullet("3. Entrance test scheduled (status: TEST_SCHEDULED)"),
        createBullet("4. Test completed and scores recorded (status: TEST_COMPLETED)"),
        createBullet("5. Interview scheduled for qualified candidates"),
        createBullet("6. Interview completed with notes and feedback"),
        createBullet("7. Admission decision made (APPROVED/REJECTED/WAITLISTED)"),
        createBullet("8. Approved admission creates Student record"),
        createBullet("9. Fee structure assigned and payment initiated"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 5. SOFTWARE ARCHITECTURE ====================
        createHeading("5. Software Architecture", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System follows a modern, scalable architecture designed for enterprise-grade deployments."
        ),

        createSubHeading("5.1 Architecture Overview"),
        createParagraph(
          "The system implements a monolithic architecture using Next.js, combining frontend and backend in a single deployable unit. This approach simplifies deployment while maintaining clear separation of concerns."
        ),

        createSubHeading("5.2 Layer Architecture"),
        createTable(
          ["Layer", "Components", "Responsibility"],
          [
            ["Presentation", "React Components, Pages", "User interface rendering"],
            ["Application", "API Routes, Middleware", "Business logic execution"],
            ["Data Access", "Prisma ORM", "Database operations"],
            ["Database", "PostgreSQL", "Data persistence"],
            ["Security", "NextAuth, Middleware", "Authentication & Authorization"],
          ]
        ),

        createSubHeading("5.3 Directory Structure"),
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fs.readFileSync("directory-structure.png"),
              transformation: {
                width: 450,
                height: 550,
              },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ spacing: { before: 100 } }),

        createSubHeading("5.4 Design Patterns"),
        createBullet("Repository Pattern: Prisma ORM abstracts database operations"),
        createBullet("Middleware Pattern: Request processing pipeline for auth/validation"),
        createBullet("Factory Pattern: Standardized API response generation"),
        createBullet("Strategy Pattern: Role-based permission checking"),
        createBullet("Observer Pattern: Audit logging for all operations"),

        createSubHeading("5.5 Multi-Tenancy Architecture"),
        createParagraph(
          "The system implements row-level multi-tenancy where all data is scoped by schoolId. This ensures:"
        ),
        createBullet("Data isolation between schools"),
        createBullet("Shared infrastructure for cost efficiency"),
        createBullet("Centralized super-admin management"),
        createBullet("School-specific configurations"),

        createSubHeading("5.6 Security Architecture"),
        createTable(
          ["Component", "Implementation", "Purpose"],
          [
            ["Authentication", "NextAuth.js + JWT", "User identity verification"],
            ["Authorization", "Role-based middleware", "Access control"],
            ["Data Isolation", "School-scoped queries", "Multi-tenant security"],
            ["Password Security", "bcrypt (salt: 10)", "Credential protection"],
            ["Session Management", "8-hour JWT tokens", "Secure sessions"],
            ["Audit Trail", "AuditLog model", "Activity tracking"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 6. PLAN OF ACTION ====================
        createHeading("6. Plan of Action (Phase-wise Development)", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System development is organized into distinct phases for structured delivery:"
        ),

        createSubHeading("Phase 1: Foundation & Core Infrastructure"),
        createParagraph("Objective: Establish the technical foundation and core modules", {
          bold: true,
        }),
        createBullet("Project setup with Next.js, TypeScript, and Prisma"),
        createBullet("Database schema design and initial migrations"),
        createBullet("Authentication system with NextAuth.js"),
        createBullet("Role-based authorization middleware"),
        createBullet("UI component library development"),
        createBullet("School and branch management"),
        createBullet("Academic year and class structure"),
        createBullet("Basic dashboard layout"),

        createSubHeading("Phase 2: Student & Staff Management"),
        createParagraph("Objective: Implement core user management modules", { bold: true }),
        createBullet("Student profile management with all fields"),
        createBullet("Guardian and sibling management"),
        createBullet("Bulk student upload functionality"),
        createBullet("Staff management with complete profiles"),
        createBullet("Department and designation setup"),
        createBullet("Staff attendance tracking"),
        createBullet("Leave management workflow"),

        createSubHeading("Phase 3: Admissions & Finance"),
        createParagraph("Objective: Implement admission workflow and financial modules", {
          bold: true,
        }),
        createBullet("Complete admission funnel implementation"),
        createBullet("Entrance test and interview management"),
        createBullet("Fee structure configuration"),
        createBullet("Fee payment processing"),
        createBullet("Expense tracking"),
        createBullet("Financial reports"),
        createBullet("Payroll processing"),

        createSubHeading("Phase 4: Academic & LMS"),
        createParagraph("Objective: Build learning management capabilities", { bold: true }),
        createBullet("Course management"),
        createBullet("Assignment creation and submission"),
        createBullet("Examination system"),
        createBullet("Result management"),
        createBullet("Report card generation"),
        createBullet("Performance analytics"),

        createSubHeading("Phase 5: Facilities Management"),
        createParagraph("Objective: Implement facility management modules", { bold: true }),
        createBullet("Transport route and vehicle management"),
        createBullet("GPS tracking integration"),
        createBullet("Hostel room and bed allocation"),
        createBullet("Library book management"),
        createBullet("Issue/return tracking"),
        createBullet("Inventory and asset management"),

        createSubHeading("Phase 6: Canteen, Marketplace & Communication"),
        createParagraph("Objective: Build engagement and commerce modules", { bold: true }),
        createBullet("Canteen menu management"),
        createBullet("Smart wallet implementation"),
        createBullet("Order processing"),
        createBullet("Marketplace product catalog"),
        createBullet("Announcement system"),
        createBullet("Messaging and notifications"),

        createSubHeading("Phase 7: Security, Analytics & Optimization"),
        createParagraph("Objective: Enhance security and reporting", { bold: true }),
        createBullet("Comprehensive audit logging"),
        createBullet("Compliance tracking"),
        createBullet("Backup and restore"),
        createBullet("Dashboard analytics"),
        createBullet("Performance optimization"),
        createBullet("Security hardening"),

        createSubHeading("Phase 8: Testing, Documentation & Deployment"),
        createParagraph("Objective: Prepare for production deployment", { bold: true }),
        createBullet("Unit and integration testing"),
        createBullet("User acceptance testing"),
        createBullet("Performance testing"),
        createBullet("Security audit"),
        createBullet("Documentation completion"),
        createBullet("Production deployment"),
        createBullet("Training and handover"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 7. REQUIRED TEAM SETUP ====================
        createHeading("7. Required Team Setup", HeadingLevel.HEADING_1),
        createParagraph(
          "The following team structure is recommended for successful project execution:"
        ),

        createSubHeading("7.1 Core Development Team"),
        createTable(
          ["Role", "Count", "Key Responsibilities"],
          [
            [
              "Project Manager",
              "1",
              "Project planning, client communication, milestone tracking",
            ],
            [
              "Technical Lead",
              "1",
              "Architecture decisions, code reviews, technical guidance",
            ],
            [
              "Senior Full-Stack Developer",
              "2",
              "Core feature development, complex integrations",
            ],
            [
              "Full-Stack Developer",
              "3",
              "Module development, API implementation",
            ],
            [
              "Frontend Developer",
              "2",
              "UI/UX implementation, responsive design",
            ],
            ["Database Developer", "1", "Schema design, query optimization, migrations"],
            ["QA Engineer", "2", "Testing, bug tracking, quality assurance"],
            ["DevOps Engineer", "1", "CI/CD, deployment, infrastructure"],
          ]
        ),

        createSubHeading("7.2 Extended Team (As Needed)"),
        createTable(
          ["Role", "Count", "Key Responsibilities"],
          [
            ["UI/UX Designer", "1", "Interface design, user experience"],
            ["Technical Writer", "1", "Documentation, user guides"],
            ["Security Specialist", "1", "Security audits, penetration testing"],
            ["Business Analyst", "1", "Requirements gathering, process mapping"],
          ]
        ),

        createSubHeading("7.3 Team Skill Requirements"),
        new Paragraph({ spacing: { before: 100 } }),
        createParagraph("Technical Lead:", { bold: true }),
        createBullet("5+ years experience with React/Next.js"),
        createBullet("Strong PostgreSQL and Prisma knowledge"),
        createBullet("Experience with enterprise applications"),

        createParagraph("Full-Stack Developers:", { bold: true }),
        createBullet("3+ years React and Node.js experience"),
        createBullet("TypeScript proficiency"),
        createBullet("REST API design experience"),
        createBullet("Database design knowledge"),

        createParagraph("Frontend Developers:", { bold: true }),
        createBullet("3+ years React experience"),
        createBullet("TailwindCSS proficiency"),
        createBullet("Responsive design expertise"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 8. TIMELINE ====================
        createHeading("8. Timeline", HeadingLevel.HEADING_1),
        createParagraph(
          "The following timeline outlines the estimated duration for each development phase:"
        ),

        createSubHeading("8.1 Phase-wise Timeline"),
        createTable(
          ["Phase", "Duration", "Start Week", "End Week"],
          [
            ["Phase 1: Foundation & Core", "4 weeks", "Week 1", "Week 4"],
            ["Phase 2: Student & Staff", "4 weeks", "Week 5", "Week 8"],
            ["Phase 3: Admissions & Finance", "4 weeks", "Week 9", "Week 12"],
            ["Phase 4: Academic & LMS", "3 weeks", "Week 13", "Week 15"],
            ["Phase 5: Facilities", "4 weeks", "Week 16", "Week 19"],
            ["Phase 6: Canteen & Communication", "3 weeks", "Week 20", "Week 22"],
            ["Phase 7: Security & Analytics", "2 weeks", "Week 23", "Week 24"],
            ["Phase 8: Testing & Deployment", "4 weeks", "Week 25", "Week 28"],
          ]
        ),

        createSubHeading("8.2 Total Project Duration"),
        new Paragraph({
          children: [
            new TextRun({ text: "Estimated Total Duration: ", bold: true, size: 26 }),
            new TextRun({ text: "28 weeks (7 months)", size: 26, color: "1a56db" }),
          ],
          spacing: { before: 100, after: 100 },
        }),

        createSubHeading("8.3 Milestone Deliverables"),
        createTable(
          ["Milestone", "Week", "Deliverables"],
          [
            ["M1", "Week 4", "Core infrastructure, authentication, basic admin"],
            ["M2", "Week 8", "Student management, staff management complete"],
            ["M3", "Week 12", "Admissions workflow, finance module complete"],
            ["M4", "Week 15", "LMS with examinations and report cards"],
            ["M5", "Week 19", "Transport, hostel, library modules complete"],
            ["M6", "Week 22", "Canteen, marketplace, communication ready"],
            ["M7", "Week 24", "Security, analytics, optimization complete"],
            ["M8", "Week 28", "Production-ready deployment with documentation"],
          ]
        ),

        createSubHeading("8.4 Post-Launch Support"),
        createBullet("30 days of post-launch bug fixes included"),
        createBullet("Knowledge transfer and documentation handover"),
        createBullet("Optional: Ongoing maintenance and support contract"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 9. API DOCUMENTATION ====================
        createHeading("9. API Documentation", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System exposes 210+ RESTful API endpoints. Below is the comprehensive API structure:"
        ),

        createSubHeading("9.1 API Design Principles"),
        createBullet("RESTful architecture with resource-based URLs"),
        createBullet("JSON request and response format"),
        createBullet("JWT-based authentication via NextAuth"),
        createBullet("Zod schema validation for all inputs"),
        createBullet("Standardized pagination (page, limit, sortBy, sortOrder)"),
        createBullet("Consistent error response format"),

        createSubHeading("9.2 Authentication Endpoints"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["POST", "/api/auth/signin", "User login with credentials"],
            ["POST", "/api/auth/signout", "User logout"],
            ["GET", "/api/auth/session", "Get current session"],
            ["POST", "/api/mobile/auth/login", "Mobile app authentication"],
          ]
        ),

        createSubHeading("9.3 School Administration APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/schools", "List/Create schools"],
            ["GET/PUT/DELETE", "/api/schools/[id]", "School CRUD operations"],
            ["GET/POST", "/api/branches", "Branch management"],
            ["GET/POST", "/api/academic-years", "Academic year management"],
            ["GET/POST", "/api/classes", "Class management"],
            ["GET/POST", "/api/sections", "Section management"],
            ["GET/POST", "/api/subjects", "Subject management"],
            ["GET/POST", "/api/roles", "Role and permission management"],
          ]
        ),

        createSubHeading("9.4 Student Management APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/students", "List/Create students"],
            ["GET/PUT/DELETE", "/api/students/[id]", "Student CRUD operations"],
            ["POST", "/api/students/bulk-upload", "Bulk CSV import"],
            ["POST", "/api/students/bulk-promote", "Class promotion"],
            ["GET/POST", "/api/guardians", "Guardian management"],
          ]
        ),

        createSubHeading("9.5 Admissions APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/admissions", "Admission records"],
            ["GET/POST", "/api/admissions/applications", "Applications"],
            ["GET/POST", "/api/admissions/prospects", "Prospect management"],
            ["GET/POST", "/api/admissions/tests", "Test scheduling"],
            ["GET/POST", "/api/admissions/interviews", "Interview management"],
            ["GET", "/api/admissions/approved", "Approved admissions"],
          ]
        ),

        createSubHeading("9.6 Staff Management APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/staff", "Staff records"],
            ["GET/POST", "/api/staff/attendance", "Attendance tracking"],
            ["GET/POST", "/api/staff/leaves", "Leave management"],
            ["GET/POST", "/api/staff/payroll", "Payroll processing"],
          ]
        ),

        createSubHeading("9.7 Transport APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/routes", "Route management"],
            ["GET/POST", "/api/vehicles", "Vehicle management"],
            ["GET", "/api/transport/tracking", "GPS tracking data"],
            ["GET/POST", "/api/transport/stops", "Stop information"],
            ["GET/POST", "/api/transport/alerts", "Transport alerts"],
          ]
        ),

        createSubHeading("9.8 Finance APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/fees", "Fee structure"],
            ["GET/POST", "/api/fees/payments", "Fee payments"],
            ["GET", "/api/finance/fee-due", "Due fee reports"],
            ["GET/POST", "/api/finance/expenses", "Expense tracking"],
            ["GET", "/api/finance/reports", "Financial analytics"],
          ]
        ),

        createSubHeading("9.9 LMS APIs"),
        createTable(
          ["Method", "Endpoint", "Description"],
          [
            ["GET/POST", "/api/lms/courses", "Course management"],
            ["GET/POST", "/api/lms/assignments", "Assignment management"],
            ["GET/POST", "/api/lms/submissions", "Submission tracking"],
            ["GET/POST", "/api/lms/examinations", "Exam management"],
            ["GET/POST", "/api/lms/results", "Results management"],
            ["GET/POST", "/api/lms/report-cards", "Report card generation"],
          ]
        ),

        createSubHeading("9.10 Other Module APIs"),
        createTable(
          ["Module", "Base Endpoint", "Operations"],
          [
            ["Hostel", "/api/hostels, /api/hostel/*", "Room, bed, allocation management"],
            ["Library", "/api/books, /api/library/*", "Books, issues, overdue"],
            ["Canteen", "/api/canteen/*", "Menu, orders, wallet, transactions"],
            ["Marketplace", "/api/marketplace/*", "Products, orders, inventory"],
            ["Communication", "/api/communication/*", "Announcements, messages, notifications"],
            ["Security", "/api/security/*", "Audit logs, compliance, backups"],
            ["Analytics", "/api/analytics/*", "Dashboard, reports, statistics"],
            ["Inventory", "/api/inventory/*", "Vendors, stock, purchase orders"],
          ]
        ),

        createSubHeading("9.11 API Response Format"),
        new Paragraph({
          children: [
            new TextRun({
              text: `
// Success Response
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error Response
{
  "success": false,
  "error": "Error message description"
}`,
              size: 18,
              font: "Courier New",
            }),
          ],
          spacing: { before: 100, after: 100 },
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 10. DATABASE SCHEMA ====================
        createHeading("10. Database Schema", HeadingLevel.HEADING_1),
        createParagraph(
          "The School ERP System uses PostgreSQL with Prisma ORM. The database contains 60+ models organized into logical domains:"
        ),

        createSubHeading("10.1 Core Administration Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["School", "id, name, code, address, email, phone", "Main school entity"],
            ["Branch", "id, schoolId, name, address, isMainBranch", "School branches"],
            ["AcademicYear", "id, schoolId, name, startDate, endDate, isCurrent", "Academic sessions"],
            ["Class", "id, schoolId, name, grade, order", "Class hierarchy"],
            ["Section", "id, classId, name, capacity, teacherId", "Class sections"],
            ["Subject", "id, schoolId, name, code, description", "Subject management"],
          ]
        ),

        createSubHeading("10.2 User & Authorization Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["User", "id, email, password, role, schoolId, isActive", "User accounts"],
            ["Role", "id, schoolId, name, permissions (JSON)", "Custom roles"],
            ["UserCustomRole", "id, userId, roleId", "User-role mapping"],
          ]
        ),
        createParagraph("User Roles Enum:", { bold: true }),
        createBullet(
          "SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, VICE_PRINCIPAL, HEAD_TEACHER, TEACHER"
        ),
        createBullet(
          "ACCOUNTANT, LIBRARIAN, TRANSPORT_MANAGER, HOSTEL_WARDEN, RECEPTIONIST, STUDENT, PARENT"
        ),

        createSubHeading("10.3 Student Management Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            [
              "Student",
              "id, schoolId, admissionNo, firstName, lastName, classId, sectionId, ...",
              "Student profiles (30+ fields)",
            ],
            ["Guardian", "id, studentId, name, relation, email, phone, isPrimary", "Parent/guardian info"],
            ["StudentSibling", "id, studentId, siblingId", "Sibling relationships"],
            [
              "Admission",
              "id, schoolId, status, studentName, testScore, interviewDate, ...",
              "Admission workflow",
            ],
          ]
        ),

        createSubHeading("10.4 Staff Management Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            [
              "Staff",
              "id, schoolId, employeeId, userId, department, designation, salary, ...",
              "Employee records",
            ],
            ["StaffAttendance", "id, staffId, date, status, checkIn, checkOut", "Attendance tracking"],
            ["LeaveRequest", "id, staffId, leaveType, startDate, endDate, status", "Leave management"],
            ["Payroll", "id, staffId, month, year, basic, allowances, deductions", "Payroll processing"],
          ]
        ),

        createSubHeading("10.5 Transport Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Route", "id, schoolId, name, description, stops[]", "Transport routes"],
            ["Stop", "id, routeId, name, arrivalTime, departureTime, fare", "Route stops"],
            ["Vehicle", "id, schoolId, number, type, capacity, driverId", "Vehicle fleet"],
            ["StudentTransport", "id, studentId, routeId, stopId", "Student assignments"],
            ["GPSTracking", "id, vehicleId, latitude, longitude, speed, timestamp", "Real-time tracking"],
          ]
        ),

        createSubHeading("10.6 Hostel Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Hostel", "id, schoolId, name, type, wardenId", "Hostel buildings"],
            ["HostelFloor", "id, hostelId, name, floorNumber", "Floor management"],
            ["HostelRoom", "id, floorId, roomNumber, type, capacity", "Room information"],
            ["HostelBed", "id, roomId, bedNumber, isOccupied", "Bed allocation"],
            ["StudentHostel", "id, studentId, bedId, messPlan, startDate", "Student assignment"],
          ]
        ),

        createSubHeading("10.7 Finance Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Fee", "id, schoolId, name, type, amount, frequency", "Fee structure"],
            ["FeePayment", "id, feeId, studentId, amount, paymentMode, status", "Payment records"],
            ["Expense", "id, schoolId, category, amount, description, date", "Expense tracking"],
            ["Vendor", "id, schoolId, name, contact, gstNumber", "Vendor management"],
            ["PurchaseOrder", "id, vendorId, totalAmount, status", "Procurement"],
          ]
        ),

        createSubHeading("10.8 LMS Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Course", "id, schoolId, name, subjectId, teacherId, classId", "Course management"],
            ["Assignment", "id, courseId, title, description, dueDate, totalMarks", "Assignments"],
            ["AssignmentSubmission", "id, assignmentId, studentId, marks, feedback", "Submissions"],
            ["Exam", "id, schoolId, name, type, date, classId, subjectId", "Examinations"],
            ["ExamResult", "id, examId, studentId, marksObtained, grade", "Results"],
            ["ReportCard", "id, studentId, term, overallGrade, remarks", "Report cards"],
          ]
        ),

        createSubHeading("10.9 Library Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Library", "id, schoolId, name, location", "Library entity"],
            ["Book", "id, libraryId, title, author, isbn, barcode, copies", "Book catalog"],
            ["LibraryIssue", "id, bookId, userId, issueDate, dueDate, returnDate, fine", "Issue tracking"],
          ]
        ),

        createSubHeading("10.10 Canteen & Marketplace Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["MenuItem", "id, schoolId, name, price, category, isAvailable", "Menu items"],
            ["CanteenOrder", "id, studentId, totalAmount, status", "Orders"],
            ["SmartWallet", "id, studentId, balance", "Wallet balance"],
            ["WalletTransaction", "id, walletId, type, amount, description", "Transactions"],
            ["Product", "id, schoolId, name, price, category, stock", "Marketplace products"],
            ["MarketplaceOrder", "id, studentId, totalAmount, status", "Product orders"],
          ]
        ),

        createSubHeading("10.11 Communication & Security Models"),
        createTable(
          ["Model", "Key Fields", "Purpose"],
          [
            ["Announcement", "id, schoolId, title, content, priority, targetRole", "Announcements"],
            ["Message", "id, senderId, receiverId, subject, content", "Direct messages"],
            ["Notification", "id, userId, title, content, isRead", "Notifications"],
            ["Event", "id, schoolId, title, date, location, description", "School events"],
            ["AuditLog", "id, userId, action, entity, entityId, ipAddress", "Audit trail"],
            ["DataBackup", "id, schoolId, filename, size, status", "Backup records"],
            ["ComplianceRecord", "id, schoolId, type, status, dueDate", "Compliance tracking"],
          ]
        ),

        createSubHeading("10.12 Database Indexes"),
        createParagraph("Strategic indexes are applied on frequently queried fields:"),
        createBullet("schoolId - on all school-scoped tables for multi-tenant queries"),
        createBullet("createdAt - for time-based sorting and filtering"),
        createBullet("status - for filtering by record status"),
        createBullet("email - unique index for user lookup"),
        createBullet("admissionNo - unique per school for student lookup"),
        createBullet("Composite indexes on foreign key combinations"),

        createSubHeading("10.13 Key Enums"),
        createTable(
          ["Enum Name", "Values"],
          [
            ["UserRole", "SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, VICE_PRINCIPAL, HEAD_TEACHER, TEACHER, ACCOUNTANT, LIBRARIAN, TRANSPORT_MANAGER, HOSTEL_WARDEN, RECEPTIONIST, STUDENT, PARENT"],
            ["AdmissionStatus", "INQUIRY, PROSPECT, TEST_SCHEDULED, TEST_COMPLETED, INTERVIEW_SCHEDULED, APPROVED, REJECTED, WAITLISTED, ADMITTED, CANCELLED"],
            ["FeeType", "TUITION, ADMISSION, EXAM, TRANSPORT, HOSTEL, LIBRARY, LABORATORY, SPORTS, ACTIVITY, UNIFORM, OTHER"],
            ["PaymentMode", "CASH, CHEQUE, CARD, UPI, NET_BANKING"],
            ["PaymentStatus", "PENDING, COMPLETED, FAILED, REFUNDED"],
            ["StaffType", "TEACHING, NON_TEACHING, ADMINISTRATIVE, SUPPORT"],
            ["LeaveStatus", "PENDING, APPROVED, REJECTED, CANCELLED"],
            ["AssetType", "FURNITURE, EQUIPMENT, ELECTRONICS, VEHICLE, BUILDING, OTHER"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 11. APPENDIX ====================
        createHeading("11. Appendix", HeadingLevel.HEADING_1),

        createSubHeading("11.1 Glossary"),
        createTable(
          ["Term", "Definition"],
          [
            ["ERP", "Enterprise Resource Planning - integrated management system"],
            ["LMS", "Learning Management System - academic content delivery"],
            ["RBAC", "Role-Based Access Control - permission management"],
            ["JWT", "JSON Web Token - authentication token format"],
            ["ORM", "Object-Relational Mapping - database abstraction layer"],
            ["API", "Application Programming Interface - service endpoints"],
            ["Multi-tenancy", "Single instance serving multiple organizations"],
          ],
          [30, 70]
        ),

        createSubHeading("11.2 Assumptions & Dependencies"),
        createBullet("PostgreSQL database server available and configured"),
        createBullet("Node.js 18+ runtime environment"),
        createBullet("Client devices have modern web browser support"),
        createBullet("Stable internet connectivity for deployment"),
        createBullet("SSL certificate for production deployment"),

        createSubHeading("11.3 Acceptance Criteria"),
        createBullet("All modules functional as per specifications"),
        createBullet("Role-based access working correctly"),
        createBullet("Data integrity maintained across operations"),
        createBullet("Response time under 2 seconds for typical operations"),
        createBullet("Mobile-responsive design across all pages"),
        createBullet("Complete audit trail for all operations"),

        createSubHeading("11.4 Out of Scope"),
        createBullet("Native mobile applications (iOS/Android)"),
        createBullet("Third-party payment gateway integration"),
        createBullet("SMS gateway integration"),
        createBullet("Video conferencing integration"),
        createBullet("Custom report builder"),

        createSubHeading("11.5 Change Management"),
        createParagraph(
          "Any changes to the scope, timeline, or requirements outlined in this SoW will be handled through a formal change request process. Changes may impact the project timeline and cost."
        ),

        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: "--- End of Document ---",
              italics: true,
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    },
  ],
});

// Generate the document
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("School_ERP_Statement_of_Work.docx", buffer);
  console.log("Document created successfully: School_ERP_Statement_of_Work.docx");
});
