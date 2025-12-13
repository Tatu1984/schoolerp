'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  BookOpen,
  Bus,
  Home,
  Library,
  Package,
  DollarSign,
  UserCheck,
  Settings,
  LogOut,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  Utensils,
  Shield,
  ChevronDown,
  LucideIcon,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface SubMenuItem {
  title: string
  href: string
}

interface MenuItem {
  title: string
  href?: string
  icon: LucideIcon
  submenu?: SubMenuItem[]
  roles?: string[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Core Administration',
    icon: School,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'],
    submenu: [
      { title: 'School Setup', href: '/dashboard/school-setup' },
      { title: 'Branches', href: '/dashboard/branches' },
      { title: 'Academic Years', href: '/dashboard/academic-years' },
      { title: 'Classes', href: '/dashboard/classes' },
      { title: 'Sections', href: '/dashboard/sections' },
      { title: 'Subjects', href: '/dashboard/subjects' },
      { title: 'Roles & Permissions', href: '/dashboard/roles' },
    ],
  },
  {
    title: 'Student Management',
    icon: GraduationCap,
    submenu: [
      { title: 'All Students', href: '/dashboard/students' },
      { title: 'Add Student', href: '/dashboard/students/add' },
      { title: 'Bulk Upload', href: '/dashboard/students/bulk' },
      { title: 'Promotions', href: '/dashboard/students/promotions' },
    ],
  },
  {
    title: 'Admissions',
    icon: UserCheck,
    submenu: [
      { title: 'Inquiries', href: '/dashboard/admissions/inquiries' },
      { title: 'Prospects', href: '/dashboard/admissions/prospects' },
      { title: 'Applications', href: '/dashboard/admissions/applications' },
      { title: 'Entrance Tests', href: '/dashboard/admissions/tests' },
      { title: 'Interviews', href: '/dashboard/admissions/interviews' },
      { title: 'Approved', href: '/dashboard/admissions/approved' },
    ],
  },
  {
    title: 'Staff Management',
    icon: Users,
    submenu: [
      { title: 'All Staff', href: '/dashboard/staff' },
      { title: 'Add Staff', href: '/dashboard/staff/add' },
      { title: 'Attendance', href: '/dashboard/staff/attendance' },
      { title: 'Leave Management', href: '/dashboard/staff/leave' },
    ],
  },
  {
    title: 'Transport',
    icon: Bus,
    submenu: [
      { title: 'Routes', href: '/dashboard/transport/routes' },
      { title: 'Vehicles', href: '/dashboard/transport/vehicles' },
      { title: 'Drivers', href: '/dashboard/transport/drivers' },
      { title: 'Tracking', href: '/dashboard/transport/tracking' },
    ],
  },
  {
    title: 'Hostel',
    icon: Home,
    submenu: [
      { title: 'Hostels', href: '/dashboard/hostel/list' },
      { title: 'Rooms', href: '/dashboard/hostel/rooms' },
      { title: 'Occupancy', href: '/dashboard/hostel/occupancy' },
      { title: 'Mess Plans', href: '/dashboard/hostel/mess' },
    ],
  },
  {
    title: 'Library',
    icon: Library,
    submenu: [
      { title: 'Books', href: '/dashboard/library/books' },
      { title: 'Issue/Return', href: '/dashboard/library/issue' },
      { title: 'Overdue', href: '/dashboard/library/overdue' },
      { title: 'Reports', href: '/dashboard/library/reports' },
    ],
  },
  {
    title: 'Inventory',
    icon: Package,
    submenu: [
      { title: 'Assets', href: '/dashboard/inventory/assets' },
      { title: 'Purchase Orders', href: '/dashboard/inventory/purchase-orders' },
      { title: 'Vendors', href: '/dashboard/inventory/vendors' },
      { title: 'Stock', href: '/dashboard/inventory/stock' },
    ],
  },
  {
    title: 'Finance',
    icon: DollarSign,
    submenu: [
      { title: 'Fee Structure', href: '/dashboard/finance/fees' },
      { title: 'Fee Collection', href: '/dashboard/finance/collection' },
      { title: 'Expenses', href: '/dashboard/finance/expenses' },
      { title: 'Reports', href: '/dashboard/finance/reports' },
    ],
  },
  {
    title: 'LMS',
    icon: BookOpen,
    submenu: [
      { title: 'Courses', href: '/dashboard/lms/courses' },
      { title: 'Assignments', href: '/dashboard/lms/assignments' },
      { title: 'Online Classes', href: '/dashboard/lms/classes' },
      { title: 'Examinations', href: '/dashboard/lms/examinations' },
      { title: 'Report Cards', href: '/dashboard/lms/report-cards' },
    ],
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    submenu: [
      { title: 'Announcements', href: '/dashboard/communication/announcements' },
      { title: 'Messages', href: '/dashboard/communication/messages' },
      { title: 'Notifications', href: '/dashboard/communication/notifications' },
      { title: 'Events', href: '/dashboard/communication/events' },
    ],
  },
  {
    title: 'Canteen',
    icon: Utensils,
    submenu: [
      { title: 'Menu', href: '/dashboard/canteen/menu' },
      { title: 'Orders', href: '/dashboard/canteen/orders' },
      { title: 'Smart Wallet', href: '/dashboard/canteen/wallet' },
      { title: 'Reports', href: '/dashboard/canteen/reports' },
    ],
  },
  {
    title: 'Marketplace',
    icon: ShoppingCart,
    submenu: [
      { title: 'Products', href: '/dashboard/marketplace/products' },
      { title: 'Orders', href: '/dashboard/marketplace/orders' },
      { title: 'Inventory', href: '/dashboard/marketplace/inventory' },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'],
    submenu: [
      { title: 'Overview', href: '/dashboard/analytics/overview' },
      { title: 'Student Performance', href: '/dashboard/analytics/students' },
      { title: 'Financial Analytics', href: '/dashboard/analytics/finance' },
      { title: 'Attendance Trends', href: '/dashboard/analytics/attendance' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    submenu: [
      { title: 'Audit Logs', href: '/dashboard/security/audit-logs' },
      { title: 'Data Backup', href: '/dashboard/security/backup' },
      { title: 'Compliance', href: '/dashboard/security/compliance' },
    ],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userRole = session?.user?.role

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({ redirect: false })
      toast({
        title: 'Logged out successfully',
        variant: 'success',
      })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Failed to logout',
        description: 'Please try again',
        variant: 'error',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen bg-gray-900 text-white transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64 overflow-y-auto
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">School ERP</h1>
          {session?.user?.schoolName && (
            <p className="text-xs text-gray-400 mt-1 truncate">{session.user.schoolName}</p>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item, index) => (
            <MenuItemComponent key={index} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          {session?.user && (
            <div className="mb-4 pb-4 border-b border-gray-800">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-800 rounded-full">
                {session.user.role?.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 text-gray-300 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

interface MenuItemComponentProps {
  item: MenuItem
  pathname: string
}

function MenuItemComponent({ item, pathname }: MenuItemComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = item.icon
  const isActive = item.href ? pathname === item.href : false
  const hasActiveSubmenu = item.submenu?.some((sub) => pathname === sub.href)

  // Auto-expand if submenu has active item
  useState(() => {
    if (hasActiveSubmenu && !isOpen) {
      setIsOpen(true)
    }
  })

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
          hasActiveSubmenu
            ? 'bg-gray-800 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" aria-hidden="true" />
          <span>{item.title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && item.submenu && (
        <div className="ml-4 mt-2 space-y-1" role="menu">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === subItem.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              role="menuitem"
              aria-current={pathname === subItem.href ? 'page' : undefined}
            >
              {subItem.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
