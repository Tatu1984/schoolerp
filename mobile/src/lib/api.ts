import * as SecureStore from 'expo-secure-store';

// Thin client for the School ERP backend. Tokens live in the device keychain;
// an expired access token is renewed once with the refresh token, then the call is retried.

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const ACCESS_KEY = 'schoolerp.accessToken';
const REFRESH_KEY = 'schoolerp.refreshToken';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
  schoolName: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

async function saveTokens(access: string, refresh: string) {
  accessToken = access;
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens() {
  accessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function raw(path: string, init: RequestInit = {}, token?: string | null) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the school server. Check your internet connection.', 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.error || 'Something went wrong. Please try again.', res.status);
  }
  return body.data;
}

async function refreshTokens() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const data = await raw('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    await saveTokens(data.accessToken, data.refreshToken);
    return data.user as AuthUser;
  } catch {
    return null;
  }
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  if (!accessToken) accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
  try {
    return await raw(path, init, accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (!(await refreshTokens())) {
      await clearTokens();
      onSessionExpired?.();
      throw new ApiError('Your session has expired. Please sign in again.', 401);
    }
    return raw(path, init, accessToken);
  }
}

const PORTAL_ROLES = ['PARENT', 'STUDENT'];

export async function signIn(email: string, password: string) {
  const data = await raw('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!PORTAL_ROLES.includes(data.user.role)) {
    throw new ApiError('This app is for parents and students. Staff should use the web portal.', 403);
  }
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user as AuthUser;
}

// Called at launch: resumes the previous session if the stored tokens are still good.
export async function restoreSession() {
  const user = await refreshTokens();
  if (!user || !PORTAL_ROLES.includes(user.role)) {
    await clearTokens();
    return null;
  }
  return user;
}
