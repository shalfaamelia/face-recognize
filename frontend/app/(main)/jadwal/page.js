'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
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
    const [allJadwal, setAllJadwal] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const toastRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getJadwal();
            setJadwal(data);
            setAllJadwal(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        applyFilters(keyword, selectedDay);
    };

    const handleDayFilter = (day) => {
        setSelectedDay(day);
        applyFilters(searchKeyword, day);
    };

    const applyFilters = (keyword, day) => {
        let filtered = allJadwal;

        // Filter by day
        if (day) {
            filtered = filtered.filter((item) => item.hari === day);
        }

        // Filter by keyword
        if (keyword && keyword.trim() !== '') {
            const lowerKeyword = keyword.toLowerCase();
            filtered = filtered.filter((item) =>
                item.kode?.toLowerCase().includes(lowerKeyword) ||
                item.nama?.toLowerCase().includes(lowerKeyword)
            );
        }

        setJadwal(filtered);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.nama?.trim()) newErrors.nama = 'Nama mata kuliah harus diisi';
        if (!form.dosen?.trim()) newErrors.dosen = 'Dosen harus diisi';
        if (!form.kelas?.trim()) newErrors.kelas = 'Kelas harus diisi';
        if (!form.hari) newErrors.hari = 'Hari harus dipilih';
        if (!form.jam_mulai?.trim()) newErrors.jam_mulai = 'Jam mulai harus diisi';
        if (!form.jam_selesai?.trim()) newErrors.jam_selesai = 'Jam selesai harus diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toastRef.current?.showToast('99', 'Silakan lengkapi semua field yang wajib diisi.');
            return;
        }

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
        setErrors({});
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
            <div className="mb-3">
                <h3 className="text-xl font-semibold" style={{ margin: '0 0 0.2rem 0' }}>
                    Manajemen Jadwal Praktikum
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Filter Hari</label>
                        <Dropdown
                            value={selectedDay}
                            onChange={(e) => handleDayFilter(e.value)}
                            options={[
                                { label: 'Semua Hari', value: null },
                                { label: 'Senin', value: 'Senin' },
                                { label: 'Selasa', value: 'Selasa' },
                                { label: 'Rabu', value: 'Rabu' },
                                { label: 'Kamis', value: 'Kamis' },
                                { label: 'Jumat', value: 'Jumat' },
                                { label: 'Sabtu', value: 'Sabtu' },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih hari"
                            style={{ width: '100%' }}
                        />
                    </div>
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
                        onSearch={handleSearch}
                        onAddClick={() => {
                            setForm({});
                            setEditing(false);
                            setErrors({});
                            setDialogVisible(true);
                        }}
                        onImportClick={() => fileInputRef.current?.click()}
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
                onHide={() => {
                    setDialogVisible(false);
                    setErrors({});
                }}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                editing={editing}
                errors={errors}
            />
        </Card>
    );
}
