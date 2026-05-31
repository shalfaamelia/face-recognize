'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import UserTable from './components/userTable';
import UserForm from './components/userForm';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsersExcelZip,
} from '@/services/userService';

export default function Page() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importFiles, setImportFiles] = useState({});
  const [form, setForm] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const toastRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setAllUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    applyFilters(keyword, selectedRole);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    applyFilters(searchKeyword, role);
  };

  const applyFilters = (keyword, role) => {
    let filtered = allUsers;

    // Filter by role
    if (role) {
      filtered = filtered.filter((item) => item.role === role);
    }

    // Filter by keyword
    if (keyword && keyword.trim() !== '') {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter((item) =>
        item.kode?.toLowerCase().includes(lowerKeyword) ||
        item.nama?.toLowerCase().includes(lowerKeyword)
      );
    }

    setUsers(filtered);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toastRef.current?.showToast('99', 'Silakan lengkapi semua field yang wajib diisi.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
      } else {
        const isMultipart = form.files && form.files.length > 0;

        if (isMultipart) {
          const payload = new FormData();
          Object.keys(form).forEach(key => {
            if (key !== 'files' && form[key] !== undefined && form[key] !== null) {
              payload.append(key, form[key]);
            }
          });
          for (let i = 0; i < form.files.length; i++) {
            payload.append('files', form.files[i]);
          }
          await createUser(payload, true);
        } else {
          await createUser(form);
        }
      }

      toastRef.current?.showToast("00", "Data berhasil disimpan");
      fetchData();
      setDialogVisible(false);
      setForm({});
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal menyimpan data");
    }
  };

  const handleImportUsers = async () => {
    if (!importFiles.excel) {
      toastRef.current?.showToast("01", "File Excel wajib dipilih");
      return;
    }

    const payload = new FormData();
    payload.append('excel', importFiles.excel);
    if (importFiles.photosZip) {
      payload.append('photos_zip', importFiles.photosZip);
    }

    setLoading(true);
    try {
      const result = await importUsersExcelZip(payload);
      toastRef.current?.showToast("00", result.message || "Import user berhasil");
      await fetchData();
      setImportDialogVisible(false);
      setImportFiles({});
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal import user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    // Hanya kolom yang bisa diedit yang di-set ke form
    let editableForm = {
      id: user.id,
      nama: user.nama,
      role: user.role,
    };

    if (user.role === 'mahasiswa') {
      editableForm.nim = user.nim;
      editableForm.prodi = user.prodi;
      editableForm.kelas = user.kelas;
    } else {
      editableForm.nip = user.nip;
      editableForm.email = user.email;
    }

    setForm(editableForm);
    setEditingUser(user);
    setErrors({});
    setDialogVisible(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const nimValue = String(form.nim || '').trim();
    const nipValue = String(form.nip || '').trim();

    if (!form.nama?.trim()) newErrors.nama = 'Nama harus diisi';
    if (!form.role) newErrors.role = 'Role harus dipilih';
    
    if (form.role === 'mahasiswa') {
      if (!nimValue) {
        newErrors.nim = 'NIM harus diisi';
      } else if (nimValue.length !== 9) {
        newErrors.nim = 'NIM harus 9 karakter';
      }
      if (!form.prodi?.trim()) newErrors.prodi = 'Prodi harus diisi';
      if (!form.kelas?.trim()) newErrors.kelas = 'Kelas harus diisi';
    } else if (form.role !== 'mahasiswa') {
      if (!nipValue) {
        newErrors.nip = 'NIP harus diisi';
      } else if (!/^\d{10,20}$/.test(nipValue)) {
        newErrors.nip = 'NIP harus berupa angka 10-20 digit';
      }
      if (!form.email?.trim()) newErrors.email = 'Email harus diisi';
      if (!editingUser && !form.password?.trim()) {
        newErrors.password = 'Password harus diisi';
      } else if (form.password?.trim() && form.password.trim().length < 5) {
        newErrors.password = 'Password minimal 5 karakter';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Delete
  const handleDelete = (user) => {
    confirmDialog({
      message: `Yakin hapus '${user.nama}'?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await deleteUser(user.id);
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          fetchData();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast("01", `Gagal menghapus: ${err.message}`);
        }
      },
    });
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      <div className="mb-3">
        <h3 className="text-xl font-semibold" style={{ margin: '0 0 0.2rem 0' }}>
          Manajemen User
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Filter Role</label>
            <Dropdown
              value={selectedRole}
              onChange={(e) => handleRoleFilter(e.value)}
              options={[
                { label: 'Semua Role', value: null },
                { label: 'Mahasiswa', value: 'mahasiswa' },
                { label: 'Kepala Lab', value: 'kepala_lab' },
                { label: 'Teknisi', value: 'teknisi' },
                { label: 'Sarpras', value: 'sarpras' },
                { label: 'Dosen', value: 'dosen' },
              ]}
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih role"
              style={{ width: '100%' }}
            />
          </div>
          <HeaderBar
            title=""
            placeholder="Cari berdasarkan nama atau kode..."
            onSearch={handleSearch}
            onAddClick={() => {
              setForm({});
              setEditingUser(null);
              setErrors({});
              setDialogVisible(true);
            }}
            onImportClick={() => setImportDialogVisible(true)}
          />
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserForm
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setErrors({});
        }}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        errors={errors}
        editingUser={editingUser} // menandakan ini proses edit
      />

      <Dialog
        header="Import User"
        visible={importDialogVisible}
        onHide={() => {
          setImportDialogVisible(false);
          setImportFiles({});
        }}
        style={{ width: '40vw' }}
        modal
      >
        <div className="space-y-3">
          <div>
            <label>File Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              className="w-full mt-2"
              onChange={(e) => setImportFiles((prev) => ({
                ...prev,
                excel: e.target.files?.[0],
              }))}
            />
          </div>

          <div>
            <label>ZIP Foto (.zip)</label>
            <input
              type="file"
              accept=".zip"
              className="w-full mt-2"
              onChange={(e) => setImportFiles((prev) => ({
                ...prev,
                photosZip: e.target.files?.[0],
              }))}
            />
          </div>

          <div className="text-right pt-3">
            <Button
              type="button"
              label="Import"
              icon="pi pi-upload"
              loading={loading}
              onClick={handleImportUsers}
            />
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
