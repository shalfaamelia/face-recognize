const API_URL = 'http://localhost:5000/api';

export async function getLaporanPeminjaman() {
  const res = await fetch(`${API_URL}/laporan/peminjaman`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil laporan peminjaman');
  }

  return data;
}