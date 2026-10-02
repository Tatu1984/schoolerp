'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  ClipboardList,
  Award,
  Video,
  Megaphone,
  LogOut,
  Menu,
  GraduationCap,
  KeyRound,
} from 'lucide-react'
import { usePortal } from './PortalContext'

const menu = [
  { title: 'Overview', href: '/portal', icon: LayoutDashboard },
  { title: 'Online Classes', href: '/portal/classes', icon: Video },
  { title: 'Attendance', href: '/portal/attendance', icon: CalendarCheck },
  { title: 'Assignments', href: '/portal/assignments', icon: ClipboardList },
  { title: 'Exams & Results', href: '/portal/results', icon: Award },
  { title: 'Fees', href: '/portal/fees', icon: Wallet },
  { title: 'Announcements', href: '/portal/announcements', icon: Megaphone },
]

export default function PortalShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { data, loading, error, selectStudent } = usePortal()
  const [open, setOpen] = useState(false)

  const isParent = session?.user?.role === 'PARENT'
  const student = data?.student

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-indigo-900 text-white flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6" />
            <h1 className="text-xl font-bold">{isParent ? 'Parent Portal' : 'Student Portal'}</h1>
          </div>
          {session?.user?.schoolName && <p className="text-xs text-indigo-300 mt-1 truncate">{session.user.schoolName}</p>}
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          {session?.user && (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{session.user.email}</p>
            </div>
          )}
          <Link href="/change-password" className="flex items-center space-x-2 text-indigo-200 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-indigo-800">
            <KeyRound className="w-5 h-5" />
            <span>Change password</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-indigo-200 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-indigo-800">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </button>
              {student && (
                <div>
                  <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-gray-500">
                    {student.class?.name}{student.section ? ` - ${student.section.name}` : ''} · Adm. No. {student.admissionNumber}
                  </p>
                </div>
              )}
            </div>
            {isParent && data?.children?.length > 1 && (
              <div className="flex items-center space-x-2">
                <label htmlFor="child" className="text-sm text-gray-600 hidden sm:block">Viewing</label>
                <select id="child" className="input w-auto" value={student?.id || ''} onChange={(e) => selectStudent(e.target.value)}>
                  {data.children.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.class?.name})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          {loading && !data ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="card text-center text-red-600">{error}</div>
          ) : !student ? (
            <div className="card text-center text-gray-600">
              No student record is linked to this login yet. Please contact the school office.
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
