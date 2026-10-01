'use client'

import { Megaphone } from 'lucide-react'
import { usePortal, formatDate } from '@/components/portal/PortalContext'

const priority = {
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-red-100 text-red-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  LOW: 'bg-gray-100 text-gray-800',
}

export default function PortalAnnouncements() {
  const { data } = usePortal()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">Notices from the school.</p>
      </div>

      {data.announcements.length === 0 ? (
        <div className="card text-center text-gray-500">No announcements</div>
      ) : (
        data.announcements.map((a) => (
          <div key={a.id} className="card">
            <div className="flex items-start space-x-3">
              <Megaphone className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priority[a.priority] || priority.NORMAL}`}>{a.priority}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.content}</p>
                <p className="text-xs text-gray-400 mt-3">{formatDate(a.publishedAt || a.createdAt)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
