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

  const renderField = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? value : '-';

  const formatJam = (value) => {
    const jam = renderField(value);
    if (jam === '-') return jam;
    const [hour, minute] = String(jam).split(':');
    if (!hour || !minute) return jam;
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  // ── Stats ────────────────────────────────────────────────────────────────

  const totalUsers = users.length;
  // role === 'mahasiswa' vs semua petugas (kepala_lab, teknisi, dosen, sarpras)
  const totalMahasiswa = users.filter((u) => u.role === 'mahasiswa').length;
  const totalPetugas = users.filter((u) => u.role !== 'mahasiswa').length;
  const totalAktif = users.filter((u) => u.status === 'aktif').length;

  const totalJadwal = jadwal.length;

  // Monitoring: field kehadiran ada di kolom `masuk` (ada nilai = hadir)
  const totalHadir = monitoring.filter(
    (m) => m.masuk && String(m.masuk).trim() !== ''
  ).length;

  // Peminjaman (approval): status menunggu / disetujui / ditolak
  const totalPeminjaman = peminjaman.length;
  const peminjamanMenunggu = peminjaman.filter(
    (p) => p.status?.toLowerCase() === 'menunggu'
  ).length;

  // Laporan Barang: status baru / proses / selesai; keterangan temuan / hilang
  const totalLaporanBarang = laporanBarang.length;
  const laporanBarangTemuan = laporanBarang.filter(
    (lb) => lb.keterangan?.toLowerCase() === 'temuan'
  ).length;
  const laporanBarangHilang = laporanBarang.filter(
    (lb) => lb.keterangan?.toLowerCase() === 'hilang'
  ).length;

  // Laporan Peminjaman: status menunggu / disetujui / ditolak
  const totalLaporanPeminjaman = laporanPeminjaman.length;

  const stats = [
    {
      label: 'Total Pengguna',
      value: loading ? '...' : totalUsers,
      sub: loading ? '' : `${totalMahasiswa} mahasiswa · ${totalPetugas} petugas · ${totalAktif} aktif`,
      icon: 'pi-users',
      color: '#4a6cf7',
      bg: '#eef1ff',
    },
    {
      label: 'Total Jadwal Praktikum',
      value: loading ? '...' : totalJadwal,
      sub: loading ? '' : 'Total jadwal terdaftar',
      icon: 'pi-calendar',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Laporan Peminjaman Lab',
      value: loading ? '...' : totalLaporanPeminjaman,  // ← ganti ke totalLaporanPeminjaman
      sub: loading ? '' : `${totalPeminjaman} menunggu`,
      icon: 'pi-inbox',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Laporan Barang Lab',
      value: loading ? '...' : totalLaporanBarang,
      sub: loading ? '' : `${laporanBarangTemuan} temuan · ${laporanBarangHilang} hilang`,
      icon: 'pi-exclamation-triangle',
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ];

  // ── Template helpers ─────────────────────────────────────────────────────

  const statusPeminjamanTemplate = (row) => {
    const status = row.status?.toLowerCase() || '-';
    const severity =
      status === 'disetujui' ? 'success' :
        status === 'ditolak' ? 'danger' :
          status === 'menunggu' ? 'warning' : 'info';
    const label = row.status
      ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
      : '-';
    return <Tag value={label} severity={severity} />;
  };

  const keteranganBarangTemplate = (row) => {
    const val = row.keterangan?.toLowerCase() || '';
    const severity =
      val === 'temuan' ? 'success' :
        val === 'hilang' ? 'danger' : 'info';
    const label = row.keterangan
      ? row.keterangan.charAt(0).toUpperCase() + row.keterangan.slice(1)
      : '-';
    return <Tag value={label} severity={severity} />;
  };

  const namaTemplate = (row) => (
    <div>
      <div style={{ fontWeight: 600, color: '#1a2035' }}>{renderField(row.nama)}</div>
      <div style={{ fontSize: '0.75rem', color: '#8896a7' }}>
        {row.nim || row.nip || ''}
      </div>
    </div>
  );

  const jamTemplate = (row) =>
    `${formatJam(row.jam_mulai)} – ${formatJam(row.jam_selesai)}`;

  // ── Slices ───────────────────────────────────────────────────────────────

  // Recent Peminjaman (approval): sort by tanggal desc
  const recentPeminjaman = [...peminjaman]
    .sort(
      (a, b) =>
        new Date(b.tanggal || b.created_at || 0) -
        new Date(a.tanggal || a.created_at || 0)
    )
    .slice(0, 5);

  // Recent Monitoring: sort by masuk desc
  const recentMonitoring = [...monitoring]
    .sort(
      (a, b) =>
        new Date(b.masuk || b.created_at || 0) -
        new Date(a.masuk || a.created_at || 0)
    )
    .slice(0, 5);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Dashboard</div>
          <div className="page-header-subtitle">
            Selamat datang kembali,{' '}
            {currentUser?.nama || currentUser?.name || 'Admin'} 👋
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
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#8896a7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px',
                    }}
                  >
                    {s.label}
                  </div>
                  {loading ? (
                    <Skeleton width="80px" height="2.2rem" className="mb-1" />
                  ) : (
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: '#1a2035',
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {s.value}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '0.75rem',
                      color: '#8896a7',
                      fontWeight: 400,
                    }}
                  >
                    {loading ? (
                      <Skeleton width="120px" height="0.9rem" />
                    ) : (
                      s.sub
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: s.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={`pi ${s.icon}`}
                    style={{ fontSize: '1.1rem', color: s.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Peminjaman + Monitoring */}
      <div className="grid">
        {/* Recent Peminjaman Lab */}
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
                <i
                  className="pi pi-inbox"
                  style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}
                />
                Belum ada data peminjaman
              </div>
            ) : (
              <DataTable
                value={recentPeminjaman}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column header="Nama / NIM" body={namaTemplate} />
                <Column field="prodi" header="Prodi" style={{ width: '130px' }} body={(row) => renderField(row.prodi)} />
                <Column header="Jam" body={jamTemplate} style={{ width: '130px' }} />
                <Column header="Status" body={statusPeminjamanTemplate} style={{ width: '110px' }} />
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
                <i
                  className="pi pi-chart-bar"
                  style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}
                />
                Belum ada data monitoring
              </div>
            ) : (
              <DataTable
                value={recentMonitoring}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column field="kode" header="Kode" style={{ width: '80px' }} body={(row) => renderField(row.kode)} />
                <Column header="Nama / NIM" body={namaTemplate} />
                <Column field="kelas" header="Kelas" style={{ width: '70px' }} body={(row) => renderField(row.kelas)} />
                <Column
                  field="masuk"
                  header="Waktu Masuk"
                  style={{ width: '110px' }}
                  body={(row) => renderField(row.masuk)}
                />
              </DataTable>
            )}
          </Card>
        </div>
      </div>

      {/* Row 2: Jadwal + Laporan Barang */}
      <div className="grid">
        {/* Jadwal Praktikum */}
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
                <i
                  className="pi pi-calendar"
                  style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}
                />
                Belum ada jadwal
              </div>
            ) : (
              <DataTable
                value={jadwal.slice(0, 5)}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column field="kode" header="Kode" style={{ width: '70px' }} body={(row) => renderField(row.kode)} />
                <Column field="nama" header="Mata Kuliah" body={(row) => renderField(row.nama)} />
                <Column field="dosen" header="Dosen" body={(row) => renderField(row.dosen)} />
                <Column field="kelas" header="Kelas" style={{ width: '70px' }} body={(row) => renderField(row.kelas)} />
                <Column field="hari" header="Hari" style={{ width: '80px' }} body={(row) => renderField(row.hari)} />
                <Column
                  header="Jam"
                  style={{ width: '120px' }}
                  body={(row) => `${formatJam(row.jam_mulai)} – ${formatJam(row.jam_selesai)}`}
                />
              </DataTable>
            )}
          </Card>
        </div>

        {/* Laporan Barang Lab */}
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
                <i
                  className="pi pi-box"
                  style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}
                />
                Belum ada laporan barang
              </div>
            ) : (
              <DataTable
                value={laporanBarang.slice(0, 5)}
                size="small"
                showGridlines={false}
                pt={{ table: { style: { borderCollapse: 'collapse' } } }}
              >
                <Column header="Nama / NIM" body={namaTemplate} />
                <Column field="deskripsi" header="Barang" body={(row) => renderField(row.deskripsi)} />
                <Column header="Keterangan" body={keteranganBarangTemplate} style={{ width: '110px' }} />
              </DataTable>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}