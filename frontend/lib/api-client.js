// API client utility for frontend
// Handles the response format: { success: boolean, data: T, error?: string, pagination?: ... }

export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options)
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'An error occurred')
  }

  return result.data
}

export async function apiGet(url) {
  return apiFetch(url)
}

export async function apiPost(url, data) {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function apiPut(url, data) {
  return apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function apiDelete(url) {
  return apiFetch(url, { method: 'DELETE' })
}

// Helper to extract data from API response (for use with raw fetch)
export function extractData(result, defaultValue = []) {
  return result?.data ?? defaultValue
}
