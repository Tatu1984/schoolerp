'use client'

import { Video, Clock } from 'lucide-react'
import { formatDateTime } from './PortalContext'

// A class can be joined from 10 minutes before the start until it ends.
export function classState(cls) {
  const start = new Date(cls.scheduledTime).getTime()
  const end = start + (cls.duration || 60) * 60000
  const now = Date.now()
  if (cls.status === 'COMPLETED' || now > end) return 'ENDED'
  if (cls.status === 'LIVE' || now >= start - 10 * 60000) return 'LIVE'
  return 'UPCOMING'
}

export default function ClassCard({ cls }) {
  const state = classState(cls)
  const teacher = cls.course?.teacher
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${state === 'LIVE' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <Video className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{cls.title}</h3>
            {state === 'LIVE' && <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full animate-pulse">LIVE</span>}
            {state === 'ENDED' && <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">Ended</span>}
          </div>
          <p className="text-sm text-gray-600">
            {cls.course?.name || 'General'}{teacher ? ` · ${teacher.firstName} ${teacher.lastName}` : ''}
          </p>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="w-4 h-4 mr-1" />
            {formatDateTime(cls.scheduledTime)}{cls.duration ? ` · ${cls.duration} min` : ''}
          </p>
        </div>
      </div>
      {state === 'ENDED' ? (
        cls.recordingLink ? (
          <a href={cls.recordingLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-center">Watch recording</a>
        ) : null
      ) : cls.meetingLink ? (
        <a
          href={cls.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn text-center ${state === 'LIVE' ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary'}`}
        >
          {state === 'LIVE' ? 'Join now' : 'Join class'}
        </a>
      ) : null}
    </div>
  )
}
