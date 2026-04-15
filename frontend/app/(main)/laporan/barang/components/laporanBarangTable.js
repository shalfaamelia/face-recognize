'use client';

import Image from 'next/image';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const LaporanBarangTable = ({ laporanBarang, loading }) => {
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
      <a
        href={row.foto_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <Image
          src={row.foto_url}
          alt="Foto laporan barang"
          width={40}
          height={40}
          className="rounded object-cover border"
          unoptimized
        />
        <span>Lihat Foto</span>
      </a>
    );
  };

  return (
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
      <Column field="status" header="Status" body={statusBodyTemplate} />
    </DataTable>
  );
};

export default LaporanBarangTable;