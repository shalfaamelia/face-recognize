'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import UserTable from './components/userTable';
import UserForm from './components/userForm';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/userService';

export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [errors, setErrors] = useState({});

  const toastRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
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
    if (!keyword) {
      setData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        item.kode?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.nama?.toLowerCase().includes(keyword.toLowerCase())
      );
      setUsers(filtered);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
      } else {
        const isMultipart = form.files && form.files.length > 0;
        let payload;

        if (form.files && form.files.length > 0) {
          const payload = new FormData();
          Object.keys(form).forEach(key => {
            if (key !== 'files') payload.append(key, form[key]);
          });
          for (let i = 0; i < form.files.length; i++) {
            payload.append('files', form.files[i]);
          }
          await createUser(payload, true);
        }
      }
      toastRef.current?.showToast("00", "Data berhasil disimpan");
      fetchData();
      setDialogVisible(false);
      setForm({});
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", "Gagal menyimpan data");
    }
  };

    const handleEdit = (user) => {
      setForm(user);
      setEditingUser(user);
      setDialogVisible(true);
    };
  
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
            toastRef.current?.showToast("01", "Gagal menghapus data");
          }
        },
      });
    };
  
    return (
      <Card>
        <ToastNotifier ref={toastRef} />
        <ConfirmDialog />
        <div className="flex items-center justify-between mb-3">

          <h3 className="text-xl font-semibold">Manajemen User</h3>

          <div className="flex items-center ml-auto gap-2">
            <HeaderBar
              title=""
              placeholder="Cari berdasarkan nama atau kode..."
              onSearch={handleSearch}
              onAddClick={() => {
                setForm({});
                setEditingUser(null);
                setDialogVisible(true);
              }}
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
          onHide={() => setDialogVisible(false)}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          errors={errors}
        />
      </Card>
    );
  }