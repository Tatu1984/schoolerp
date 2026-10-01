'use client'

import { usePortal } from '@/components/portal/PortalContext'
import ClassCard, { classState } from '@/components/portal/ClassCard'

export default function PortalClasses() {
  const { data } = usePortal()
  const upcoming = data.onlineClasses.filter((c) => classState(c) !== 'ENDED')
  const past = data.onlineClasses.filter((c) => classState(c) === 'ENDED').reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Online Classes</h1>
        <p className="text-gray-600 mt-1">Join opens 10 minutes before a class starts. Classes run in the browser, no app needed.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Live & upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="card text-gray-500 text-center">No online classes scheduled</div>
        ) : (
          upcoming.map((cls) => <ClassCard key={cls.id} cls={cls} />)
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Past classes</h2>
          {past.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
        </section>
      )}

      {data.courses.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.courses.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.code}{c.teacher ? ` · ${c.teacher.firstName} ${c.teacher.lastName}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
