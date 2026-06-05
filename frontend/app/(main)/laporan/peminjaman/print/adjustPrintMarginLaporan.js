'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toolbar } from 'primereact/toolbar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function AdjustPrintMarginLaporan({
  adjustDialog,
  setAdjustDialog,
  dataLaporanPeminjaman = [],
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false);

  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    paperSize: 'A4',
    orientation: 'portrait',
  });

  const paperSizes = [
    { name: 'A4', value: 'A4' },
    { name: 'Letter', value: 'Letter' },
    { name: 'Legal', value: 'Legal' },
  ];

  const orientationOptions = [
    { label: 'Potrait', value: 'portrait' },
    { label: 'Lanskap', value: 'landscape' },
  ];

  const onInputChangeNumber = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value || 0 }));
  };

  const onInputChange = (e, name) => {
    setDataAdjust((prev) => ({ ...prev, [name]: e.value }));
  };

  const capitalize = (str) => {
    if (!str || str === '-') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const addHeader = (doc, title, marginLeft, marginTop, marginRight, totalData) => {
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Banner background
    doc.setFillColor(15, 52, 96);
    doc.rect(marginLeft, marginTop, contentWidth, 22, 'F');

    // Accent bar kiri
    doc.setFillColor(52, 152, 219);
    doc.rect(marginLeft, marginTop, 4, 22, 'F');

    // Judul utama
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, marginLeft + 10, marginTop + 10);

    // Subjudul
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 210, 240);
    doc.text('Smart Access', marginLeft + 10, marginTop + 17);

    // Info tanggal & total di kanan
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.setFontSize(8);
    doc.setTextColor(180, 210, 240);
    doc.text(`Dicetak: ${today}`, pageWidth - marginRight - 2, marginTop + 10, { align: 'right' });
    doc.text(`Total Data: ${totalData} data`, pageWidth - marginRight - 2, marginTop + 17, { align: 'right' });

    // Garis bawah accent
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.8);
    doc.line(marginLeft, marginTop + 24, pageWidth - marginRight, marginTop + 24);

    return marginTop + 29;
  };

  const addFooter = (doc, marginLeft, marginRight, marginBottom) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = pageHeight - marginBottom + 4;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, footerY - 2, pageWidth - marginRight, footerY - 2);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 130);
      doc.text(
        'Smart Access — Dokumen ini dicetak secara otomatis',
        marginLeft,
        footerY + 3
      );
      doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - marginRight, footerY + 3, {
        align: 'right',
      });
    }
  };

  const exportPDF = async (adjustConfig) => {
    const doc = new jsPDF({
      orientation: adjustConfig.orientation,
      unit: 'mm',
      format: adjustConfig.paperSize.toLowerCase(),
    });

    const marginLeft = parseFloat(adjustConfig.marginLeft);
    const marginTop = parseFloat(adjustConfig.marginTop);
    const marginRight = parseFloat(adjustConfig.marginRight);
    const marginBottom = parseFloat(adjustConfig.marginBottom);

    const startY = addHeader(
      doc,
      'LAPORAN PEMINJAMAN',
      marginLeft,
      marginTop,
      marginRight,
      dataLaporanPeminjaman.length
    );

    autoTable(doc, {
      startY,
      head: [['No', 'Nama', 'NIM', 'Prodi', 'Kelas', 'Keterangan', 'Status']],
      body: dataLaporanPeminjaman.map((item, i) => [
        i + 1,
        item.nama || '-',
        item.nim || '-',
        item.prodi || '-',
        item.kelas || '-',
        item.keterangan || '-',
        capitalize(item.status) || '-',
      ]),
      margin: {
        left: marginLeft,
        right: marginRight,
        bottom: marginBottom + 8,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        lineColor: [220, 230, 240],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [15, 52, 96],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      },
      alternateRowStyles: {
        fillColor: [240, 247, 255],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
      },
    });

    addFooter(doc, marginLeft, marginRight, marginBottom);

    return doc.output('datauristring');
  };

  const exportExcel = () => {
    const dataExcel = dataLaporanPeminjaman.map((item, i) => ({
      No: i + 1,
      Nama: item.nama || '-',
      NIM: item.nim || '-',
      Prodi: item.prodi || '-',
      Kelas: item.kelas || '-',
      Keterangan: item.keterangan || '-',
      Status: capitalize(item.status) || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Peminjaman');
    XLSX.writeFile(wb, 'Laporan_Peminjaman.xlsx');
  };

  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(dataAdjust);
      setPdfUrl(pdfDataUrl);
      setFileName('Laporan_Peminjaman');
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } catch (error) {
      console.error('Gagal export PDF:', error);
    } finally {
      setLoadingExport(false);
    }
  };

  const footer = () => (
    <div className="flex flex-row gap-2">
      <Button
        label="Export Excel"
        icon="pi pi-file-excel"
        severity="success"
        onClick={exportExcel}
      />
      <Button
        label="Export PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        onClick={handleExportPdf}
        loading={loadingExport}
      />
    </div>
  );

  return (
    <Dialog
      visible={adjustDialog}
      onHide={() => setAdjustDialog(false)}
      header="Pengaturan Cetak"
      style={{ width: '50vw' }}
    >
      <div className="grid p-fluid">
        <div className="col-12 md:col-6">
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Margin (mm)</h5>
            {['Top', 'Bottom', 'Right', 'Left'].map((label) => (
              <div className="col-6 field" key={label}>
                <label>Margin {label}</label>
                <InputNumber
                  value={dataAdjust[`margin${label}`]}
                  onChange={(e) => onInputChangeNumber(e, `margin${label}`)}
                  min={0}
                  suffix=" mm"
                  showButtons
                  className="w-full"
                  inputStyle={{ padding: '0.3rem' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="grid formgrid">
            <h5 className="col-12 mb-2">Pengaturan Kertas</h5>
            <div className="col-12 field">
              <label>Ukuran Kertas</label>
              <Dropdown
                value={dataAdjust.paperSize}
                options={paperSizes}
                onChange={(e) => onInputChange(e, 'paperSize')}
                optionLabel="name"
                className="w-full"
              />
            </div>
            <div className="col-12 field">
              <label>Orientasi</label>
              <Dropdown
                value={dataAdjust.orientation}
                options={orientationOptions}
                onChange={(e) => onInputChange(e, 'orientation')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <Toolbar className="py-2 justify-content-end" end={footer} />
    </Dialog>
  );
}