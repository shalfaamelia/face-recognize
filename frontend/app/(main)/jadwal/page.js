'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
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
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [form, setForm] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const toastRef = useRef(null);

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
        item.prodi?.toLowerCase().includes(lowerKeyword) ||
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

    if (!form.prodi?.trim()) {
      newErrors.prodi = 'Prodi harus diisi';
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
    const file = event?.target?.files?.[0] || importFile;

    if (!file) {
      toastRef.current?.showToast("01", "File Excel wajib dipilih");
      return;
    }

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
      setImportDialogVisible(false);
      setImportFile(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast("01", err.message || "Gagal import jadwal");
    } finally {
      if (event?.target) {
        event.target.value = '';
      }
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/format_import_jadwal_praktikum.xlsx?v=prodi-20260604';
    link.download = 'format_import_jadwal_praktikum.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      prodi: row.prodi || '',
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

          <HeaderBar
            title=""
            placeholder="Cari nama, kode, dosen, NIP, prodi, atau kelas..."
            onSearch={handleSearch}
            onAddClick={() => {
              setForm({
                kode: '',
                nama: '',
                dosen_user_id: null,
                dosen: '',
                nip: '',
                prodi: '',
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
            onImportClick={() => setImportDialogVisible(true)}
          />
        </div>
      </div>

      <Dialog
        header="Import Jadwal"
        visible={importDialogVisible}
        onHide={() => {
          setImportDialogVisible(false);
          setImportFile(null);
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
              onChange={(e) => setImportFile(e.target.files?.[0])}
            />
          </div>

          <div className="p-3 rounded border border-300 bg-gray-50 text-sm">
            <p className="font-semibold mb-2">Petunjuk Singkat</p>
            <p className="m-0">Silahkan download format terlebih dahulu. Untuk petunjuk pengisian data akan ada di dalam file.</p>
          </div>

          <div className="flex justify-content-between gap-3 flex-wrap align-items-center pt-3">
            <Button
              type="button"
              label="Download Format"
              icon="pi pi-download"
              severity="warning"
              size="small"
              onClick={handleDownloadTemplate}
            />
            <Button
              type="button"
              label="Import"
              icon="pi pi-upload"
              severity="severity"
              size="small"
              loading={loading}
              onClick={handleImportExcel}
            />
          </div>
        </div>
      </Dialog>

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
