'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

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
    errors[field] ? 'p-invalid w-full mt-2' : 'w-full mt-2';

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
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>

        {/* Role hanya saat tambah */}
        {!editingUser && (
          <div>
            <label>Role</label>
            <Dropdown
              className="w-full mt-2"
              value={form.role}
              options={roles}
              onChange={onRoleChange}
              placeholder="Pilih Role"
            />
          </div>
        )}

        {/* Mahasiswa Fields */}
        {form.role === 'mahasiswa' && (
          <>
            <div>
              <label>NIM</label>
              <InputText
                className="w-full mt-2"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
              />
            </div>
            <div>
              <label>Prodi</label>
              <InputText
                className="w-full mt-2"
                value={form.prodi}
                onChange={(e) => setForm({ ...form, prodi: e.target.value })}
              />
            </div>
            <div>
              <label>Kelas</label>
              <InputText
                className="w-full mt-2"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Non-Mahasiswa Fields */}
        {form.role !== 'mahasiswa' && (
          <>
            <div>
              <label>NIP</label>
              <InputText
                className="w-full mt-2"
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
              />
            </div>
            <div>
              <label>Email</label>
              <InputText
                className="w-full mt-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {/* Password hanya saat tambah */}
            {!editingUser && (
              <div>
                <label>Password</label>
                <InputText
                  type="password"
                  className="w-full mt-2"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
          </>
        )}

        {/* Status */}
        <div>
          <label>Status</label>
          <Dropdown
            className="w-full mt-2"
            placeholder="Pilih Status"
            value={form.status}
            options={[
              { label: 'Aktif', value: 'aktif' },
              { label: 'Nonaktif', value: 'nonaktif' }
            ]}
            onChange={(e) => setForm({ ...form, status: e.value })}
          />
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
