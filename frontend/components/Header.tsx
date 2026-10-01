'use client'

import { useState } from 'react'
import { Menu, Bell, User, Search, ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search students, staff, or anything..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/communication/notifications"
            className="p-2 rounded-lg hover:bg-gray-100 relative"
            aria-label="View notifications"
          >
            <Bell className="w-6 h-6 text-gray-600" aria-hidden="true" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            <span className="sr-only">You have unread notifications</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium truncate max-w-[120px]">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {session?.user?.email || ''}
                </p>
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" aria-hidden="true" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200"
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.role?.replace(/_/g, ' ')}</p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Account Settings
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
