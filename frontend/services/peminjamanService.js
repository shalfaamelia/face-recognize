import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPeminjaman() {
  const res = await fetch(`${API_URL}/admin/peminjaman`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil data peminjaman');
  }

  return data;
}

export async function updateStatusPeminjaman(id, data) {
  const res = await fetch(`${API_URL}/admin/peminjaman/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal update status peminjaman');
  }

  return result;
}