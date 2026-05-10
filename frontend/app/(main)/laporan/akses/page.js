'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import { Card } from 'primereact/card';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import ToastNotifier from '@/app/components/toastNotifier';
import HeaderBar from "@/app/components/headerbar";
import LaporanAksesTable from './components/laporanAksesTable';
import { getLaporanAkses } from '@/services/laporanAksesService';
import AdjustPrintMarginLaporan from '@/app/(main)/laporan/akses/print/adjustPrintMarginLaporan';

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  ssr: false,
});

export default function Page() {
  const [laporanAkses, setLaporanAkses] = useState([]);
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getLaporanAkses();
      setLaporanAkses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">Laporan Akses Lab</h3>

        <div className="flex items-center ml-auto gap-2">
          <Button
            icon="pi pi-print"
            className="p-button-warning mt-3"
            tooltip="Cetak Data"
            onClick={() => setAdjustDialog(true)}
          />

          <HeaderBar
            title=""
            placeholder="Cari berdasarkan nama atau kode..."
            onSearch={(keyword) => {
              if (!keyword) {
                fetchData();
              } else {
                setLaporanAkses((prev) =>
                  prev.filter(item =>
                    item.kode?.toLowerCase().includes(keyword.toLowerCase()) ||
                    item.nama?.toLowerCase().includes(keyword.toLowerCase())
                  )
                );
              }
            }}
          />
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