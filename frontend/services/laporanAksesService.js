import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getLaporanAkses() {
  const res = await fetch(`${API_URL}/laporan/akses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch laporan akses data');
  }
  return res.json();
}