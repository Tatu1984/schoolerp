import { z } from 'zod'

// Common validations
const requiredString = z.string().min(1, 'This field is required')
const optionalString = z.string().optional().nullable()
const email = z.string().email('Invalid email address')
const optionalEmail = z.string().email('Invalid email address').optional().nullable().or(z.literal(''))
const phone = z.string().regex(/^[\d\s\-+()]+$/, 'Invalid phone number').optional().nullable()
const requiredPhone = z.string().regex(/^[\d\s\-+()]+$/, 'Invalid phone number')
const positiveNumber = z.number().positive('Must be a positive number')
const nonNegativeNumber = z.number().min(0, 'Cannot be negative')
const dateString = z.string().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date')

// Enums from Prisma
const Gender = z.enum(['MALE', 'FEMALE', 'OTHER'])
const BloodGroup = z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'])
const StaffType = z.enum(['TEACHING', 'NON_TEACHING', 'ADMINISTRATIVE', 'SUPPORT'])
const FeeType = z.enum(['TUITION', 'ADMISSION', 'EXAMINATION', 'TRANSPORT', 'HOSTEL', 'LIBRARY', 'SPORTS', 'LABORATORY', 'UNIFORM', 'BOOKS', 'OTHER'])
const FeeFrequency = z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'])
const PaymentStatus = z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])
const PaymentMode = z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE'])
const AdmissionStatus = z.enum(['INQUIRY', 'PROSPECT', 'TEST_SCHEDULED', 'TEST_COMPLETED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WAITLISTED', 'ADMITTED', 'CANCELLED'])
const AssetType = z.enum(['FURNITURE', 'EQUIPMENT', 'ELECTRONICS', 'VEHICLES', 'BOOKS', 'SPORTS', 'OTHER'])
const IssueStatus = z.enum(['ISSUED', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED'])
const OrderStatus = z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
const MarketplaceOrderStatus = z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
const LeaveStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
const TransactionType = z.enum(['CREDIT', 'DEBIT'])
const ProductCategory = z.enum(['UNIFORM', 'BOOKS', 'STATIONERY', 'SPORTS', 'OTHER'])
const UserRole = z.enum(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER', 'HOSTEL_WARDEN', 'RECEPTIONIST', 'PARENT', 'STUDENT'])

// ============ SCHOOL & BRANCH ============
export const schoolSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  address: optionalString,
  phone: phone,
  email: optionalEmail,
  website: optionalString,
  logo: optionalString,
  description: optionalString,
  isActive: z.boolean().default(true),
})

export const branchSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  schoolId: requiredString,
  address: optionalString,
  phone: phone,
  email: optionalEmail,
  isActive: z.boolean().default(true),
})

// ============ ACADEMIC ============
export const academicYearSchema = z.object({
  name: requiredString.max(100),
  schoolId: requiredString,
  startDate: dateString,
  endDate: dateString,
  isCurrent: z.boolean().default(false),
})

export const classSchema = z.object({
  name: requiredString.max(100),
  grade: z.number().int().min(1).max(12),
  schoolId: requiredString,
  branchId: optionalString,
  academicYearId: requiredString,
  capacity: nonNegativeNumber.int().default(30),
  description: optionalString,
  isActive: z.boolean().default(true),
})

export const sectionSchema = z.object({
  name: requiredString.max(50),
  classId: requiredString,
  teacherId: optionalString,
  capacity: nonNegativeNumber.int().default(40),
  isActive: z.boolean().default(true),
})

export const subjectSchema = z.object({
  name: requiredString.max(100),
  code: requiredString.max(20),
  schoolId: requiredString,
  classId: optionalString,
  description: optionalString,
  isActive: z.boolean().default(true),
})

// ============ STUDENT ============
export const studentSchema = z.object({
  firstName: requiredString.max(100),
  lastName: requiredString.max(100),
  email: optionalEmail,
  phone: phone,
  dateOfBirth: dateString,
  gender: Gender,
  bloodGroup: BloodGroup.optional().nullable(),
  nationality: optionalString,
  religion: optionalString,
  address: optionalString,
  schoolId: requiredString,
  branchId: optionalString,
  classId: requiredString,
  sectionId: optionalString,
  rollNumber: optionalString,
  admissionNumber: requiredString.max(50),
  admissionDate: dateString.optional(),
  previousSchool: optionalString,
  medicalInfo: z.record(z.unknown()).optional().nullable(),
  documents: z.record(z.unknown()).optional().nullable(),
  customFields: z.record(z.unknown()).optional().nullable(),
  photo: optionalString,
  isActive: z.boolean().default(true),
})

