import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  const data = await res.json();
  return data.profile;
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profileData),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  
  return data.profile;
}