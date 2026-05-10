'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from '@/app/components/headerbar';
import LaporanBarangTable from './components/laporanBarangTable';
import { getLaporanBarang } from '@/services/laporanBarangService';
import dynamic from "next/dynamic";
import AdjustPrintMarginLaporan from '@/app/(main)/laporan/barang/print/adjustPrintMarginLaporan';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  ssr: false,
});

export default function Page() {
  const [laporanBarang, setLaporanBarang] = useState([]);
  const [allLaporanBarang, setAllLaporanBarang] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getLaporanBarang();
      setAllLaporanBarang(data);
      setLaporanBarang(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal', err.message || 'Terjadi kesalahan saat mengambil laporan barang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === '') {
      setLaporanBarang(allLaporanBarang);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const filtered = allLaporanBarang.filter((item) =>
      item.nama?.toLowerCase().includes(lowerKeyword) ||
      item.nim?.toLowerCase().includes(lowerKeyword) ||
      item.prodi?.toLowerCase().includes(lowerKeyword) ||
      item.kelas?.toLowerCase().includes(lowerKeyword) ||
      item.keterangan?.toLowerCase().includes(lowerKeyword) ||
      item.deskripsi?.toLowerCase().includes(lowerKeyword) ||
      item.status?.toLowerCase().includes(lowerKeyword)
    );

    setLaporanBarang(filtered);
  };

  return (
    <Card>
      <ToastNotifier ref={toastRef} />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">Laporan Barang Lab</h3>

        <div className="flex items-center ml-auto gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Data"
            onClick={() => setAdjustDialog(true)}
          />
          <HeaderBar
            title=""
            placeholder="Cari nama, NIM, prodi, kelas, keterangan..."
            onSearch={handleSearch}
          />
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