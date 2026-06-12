'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from '@/app/components/headerbar';
import AjuanBarangTable from './components/AjuanBarangTable';
import {
  getAjuanBarang,
  terimaAjuanBarang,
} from '@/services/ajuanBarangService';

export default function Page() {
  const [ajuanBarang, setAjuanBarang] = useState([]);
  const [allAjuanBarang, setAllAjuanBarang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const toastRef = useRef(null);

  const showToast = (severity, summary, detail) => {
    toastRef.current?.show?.({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const applySearch = (data, keyword) => {
    if (!keyword || keyword.trim() === '') return data;

    const lowerKeyword = keyword.toLowerCase();

    return data.filter((item) =>
      item.nama?.toLowerCase().includes(lowerKeyword) ||
      item.nim?.toLowerCase().includes(lowerKeyword) ||
      item.prodi?.toLowerCase().includes(lowerKeyword) ||
      item.kelas?.toLowerCase().includes(lowerKeyword) ||
      item.ruang?.toLowerCase().includes(lowerKeyword) ||
      item.no_hp?.toLowerCase().includes(lowerKeyword) ||
      item.tanggal?.toLowerCase().includes(lowerKeyword) ||
      item.keterangan?.toLowerCase().includes(lowerKeyword) ||
      item.deskripsi?.toLowerCase().includes(lowerKeyword) ||
      item.status?.toLowerCase().includes(lowerKeyword)
    );
  };

  const fetchAjuanBarang = async () => {
    setLoading(true);

    try {
      const data = await getAjuanBarang();
      setAllAjuanBarang(data);
      setAjuanBarang(applySearch(data, searchKeyword));
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        'Gagal',
        err.message || 'Terjadi kesalahan saat mengambil ajuan barang'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAjuanBarang();
  }, []);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    setAjuanBarang(applySearch(allAjuanBarang, keyword));
  };

  const handleTerima = async (row) => {
    setLoading(true);

    try {
      const result = await terimaAjuanBarang(row.id);

      setAllAjuanBarang((prev) => prev.filter((item) => item.id !== row.id));
      setAjuanBarang((prev) => prev.filter((item) => item.id !== row.id));

      showToast(
        'success',
        'Berhasil',
        result.message || `Ajuan ${row.nama} berhasil diterima`
      );

      await fetchAjuanBarang();
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        'Gagal',
        err.message || 'Terjadi kesalahan saat menerima ajuan barang'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmTerima = (row) => {
    confirmDialog({
      message: `Yakin ingin menerima ajuan barang atas nama ${row.nama}?`,
      header: 'Konfirmasi Penerimaan',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Terima',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-success',
      accept: () => handleTerima(row),
    });
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <h3 className="text-xl font-semibold">Manajemen Pengajuan Barang di Laboratorium</h3>

        <div className="flex flex-col md:flex-row gap-2 md:items-center md:ml-auto">
          <HeaderBar
            title=""
            placeholder="Cari nama, NIM, prodi, kelas, ruang, no HP..."
            onSearch={handleSearch}
            noMargin
          />
        </div>
      </div>

      <AjuanBarangTable
        ajuanBarang={ajuanBarang}
        loading={loading}
        onTerima={confirmTerima}
      />
    </Card>
  );
}