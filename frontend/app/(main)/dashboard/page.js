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

const ROLE_ACCESS = {
  users: ['kepala_lab'],
  jadwal: ['kepala_lab', 'teknisi'],
  monitoring: ['kepala_lab', 'teknisi', 'sarpras', 'dosen'],
  peminjaman: ['kepala_lab', 'teknisi'],
  laporanBarang: ['kepala_lab', 'teknisi', 'sarpras'],
  laporanPeminjaman: ['kepala_lab', 'teknisi', 'sarpras'],
};

const ROLE_LABEL = {
  kepala_lab: 'Kepala Laboratorium',
  teknisi: 'Teknisi',
  sarpras: 'Sarpras',
  dosen: 'Dosen',
};

const EMPTY_DASHBOARD_DATA = {
  users: [],
  jadwal: [],
  monitoring: [],
  peminjaman: [],
  laporanBarang: [],
  laporanPeminjaman: [],
};

const canAccessByRole = (role, feature) => {
  return Boolean(role && ROLE_ACCESS[feature]?.includes(role));
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_DATA);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    fetchDashboardData(user);
  }, []);

  const hasAccess = (feature) => {
    return canAccessByRole(currentUser?.role, feature);
  };

  const fetchDashboardData = async (authUser = currentUser) => {
    const role = authUser?.role;

    setLoading(true);

    if (!role) {
      setDashboardData({ ...EMPTY_DASHBOARD_DATA });
      setLoading(false);
      return;
    }

    try {
      const jobs = [];

      if (canAccessByRole(role, 'users')) {
        jobs.push({ key: 'users', promise: getUsers() });
      }

      if (canAccessByRole(role, 'jadwal')) {
        jobs.push({ key: 'jadwal', promise: getJadwal() });
      }

      if (canAccessByRole(role, 'monitoring')) {
        jobs.push({ key: 'monitoring', promise: getMonitoring() });
      }

      if (canAccessByRole(role, 'peminjaman')) {
        jobs.push({ key: 'peminjaman', promise: getPeminjaman() });
      }

      if (canAccessByRole(role, 'laporanBarang')) {
        jobs.push({ key: 'laporanBarang', promise: getLaporanBarang() });
      }

      if (canAccessByRole(role, 'laporanPeminjaman')) {
        jobs.push({ key: 'laporanPeminjaman', promise: getLaporanPeminjaman() });
      }

      const results = await Promise.allSettled(jobs.map((job) => job.promise));

      const nextData = { ...EMPTY_DASHBOARD_DATA };

      results.forEach((result, index) => {
        const key = jobs[index].key;

        if (result.status === 'fulfilled') {
          nextData[key] = Array.isArray(result.value) ? result.value : [];
        } else {
          console.warn(`Gagal mengambil data ${key}:`, result.reason);
        }
      });

      setDashboardData(nextData);
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

  const {
    users,
    jadwal,
    monitoring,
    peminjaman,
    laporanBarang,
    laporanPeminjaman,
  } = dashboardData;

  const totalUsers = users.length;
  const totalMahasiswa = users.filter((u) => u.role === 'mahasiswa').length;
  const totalPetugas = users.filter((u) => u.role !== 'mahasiswa').length;
  const totalAktif = users.filter((u) => u.status === 'aktif').length;

  const totalJadwal = jadwal.length;

  const totalHadir = monitoring.filter(
    (m) => m.masuk && String(m.masuk).trim() !== ''
  ).length;

  const totalPeminjaman = peminjaman.length;
  const peminjamanMenunggu = peminjaman.filter(
    (p) => p.status?.toLowerCase() === 'menunggu'
  ).length;

  const totalLaporanBarang = laporanBarang.length;
  const laporanBarangTemuan = laporanBarang.filter(
    (lb) => lb.keterangan?.toLowerCase() === 'temuan'
  ).length;
  const laporanBarangHilang = laporanBarang.filter(
    (lb) => lb.keterangan?.toLowerCase() === 'hilang'
  ).length;

  const totalLaporanPeminjaman = laporanPeminjaman.length;
  const laporanPeminjamanMenunggu = laporanPeminjaman.filter(
    (lp) => lp.status?.toLowerCase() === 'menunggu'
  ).length;

  const allStats = [
    {
      feature: 'users',
      label: 'Total Pengguna',
      value: loading ? '...' : totalUsers,
      sub: loading
        ? ''
        : `${totalMahasiswa} mahasiswa · ${totalPetugas} petugas · ${totalAktif} aktif`,
      icon: 'pi-users',
      color: '#4a6cf7',
      bg: '#eef1ff',
    },
    {
      feature: 'jadwal',
      label: 'Total Jadwal Praktikum',
      value: loading ? '...' : totalJadwal,
      sub: loading ? '' : 'Total jadwal terdaftar',
      icon: 'pi-calendar',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      feature: 'monitoring',
      label: 'Monitoring Kehadiran',
      value: loading ? '...' : totalHadir,
      sub: loading ? '' : 'Total data kehadiran tercatat',
      icon: 'pi-eye',
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      feature: 'peminjaman',
      label: 'Pengajuan Peminjaman Lab',
      value: loading ? '...' : totalPeminjaman,
      sub: loading ? '' : `${peminjamanMenunggu} menunggu persetujuan`,
      icon: 'pi-calendar-plus',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      feature: 'laporanBarang',
      label: 'Laporan Barang Lab',
      value: loading ? '...' : totalLaporanBarang,
      sub: loading ? '' : `${laporanBarangTemuan} temuan · ${laporanBarangHilang} hilang`,
      icon: 'pi-box',
      color: '#ef4444',
      bg: '#fef2f2',
    },
    {
      feature: 'laporanPeminjaman',
      label: 'Laporan Peminjaman Lab',
      value: loading ? '...' : totalLaporanPeminjaman,
      sub: loading ? '' : `${laporanPeminjamanMenunggu} laporan menunggu`,
      icon: 'pi-file',
      color: '#0ea5e9',
      bg: '#f0f9ff',
    },
  ];

  const stats = allStats.filter((stat) => hasAccess(stat.feature));

  const statColClass =
    currentUser?.role === 'teknisi' && stats.length === 5
      ? 'col-12 sm:col-6 md:col-4 lg:col-2'
      : stats.length <= 1 && currentUser?.role === 'dosen'
        ? 'col-12 sm:col-6 lg:col-4'
        : stats.length <= 1
          ? 'col-12'
          : stats.length === 2
            ? 'col-12 sm:col-6'
            : stats.length === 3 || stats.length === 6
              ? 'col-12 sm:col-6 lg:col-4'
              : 'col-12 sm:col-6 lg:col-3';

  const statusPeminjamanTemplate = (row) => {
    const status = row.status?.toLowerCase() || '-';

    const severity =
      status === 'disetujui'
        ? 'success'
        : status === 'ditolak'
          ? 'danger'
          : status === 'menunggu'
            ? 'warning'
            : 'info';

    const label = row.status
      ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
      : '-';

    return <Tag value={label} severity={severity} />;
  };

  const keteranganBarangTemplate = (row) => {
    const val = row.keterangan?.toLowerCase() || '';

    const severity =
      val === 'temuan'
        ? 'success'
        : val === 'hilang'
          ? 'danger'
          : 'info';

    const label = row.keterangan
      ? row.keterangan.charAt(0).toUpperCase() + row.keterangan.slice(1)
      : '-';

    return <Tag value={label} severity={severity} />;
  };

  const namaTemplate = (row) => (
    <div>
      <div style={{ fontWeight: 600, color: '#1a2035' }}>
        {renderField(row.nama)}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#8896a7' }}>
        {row.nim || row.nip || ''}
      </div>
    </div>
  );

  const jamTemplate = (row) =>
    `${formatJam(row.jam_mulai)} – ${formatJam(row.jam_selesai)}`;

  const recentPeminjaman = [...peminjaman]
    .sort(
      (a, b) =>
        new Date(b.tanggal || b.created_at || 0) -
        new Date(a.tanggal || a.created_at || 0)
    )
    .slice(0, 5);

  const recentMonitoring = [...monitoring]
    .sort(
      (a, b) =>
        new Date(b.masuk || b.created_at || 0) -
        new Date(a.masuk || a.created_at || 0)
    )
    .slice(0, 5);

  const recentLaporanPeminjaman = [...laporanPeminjaman]
    .sort(
      (a, b) =>
        new Date(b.tanggal || b.created_at || 0) -
        new Date(a.tanggal || a.created_at || 0)
    )
    .slice(0, 5);

  const sectionCount = [
    hasAccess('jadwal'),
    hasAccess('laporanBarang'),
    hasAccess('laporanPeminjaman'),
  ].filter(Boolean).length;

  const sectionColClass = sectionCount <= 1 ? 'col-12' : 'col-12 lg:col-6';

  return (
    <Card>
      <div className="page-header">
        <div>
          <div className="page-header-title">
            Dashboard {ROLE_LABEL[currentUser?.role] || ''}
          </div>
          <div className="page-header-subtitle">
            Selamat datang kembali,{' '}
            {currentUser?.nama || currentUser?.name || 'Pengguna'} 👋
          </div>
        </div>

        <Button
          label="Refresh"
          icon="pi pi-refresh"
          className="p-button-outlined"
          style={{ borderRadius: '10px', fontSize: '0.85rem' }}
          onClick={() => fetchDashboardData(currentUser)}
          loading={loading}
        />
      </div>

      <div
        className="grid mb-4"
        style={currentUser?.role === 'teknisi' && stats.length === 5 ? { display: 'flex', flexWrap: 'wrap', gap: '1rem' } : undefined}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className={statColClass}
            style={
              currentUser?.role === 'teknisi' && stats.length === 5
                ? { flex: '0 0 calc(20% - 1rem)', maxWidth: 'calc(20% - 1rem)' }
                : undefined
            }
          >
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

      <div className="grid">
        {hasAccess('peminjaman') && (
          <div className="col-12 sm:col-6 lg:col-6">
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
                <DataTable value={recentPeminjaman} size="small" showGridlines={false}>
                  <Column header="Nama / NIM" body={namaTemplate} />
                  <Column
                    field="prodi"
                    header="Prodi"
                    style={{ width: '130px' }}
                    body={(row) => renderField(row.prodi)}
                  />
                  <Column header="Jam" body={jamTemplate} style={{ width: '130px' }} />
                  <Column header="Status" body={statusPeminjamanTemplate} style={{ width: '110px' }} />
                </DataTable>
              )}
            </Card>
          </div>
        )}

        {hasAccess('jadwal') && (
          <div className="col-12 sm:col-6 lg:col-6">
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
                <DataTable value={jadwal.slice(0, 5)} size="small" showGridlines={false}>
                  <Column
                    field="kode"
                    header="Kode"
                    style={{ width: '70px' }}
                    body={(row) => renderField(row.kode)}
                  />
                  <Column field="nama" header="Mata Kuliah" body={(row) => renderField(row.nama)} />
                  <Column field="dosen" header="Dosen" body={(row) => renderField(row.dosen)} />
                  <Column
                    field="kelas"
                    header="Kelas"
                    style={{ width: '70px' }}
                    body={(row) => renderField(row.kelas)}
                  />
                  <Column
                    field="hari"
                    header="Hari"
                    style={{ width: '80px' }}
                    body={(row) => renderField(row.hari)}
                  />
                  <Column
                    header="Jam"
                    style={{ width: '120px' }}
                    body={(row) => `${formatJam(row.jam_mulai)} – ${formatJam(row.jam_selesai)}`}
                  />
                </DataTable>
              )}
            </Card>
          </div>
        )}
      </div>

      <div className="grid">
        {hasAccess('monitoring') && (
          <div className={currentUser?.role === 'dosen' ? 'col-12' : 'col-12 sm:col-6 lg:col-4'}>
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
                <DataTable value={recentMonitoring} size="small" showGridlines={false}>
                  <Column
                    field="kode"
                    header="Kode"
                    style={{ width: '80px' }}
                    body={(row) => renderField(row.kode)}
                  />
                  <Column header="Nama / NIM" body={namaTemplate} />
                  <Column
                    field="kelas"
                    header="Kelas"
                    style={{ width: '70px' }}
                    body={(row) => renderField(row.kelas)}
                  />
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
        )}

        {hasAccess('laporanBarang') && (
          <div className="col-12 sm:col-6 lg:col-4">
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
                <DataTable value={laporanBarang.slice(0, 5)} size="small" showGridlines={false}>
                  <Column header="Nama / NIM" body={namaTemplate} />
                  <Column
                    field="deskripsi"
                    header="Barang"
                    body={(row) => renderField(row.deskripsi)}
                  />
                  <Column
                    header="Keterangan"
                    body={keteranganBarangTemplate}
                    style={{ width: '110px' }}
                  />
                </DataTable>
              )}
            </Card>
          </div>
        )}

        {hasAccess('laporanPeminjaman') && (
          <div className="col-12 sm:col-6 lg:col-4">
            <Card
              title={
                <div className="flex align-items-center justify-content-between">
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>
                    Laporan Peminjaman Lab
                  </span>
                  {laporanPeminjamanMenunggu > 0 && (
                    <Badge value={laporanPeminjamanMenunggu} severity="warning" />
                  )}
                </div>
              }
              style={{ marginBottom: '24px' }}
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height="2rem" className="mb-2" />
                ))
              ) : recentLaporanPeminjaman.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8896a7', padding: '1.5rem 0' }}>
                  <i
                    className="pi pi-file"
                    style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}
                  />
                  Belum ada laporan peminjaman
                </div>
              ) : (
                <DataTable value={recentLaporanPeminjaman} size="small" showGridlines={false}>
                  <Column header="Nama / NIM" body={namaTemplate} />
                  <Column
                    field="prodi"
                    header="Prodi"
                    style={{ width: '130px' }}
                    body={(row) => renderField(row.prodi)}
                  />
                  <Column header="Jam" body={jamTemplate} style={{ width: '130px' }} />
                  <Column
                    header="Status"
                    body={statusPeminjamanTemplate}
                    style={{ width: '110px' }}
                  />
                </DataTable>
              )}
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}