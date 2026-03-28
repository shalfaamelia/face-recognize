'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const UserTable = ({ users, loading, onEdit, onDelete }) => {
  const roleLabels = {
    kepala_lab: 'Kepala Lab',
    teknisi: 'Teknisi',
    sarpras: 'Sarana Prasarana',
    mahasiswa: 'Mahasiswa'
  };

  const statusLabels = {
    aktif: 'Aktif',
    nonaktif: 'Nonaktif'
  };

  return (
    <DataTable
      value={users}
      paginator
      rows={10}
      rowsPerPageOptions={[10, 25, 50]}
      loading={loading}
      size="small"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
      emptyMessage="Tidak ada user"
    >
      <Column selectionMode="multiple" headerStyle={{ width: "3em" }}></Column>
      <Column field="kode" header="Kode" />
      <Column field="nama" header="Nama" />
      <Column field="role" header="Role" body={(row) => roleLabels[row.role] || row.role}/>
      <Column field="email" header="Email" />
      <Column field="status" header="Status" body={(row) => statusLabels[row.status] || row.status} />
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
        style={{ width: "150px" }}
      />
    </DataTable>
  );
};

export default UserTable;