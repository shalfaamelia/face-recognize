const API_URL = 'http://localhost:5000/api';

export async function getPeminjaman() {
  const res = await fetch(`${API_URL}/admin/peminjaman`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil data peminjaman');
  }

  return data;
}

export async function updateStatusPeminjaman(id, data) {
  const res = await fetch(`${API_URL}/admin/peminjaman/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal update status peminjaman');
  }

  return result;
}