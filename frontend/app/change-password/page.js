'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const forced = session?.user?.mustChangePassword
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirm) {
      setError('The new passwords do not match')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(result.error || 'Could not change the password')
        return
      }
      // Changing the password ends every existing session, including this one
      await signOut({ redirect: false })
      router.push('/login?changed=1')
    } catch (err) {
      setError('Could not change the password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, autoComplete) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        type="password"
        required
        autoComplete={autoComplete}
        className="input"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">{forced ? 'Choose a new password' : 'Change password'}</h1>
        <p className="text-gray-600 mt-2 mb-6">
          {forced
            ? 'You signed in with a temporary password. Choose your own to continue.'
            : 'You will be asked to sign in again afterwards.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
          {field('currentPassword', forced ? 'Temporary password' : 'Current password', 'current-password')}
          {field('newPassword', 'New password', 'new-password')}
          {field('confirm', 'Confirm new password', 'new-password')}
          <p className="text-xs text-gray-500">At least 8 characters, with a letter and a number.</p>

          <button type="submit" disabled={saving} className="btn btn-primary w-full disabled:opacity-50">
            {saving ? 'Saving...' : 'Change password'}
          </button>
          {!forced && (
            <button type="button" onClick={() => router.back()} className="btn btn-secondary w-full">
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
