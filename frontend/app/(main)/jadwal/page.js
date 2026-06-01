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
  getDosenOptions,
} from '@/services/jadwalService';

export default function Page() {
  const [jadwal, setJadwal] = useState([]);
  const [allJadwal, setAllJadwal] = useState([]);
  const [dosenOptions, setDosenOptions] = useState([]);

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
      const [jadwalData, dosenData] = await Promise.all([
        getJadwal(),
        getDosenOptions(),
      ]);

      setJadwal(jadwalData);
      setAllJadwal(jadwalData);
      setDosenOptions(dosenData);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    applyFilters(keyword, selectedDay);
  };

  const handleDayFilter = (day) => {
    setSelectedDay(day);
    applyFilters(searchKeyword, day);
  };

  const applyFilters = (keyword, day) => {
    let filtered = [...allJadwal];

    if (day) {
      filtered = filtered.filter((item) => item.hari === day);
    }

    if (keyword && keyword.trim() !== '') {
      const lowerKeyword = keyword.toLowerCase();

      filtered = filtered.filter((item) =>
        item.kode?.toLowerCase().includes(lowerKeyword) ||
        item.nama?.toLowerCase().includes(lowerKeyword) ||
        item.dosen?.toLowerCase().includes(lowerKeyword) ||
        item.nip?.toLowerCase().includes(lowerKeyword) ||
        item.kelas?.toLowerCase().includes(lowerKeyword)
      );
    }

    setJadwal(filtered);
  };

  const padTimePart = (value) => String(value || '').padStart(2, '0');

  const normalizeTimeString = (value) =>
    String(value || '').replace(/:+$/, '').trim();

  const validateForm = () => {
    const newErrors = {};

    if (!form.nama?.trim()) {
      newErrors.nama = 'Nama mata kuliah harus diisi';
    }

    if (!form.dosen_user_id) {
      newErrors.dosen_user_id = 'Dosen harus dipilih';
    }

    if (!form.nip?.trim()) {
      newErrors.nip = 'NIP dosen tidak boleh kosong';
    }

    if (!form.kelas?.trim()) {
      newErrors.kelas = 'Kelas harus diisi';
    }

    if (!form.hari) {
      newErrors.hari = 'Hari harus dipilih';
    }

    if (!form.jam_mulai_jam?.trim()) {
      newErrors.jam_mulai_jam = 'Jam mulai (jam) harus diisi';
    } else if (!/^[0-2]?\d$/.test(form.jam_mulai_jam) || Number(form.jam_mulai_jam) > 23) {
      newErrors.jam_mulai_jam = 'Jam tidak valid';
    }

    if (!form.jam_mulai_menit?.trim()) {
      newErrors.jam_mulai_menit = 'Jam mulai (menit) harus diisi';
    } else if (!/^[0-5]?\d$/.test(form.jam_mulai_menit)) {
      newErrors.jam_mulai_menit = 'Menit tidak valid';
    }

    if (!form.jam_selesai_jam?.trim()) {
      newErrors.jam_selesai_jam = 'Jam selesai (jam) harus diisi';
    } else if (!/^[0-2]?\d$/.test(form.jam_selesai_jam) || Number(form.jam_selesai_jam) > 23) {
      newErrors.jam_selesai_jam = 'Jam tidak valid';
    }

    if (!form.jam_selesai_menit?.trim()) {
      newErrors.jam_selesai_menit = 'Jam selesai (menit) harus diisi';
    } else if (!/^[0-5]?\d$/.test(form.jam_selesai_menit)) {
      newErrors.jam_selesai_menit = 'Menit tidak valid';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toastRef.current?.showToast(
        '99',
        'Silakan lengkapi semua field yang wajib diisi.'
      );
      return;
    }

    const payload = {
      ...form,
      jam_mulai: `${padTimePart(form.jam_mulai_jam)}:${padTimePart(
        form.jam_mulai_menit
      )}`,
      jam_selesai: `${padTimePart(form.jam_selesai_jam)}:${padTimePart(
        form.jam_selesai_menit
      )}`,
    };

    delete payload.jam_mulai_jam;
    delete payload.jam_mulai_menit;
    delete payload.jam_selesai_jam;
    delete payload.jam_selesai_menit;

    try {
      if (editing) {
        await updateJadwal(form.id, payload);
      } else {
        await createJadwal(payload);
      }

      toastRef.current?.showToast("00", "Data berhasil disimpan");

      await fetchData();

      setDialogVisible(false);
      setForm({});
      setEditing(false);
      setErrors({});
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal menyimpan data");
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
      toastRef.current?.showToast(
        "00",
        result.message || "Import jadwal berhasil"
      );

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
    const [jamMulaiJam = '', jamMulaiMenit = ''] = normalizeTimeString(row.jam_mulai || '').split(':');
    const [jamSelesaiJam = '', jamSelesaiMenit = ''] = normalizeTimeString(row.jam_selesai || '').split(':');

    setForm({
      id: row.id,
      kode: row.kode || '',
      nama: row.nama || '',
      dosen_user_id: row.dosen_user_id || null,
      dosen: row.dosen || '',
      nip: row.nip || '',
      kelas: row.kelas || '',
      hari: row.hari || '',
      jam_mulai_jam: jamMulaiJam,
      jam_mulai_menit: jamMulaiMenit,
      jam_selesai_jam: jamSelesaiJam,
      jam_selesai_menit: jamSelesaiMenit,
    });

    setEditing(true);
    setErrors({});
    setDialogVisible(true);
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Yakin hapus jadwal '${row.nama}' kelas '${row.kelas}'?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await deleteJadwal(row.id);
          toastRef.current?.showToast("00", "Data berhasil dihapus");
          await fetchData();
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast(
            "01",
            `Gagal menghapus: ${err.message}`
          );
        }
      },
    });
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="mb-3">
        <h3
          className="text-xl font-semibold"
          style={{ margin: '0 0 0.2rem 0' }}
        >
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
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
              }}
            >
              Filter Hari
            </label>

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
                { label: 'Minggu', value: 'Minggu' },
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
            placeholder="Cari nama, kode, dosen, NIP, atau kelas..."
            onSearch={handleSearch}
            onAddClick={() => {
              setForm({
                kode: '',
                nama: '',
                dosen_user_id: null,
                dosen: '',
                nip: '',
                kelas: '',
                hari: '',
                jam_mulai_jam: '',
                jam_mulai_menit: '',
                jam_selesai_jam: '',
                jam_selesai_menit: '',
              });
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
        dosenOptions={dosenOptions}
      />
    </Card>
  );
}