'use client';

import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const stats = [
  { label: 'Total Users', value: '1,248', icon: 'pi-users', color: '#4a6cf7', bg: '#eef1ff', change: '+12%' },
  { label: 'Active Doors', value: '36', icon: 'pi-lock', color: '#10b981', bg: '#ecfdf5', change: '+2' },
  { label: 'Access Today', value: '483', icon: 'pi-check-circle', color: '#f59e0b', bg: '#fffbeb', change: '+8%' },
  { label: 'Alerts', value: '4', icon: 'pi-exclamation-triangle', color: '#ef4444', bg: '#fef2f2', change: 'New' },
];

const recentLogs = [
  { name: 'Budi Santoso', door: 'Main Entrance', time: '08:31', status: 'granted' },
  { name: 'Siti Rahayu', door: 'Server Room', time: '08:45', status: 'denied' },
  { name: 'Ahmad Fauzi', door: 'Office A', time: '09:02', status: 'granted' },
  { name: 'Dewi Lestari', door: 'Main Entrance', time: '09:14', status: 'granted' },
  { name: 'Rizky Pratama', door: 'Warehouse', time: '09:28', status: 'denied' },
];

export default function DashboardPage() {
  const statusTemplate = (row) => (
    <Tag
      value={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      severity={row.status === 'granted' ? 'success' : 'danger'}
    />
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Dashboard</div>
          <div className="page-header-subtitle">Selamat datang kembali, Admin 👋</div>
        </div>
        <Button
          label="Export Report"
          icon="pi pi-download"
          className="p-button-primary"
          style={{ borderRadius: '10px', fontSize: '0.85rem' }}
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
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a2035', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {s.value}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>
                    {s.change} <span style={{ color: '#8896a7', fontWeight: 400 }}>vs kemarin</span>
                  </div>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`pi ${s.icon}`} style={{ fontSize: '1.1rem', color: s.color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Logs Table */}
      <Card
        title={
          <div className="flex align-items-center justify-content-between">
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2035' }}>Recent Access Logs</span>
            <Button label="Lihat Semua" text icon="pi pi-arrow-right" iconPos="right"
              style={{ fontSize: '0.8rem', color: '#4a6cf7' }} />
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <DataTable value={recentLogs} size="small" showGridlines={false}
          pt={{ table: { style: { borderCollapse: 'collapse' } } }}>
          <Column field="name" header="Nama" />
          <Column field="door" header="Pintu" />
          <Column field="time" header="Waktu" style={{ width: '100px' }} />
          <Column header="Status" body={statusTemplate} style={{ width: '120px' }} />
        </DataTable>
      </Card>
    </div>
  );
}