import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const buildDateQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const query = params.toString();
  return query ? `?${query}` : '';
};

export async function getLaporanAkses(filters = {}) {
  const res = await fetch(`${API_URL}/laporan/akses${buildDateQuery(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch laporan akses data');
  }
  return res.json();
}
