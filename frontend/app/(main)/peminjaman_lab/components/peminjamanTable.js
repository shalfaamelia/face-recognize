'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const PeminjamanTable = ({
  peminjaman,
  loading,
  onApprove,
  onReject,
}) => {
  const renderField = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== ''
      ? value
      : '-';
  };

  const formatJam = (value) => {
    const jam = renderField(value);
    if (jam === '-') return jam;

    const [hour, minute] = String(jam).split(':');
    if (!hour || !minute) return jam;

    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const formatStatus = (value) => {
    const status = renderField(value);
    return status === '-' ? status : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusBodyTemplate = (row) => {
    let severity = 'info';

    if (row.status === 'disetujui') severity = 'success';
    else if (row.status === 'ditolak') severity = 'danger';
    else if (row.status === 'menunggu') severity = 'warning';

    return <Tag value={formatStatus(row.status)} severity={severity} />;
  };

  const jamBodyTemplate = (row) => {
    const jamMulai = formatJam(row.jam_mulai);
    const jamSelesai = formatJam(row.jam_selesai);
    return `${jamMulai} - ${jamSelesai}`;
  };

  const actionBodyTemplate = (row) => {
    if (row.status !== 'menunggu') {
      return <span className="text-gray-500">-</span>;
    }

    return (
      <div className="flex gap-2">
        <Button
          label="Setujui"
          icon="pi pi-check"
          size="small"
          severity="success"
          onClick={() => onApprove(row)}
        />
        <Button
          label="Tolak"
          icon="pi pi-times"
          size="small"
          severity="danger"
          outlined
          onClick={() => onReject(row)}
        />
      </div>
    );
  };

  return (
    <DataTable
      value={peminjaman}
      paginator
      rows={10}
      rowsPerPageOptions={[10, 25, 50, 100]}
      loading={loading}
      size="small"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
      emptyMessage="Tidak ada data peminjaman lab"
    >
      <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
      <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
      <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
      <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
      <Column field="tanggal" header="Tanggal" body={(row) => renderField(row.tanggal)} />
      <Column header="Jam" body={jamBodyTemplate} />
      <Column field="keterangan" header="Keterangan" body={(row) => renderField(row.keterangan)} />
      <Column field="status" header="Status" body={statusBodyTemplate} />
      <Column header="Aksi" body={actionBodyTemplate} />
    </DataTable>
  );
};

export default PeminjamanTable;
