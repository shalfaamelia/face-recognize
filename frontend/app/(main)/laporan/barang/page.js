'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from '@/app/components/headerbar';
import FilterTanggal from '@/app/components/filterTanggal';
import LaporanBarangTable from './components/laporanBarangTable';
import { getLaporanBarang } from '@/services/laporanBarangService';
import dynamic from "next/dynamic";
import AdjustPrintMarginLaporan from '@/app/(main)/laporan/barang/print/adjustPrintMarginLaporan';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  ssr: false,
});

export default function Page() {
  const [laporanBarang, setLaporanBarang] = useState([]);
  const [allLaporanBarang, setAllLaporanBarang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const toastRef = useRef(null);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const showToast = (severity, summary, detail) => {
    toastRef.current?.show?.({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const formatDateParam = (date) => {
    if (!date) return '';

    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const applySearch = (data, keyword) => {
    if (!keyword || keyword.trim() === '') return data;

    const lowerKeyword = keyword.toLowerCase();

    return data.filter((item) =>
      item.nama?.toLowerCase().includes(lowerKeyword) ||
      item.nim?.toLowerCase().includes(lowerKeyword) ||
      item.prodi?.toLowerCase().includes(lowerKeyword) ||
      item.kelas?.toLowerCase().includes(lowerKeyword) ||
      item.ruang?.toLowerCase().includes(lowerKeyword) ||
      item.no_hp?.toLowerCase().includes(lowerKeyword) ||
      item.keterangan?.toLowerCase().includes(lowerKeyword) ||
      item.deskripsi?.toLowerCase().includes(lowerKeyword) ||
      item.status?.toLowerCase().includes(lowerKeyword)
    );
  };

  const fetchData = async (filters = {}) => {
    setLoading(true);

    try {
      const data = await getLaporanBarang(filters);
      setAllLaporanBarang(data);
      setLaporanBarang(applySearch(data, searchKeyword));
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        'Gagal',
        err.message || 'Terjadi kesalahan saat mengambil laporan barang'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    setLaporanBarang(applySearch(allLaporanBarang, keyword));
  };

  const handleDateFilter = () => {
    fetchData({
      startDate: formatDateParam(startDate),
      endDate: formatDateParam(endDate),
    });
  };

  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    fetchData();
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />

      <div className="mb-3">
        <h3
          className="text-xl font-semibold"
          style={{ margin: '0 0 1.25rem 0' }}
        >
          Laporan Barang Lab
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <FilterTanggal
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleDateFilter={handleDateFilter}
            resetFilter={resetFilter}
          />

          <div
            className="flex gap-2"
            style={{ alignItems: 'flex-end', marginLeft: 'auto' }}
          >
            <Button
              icon="pi pi-print"
              className="p-button-warning report-print-button mb-2"
              tooltip="Cetak Data"
              onClick={() => setAdjustDialog(true)}
            />

            <HeaderBar
              title=""
              placeholder="Cari nama, NIM, prodi, kelas, ruang, no HP..."
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      <LaporanBarangTable
        laporanBarang={laporanBarang}
        loading={loading}
      />

      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataLaporanBarang={laporanBarang}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        modal
        style={{ width: "90vw", height: "90vh" }}
        header="Preview PDF"
      >
        <PDFViewer
          pdfUrl={pdfUrl}
          fileName={fileName}
          paperSize="A4"
        />
      </Dialog>
    </Card>
  );
}