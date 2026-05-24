'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const UserTable = ({ users, loading, onEdit, onDelete }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const roleLabels = {
    kepala_lab: 'Kepala Lab',
    teknisi: 'Teknisi',
    dosen: 'Dosen',
    sarpras: 'Sarana Prasarana',
    mahasiswa: 'Mahasiswa'
  };

  const statusLabels = {
    aktif: 'Aktif',
    nonaktif: 'Nonaktif'
  };

  const renderField = (value) => {
    return value && String(value).trim() !== '' ? value : '-';
  };

  const renderPhotos = (row) => {
    if (!row.user_faces || row.user_faces.length === 0) return '-';

    return (
      <div className="flex flex-wrap gap-1">
        {row.user_faces.map((photo, idx) => {
          const photoName = photo.image_name || photo.image_path;

          if (!photoName) return null;

          const fileNameOnly = String(photoName).split(/[\\/]/).pop();

          const photoUrl = `/api/image-proxy?face_label=${encodeURIComponent(row.face_label)}&filename=${encodeURIComponent(photoName)}`;

          return (
            <img
              key={idx}
              src={photoUrl}
              alt={fileNameOnly}
              title={photoUrl}
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#f3f4f6'
              }}
              onError={(e) => {
                console.log('GAGAL LOAD FOTO:', photoUrl);
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        })}
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

export default UserTable;