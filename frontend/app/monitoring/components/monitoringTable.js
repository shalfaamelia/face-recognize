'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { getMonitoring } from '../../../services/monitoringService';

export default function MonitoringTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonitoring()
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, []);

  const header = (
    <div
      className="flex justify-content-between align-items-center"
      style={{ padding: '1.25rem 1.5rem 0.75rem' }}
    >
      <div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a2035'
          }}
        >
          Monitoring Kehadiran
        </div>

        <div
          style={{
            fontSize: '0.85rem',
            color: '#8896a7',
            marginTop: '4px'
          }}
        >
          Log kehadiran mahasiswa secara realtime
        </div>
      </div>

      <Tag
        value={`${data.length} Records`}
        severity="info"
        style={{ fontSize: '0.75rem' }}
      />
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">

        <Card
          header={header}
          className="shadow-2"
          pt={{
            root: { style: { borderRadius: '12px' } },
            body: { style: { padding: '0 1.5rem 1.5rem' } },
          }}
        >

          <DataTable
            value={data}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            loading={loading}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="Tidak ada data monitoring"
            className="p-datatable-sm"
          >
            <Column
              field="id"
              header="ID"
              style={{ width: '80px' }}
            />

            <Column
              field="nama"
              header="Nama"
            />

            <Column
              field="nim"
              header="NIM"
            />

            <Column
              field="masuk"
              header="Waktu Masuk"
              style={{ width: '200px' }}
            />

          </DataTable>

        </Card>

      </div>
    </div>
  );
}