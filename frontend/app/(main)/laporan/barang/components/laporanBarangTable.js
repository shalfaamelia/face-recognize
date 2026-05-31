'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { getLaporanBarangImage } from '@/services/laporanBarangService';

const LaporanBarangTable = ({ laporanBarang, loading }) => {
  const [imageDialogVisible, setImageDialogVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  const renderField = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== ''
      ? value
      : '-';
  };

  const formatBadgeText = (value) => {
    if (!value) return '-';
    const text = String(value).toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const keteranganBodyTemplate = (row) => {
    const value = row.keterangan || '-';
    const normalizedValue = String(value).toLowerCase();
    let severity = 'info';
    if (normalizedValue === 'temuan') severity = 'success';
    else if (normalizedValue === 'hilang') severity = 'danger';
    return <Tag value={formatBadgeText(value)} severity={severity} />;
  };

  const statusBodyTemplate = (row) => {
    const value = row.status || 'baru';
    const normalizedValue = String(value).toLowerCase();
    let severity = 'warning';
    if (normalizedValue === 'baru') severity = 'warning';
    else if (normalizedValue === 'proses') severity = 'info';
    else if (normalizedValue === 'selesai') severity = 'success';
    return <Tag value={formatBadgeText(value)} severity={severity} />;
  };

  const fotoBodyTemplate = (row) => {
    if (!row.foto) return '-';
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            const url = await getLaporanBarangImage(row.foto);
            setSelectedImage(url);
            setImageError(false);
            setImageDialogVisible(true);
          } catch (err) {
            console.error(err);
            setSelectedImage(null);
            setImageError(true);
            setImageDialogVisible(true);
          }
        }}
        style={{
          color: '#2563eb',
          textDecoration: 'underline',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: 'inherit',
        }}
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
        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column header="Foto" body={fotoBodyTemplate} />
      </DataTable>

      <Dialog
        visible={imageDialogVisible}
        onHide={() => {
          setImageDialogVisible(false);
          setSelectedImage(null);
          setImageError(false);
        }}
        header="Foto Laporan Barang"
        style={{ width: '50vw' }}
        modal
      >
        {selectedImage && !imageError && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '250px' }}>
            <img
              src={selectedImage}
              alt="Foto laporan barang"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {imageError && (
          <div style={{ padding: '1rem', color: '#b91c1c', background: '#fee2e2', borderRadius: '8px', lineHeight: '1.5' }}>
            <strong>Foto gagal dimuat.</strong>
          </div>
        )}

        {!selectedImage && !imageError && <p>Tidak ada foto yang dipilih.</p>}
      </Dialog>
    </>
  );
};

export default LaporanBarangTable;