export const studentUpdateSchema = studentSchema.partial().omit({ schoolId: true, admissionNumber: true })

export const guardianSchema = z.object({
  firstName: requiredString.max(100),
  lastName: requiredString.max(100),
  relation: requiredString.max(50),
  phone: requiredString.regex(/^[\d\s\-+()]+$/, 'Invalid phone number'),
  email: optionalEmail,
  occupation: optionalString,
  address: optionalString,
  isPrimary: z.boolean().default(false),
  studentId: requiredString,
})

export const bulkStudentSchema = z.object({
  students: z.array(studentSchema.extend({
    guardians: z.array(guardianSchema.omit({ studentId: true })).optional(),
  })).min(1, 'At least one student is required').max(500, 'Maximum 500 students per upload'),
})

// ============ STAFF ============
export const staffSchema = z.object({
  firstName: requiredString.max(100),
  lastName: requiredString.max(100),
  email: email.max(255),
  phone: requiredPhone,
  dateOfBirth: dateString,
  gender: Gender,
  bloodGroup: BloodGroup.optional().nullable(),
  photo: optionalString,
  address: optionalString,
  city: optionalString,
  state: optionalString,
  pincode: optionalString,
  schoolId: requiredString,
  branchId: optionalString,
  employeeId: requiredString.max(50),
  staffType: StaffType,
  designation: requiredString,
  department: optionalString,
  joiningDate: dateString,
  qualification: optionalString,
  experience: nonNegativeNumber.int().optional().nullable(),
  salary: nonNegativeNumber.optional().nullable(),
  bankDetails: z.record(z.unknown()).optional().nullable(),
  documents: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const staffUpdateSchema = staffSchema.partial().omit({ schoolId: true, employeeId: true })

export const staffAttendanceSchema = z.object({
  staffId: requiredString,
  date: dateString,
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
  checkIn: dateString.optional(),
  checkOut: dateString.optional(),
  remarks: optionalString,
})

export const leaveRequestSchema = z.object({
  staffId: requiredString,
  startDate: dateString,
  endDate: dateString,
  reason: requiredString.max(500),
  leaveType: requiredString.max(50),
  status: LeaveStatus.default('PENDING'),
})

export const payrollSchema = z.object({
  staffId: requiredString,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  basicSalary: positiveNumber,
  allowances: z.record(z.number()).optional(),
  deductions: z.record(z.number()).optional(),
  netSalary: positiveNumber,
  isPaid: z.boolean().default(false),
  paidDate: dateString.optional(),
})

// ============ ADMISSIONS ============
export const admissionSchema = z.object({
  inquiryNumber: requiredString.max(50),
  schoolId: requiredString,
  studentId: optionalString,
  firstName: requiredString.max(100),
  lastName: requiredString.max(100),
  dateOfBirth: dateString.optional(),
  gender: Gender.optional(),
  appliedClass: requiredString,
  previousSchool: optionalString,
  parentName: requiredString.max(200),
  parentPhone: requiredString.regex(/^[\d\s\-+()]+$/, 'Invalid phone number'),
  parentEmail: optionalEmail,
  address: optionalString,
  status: AdmissionStatus.default('INQUIRY'),
  testDate: dateString.optional(),
  testScore: nonNegativeNumber.optional().nullable(),
  interviewDate: dateString.optional(),
  interviewNotes: optionalString,
  documents: z.record(z.unknown()).optional().nullable(),
})

// ============ FINANCE ============
export const feeSchema = z.object({
  name: requiredString.max(200),
  schoolId: requiredString,
  classId: optionalString,
  type: FeeType,
  amount: positiveNumber,
  frequency: FeeFrequency,
  description: optionalString,
  isActive: z.boolean().default(true),
})

export const feePaymentSchema = z.object({
  studentId: requiredString,
  feeId: requiredString,
  schoolId: requiredString,
  amount: positiveNumber,
  paidAmount: nonNegativeNumber.default(0),
  dueDate: dateString,
  status: PaymentStatus.default('PENDING'),
  paymentDate: dateString.optional(),
  paymentMode: PaymentMode.optional(),
  transactionId: optionalString,
  receiptNumber: optionalString,
  notes: optionalString,
})

export const expenseSchema = z.object({
  schoolId: requiredString,
  category: requiredString.max(100),
  amount: positiveNumber,
  description: optionalString,
  date: dateString,
  paidTo: optionalString,
  paymentMode: optionalString,
  billNumber: optionalString,
  approvedBy: optionalString,
})

// ============ LIBRARY ============
export const bookSchema = z.object({
  title: requiredString.max(300),
  libraryId: requiredString,
  author: optionalString,
  isbn: optionalString,
  publisher: optionalString,
  category: optionalString,
  edition: optionalString,
  language: optionalString,
  pages: nonNegativeNumber.int().optional().nullable(),
  quantity: positiveNumber.int().default(1),
  available: nonNegativeNumber.int().default(1),
  price: nonNegativeNumber.optional().nullable(),
  purchaseDate: dateString.optional(),
  location: optionalString,
  barcode: optionalString,
  description: optionalString,
  coverImage: optionalString,
  isActive: z.boolean().default(true),
})

export const libraryIssueSchema = z.object({
  bookId: requiredString,
  studentId: requiredString,
  issueDate: dateString,
  dueDate: dateString,
  returnDate: dateString.optional(),
  status: IssueStatus.default('ISSUED'),
  fine: nonNegativeNumber.default(0),
  notes: optionalString,
})

// ============ TRANSPORT ============
export const routeSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  schoolId: optionalString,
  description: optionalString,
  isActive: z.boolean().default(true),
})

