const API_URL = 'http://localhost:5000/api';

export async function getLaporanBarang() {
  const res = await fetch(`${API_URL}/laporan/barang`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil laporan barang');
  }

  return data;
}

export async function getDetailLaporanBarang(id) {
  const res = await fetch(`${API_URL}/laporan/barang/${id}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil detail laporan barang');
  }

  return data;
}