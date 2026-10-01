'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const PortalContext = createContext(null)

export function PortalProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [studentId, setStudentId] = useState('')

  const load = useCallback(async (id) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/portal/data${id ? `?studentId=${id}` : ''}`)
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Could not load your data')
      setData(result.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(studentId)
  }, [studentId, load])

  return (
    <PortalContext.Provider
      value={{ data, loading, error, selectStudent: setStudentId, refresh: () => load(studentId) }}
    >
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal() {
  return useContext(PortalContext)
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '-'

export const formatMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
