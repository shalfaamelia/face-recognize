import { getAuthHeaders } from '@/services/authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || API_URL;

// ===============================
// GET USERS
// ===============================
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  return data;
}

// ===============================
// CREATE USER
// ===============================
export async function createUser(data, isMultipart = false) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: isMultipart
      ? getAuthHeaders()
      : getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: isMultipart ? data : JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Failed to create user');
  }

  return result;
}

// ===============================
// IMPORT USERS
// ===============================
export async function importUsersExcelZip(formData) {
  const res = await fetch(`${API_URL}/users/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal import user');
  }

  return result;
}

// ===============================
// UPDATE & DELETE USER
// ===============================
export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal update user');
  }

  return result;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Gagal hapus user');
  }

  return data;
}

// ===============================
// UPLOAD USER FACES
// ===============================
export async function uploadUserFace(userId, formData) {
  const res = await fetch(`${API_URL}/users/${userId}/upload_faces`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Failed to upload face image');
  }

  return result;
}

// ===============================
// GENERATE KODE OTOMATIS
// ===============================
export async function generateKode(role) {
  const res = await fetch(`${API_URL}/users/generate_kode?role=${role}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.message || 'Gagal generate kode');
  }

  return result;
}

// ===============================
// IMAGE PROXY FUNCTION
// ===============================
export async function getUserFaceImage(faceLabel, filename) {
  if (!faceLabel || !filename) throw new Error('face_label dan filename wajib diisi');

  const imageUrl = `${BACKEND_URL}/uploads/${encodeURIComponent(faceLabel)}/${encodeURIComponent(filename)}`;

  const res = await fetch(imageUrl, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil gambar: ${res.status}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}