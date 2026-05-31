'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const MonitoringTable = ({ monitoring, loading, type }) => {
  const renderField = (value) => {
    if (value === 0) return value;
    return value && String(value).trim() !== '' ? value : '-';
  };

  return (
    <DataTable
      value={monitoring}
      paginator
      rows={10}
      rowsPerPageOptions={[10, 25, 50, 100]}
      loading={loading}
      size="small"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
      emptyMessage="Tidak ada data monitoring"
    >
      <Column field="kode" header="Kode" body={(row) => renderField(row.kode)} />
      <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
      <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
      <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
      <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
      <Column field="masuk" header="Waktu Masuk" body={(row) => renderField(row.masuk)} />

      {type === 'terlambat' && (
        <Column
          field="terlambat"
          header="Terlambat"
          body={(row) => renderField(row.terlambat)}
        />
      )}
    </DataTable>
  );
};

export default MonitoringTable;