import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { getUserFaceImage } from '@/services/userService';
import { useEffect, useState } from 'react';

const UserTable = ({ users, loading, onEdit, onDelete }) => {
  const roleLabels = {
    kepala_lab: 'Kepala Lab',
    teknisi: 'Teknisi',
    dosen: 'Dosen',
    sarpras: 'Sarana Prasarana',
    mahasiswa: 'Mahasiswa'
  };

  const renderField = (value) => value && String(value).trim() !== '' ? value : '-';

  const PhotoCell = ({ row }) => {
    const [src, setSrc] = useState(null);

    useEffect(() => {
      if (row.user_faces && row.user_faces.length > 0) {
        getUserFaceImage(row.face_label, row.user_faces[0].image_name)
          .then(url => setSrc(url))
          .catch(() => setSrc(null));
      }
    }, [row]);

    return src ? (
      <img
        src={src}
        alt="User Face"
        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
      />
    ) : '-';
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
      <Column header="Foto" body={(row) => <PhotoCell row={row} />} />
      <Column
        header="Aksi"
        body={(row) => (
          <div className="flex gap-2">
            <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => onEdit(row)} />
            <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => onDelete(row)} />
          </div>
        )}
        style={{ width: '150px' }}
      />
    </DataTable>
  );
};

export default UserTable;