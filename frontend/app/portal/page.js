'use client'

import Link from 'next/link'
import { CalendarCheck, Wallet, ClipboardList, Video, Megaphone } from 'lucide-react'
import { usePortal, formatDate, formatMoney } from '@/components/portal/PortalContext'
import ClassCard, { classState } from '@/components/portal/ClassCard'

function Stat({ icon: Icon, label, value, hint, href, color }) {
  return (
    <Link href={href} className="card hover:shadow-lg transition-shadow block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Link>
  )
}

export default function PortalOverview() {
  const { data } = usePortal()
  const { student, attendance, fees, assignments, onlineClasses, announcements, exams, role } = data

  const pending = assignments.filter((a) => !a.submission)
  const upcomingClasses = onlineClasses.filter((c) => classState(c) !== 'ENDED')
  const summary = attendance.summary

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {role === 'PARENT' ? `${student.firstName}'s Overview` : `Welcome, ${student.firstName}`}
        </h1>
        <p className="text-gray-600 mt-1">Here is what is happening at school.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Stat
          icon={CalendarCheck}
          label="Attendance (last 90 days)"
          value={summary.percentage === null ? '-' : `${summary.percentage}%`}
          hint={summary.total ? `${summary.PRESENT + summary.LATE} of ${summary.total} days present` : 'No attendance marked yet'}
          href="/portal/attendance"
          color="bg-green-100 text-green-600"
        />
        <Stat
          icon={Wallet}
          label="Fees due"
          value={formatMoney(fees.totalDue)}
          hint={fees.totalDue > 0 ? 'Tap to see details' : 'All fees are paid'}
          href="/portal/fees"
          color={fees.totalDue > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
        />
        <Stat
          icon={ClipboardList}
          label="Pending assignments"
          value={pending.length}
          hint={`${assignments.length} assigned in total`}
          href="/portal/assignments"
          color="bg-yellow-100 text-yellow-600"
        />
        <Stat
          icon={Video}
          label="Upcoming online classes"
          value={upcomingClasses.length}
          hint={exams.length ? `${exams.length} upcoming exam${exams.length > 1 ? 's' : ''}` : 'No upcoming exams'}
          href="/portal/classes"
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Online classes</h2>
            <Link href="/portal/classes" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {upcomingClasses.length === 0 ? (
            <div className="card text-gray-500 text-center">No online classes scheduled</div>
          ) : (
            upcomingClasses.slice(0, 3).map((cls) => <ClassCard key={cls.id} cls={cls} />)
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
            <Link href="/portal/announcements" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {announcements.length === 0 ? (
            <div className="card text-gray-500 text-center">No announcements</div>
          ) : (
            announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="card">
                <div className="flex items-start space-x-3">
                  <Megaphone className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(a.publishedAt || a.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
