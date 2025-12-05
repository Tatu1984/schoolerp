// Role-based access control utilities

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  TRANSPORT_VENDOR: 'TRANSPORT_VENDOR',
  HOSTEL_WARDEN: 'HOSTEL_WARDEN',
  CANTEEN_ADMIN: 'CANTEEN_ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
}

// Define which roles have access to which modules
export const MODULE_PERMISSIONS = {
  // Core Administration
  'school-setup': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'branches': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'academic-years': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'classes': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER],
  'sections': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER],
  'subjects': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER],
  'roles': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN],

  // Student Management
  'students': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER, USER_ROLES.RECEPTIONIST],
  'guardians': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.RECEPTIONIST],
  'promotions': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'bulk-upload': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],

  // Admissions
  'admissions': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.RECEPTIONIST],

  // Staff/HRMS
  'staff': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'attendance': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
  'leave': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER],
  'payroll': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.ACCOUNTANT],

  // Transport
  'transport': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.TRANSPORT_MANAGER, USER_ROLES.TRANSPORT_VENDOR],

  // Hostel
  'hostel': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.HOSTEL_WARDEN],

  // Library
  'library': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.LIBRARIAN, USER_ROLES.TEACHER],

  // Inventory
  'inventory': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.ACCOUNTANT],

  // Finance
  'finance': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.ACCOUNTANT],

  // LMS
  'lms': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER, USER_ROLES.STUDENT],

  // Communication
  'communication': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.TEACHER, USER_ROLES.PARENT],

  // Canteen
  'canteen': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.CANTEEN_ADMIN, USER_ROLES.STUDENT],

  // Marketplace
  'marketplace': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PARENT, USER_ROLES.STUDENT],

  // Analytics
  'analytics': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],

  // Security
  'security': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN],

  // Settings
  'settings': [USER_ROLES.SUPER_ADMIN, USER_ROLES.SCHOOL_ADMIN, USER_ROLES.PRINCIPAL],
}

// Check if a role has access to a module
export function hasAccess(userRole, modulePath) {
  if (!userRole || !modulePath) return false

  // Super admin has access to everything
  if (userRole === USER_ROLES.SUPER_ADMIN) return true

  // Extract module from path (e.g., '/dashboard/students' -> 'students')
  const module = modulePath.replace('/dashboard/', '').split('/')[0]

  const allowedRoles = MODULE_PERMISSIONS[module]
  if (!allowedRoles) return false

  return allowedRoles.includes(userRole)
}

// Get default dashboard path for a role
export function getDefaultDashboard(userRole) {
  const dashboards = {
    [USER_ROLES.SUPER_ADMIN]: '/dashboard',
    [USER_ROLES.SCHOOL_ADMIN]: '/dashboard',
    [USER_ROLES.PRINCIPAL]: '/dashboard',
    [USER_ROLES.TEACHER]: '/dashboard/lms',
    [USER_ROLES.ACCOUNTANT]: '/dashboard/finance',
    [USER_ROLES.LIBRARIAN]: '/dashboard/library',
    [USER_ROLES.TRANSPORT_MANAGER]: '/dashboard/transport',
    [USER_ROLES.TRANSPORT_VENDOR]: '/dashboard/transport',
    [USER_ROLES.HOSTEL_WARDEN]: '/dashboard/hostel',
    [USER_ROLES.CANTEEN_ADMIN]: '/dashboard/canteen',
    [USER_ROLES.RECEPTIONIST]: '/dashboard/admissions',
    [USER_ROLES.STUDENT]: '/dashboard/lms',
    [USER_ROLES.PARENT]: '/dashboard/students',
  }

  return dashboards[userRole] || '/dashboard'
}

// Get role display name
export function getRoleDisplayName(userRole) {
  const displayNames = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
    [USER_ROLES.SCHOOL_ADMIN]: 'School Administrator',
    [USER_ROLES.PRINCIPAL]: 'Principal',
    [USER_ROLES.TEACHER]: 'Teacher',
    [USER_ROLES.ACCOUNTANT]: 'Accountant',
    [USER_ROLES.LIBRARIAN]: 'Librarian',
    [USER_ROLES.TRANSPORT_MANAGER]: 'Transport Manager',
    [USER_ROLES.TRANSPORT_VENDOR]: 'Transport Vendor',
    [USER_ROLES.HOSTEL_WARDEN]: 'Hostel Warden',
    [USER_ROLES.CANTEEN_ADMIN]: 'Canteen Administrator',
    [USER_ROLES.RECEPTIONIST]: 'Receptionist',
    [USER_ROLES.STUDENT]: 'Student',
    [USER_ROLES.PARENT]: 'Parent',
  }

  return displayNames[userRole] || userRole
}
