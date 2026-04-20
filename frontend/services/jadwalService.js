import { getAuthHeaders } from '@/services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL; 

export async function getJadwal() {
  const res = await fetch(`${API_URL}/jadwal/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch jadwal');
  }

  return data;
}

export async function createJadwal(data) {
  const res = await fetch(`${API_URL}/jadwal/`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Failed to create jadwal');
  }

  return result;
}

export async function updateJadwal(id, data) {
  const res = await fetch(`${API_URL}/jadwal/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal update jadwal');
  }

  return result;
}

export async function deleteJadwal(id) {
  const res = await fetch(`${API_URL}/jadwal/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal hapus jadwal');
  }

  return data;
}