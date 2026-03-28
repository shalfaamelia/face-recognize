'use client';

import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { createUser } from '@/services/userService';

export default function UserForm({ onSubmitSuccess, initialData, onCancel }) {
  const [form, setForm] = useState({
    kode: '',
    nama: '',
    face_label: '',
    role: 'mahasiswa',
    nim: '',
    nip: '',
    prodi: '',
    kelas: '',
    email: '',
    password: '',
    status: 'aktif'
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Gunakan FormData untuk mendukung file upload
      const formData = new FormData();
      for (let key in form) {
        formData.append(key, form[key]);
      }
      if (file) formData.append('file', file);

      const res = await createUser(formData, true); // parameter kedua: multipart
      alert(`User berhasil dibuat${res.file_uploaded ? `, file: ${res.file_uploaded}` : ''}`);
      setForm({
        kode: '',
        nama: '',
        face_label: '',
        role: 'mahasiswa',
        nim: '',
        nip: '',
        prodi: '',
        kelas: '',
        email: '',
        password: '',
        status: 'aktif'
      });
      setFile(null);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      alert(`Gagal membuat user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    { label: 'Kepala Lab', value: 'kepala_lab' },
    { label: 'Teknisi', value: 'teknisi' },
    { label: 'Sarana Prasarana', value: 'sarpras' },
    { label: 'Mahasiswa', value: 'mahasiswa' }
  ];

  return (
    <form onSubmit={handleSubmit} className="p-fluid card p-3 mb-4">
      <div className="field">
        <label>Kode</label>
        <InputText name="kode" value={form.kode} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Nama</label>
        <InputText name="nama" value={form.nama} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Face Label</label>
        <InputText name="face_label" value={form.face_label} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Role</label>
        <Dropdown name="role" value={form.role} options={roles} onChange={handleChange} placeholder="Pilih role" />
      </div>

      {form.role === 'mahasiswa' && (
        <>
          <div className="field">
            <label>NIM</label>
            <InputText name="nim" value={form.nim} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Prodi</label>
            <InputText name="prodi" value={form.prodi} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Kelas</label>
            <InputText name="kelas" value={form.kelas} onChange={handleChange} />
          </div>
        </>
      )}

      {form.role !== 'mahasiswa' && (
        <div className="field">
          <label>NIP</label>
          <InputText name="nip" value={form.nip} onChange={handleChange} />
        </div>
      )}

      <div className="field">
        <label>Email</label>
        <InputText name="email" value={form.email} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Password</label>
        <InputText type="password" name="password" value={form.password} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Status</label>
        <Dropdown
          name="status"
          value={form.status}
          options={[
            { label: 'Aktif', value: 'aktif' },
            { label: 'Nonaktif', value: 'nonaktif' }
          ]}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label>Upload Foto Wajah (opsional)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="flex justify-content-end mt-3">
        <Button type="submit" label={submitting ? "Menyimpan..." : "Simpan"} className="mr-2" disabled={submitting} />
        <Button type="button" label="Batal" className="p-button-secondary" onClick={onCancel} disabled={submitting} />
      </div>
    </form>
  );
}