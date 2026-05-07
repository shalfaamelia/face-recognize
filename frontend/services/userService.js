import { getAuthHeaders } from '@/services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  return data;
}

export async function createUser(data, isMultipart = false) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: isMultipart
      ? getAuthHeaders()
      : getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: isMultipart ? data : JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Failed to create user');
  }

  return result;
}

export async function importUsersExcelZip(formData) {
  const res = await fetch(`${API_URL}/users/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal import user');
  }

  return result;
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal update user');
  }

  return result;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal hapus user');
  }

  return data;
}

export async function uploadUserFace(userId, formData) {
  // endpoint ini harus sesuai backend user.py
  const res = await fetch(`${API_URL}/users/${userId}/upload_faces`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Failed to upload face image');
  }

  return result;
}

export async function generateKode(role) {
  const res = await fetch(`${API_URL}/users/generate_kode?role=${role}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal generate kode');
  }

  return result;
}
