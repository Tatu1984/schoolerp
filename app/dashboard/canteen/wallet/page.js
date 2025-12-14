'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function SmartWalletPage() {
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [rechargeAmount, setRechargeAmount] = useState('')

  useEffect(() => {
    fetchWallets()
    fetchTransactions()
  }, [])

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/canteen/wallet')
      if (res.ok) {
        const result = await res.json()
        setWallets(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/canteen/wallet/transactions')
      if (res.ok) {
        const result = await res.json()
        setTransactions(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleRecharge = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/canteen/wallet/${selectedWallet.id}/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(rechargeAmount) })
      })

      if (res.ok) {
        fetchWallets()
        fetchTransactions()
        setShowRechargeModal(false)
        setRechargeAmount('')
        setSelectedWallet(null)
        alert('Wallet recharged successfully!')
      }
    } catch (error) {
      console.error('Error recharging wallet:', error)
    }
  }

  const filteredWallets = wallets.filter(wallet =>
    wallet.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.admissionNumber?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading wallets...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Smart Wallet</h1>
        <p className="text-gray-600">Manage student canteen wallets and recharges</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{wallets.length}</div>
          <div className="text-sm text-gray-600">Active Wallets</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            ₹{wallets.reduce((sum, w) => sum + w.balance, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Balance</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {transactions.filter(t => t.type === 'RECHARGE' && new Date(t.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
          </div>
          <div className="text-sm text-gray-600">Recharges Today</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {wallets.filter(w => w.balance < 50).length}
          </div>
          <div className="text-sm text-gray-600">Low Balance Wallets</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWallets.map((wallet) => (
              <tr key={wallet.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{wallet.studentName}</div>
                  <div className="text-sm text-gray-500">{wallet.admissionNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {wallet.className}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${wallet.balance < 50 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{wallet.balance.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {wallet.lastTransaction ? new Date(wallet.lastTransaction).toLocaleDateString() : 'No transactions'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => {
                      setSelectedWallet(wallet)
                      setShowRechargeModal(true)
                    }}
                    className="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    Recharge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {transaction.type === 'RECHARGE' ? (
                  <ArrowDownRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{transaction.studentName}</div>
                  <div className="text-xs text-gray-500">{transaction.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${transaction.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'RECHARGE' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recharge Wallet</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Student: {selectedWallet.studentName}</p>
              <p className="text-sm text-gray-600">Current Balance: ₹{selectedWallet.balance.toFixed(2)}</p>
            </div>
            <form onSubmit={handleRecharge}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recharge Amount *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRechargeModal(false)
                    setRechargeAmount('')
                    setSelectedWallet(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
