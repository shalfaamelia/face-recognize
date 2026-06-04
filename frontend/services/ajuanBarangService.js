import { getAuthHeaders } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAjuanBarang() {
  const res = await fetch(`${API_URL}/admin/ajuan-barang`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengambil ajuan barang');
  }

  return data;
}

export async function terimaAjuanBarang(id, admin_id = null) {
  const res = await fetch(`${API_URL}/admin/ajuan-barang/${id}/terima`, {
    method: 'PUT',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ admin_id }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal menerima ajuan barang');
  }

  return data;
}

export async function getAjuanBarangImage(filename) {
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