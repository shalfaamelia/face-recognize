import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || API_URL;

// ===============================
// BUILD DATE QUERY (FILTER)
const buildDateQuery = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  const query = params.toString();
  return query ? `?${query}` : '';
};

// ===============================
// GET SEMUA LAPORAN BARANG
export async function getLaporanBarang(filters = {}) {
  const res = await fetch(`${API_URL}/laporan/barang${buildDateQuery(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil laporan barang');
  return data;
}

// ===============================
// GET DETAIL LAPORAN BARANG
export async function getDetailLaporanBarang(id) {
  const res = await fetch(`${API_URL}/laporan/barang/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil detail laporan barang');
  return data;
}

// ===============================
// IMAGE PROXY
export async function getLaporanBarangImage(filename) {
  if (!filename) throw new Error('filename wajib diisi');

  const urlsToTry = [
    `${BACKEND_API_URL}/uploads/laporan_barang/${encodeURIComponent(filename)}`,
    `${BACKEND_API_URL}/laporan-barang/uploads/${encodeURIComponent(filename)}`
  ];

  const errors = [];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'image/*,*/*',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } else {
        errors.push({ url, status: res.status });
      }
    } catch (err) {
      errors.push({ url, error: err.message });
    }
  }

  throw new Error(`Gagal mengambil foto. Dicoba dari: ${errors.map(e => e.url).join(', ')}`);
}

// ===============================
// CREATE LAPORAN BARANG (MOBILE)
export async function createLaporanBarang(payload) {
  const res = await fetch(`${API_URL}/laporan-barang`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: payload, // FormData: user_id, tanggal, keterangan, deskripsi, foto
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Gagal menambahkan laporan barang');
  return data;
}

// ===============================
// UPDATE LAPORAN BARANG (MOBILE)
export async function updateLaporanBarang(id, payload) {
  const res = await fetch(`${API_URL}/laporan-barang/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: payload, // FormData
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Gagal update laporan barang');
  return data;
}

// ===============================
// DELETE LAPORAN BARANG (MOBILE)
export async function deleteLaporanBarang(id, userId) {
  const url = `${API_URL}/laporan-barang/${id}?user_id=${userId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Gagal hapus laporan barang');
  return data;
}