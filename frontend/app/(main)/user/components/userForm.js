'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

const API_URL = 'http://localhost:5000/api';

const UserForm = ({
  visible,
  onHide,
  onSubmit,
  form,
  setForm,
  errors,
  editingUser,
}) => {
  const roles = [
    { label: 'Kepala Lab', value: 'kepala_lab' },
    { label: 'Teknisi', value: 'teknisi' },
    { label: 'Dosen', value: 'dosen' },
    { label: 'Sarana Prasarana', value: 'sarpras' },
    { label: 'Mahasiswa', value: 'mahasiswa' },
  ];

  const inputClass = (field) =>
    classNames('w-full mt-2', { 'p-invalid': errors?.[field] });

  const dropdownClass = (field) =>
    classNames('w-full', { 'p-invalid': errors?.[field] });

  const onRoleChange = async (e) => {
    const role = e.value;

    setForm({
      ...form,
      role,
      nim: '',
      nip: '',
      prodi: '',
      kelas: '',
      email: '',
      password: '',
      files: null,
    });

    if (!editingUser) {
      try {
        const res = await fetch(`${API_URL}/users/generate_kode?role=${role}`);
        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          kode: data.kode,
        }));
      } catch (err) {
        console.error('Gagal generate kode:', err);

        setForm((prev) => ({
          ...prev,
          kode: '-',
        }));
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
        <div>
          <label>Kode</label>
          <InputText
            className={inputClass('kode')}
            value={editingUser ? form.kode || '' : form.kode || 'Otomatis'}
            disabled
          />
        </div>

        <div>
          <label>Nama</label>
          <InputText
            className={inputClass('nama')}
            placeholder="Masukkan Nama"
            value={form.nama || ''}
            onChange={(e) =>
              setForm({
                ...form,
                nama: e.target.value,
              })
            }
          />
          {errors?.nama && <small className="p-error">{errors.nama}</small>}
        </div>

        {!editingUser && (
          <div>
            <label>Role</label>
            <Dropdown
              className={dropdownClass('role')}
              value={form.role || null}
              options={roles}
              onChange={onRoleChange}
              placeholder="Pilih Role"
            />
            {errors?.role && <small className="p-error">{errors.role}</small>}
          </div>
        )}

        {form.role === 'mahasiswa' && (
          <>
            <div>
              <label>NIM</label>
              <InputText
                className={inputClass('nim')}
                placeholder="Masukkan NIM"
                value={form.nim || ''}
                maxLength={9}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nim: e.target.value.slice(0, 9),
                  })
                }
              />
              {errors?.nim && <small className="p-error">{errors.nim}</small>}
            </div>

            <div>
              <label>Program Studi</label>
              <InputText
                className={inputClass('prodi')}
                placeholder="Masukkan Program Studi"
                value={form.prodi || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prodi: e.target.value,
                  })
                }
              />
              {errors?.prodi && (
                <small className="p-error">{errors.prodi}</small>
              )}
            </div>

            <div>
              <label>Kelas</label>
              <InputText
                className={inputClass('kelas')}
                placeholder="Masukkan Kelas"
                value={form.kelas || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kelas: e.target.value,
                  })
                }
              />
              {errors?.kelas && (
                <small className="p-error">{errors.kelas}</small>
              )}
            </div>
          </>
        )}

        {form.role !== 'mahasiswa' && (
          <>
            <div>
              <label>NIP</label>
              <InputText
                className={inputClass('nip')}
                placeholder="Masukkan NIP"
                value={form.nip || ''}
                keyfilter="int"
                maxLength={18}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nip: e.target.value.replace(/\D/g, '').slice(0, 18),
                  })
                }
              />
              {errors?.nip && <small className="p-error">{errors.nip}</small>}
            </div>

            <div>
              <label>Email</label>
              <InputText
                className={inputClass('email')}
                placeholder="Masukkan Email"
                value={form.email || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
              {errors?.email && (
                <small className="p-error">{errors.email}</small>
              )}
            </div>

            <div>
              <label>Password</label>
              <InputText
                type="password"
                className={inputClass('password')}
                placeholder={
                  editingUser
                    ? 'Kosongkan apabila tidak mengubah Password'
                    : 'Masukkan Password'
                }
                value={form.password || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
              {errors?.password && (
                <small className="p-error">{errors.password}</small>
              )}
            </div>
          </>
        )}

        {!editingUser && (
          <div className="field">
            <label>Upload Foto (Dapat lebih dari 1 foto)</label>
            <input
              type="file"
              name="files"
              className="w-full mt-2"
              accept="image/*"
              multiple
              onChange={(e) =>
                setForm({
                  ...form,
                  files: e.target.files,
                })
              }
            />
          </div>
        )}

        <div className="text-right pt-3">
          <Button type="submit" label="Simpan" icon="pi pi-save" />
        </div>
      </form>
    </Dialog>
  );
};

export default UserForm;
