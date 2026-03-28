'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/userService';
import UserTable from './components/userTable';
import UserForm from './components/userForm';

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // =========================
  // Load daftar user dari backend
  // =========================
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      console.log("Data user dari backend:", data); // debug
      setUsers(data);
    } catch (err) {
      console.error("Gagal memuat user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // Handle submit form (create / update)
  // =========================
  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        // update user tanpa file (opsional, bisa ditambahkan)
        await updateUser(editingUser.id, formData);
        setEditingUser(null);
      } else {
        // create user + file foto
        const isMultipart = formData instanceof FormData; // deteksi FormData
        await createUser(formData, isMultipart);
      }

      setShowForm(false);
      loadUsers(); // refresh tabel otomatis
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan user: " + err.message);
    }
  };

  // =========================
  // Handle delete user
  // =========================
  const handleDelete = async (id) => {
    if (confirm("Hapus user ini?")) {
      try {
        await deleteUser(id);
        loadUsers(); // refresh tabel setelah delete
      } catch (err) {
        alert("Gagal menghapus user: " + err.message);
      }
    }
  };

  return (
    <div className="grid p-4">
      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-3">
            <h2>Manajemen Pengguna</h2>
            <button
              className="p-button p-component p-button-success"
              onClick={() => { setShowForm(true); setEditingUser(null); }}
            >
              Tambah User
            </button>
          </div>

          {/* Form Tambah/Edit User */}
          {showForm && (
            <UserForm
              initialData={editingUser}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingUser(null); }}
            />
          )}

          {/* Tabel User */}
          <UserTable
            users={users}
            onEdit={(user) => { setEditingUser(user); setShowForm(true); }}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </div>
  );
}