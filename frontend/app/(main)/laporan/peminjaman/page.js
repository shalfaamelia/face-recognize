'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from '@/app/components/headerbar';
import LaporanPeminjamanTable from './components/laporanPeminjamanTable';
import { getLaporanPeminjaman } from '@/services/laporanPeminjamanService';

export default function Page() {
  const [laporan, setLaporan] = useState([]);
  const [allLaporan, setAllLaporan] = useState([]);
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
      const data = await getLaporanPeminjaman();
      setAllLaporan(data);
      setLaporan(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', err.message || 'Terjadi kesalahan saat mengambil laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === '') {
      setLaporan(allLaporan);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const filtered = allLaporan.filter((item) =>
      item.nama?.toLowerCase().includes(lowerKeyword) ||
      item.nim?.toLowerCase().includes(lowerKeyword) ||
      item.prodi?.toLowerCase().includes(lowerKeyword) ||
      item.kelas?.toLowerCase().includes(lowerKeyword) ||
      item.status?.toLowerCase().includes(lowerKeyword) ||
      item.keterangan?.toLowerCase().includes(lowerKeyword)
    );

    setLaporan(filtered);
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <h3 className="text-xl font-semibold">Laporan Peminjaman Lab</h3>

        <div className="flex flex-col md:flex-row gap-2 md:items-center md:ml-auto">
          <HeaderBar
            title=""
            placeholder="Cari nama, NIM, prodi, kelas, status..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      <LaporanPeminjamanTable
        laporan={laporan}
        loading={loading}
      />
    </Card>
  );
}