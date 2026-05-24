'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';

const buildLaporanBarangImageUrl = (filename) => {
  if (!filename) return null;

  const cleanFilename = String(filename).split(/[\\/]/).pop();

  return `/api/laporan_barang_image?filename=${encodeURIComponent(cleanFilename)}`;
};

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

    if (normalizedValue === 'temuan') {
      severity = 'success';
    } else if (normalizedValue === 'hilang') {
      severity = 'danger';
    }

    return (
      <Tag
        value={formatBadgeText(value)}
        severity={severity}
      />
    );
  };

  const statusBodyTemplate = (row) => {
    const value = row.status || 'baru';
    const normalizedValue = String(value).toLowerCase();

    let severity = 'warning';

    if (normalizedValue === 'baru') {
      severity = 'warning';
    } else if (normalizedValue === 'proses') {
      severity = 'info';
    } else if (normalizedValue === 'selesai') {
      severity = 'success';
    }

    return (
      <Tag
        value={formatBadgeText(value)}
        severity={severity}
      />
    );
  };

  const fotoBodyTemplate = (row) => {
    const fotoUrl = buildLaporanBarangImageUrl(row.foto);

    if (!fotoUrl) return '-';

    return (
      <button
        type="button"
        onClick={() => {
          console.log('ROW LAPORAN BARANG:', row);
          console.log('NAMA FILE FOTO:', row.foto);
          console.log('URL FOTO PROXY:', fotoUrl);

          setSelectedImage(fotoUrl);
          setImageError(false);
          setImageDialogVisible(true);
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
        <Column
          field="nama"
          header="Nama"
          body={(row) => renderField(row.nama)}
        />

        <Column
          field="nim"
          header="NIM"
          body={(row) => renderField(row.nim)}
        />

        <Column
          field="prodi"
          header="Prodi"
          body={(row) => renderField(row.prodi)}
        />

        <Column
          field="kelas"
          header="Kelas"
          body={(row) => renderField(row.kelas)}
        />

        <Column
          field="tanggal"
          header="Tanggal"
          body={(row) => renderField(row.tanggal)}
        />

        <Column
          field="keterangan"
          header="Keterangan"
          body={keteranganBodyTemplate}
        />

        <Column
          field="deskripsi"
          header="Deskripsi"
          body={(row) => renderField(row.deskripsi)}
        />

        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
        />

        <Column
          header="Foto"
          body={fotoBodyTemplate}
        />
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
              alt="Foto laporan barang"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
              onLoad={() => {
                console.log('Foto laporan barang berhasil dimuat:', selectedImage);
              }}
              onError={() => {
                console.log('Foto laporan barang gagal dimuat:', selectedImage);
                setImageError(true);
              }}
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
            <br />
            Coba buka URL proxy ini langsung di browser:
            <br />
            <code>
              {selectedImage
                ? `${typeof window !== 'undefined' ? window.location.origin : ''}${selectedImage}`
                : '-'}
            </code>
          </div>
        )}

        {!selectedImage && (
          <p>Tidak ada foto yang dipilih.</p>
        )}
      </Dialog>
    </>
  );
};

export default LaporanBarangTable;