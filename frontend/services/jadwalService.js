const API_URL = 'http://localhost:5000/api';

export async function getJadwal() {
  const res = await fetch(`${API_URL}/jadwal/`);
  if (!res.ok) throw new Error('Failed to fetch jadwal');
  return res.json();
}

export async function createJadwal(data) {
    const res = await fetch(`${API_URL}/jadwal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create jadwal');
  return res.json();
}

export async function updateJadwal(id, data) {
  const res = await fetch(`${API_URL}/jadwal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal update jadwal');
  return res.json();
}

export async function deleteJadwal(id) {
  const res = await fetch(`${API_URL}/jadwal/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Gagal hapus jadwal");
  }
  return res.json();
}