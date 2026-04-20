const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getLaporanPeminjaman() {
  const res = await fetch(`${API_URL}/laporan/peminjaman`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil laporan peminjaman');
  }

  return data;
}