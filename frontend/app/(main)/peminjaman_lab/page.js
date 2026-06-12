'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from '@/app/components/headerbar';
import PeminjamanTable from './components/peminjamanTable';
import {
  getPeminjaman,
  updateStatusPeminjaman,
} from '@/services/peminjamanService';

export default function Page() {
  const [peminjaman, setPeminjaman] = useState([]);
  const [allPeminjaman, setAllPeminjaman] = useState([]);
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const showToast = (severity, summary, detail) => {
    toastRef.current?.show?.({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPeminjaman();
      setAllPeminjaman(data);
      setPeminjaman(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === '') {
      setPeminjaman(allPeminjaman);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const filtered = allPeminjaman.filter((item) =>
      item.nama?.toLowerCase().includes(lowerKeyword) ||
      item.nim?.toLowerCase().includes(lowerKeyword) ||
      item.prodi?.toLowerCase().includes(lowerKeyword) ||
      item.kelas?.toLowerCase().includes(lowerKeyword) ||
      item.keterangan?.toLowerCase().includes(lowerKeyword)
    );

    setPeminjaman(filtered);
  };

  const handleUpdateStatus = async (row, statusBaru) => {
    setLoading(true);
    try {
      const result = await updateStatusPeminjaman(row.id, {
        status: statusBaru
      });

      setAllPeminjaman((prev) => prev.filter((item) => item.id !== row.id));
      setPeminjaman((prev) => prev.filter((item) => item.id !== row.id));
      showToast('success', 'Berhasil', result.message || 'Status berhasil diperbarui');
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', err.message || 'Terjadi kesalahan saat update status');
    } finally {
      setLoading(false);
    }
  };

  const confirmApprove = (row) => {
    confirmDialog({
      message: `Yakin ingin menyetujui peminjaman lab atas nama ${row.nama}?`,
      header: 'Konfirmasi Persetujuan',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Setujui',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-success',
      accept: () => handleUpdateStatus(row, 'disetujui'),
    });
  };

  const confirmReject = (row) => {
    confirmDialog({
      message: `Yakin ingin menolak peminjaman lab atas nama ${row.nama}?`,
      header: 'Konfirmasi Penolakan',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Tolak',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => handleUpdateStatus(row, 'ditolak'),
    });
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <h3 className="text-xl font-semibold">Manajemen Pengajuan Peminjaman Laboratorium</h3>

        <div className="flex flex-col md:flex-row gap-2 md:items-center md:ml-auto">
          <HeaderBar
            title=""
            placeholder="Cari nama, NIM, prodi, kelas, keterangan..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      <PeminjamanTable
        peminjaman={peminjaman}
        loading={loading}
        onApprove={confirmApprove}
        onReject={confirmReject}
      />
    </Card>
  );
}
