'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { Card } from 'primereact/card';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import FilterTanggal from '@/app/components/filterTanggal';
import LaporanAksesTable from './components/laporanAksesTable';
import { getLaporanAkses } from '@/services/laporanAksesService';
import AdjustPrintMarginLaporan from '@/app/(main)/laporan/akses/print/adjustPrintMarginLaporan';

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  ssr: false,
});

export default function Page() {
  const [laporanAkses, setLaporanAkses] = useState([]);
  const [allLaporanAkses, setAllLaporanAkses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const toastRef = useRef(null);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

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
    return data.filter(item =>
      item.kode?.toLowerCase().includes(lowerKeyword) ||
      item.nama?.toLowerCase().includes(lowerKeyword)
    );
  };

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getLaporanAkses(filters);
      setAllLaporanAkses(data);
      setLaporanAkses(applySearch(data, searchKeyword));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    setLaporanAkses(applySearch(allLaporanAkses, keyword));
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
      <ConfirmDialog />

      <div className="mb-3">
        <h3 className="text-xl font-semibold" style={{ margin: '0 0 1.25rem 0' }}>
          Laporan Akses Lab
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

          <div className="flex gap-2" style={{ alignItems: 'flex-end', marginLeft: 'auto' }}>
            <Button
              icon="pi pi-print"
              className="p-button-warning report-print-button mb-2"
              tooltip="Cetak Data"
              onClick={() => setAdjustDialog(true)}
            />

            <HeaderBar
              title=""
              placeholder="Cari berdasarkan nama atau kode..."
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      <LaporanAksesTable
        laporanAkses={laporanAkses}
        loading={loading}
      />

      <AdjustPrintMarginLaporan
        adjustDialog={adjustDialog}
        setAdjustDialog={setAdjustDialog}
        dataLaporanAkses={laporanAkses}
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
