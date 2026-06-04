import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ===============================
// BUILD DATE QUERY FILTER
// ===============================
const buildDateQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

// ===============================
// GET SEMUA LAPORAN BARANG
// ===============================
export async function getLaporanBarang(filters = {}) {
  const res = await fetch(`${API_URL}/laporan/barang${buildDateQuery(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil laporan barang');
  }

  return data;
}

// ===============================
// GET DETAIL LAPORAN BARANG
// ===============================
export async function getDetailLaporanBarang(id) {
  const res = await fetch(`${API_URL}/laporan/barang/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil detail laporan barang');
  }

  return data;
}

// ===============================
// GET FOTO LAPORAN BARANG
// ===============================
export async function getLaporanBarangImage(filename) {
  if (!filename) {
    throw new Error('filename wajib diisi');
  }

  const urlsToTry = [
    `${API_URL}/uploads/laporan_barang/${encodeURIComponent(filename)}`,
    `${API_URL}/laporan-barang/uploads/${encodeURIComponent(filename)}`,
  ];

  const errors = [];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
          'ngrok-skip-browser-warning': 'true',
          Accept: 'image/*,*/*',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }

      errors.push({ url, status: res.status });
    } catch (err) {
      errors.push({ url, error: err.message });
    }
  }

  throw new Error(
    `Gagal mengambil foto. Dicoba dari: ${errors.map((e) => e.url).join(', ')}`
  );
}