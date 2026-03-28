'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

export default function UserTable({ users, onEdit, onDelete }) {
  const [selectedUsers, setSelectedUsers] = useState(null);

  // Kolom aksi: Edit, Hapus
  const actionBodyTemplate = (rowData) => (
    <div className="flex align-items-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success mr-2"
        onClick={() => onEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => onDelete(rowData.id)}
      />
    </div>
  );

  // Header tabel dengan jumlah records
  const header = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daftar User</div>
        <div style={{ fontSize: '0.85rem', color: '#8896a7', marginTop: 4 }}>
          Manajemen user sistem
        </div>
      </div>
      <Tag value={`${users.length} Records`} severity="info" style={{ fontSize: '0.75rem' }} />
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={users}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        selection={selectedUsers}
        onSelectionChange={e => setSelectedUsers(e.value)}
        dataKey="id"
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="Tidak ada user"
      >
        {/* Checkbox untuk multi-select */}
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>

        <Column field="kode" header="Kode" />
        <Column field="nama" header="Nama" />
        <Column field="role" header="Role" />
        <Column field="email" header="Email" />
        <Column field="status" header="Status" />

        {/* Kolom aksi: Edit & Delete */}
        <Column body={actionBodyTemplate} header="Aksi" style={{ width: '150px' }} />
      </DataTable>
    </div>
  );
}