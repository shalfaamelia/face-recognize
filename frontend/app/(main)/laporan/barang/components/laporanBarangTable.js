'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';

const LaporanBarangTable = ({ laporanBarang, loading }) => {
  const [imageDialogVisible, setImageDialogVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const renderField = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== ''
      ? value
      : '-';
  };

  const keteranganBodyTemplate = (row) => {
    const value = row.keterangan || '-';

    let severity = 'info';
    if (value === 'temuan') severity = 'success';
    else if (value === 'hilang') severity = 'danger';

    return <Tag value={value} severity={severity} />;
  };

  const statusBodyTemplate = (row) => {
    const value = row.status || 'baru';

    let severity = 'warning';
    if (value === 'baru') severity = 'warning';
    else if (value === 'proses') severity = 'info';
    else if (value === 'selesai') severity = 'success';

    return <Tag value={value} severity={severity} />;
  };

  const fotoBodyTemplate = (row) => {
    if (!row.foto_url) return '-';

    return (
      <button
        onClick={() => {
          setSelectedImage(row.foto_url);
          setImageDialogVisible(true);
        }}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Lihat Foto
      </button>
    );
  };

  return (
    <>
      <DataTable
        value={laporanBarang}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50, 100]}
        loading={loading}
        size="small"
        dataKey="id"
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="Tidak ada laporan barang lab"
      >
        <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
        <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
        <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
        <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
        <Column field="tanggal" header="Tanggal" body={(row) => renderField(row.tanggal)} />
        <Column field="keterangan" header="Keterangan" body={keteranganBodyTemplate} />
        <Column field="deskripsi" header="Deskripsi" body={(row) => renderField(row.deskripsi)} />
        <Column header="Foto" body={fotoBodyTemplate} />
      </DataTable>

      <Dialog
        visible={imageDialogVisible}
        onHide={() => setImageDialogVisible(false)}
        header="Foto Laporan Barang"
        style={{ width: '50vw' }}
        modal
      >
        {selectedImage && (
          <div className="flex justify-center">
            <Image
              src={selectedImage}
              alt="Foto laporan barang"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain"
              unoptimized
            />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default LaporanBarangTable;