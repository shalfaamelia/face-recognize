const API_URL = 'http://localhost:5000/api';

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(data, isMultipart = false) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
    body: isMultipart ? data : JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal update user');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Gagal hapus user");
  }
  return res.json();
}

export async function uploadUserFace(userId, formData) {
  const res = await fetch(`http://localhost:5000/api/user_faces/upload/${userId}`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Failed to upload face image");
  return res.json();
}