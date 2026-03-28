'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const UserForm = ({ visible, onHide, onSubmit, form, setForm, errors }) => {
  const roles = [
    { label: 'Kepala Lab', value: 'kepala_lab' },
    { label: 'Teknisi', value: 'teknisi' },
    { label: 'Sarana Prasarana', value: 'sarpras' },
    { label: 'Mahasiswa', value: 'mahasiswa' }
  ];

  const inputClass = (field) =>
    errors[field] ? 'p-invalid w-full mt-2' : 'w-full mt-2';

  return (
    <Dialog
      header={form?.id ? 'Edit User' : 'Tambah User'}
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
        <div>
          <label>Kode</label>
          <InputText
            className={inputClass('kode')}
            value={form.kode}
            onChange={(e) => setForm({ ...form, kode: e.target.value })}
          />
        </div>

        <div>
          <label>Nama</label>
          <InputText
            className={inputClass('nama')}
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>

        <div>
          <label>Face Label</label>
          <InputText
            className="w-full mt-2"
            value={form.face_label}
            onChange={(e) => setForm({ ...form, face_label: e.target.value })}
          />
        </div>

        <div>
          <label>Role</label>
          <Dropdown
            className="w-full mt-2"
            value={form.role}
            options={roles}
            onChange={(e) => setForm({ ...form, role: e.value })}
            placeholder="Pilih role"
          />
        </div>

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

        {form.role !== 'mahasiswa' && (
          <div>
            <label>NIP</label>
            <InputText
              className="w-full mt-2"
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
            />
          </div>
        )}

        <div>
          <label>Email</label>
          <InputText
            className="w-full mt-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label>Password</label>
          <InputText
            type="password"
            className="w-full mt-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div>
          <label>Status</label>
          <Dropdown
            className="w-full mt-2"
            placeholder="Pilih status"
            value={form.status}
            options={[
              { label: 'Aktif', value: 'aktif' },
              { label: 'Nonaktif', value: 'nonaktif' }
            ]}
            onChange={(e) => setForm({ ...form, status: e.value })}
          />
        </div>

        {/* ================= MULTIPLE FILE UPLOAD ================= */}
        <div className="field">
          <label>Upload Foto (Bisa lebih dari 1)</label>
          <input
            type="file"
            className="w-full mt-2"
            accept="image/*"
            multiple
            onChange={(e) => setForm({ ...form, files: e.target.files })}
          />
        </div>

        <div className="text-right pt-3">
          <Button type="submit" label="Simpan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default UserForm;