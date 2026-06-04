'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { getAjuanBarangImage } from '@/services/ajuanBarangService';

const AjuanBarangTable = ({ ajuanBarang, loading, onTerima }) => {
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

    if (normalizedValue === 'temuan') {
      severity = 'success';
    } else if (normalizedValue === 'hilang') {
      severity = 'danger';
    }

    return <Tag value={formatBadgeText(value)} severity={severity} />;
  };

  const statusBodyTemplate = (row) => {
    const value = row.status || 'menunggu';
    const normalizedValue = String(value).toLowerCase();

    let severity = 'info';

    if (normalizedValue === 'menunggu') {
      severity = 'warning';
    } else if (normalizedValue === 'diterima') {
      severity = 'success';
    }

    return <Tag value={formatBadgeText(value)} severity={severity} />;
  };

  const fotoBodyTemplate = (row) => {
    if (!row.foto) return '-';

    return (
      <button
        type="button"
        onClick={async () => {
          try {
            const url = await getAjuanBarangImage(row.foto);
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

  const actionBodyTemplate = (row) => {
    if (row.status !== 'menunggu') {
      return <span className="text-gray-500">-</span>;
    }

    return (
      <Button
        label="Terima"
        icon="pi pi-check"
        severity="success"
        size="small"
        onClick={() => onTerima(row)}
      />
    );
  };

  return (
    <>
      <DataTable
        value={ajuanBarang}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50, 100]}
        loading={loading}
        size="small"
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="Tidak ada ajuan barang lab"
        dataKey="id"
      >
        <Column field="nama" header="Nama" body={(row) => renderField(row.nama)} />
        <Column field="nim" header="NIM" body={(row) => renderField(row.nim)} />
        <Column field="prodi" header="Prodi" body={(row) => renderField(row.prodi)} />
        <Column field="kelas" header="Kelas" body={(row) => renderField(row.kelas)} />
        <Column field="ruang" header="Ruang" body={(row) => renderField(row.ruang)} />
        <Column field="no_hp" header="No HP" body={(row) => renderField(row.no_hp)} />
        <Column field="tanggal" header="Tanggal" body={(row) => renderField(row.tanggal)} />
        <Column field="keterangan" header="Keterangan" body={keteranganBodyTemplate} />
        <Column field="deskripsi" header="Deskripsi" body={(row) => renderField(row.deskripsi)} />
        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column header="Foto" body={fotoBodyTemplate} />
        <Column header="Aksi" body={actionBodyTemplate} />
      </DataTable>

      <Dialog
        visible={imageDialogVisible}
        onHide={() => {
          setImageDialogVisible(false);
          setSelectedImage(null);
          setImageError(false);
        }}
        header="Foto Ajuan Barang"
        style={{ width: '50vw' }}
        modal
      >
        {selectedImage && !imageError && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '250px',
            }}
          >
            <img
              src={selectedImage}
              alt="Foto ajuan barang"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {imageError && (
          <div
            style={{
              padding: '1rem',
              color: '#b91c1c',
              background: '#fee2e2',
              borderRadius: '8px',
              lineHeight: '1.5',
            }}
          >
            <strong>Foto gagal dimuat.</strong>
          </div>
        )}

        {!selectedImage && !imageError && <p>Tidak ada foto yang dipilih.</p>}
      </Dialog>
    </>
  );
};

export default AjuanBarangTable;