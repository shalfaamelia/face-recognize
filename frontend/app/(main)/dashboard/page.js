'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';

import { getUsers } from '@/services/userService';
import { getJadwal } from '@/services/jadwalService';
import { getMonitoring } from '@/services/monitoringService';
import { getPeminjaman } from '@/services/peminjamanService';
import { getLaporanBarang } from '@/services/laporanBarangService';
import { getLaporanPeminjaman } from '@/services/laporanPeminjamanService';
import { getStoredUser } from '@/services/authService';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [laporanBarang, setLaporanBarang] = useState([]);
  const [laporanPeminjaman, setLaporanPeminjaman] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        usersData,
        jadwalData,
        monitoringData,
        peminjamanData,
        laporanBarangData,
        laporanPeminjamanData,
      ] = await Promise.allSettled([
        getUsers(),
        getJadwal(),
        getMonitoring(),
        getPeminjaman(),
        getLaporanBarang(),
        getLaporanPeminjaman(),
      ]);

      if (usersData.status === 'fulfilled') setUsers(usersData.value || []);
      if (jadwalData.status === 'fulfilled') setJadwal(jadwalData.value || []);
      if (monitoringData.status === 'fulfilled') setMonitoring(monitoringData.value || []);
      if (peminjamanData.status === 'fulfilled') setPeminjaman(peminjamanData.value || []);
      if (laporanBarangData.status === 'fulfilled') setLaporanBarang(laporanBarangData.value || []);
      if (laporanPeminjamanData.status === 'fulfilled') setLaporanPeminjaman(laporanPeminjamanData.value || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // === Computed Stats ===
  const totalUsers = users.length;
  const totalMahasiswa = users.filter(u => u.role === 'mahasiswa').length;
  const totalDosen = users.filter(u => u.role !== 'mahasiswa').length;

  const totalJadwal = jadwal.length;

  const totalHadir = monitoring.filter(m =>
    m.status?.toLowerCase() === 'hadir' || m.kehadiran?.toLowerCase() === 'hadir'
  ).length;

  const peminjamanMenunggu = peminjaman.filter(p =>
    p.status?.toLowerCase() === 'menunggu' || p.status?.toLowerCase() === 'pending'
  ).length;
  const peminjamanDisetujui = peminjaman.filter(p =>
    p.status?.toLowerCase() === 'disetujui'
  ).length;

  const laporanBarangRusak = laporanBarang.filter(lb =>
    lb.status?.toLowerCase() === 'rusak' || lb.keterangan?.toLowerCase().includes('rusak')
  ).length;

  const laporanPeminjamanAktif = laporanPeminjaman.filter(lp =>
    lp.status?.toLowerCase() === 'disetujui' || lp.status?.toLowerCase() === 'aktif'
  ).length;

  const stats = [
    {
      label: 'Total Pengguna',
      value: loading ? '...' : totalUsers,
      sub: loading ? '' : `${totalMahasiswa} mahasiswa · ${totalDosen} dosen/staf`,
      icon: 'pi-users',
      color: '#4a6cf7',
      bg: '#eef1ff',
    },
    {
      label: 'Jadwal Aktif',
      value: loading ? '...' : totalJadwal,
      sub: loading ? '' : 'Total jadwal terdaftar',
      icon: 'pi-calendar',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Peminjaman Pending',
      value: loading ? '...' : peminjamanMenunggu,
      sub: loading ? '' : `${peminjamanDisetujui} sudah disetujui`,
      icon: 'pi-inbox',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Laporan Barang Rusak',
      value: loading ? '...' : laporanBarangRusak,
      sub: loading ? '' : `${laporanBarang.length} total laporan`,
      icon: 'pi-exclamation-triangle',
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ];

  // === Recent Peminjaman ===
  const recentPeminjaman = [...peminjaman]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const statusSeverityMap = {
    disetujui: 'success',
    menunggu: 'warning',
    pending: 'warning',
    ditolak: 'danger',
    aktif: 'success',
    selesai: 'info',
    rusak: 'danger',
    baik: 'success',
    hilang: 'danger',
  };

  const statusTemplate = (row) => {
    const status = row.status || '-';
    const severity = statusSeverityMap[status.toLowerCase()] || 'info';
    return (
      <Tag
        value={status.charAt(0).toUpperCase() + status.slice(1)}
        severity={severity}
      />
    );
  };

  const keteranganBodyTemplate = (row) => {
    const value = row.keterangan || '-';

    let severity = 'info';
    if (value === 'temuan') severity = 'success';
    else if (value === 'hilang') severity = 'danger';

    return <Tag value={value} severity={severity} />;
  };
  
  const namaTemplate = (row) => (
    <div>
      <div style={{ fontWeight: 600, color: '#1a2035' }}>{row.nama || '-'}</div>
      <div style={{ fontSize: '0.75rem', color: '#8896a7' }}>{row.nim || row.nip || ''}</div>
    </div>
  );

  // === Recent Monitoring ===
  const recentMonitoring = [...monitoring]
    .sort((a, b) => new Date(b.tanggal || b.created_at || 0) - new Date(a.tanggal || a.created_at || 0))
    .slice(0, 5);

  const kehadiranTemplate = (row) => {
    const status = row.status || row.kehadiran || '-';
    const severity = statusSeverityMap[status.toLowerCase()] || 'info';
    return <Tag value={status.charAt(0).toUpperCase() + status.slice(1)} severity={severity} />;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Dashboard</div>
          <div className="page-header-subtitle">
            Selamat datang kembali, {currentUser?.nama || currentUser?.name || 'Admin'} 👋
          </div>
        </div>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          className="p-button-outlined"
          style={{ borderRadius: '10px', fontSize: '0.85rem' }}
          onClick={fetchAllData}
          loading={loading}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-12 sm:col-6 lg:col-3">
            <div className="stat-card">
              <div className="flex justify-content-between align-items-start">
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8896a7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {s.label}
                  </div>
                  {loading ? (
                    <Skeleton width="80px" height="2.2rem" className="mb-1" />
                  ) : (
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a2035', lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {s.value}
                    </div>
                  )}
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#8896a7', fontWeight: 400 }}>
                    {loading ? <Skeleton width="120px" height="0.9rem" /> : s.sub}
                  </div>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={`pi ${s.icon}`} style={{ fontSize: '1.1rem', color: s.color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid">
        {/* Recent Peminjaman */}
        <div className="col-12 lg:col-7">
          <Card
            title={
              <div className="flex align-items-center justify-content-between">
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>
                  Peminjaman Lab Terbaru
                </span>
                {peminjamanMenunggu > 0 && (
                  <Badge value={peminjamanMenunggu} severity="warning" />
                )}
              </div>
            }
            style={{ marginBottom: '24px', height: '100%' }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <Skeleton width="100%" height="2rem" />
                </div>
              ))
            ) : recentPeminjaman.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8896a7', padding: '2rem 0' }}>
                <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
                Belum ada data peminjaman
              </div>
            ) : (
              <DataTable
                value={recentPeminjaman}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column header="Nama" body={namaTemplate} />
                <Column field="prodi" header="Prodi" style={{ width: '130px' }} />
                <Column field="kelas" header="Kelas" style={{ width: '80px' }} />
                <Column header="Status" body={statusTemplate} style={{ width: '120px' }} />
              </DataTable>
            )}
          </Card>
        </div>

        {/* Monitoring Kehadiran */}
        <div className="col-12 lg:col-5">
          <Card
            title={
              <div className="flex align-items-center justify-content-between">
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>
                  Monitoring Kehadiran
                </span>
                <span style={{ fontSize: '0.78rem', color: '#8896a7' }}>
                  {totalHadir} hadir
                </span>
              </div>
            }
            style={{ marginBottom: '24px', height: '100%' }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <Skeleton width="100%" height="2rem" />
                </div>
              ))
            ) : recentMonitoring.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8896a7', padding: '2rem 0' }}>
                <i className="pi pi-chart-bar" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
                Belum ada data monitoring
              </div>
            ) : (
              <DataTable
                value={recentMonitoring}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column field="nama" header="Nama" />
                <Column field="kode" header="Kode" style={{ width: '90px' }} />
                <Column header="Kehadiran" body={kehadiranTemplate} style={{ width: '110px' }} />
              </DataTable>
            )}
          </Card>
        </div>
      </div>

      {/* Jadwal & Laporan Row */}
      <div className="grid">
        {/* Jadwal */}
        <div className="col-12 lg:col-6">
          <Card
            title={
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>
                Jadwal Praktikum
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="2rem" className="mb-2" />
              ))
            ) : jadwal.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8896a7', padding: '1.5rem 0' }}>
                <i className="pi pi-calendar" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
                Belum ada jadwal
              </div>
            ) : (
              <DataTable
                value={jadwal.slice(0, 5)}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column field="kode" header="Kode" style={{ width: '90px' }} />
                <Column field="nama" header="Nama Jadwal" />
                <Column field="hari" header="Hari" style={{ width: '90px' }} />
                <Column field="jam" header="Jam" style={{ width: '90px' }} />
              </DataTable>
            )}
          </Card>
        </div>

        {/* Laporan Barang */}
        <div className="col-12 lg:col-6">
          <Card
            title={
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>
                Laporan Barang Lab
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="2rem" className="mb-2" />
              ))
            ) : laporanBarang.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8896a7', padding: '1.5rem 0' }}>
                <i className="pi pi-box" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
                Belum ada laporan barang
              </div>
            ) : (
              <DataTable
                value={laporanBarang.slice(0, 5)}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column field="nama" header="Nama" />
                <Column field="nim" header="NIM" style={{ width: '120px' }} />
                <Column field="deskripsi" header="Barang" />
                <Column field="keterangan" header="Keterangan" body={keteranganBodyTemplate} />
              </DataTable>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}