import { getStoredToken } from '@/services/authService';

export function getAuthHeaders(extraHeaders = {}) {
  const token = getStoredToken();

  if (!token) {
    return { ...extraHeaders };
  }

  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}