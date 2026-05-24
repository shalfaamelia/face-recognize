import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const buildDateQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const query = params.toString();
  return query ? `?${query}` : '';
};

export async function getLaporanPeminjaman(filters = {}) {
  const res = await fetch(`${API_URL}/laporan/peminjaman${buildDateQuery(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil laporan peminjaman');
  }

  return data;
}
