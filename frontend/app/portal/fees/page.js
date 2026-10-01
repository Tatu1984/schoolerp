'use client'

import { usePortal, formatDate, formatMoney } from '@/components/portal/PortalContext'

const styles = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export default function PortalFees() {
  const { data } = usePortal()
  const { items, totalDue, totalPaid } = data.fees

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fees</h1>
        <p className="text-gray-600 mt-1">Dues and payment history. Payments are recorded by the school accounts office.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className={`text-3xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatMoney(totalDue)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Paid so far</p>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(totalPaid)}</p>
        </div>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No fee records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Fee', 'Amount', 'Paid', 'Balance', 'Due date', 'Status', 'Receipt'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.fee?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatMoney(f.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatMoney(f.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatMoney(f.amount - f.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(f.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[f.status] || styles.CANCELLED}`}>{f.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {f.receiptNumber || '-'}{f.paymentDate ? ` · ${formatDate(f.paymentDate)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
