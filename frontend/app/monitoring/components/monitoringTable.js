'use client';

import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getMonitoring } from '../../../services/monitoringService';

export default function MonitoringTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonitoring()    
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2>Log Kehadiran Mahasiswa</h2>

      <DataTable
        value={data}
        paginator
        rows={10}
        loading={loading}
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" />
        <Column field="nama" header="Nama" />
        <Column field="nim" header="NIM" />
        <Column field="masuk" header="Waktu Masuk" />
      </DataTable>
    </div>
  );
}
