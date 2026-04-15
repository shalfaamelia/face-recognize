'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const LaporanPeminjamanTable = ({ laporan, loading }) => {
  const renderField = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== ''
      ? value
      : '-';
  };

  const statusBodyTemplate = (row) => {
    let severity = 'info';

    if (row.status === 'disetujui') severity = 'success';
    else if (row.status === 'ditolak') severity = 'danger';

    return <Tag value={renderField(row.status)} severity={severity} />;
  };

  const jamBodyTemplate = (row) => {
    const jamMulai = renderField(row.jam_mulai);
    const jamSelesai = renderField(row.jam_selesai);
    return `${jamMulai} - ${jamSelesai}`;
  };

  return (
    <DataTable
      value={laporan}
      paginator
      rows={10}
      rowsPerPageOptions={[10, 25, 50, 100]}
      loading={loading}
      size="small"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
      emptyMessage="Tidak ada laporan peminjaman lab"
    >
      <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
      <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
      <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
      <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
      <Column field="tanggal" header="Tanggal" body={(row) => renderField(row.tanggal)} />
      <Column header="Jam" body={jamBodyTemplate} />
      <Column field="keterangan" header="Keterangan" body={(row) => renderField(row.keterangan)} />
      <Column field="status" header="Status" body={statusBodyTemplate} />
    </DataTable>
  );
};

export default LaporanPeminjamanTable;