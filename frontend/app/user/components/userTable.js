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

  const renderField = (value) => value && value.trim() !== '' ? value : '-';

  const renderPhotos = (row) => {
    if (!row.user_faces || row.user_faces.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1">
        {row.user_faces.map((photo, idx) => (
          <img
            key={idx}
            src={`http://localhost:5000/uploads/${row.face_label}/${photo.image_name}`}
            alt={photo.image_name}
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => e.target.src = 'https://via.placeholder.com/50?text=No+Photo'}
          />
        ))}
      </div>
    );
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
      <Column field="kode" header="Kode" body={(row) => renderField(row.kode)} />
      <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
      <Column field="role" header="Role" body={(row) => renderField(roleLabels[row.role] || row.role)} />
      <Column field="nip" header="NIP" body={(row) => renderField(row.nip)} />
      <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
      <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
      <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
      <Column field="email" header="Email" body={(row) => renderField(row.email)} />
      <Column field="status" header="Status" body={(row) => renderField(statusLabels[row.status] || row.status)} />
      <Column header="Foto" body={renderPhotos} />
      <Column
        header="Aksi"
        body={(row) => (
          <div className="flex gap-2">
            <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => onEdit(row)} />
            <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => onDelete(row)} />
          </div>
        )}
        style={{ width: "150px" }}
      />
    </DataTable>
  );
};

export default UserTable;