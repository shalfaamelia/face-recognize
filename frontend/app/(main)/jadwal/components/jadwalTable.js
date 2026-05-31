'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const JadwalTable = ({ jadwal, loading, onEdit, onDelete }) => {
  const renderField = (value) => {
    return value && String(value).trim() !== '' ? value : '-';
  };

  return (
    <DataTable
      value={jadwal}
      paginator
      rows={10}
      rowsPerPageOptions={[10, 25, 50]}
      loading={loading}
      size="small"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
      emptyMessage="Tidak ada jadwal"
    >
      <Column field="kode" header="Kode" body={(row) => renderField(row.kode)} />
      <Column field="nama" header="Mata Kuliah" body={(row) => renderField(row.nama)} />
      <Column field="dosen" header="Dosen" body={(row) => renderField(row.dosen)} />
      <Column field="nip" header="NIP" body={(row) => renderField(row.nip)} />
      <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
      <Column field="hari" header="Hari" body={(row) => renderField(row.hari)} />
      <Column field="jam_mulai" header="Jam Mulai" body={(row) => renderField(row.jam_mulai)} />
      <Column field="jam_selesai" header="Jam Selesai" body={(row) => renderField(row.jam_selesai)} />

      <Column
        header="Aksi"
        body={(row) => (
          <div className="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              onClick={() => onEdit(row)}
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              onClick={() => onDelete(row)}
            />
          </div>
        )}
        style={{ width: '150px' }}
      />
    </DataTable>
  );
};

export default JadwalTable;