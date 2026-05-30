'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const UserForm = ({ visible, onHide, onSubmit, form, setForm, errors, editingUser }) => {
  const roles = [
    { label: 'Kepala Lab', value: 'kepala_lab' },
    { label: 'Teknisi', value: 'teknisi' },
    { label: 'Dosen', value: 'dosen' },
    { label: 'Sarana Prasarana', value: 'sarpras' },
    { label: 'Mahasiswa', value: 'mahasiswa' }
  ];

  const inputClass = (field) =>
    classNames('w-full mt-2', { 'p-invalid': errors?.[field] });

  const dropdownClass = (field) =>
    classNames('w-full', { 'p-invalid': errors?.[field] });

  const onRoleChange = async (e) => {
    const role = e.value;
    setForm({ ...form, role });

    if (!editingUser) { // generate kode hanya saat tambah user
      try {
        const res = await fetch(`${API_URL}/users/generate_kode?role=${role}`);
        const data = await res.json();
        setForm((prev) => ({ ...prev, kode: data.kode }));
      } catch (err) {
        console.error("Gagal generate kode:", err);
        setForm((prev) => ({ ...prev, kode: '-' }));
      }
    }
  };

  return (
    <Dialog
      header={editingUser ? 'Edit User' : 'Tambah User'}
      visible={visible}
      onHide={onHide}
      style={{ width: '40vw' }}
      modal
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Kode Otomatis */}
        <div>
          <label>Kode</label>
          <InputText
            className={inputClass('kode')}
            value={form.kode || 'Otomatis'}
            disabled
          />
        </div>

        {/* Nama */}
        <div>
          <label>Nama</label>
          <InputText
            className={inputClass('nama')}
            placeholder="Masukkan nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
          {errors?.nama && <small className="p-error">{errors.nama}</small>}
        </div>

        {/* Role hanya saat tambah */}
        {!editingUser && (
          <div>
            <label>Role</label>
            <Dropdown
              className={dropdownClass('role')}
              value={form.role}
              options={roles}
              onChange={onRoleChange}
              placeholder="Pilih Role"
            />
            {errors?.role && <small className="p-error">{errors.role}</small>}
          </div>
        )}

        {/* Mahasiswa Fields */}
        {form.role === 'mahasiswa' && (
          <>
            <div>
              <label>NIM</label>
              <InputText
                className={inputClass('nim')}
                placeholder="Masukkan NIM"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
              />
              {errors?.nim && <small className="p-error">{errors.nim}</small>}
            </div>
            <div>
              <label>Prodi</label>
              <InputText
                className={inputClass('prodi')}
                placeholder="Masukkan program studi"
                value={form.prodi}
                onChange={(e) => setForm({ ...form, prodi: e.target.value })}
              />
              {errors?.prodi && <small className="p-error">{errors.prodi}</small>}
            </div>
            <div>
              <label>Kelas</label>
              <InputText
                className={inputClass('kelas')}
                placeholder="Masukkan kelas"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              />
              {errors?.kelas && <small className="p-error">{errors.kelas}</small>}
            </div>
          </>
        )}

        {/* Non-Mahasiswa Fields */}
        {form.role !== 'mahasiswa' && (
          <>
            <div>
              <label>NIP</label>
              <InputText
                className={inputClass('nip')}
                placeholder="Masukkan NIP"
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
              />
              {errors?.nip && <small className="p-error">{errors.nip}</small>}
            </div>
            <div>
              <label>Email</label>
              <InputText
                className={inputClass('email')}
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors?.email && <small className="p-error">{errors.email}</small>}
            </div>
            {/* Password hanya saat tambah */}
            {!editingUser && (
              <div>
                <label>Password</label>
                <InputText
                  type="password"
                  className={inputClass('password')}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors?.password && <small className="p-error">{errors.password}</small>}
              </div>
            )}
          </>
        )}

        {/* Status */}
        <div>
          <label>Status</label>
          <Dropdown
            className={dropdownClass('status')}
            placeholder="Pilih Status"
            value={form.status}
            options={[
              { label: 'Aktif', value: 'aktif' },
              { label: 'Nonaktif', value: 'nonaktif' }
            ]}
            onChange={(e) => setForm({ ...form, status: e.value })}
          />
          {errors?.status && <small className="p-error">{errors.status}</small>}
        </div>

        {/* Upload Foto hanya saat tambah */}
        {!editingUser && (
          <div className="field">
            <label>Upload Foto (Bisa lebih dari 1)</label>
            <input
              type="file"
              name="files"
              className="w-full mt-2"
              accept="image/*"
              multiple
              onChange={(e) => setForm({ ...form, files: e.target.files })}
            />
          </div>
        )}

        {/* Submit */}
        <div className="text-right pt-3">
          <Button type="submit" label="Simpan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default UserForm;
