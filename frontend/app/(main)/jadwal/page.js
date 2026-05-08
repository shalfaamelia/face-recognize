'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import JadwalTable from './components/jadwalTable';
import JadwalForm from './components/jadwalForm';
import {
    getJadwal,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    importJadwalExcel,
} from '@/services/jadwalService';

export default function Page() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(false);
    const toastRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getJadwal();
            setJadwal(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            if (editing) await updateJadwal(form.id, form);
            else await createJadwal(form);

            toastRef.current?.showToast("00", "Data berhasil disimpan");
            fetchData();
            setDialogVisible(false);
            setForm({});
            setEditing(false);
        } catch (err) {
            console.error(err);
            toastRef.current?.showToast("01", "Gagal menyimpan data");
        }
    };

    const handleImportExcel = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const payload = new FormData();
        payload.append('file', file);

        setLoading(true);
        try {
            const result = await importJadwalExcel(payload);
            toastRef.current?.showToast("00", result.message || "Import jadwal berhasil");
            await fetchData();
        } catch (err) {
            console.error(err);
            toastRef.current?.showToast("01", err.message || "Gagal import jadwal");
        } finally {
            event.target.value = '';
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setForm(row);
        setEditing(true);
        setDialogVisible(true);
    };

    const handleDelete = (row) => {
        confirmDialog({
            message: `Yakin hapus '${row.nama}'?`,
            header: "Konfirmasi Hapus",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Ya",
            rejectLabel: "Batal",
            accept: async () => {
                try {
                    await deleteJadwal(row.id);
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
            <div className="flex items-center justify-between mb-3">

                <h3 className="text-xl font-semibold">Manajemen Jadwal Praktikum</h3>

                <div className="flex items-center ml-auto gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleImportExcel}
                    />
                    <HeaderBar
                        title=""
                        placeholder="Cari berdasarkan nama atau kode..."
                        onSearch={(keyword) => {
                            if (!keyword) fetchData();
                            else setJadwal(jadwal.filter(item =>
                                item.kode?.toLowerCase().includes(keyword.toLowerCase()) ||
                                item.nama?.toLowerCase().includes(keyword.toLowerCase())
                            ));
                        }}
                        onAddClick={() => { setForm({}); setEditing(false); setDialogVisible(true); }}
                    />
                    <Button
                        type="button"
                        label="Import Excel"
                        icon="pi pi-upload"
                        severity="success"
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                    />
                </div>
            </div>

            <JadwalTable
                jadwal={jadwal}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <JadwalForm
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                form={form} setForm={setForm}
                onSubmit={handleSubmit}
                editing={editing}
            />
        </Card>
    );
}