export const stopSchema = z.object({
  name: requiredString.max(200),
  routeId: requiredString,
  location: optionalString,
  arrivalTime: optionalString,
  fare: nonNegativeNumber.default(0),
  sequence: nonNegativeNumber.int().default(0),
  isActive: z.boolean().default(true),
})

export const vehicleSchema = z.object({
  schoolId: optionalString,
  number: requiredString.max(50),
  registrationNo: optionalString,
  type: requiredString.max(50),
  capacity: positiveNumber.int(),
  routeId: optionalString,
  driverName: optionalString,
  driverPhone: phone,
  driverLicense: optionalString,
  insurance: optionalString,
  isActive: z.boolean().default(true),
})

export const studentTransportSchema = z.object({
  studentId: requiredString,
  routeId: requiredString,
  stopId: requiredString,
  isActive: z.boolean().default(true),
})

export const driverSchema = z.object({
  name: requiredString.max(200),
  schoolId: requiredString,
  licenseNumber: requiredString.max(50),
  phone: phone,
  email: optionalEmail,
  dateOfBirth: dateString.optional(),
  joiningDate: dateString.optional(),
  licenseExpiry: dateString.optional(),
  address: optionalString,
  vehicleId: optionalString,
  isActive: z.boolean().default(true),
})

export const vehicleTrackingSchema = z.object({
  vehicleId: requiredString,
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional().nullable(),
  timestamp: dateString.optional(),
  status: optionalString,
})

// ============ HOSTEL ============
export const hostelSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  schoolId: requiredString,
  address: optionalString,
  warden: optionalString,
  phone: phone,
  capacity: positiveNumber.int(),
  isActive: z.boolean().default(true),
})

export const hostelFloorSchema = z.object({
  name: requiredString.max(100),
  hostelId: requiredString,
  floorNumber: z.number().int(),
})

export const hostelRoomSchema = z.object({
  roomNumber: requiredString.max(50),
  floorId: requiredString,
  capacity: positiveNumber.int(),
  type: requiredString.max(50),
  rent: nonNegativeNumber.default(0),
  isActive: z.boolean().default(true),
})

export const hostelBedSchema = z.object({
  bedNumber: requiredString.max(50),
  roomId: requiredString,
  isOccupied: z.boolean().default(false),
})

export const messMenuSchema = z.object({
  schoolId: requiredString,
  date: dateString,
  dayOfWeek: optionalString,
  breakfast: optionalString,
  lunch: optionalString,
  dinner: optionalString,
  snacks: optionalString,
  mealType: optionalString,
  isActive: z.boolean().default(true),
})

// ============ INVENTORY ============
export const vendorSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  schoolId: requiredString,
  contactPerson: optionalString,
  phone: phone,
  email: optionalEmail,
  address: optionalString,
  gst: optionalString,
  isActive: z.boolean().default(true),
})

export const purchaseOrderSchema = z.object({
  orderNumber: requiredString.max(50),
  schoolId: requiredString,
  vendorId: requiredString,
  orderDate: dateString,
  expectedDelivery: dateString.optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'DELIVERED', 'CANCELLED']).default('DRAFT'),
  totalAmount: nonNegativeNumber.default(0),
  notes: optionalString,
})

export const assetSchema = z.object({
  name: requiredString.max(200),
  schoolId: requiredString,
  assetType: AssetType,
  code: requiredString.max(50),
  description: optionalString,
  purchaseDate: dateString.optional(),
  purchasePrice: nonNegativeNumber.optional(),
  currentValue: nonNegativeNumber.optional(),
  location: optionalString,
  condition: optionalString,
  isDurable: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

// ============ LMS ============
export const courseSchema = z.object({
  name: requiredString.max(200),
  code: requiredString.max(50),
  schoolId: optionalString,
  subjectId: optionalString,
  classId: optionalString,
  teacherId: optionalString,
  description: optionalString,
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  isActive: z.boolean().default(true),
})

export const assignmentSchema = z.object({
  title: requiredString.max(200),
  courseId: requiredString,
  description: optionalString,
  dueDate: dateString,
  maxScore: positiveNumber,
  attachments: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const assignmentSubmissionSchema = z.object({
  assignmentId: requiredString,
  studentId: requiredString,
  content: optionalString,
  attachments: z.record(z.unknown()).optional().nullable(),
  submittedAt: dateString,
  marks: nonNegativeNumber.optional().nullable(),
  feedback: optionalString,
  isLate: z.boolean().default(false),
})

export const examSchema = z.object({
  courseId: requiredString,
  title: requiredString.max(200),
  description: optionalString,
  examDate: dateString,
  duration: positiveNumber.int().optional(),
  maxScore: positiveNumber,
  isActive: z.boolean().default(true),
})

export const examResultSchema = z.object({
  examId: requiredString,
  studentId: requiredString,
  score: nonNegativeNumber,
  remarks: optionalString,
})

export const reportCardSchema = z.object({
  studentId: requiredString,
  academicYearId: requiredString,
  term: requiredString.max(50),
  grades: z.record(z.any()), // JSON field
  overallScore: nonNegativeNumber.optional(),
  remarks: optionalString,
  isPublished: z.boolean().default(false),
})

// ============ COMMUNICATION ============
export const announcementSchema = z.object({
  title: requiredString.max(200),
  schoolId: requiredString,
  content: requiredString,
  targetRole: optionalString,
  targetClass: optionalString,
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  attachments: z.record(z.unknown()).optional().nullable(),
  publishedAt: dateString.optional(),
  isActive: z.boolean().default(true),
})

export const messageSchema = z.object({
  senderId: requiredString,
  receiverId: requiredString,
  subject: requiredString.max(200),
  content: requiredString,
  isRead: z.boolean().default(false),
})

export const notificationSchema = z.object({
  userId: requiredString,
  title: requiredString.max(200),
  message: requiredString,
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER']).default('INFO'),
  link: optionalString,
  isRead: z.boolean().default(false),
})

export const eventSchema = z.object({
  title: requiredString.max(200),
  schoolId: requiredString,
  description: optionalString,
  eventDate: dateString,
  location: optionalString,
  organizer: optionalString,
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

// ============ CANTEEN ============
export const menuItemSchema = z.object({
  name: requiredString.max(200),
  schoolId: requiredString,
  category: requiredString.max(100),
  price: positiveNumber,
  description: optionalString,
  image: optionalString,
  isVegetarian: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
})

export const canteenOrderSchema = z.object({
  orderNumber: requiredString.max(50),
  studentId: requiredString,
  items: z.array(z.object({
    menuItemId: requiredString,
    quantity: positiveNumber.int(),
    price: positiveNumber,
  })).min(1),
  totalAmount: positiveNumber,
  status: OrderStatus.default('PENDING'),
  paymentMode: PaymentMode.optional(),
  notes: optionalString,
})

export const smartWalletSchema = z.object({
  studentId: requiredString,
  balance: nonNegativeNumber.default(0),
  isActive: z.boolean().default(true),
})

export const walletTransactionSchema = z.object({
  walletId: requiredString,
  type: TransactionType,
  amount: positiveNumber,
  description: optionalString,
  referenceId: optionalString,
  balanceBefore: nonNegativeNumber,
  balanceAfter: nonNegativeNumber,
})

// ============ MARKETPLACE ============
export const productSchema = z.object({
  name: requiredString.max(200),
  schoolId: requiredString,
  category: ProductCategory,
  price: positiveNumber,
  description: optionalString,
  image: optionalString,
  stock: nonNegativeNumber.int().default(0),
  sku: optionalString,
  isActive: z.boolean().default(true),
})

export const marketplaceOrderSchema = z.object({
  orderNumber: requiredString.max(50),
  studentId: requiredString,
  items: z.array(z.object({
    productId: requiredString,
    quantity: positiveNumber.int(),
    price: positiveNumber,
  })).min(1),
  totalAmount: positiveNumber,
  status: MarketplaceOrderStatus.default('PENDING'),
  paymentMode: PaymentMode.optional(),
  shippingAddress: optionalString,
  notes: optionalString,
})

// ============ SECURITY ============
export const auditLogSchema = z.object({
  userId: optionalString,
  action: requiredString.max(100),
  entity: requiredString.max(100),
  entityId: optionalString,
  oldValue: z.record(z.unknown()).optional().nullable(),
  newValue: z.record(z.unknown()).optional().nullable(),
  ipAddress: optionalString,
  userAgent: optionalString,
})

export const dataBackupSchema = z.object({
  schoolId: requiredString,
  filename: requiredString.max(255),
  size: nonNegativeNumber.int(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).default('PENDING'),
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL']).default('FULL'),
  notes: optionalString,
})

export const complianceRecordSchema = z.object({
  schoolId: requiredString,
  type: requiredString.max(100),
  description: requiredString,
  status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW', 'EXEMPTED']).default('PENDING_REVIEW'),
  dueDate: dateString.optional(),
  completedDate: dateString.optional(),
  evidence: z.record(z.unknown()).optional().nullable(),
  notes: optionalString,
})

// ============ USER & ROLE ============
export const userSchema = z.object({
  email: email.max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  name: requiredString.max(200),
  role: UserRole,
  schoolId: optionalString,
  isActive: z.boolean().default(true),
})

export const userUpdateSchema = userSchema.partial().omit({ password: true })

export const roleSchema = z.object({
  name: requiredString.max(100),
  schoolId: requiredString,
  permissions: z.record(z.boolean()),
  description: optionalString,
  isActive: z.boolean().default(true),
})

export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, 'Password is required'),
})

// Type exports
export type SchoolInput = z.infer<typeof schoolSchema>
export type BranchInput = z.infer<typeof branchSchema>
export type AcademicYearInput = z.infer<typeof academicYearSchema>
export type ClassInput = z.infer<typeof classSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type SubjectInput = z.infer<typeof subjectSchema>
export type StudentInput = z.infer<typeof studentSchema>
export type GuardianInput = z.infer<typeof guardianSchema>
export type StaffInput = z.infer<typeof staffSchema>
export type AdmissionInput = z.infer<typeof admissionSchema>
export type FeeInput = z.infer<typeof feeSchema>
export type FeePaymentInput = z.infer<typeof feePaymentSchema>
export type BookInput = z.infer<typeof bookSchema>
export type RouteInput = z.infer<typeof routeSchema>
export type VehicleInput = z.infer<typeof vehicleSchema>
export type HostelInput = z.infer<typeof hostelSchema>
export type VendorInput = z.infer<typeof vendorSchema>
export type AssetInput = z.infer<typeof assetSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type AssignmentInput = z.infer<typeof assignmentSchema>
export type ExamInput = z.infer<typeof examSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type EventInput = z.infer<typeof eventSchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type ProductInput = z.infer<typeof productSchema>
export type UserInput = z.infer<typeof userSchema>
export type RoleInput = z.infer<typeof roleSchema>
