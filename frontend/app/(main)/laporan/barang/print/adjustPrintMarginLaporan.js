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

/**
 * Mengambil logo dari /public/logo-pnm.png dan mengubahnya ke base64.
 * Pastikan file logo sudah ada di folder /public dengan nama logo-pnm.png
 */
const getLogoBase64 = (url) =>
  fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

export default function AdjustPrintMarginLaporanBarang({
  adjustDialog,
  setAdjustDialog,
  dataLaporanBarang = [],
  setPdfUrl,
  setFileName,
  setJsPdfPreviewOpen,
}) {
  const [loadingExport, setLoadingExport] = useState(false);

  const [dataAdjust, setDataAdjust] = useState({
    marginTop: 10,
    marginBottom: 12,
    marginRight: 15,
    marginLeft: 15,
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

  /**
   * Menggambar kop surat Politeknik Negeri Madiun - Jurusan Teknik.
   * Mengembalikan nilai Y (startY) untuk tabel di bawah kop.
   */
  const addHeader = async (doc, marginLeft, marginTop, marginRight) => {
    const pageWidth    = doc.internal.pageSize.width;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // ── Logo PNM ──────────────────────────────────────────────────────────
    const LOGO_W = 28;
    const LOGO_H = 28;

    try {
      const logoBase64 = await getLogoBase64('/logo-pnm.png');
      doc.addImage(logoBase64, 'PNG', marginLeft, marginTop, LOGO_W, LOGO_H);
    } catch {
      // Placeholder jika logo tidak ditemukan
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft, marginTop, LOGO_W, LOGO_H, 'FD');
      doc.setFontSize(6.5);
      doc.setTextColor(160, 160, 160);
      doc.text('LOGO', marginLeft + LOGO_W / 2, marginTop + LOGO_H / 2 + 1, { align: 'center' });
    }

    // ── Area teks kop (di kanan logo, rata tengah) ────────────────────────
    const gap         = 5;
    const textLeft    = marginLeft + LOGO_W + gap;
    const textWidth   = contentWidth - LOGO_W - gap;
    const textCenterX = textLeft + textWidth / 2;

    doc.setTextColor(0, 0, 0);

    // Baris 1 — KEMENTERIAN ... (normal, 10pt)
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(
      'KEMENTERIAN PENDIDIKAN TINGGI, SAINS,',
      textCenterX,
      marginTop + 6,
      { align: 'center' }
    );

    // Baris 2 — DAN TEKNOLOGI
    doc.text('DAN TEKNOLOGI', textCenterX, marginTop + 11, { align: 'center' });

    // Baris 3 — POLITEKNIK NEGERI MADIUN (bold, 13pt)
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('POLITEKNIK NEGERI MADIUN', textCenterX, marginTop + 17, { align: 'center' });

    // Baris 4 — JURUSAN TEKNIK (bold, 12pt)
    doc.setFontSize(12);
    doc.text('JURUSAN TEKNIK', textCenterX, marginTop + 22.5, { align: 'center' });

    // Baris 5–7 — alamat, telepon, laman (normal, 8pt)
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text(
      'Jalan Ring Road Barat Winongo, Manguharjo, Kota Madiun, Kode Pos 63162',
      textCenterX,
      marginTop + 27.5,
      { align: 'center' }
    );
    doc.text(
      'Telepon +62 351 452970   Faksimile +62 351 492960',
      textCenterX,
      marginTop + 32,
      { align: 'center' }
    );
    doc.text(
      'Laman : www.pnm.ac.id   Surel : sekretariat@pnm.ac.id',
      textCenterX,
      marginTop + 36.5,
      { align: 'center' }
    );

    // ── Garis bawah kop (tebal + tipis) ───────────────────────────────────
    const line1Y = marginTop + 39.5;
    const line2Y = marginTop + 41;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.0);
    doc.line(marginLeft, line1Y, marginLeft + contentWidth, line1Y);

    doc.setLineWidth(0.3);
    doc.line(marginLeft, line2Y, marginLeft + contentWidth, line2Y);

    // ── Judul laporan ──────────────────────────────────────────────────────
    const judulY = line2Y + 9;

    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('LAPORAN BARANG LAB', marginLeft + contentWidth / 2, judulY, {
      align: 'center',
    });

    // Kembalikan posisi Y awal tabel
    return judulY + 8;
  };

  /**
   * Menambahkan footer pada setiap halaman PDF.
   * Kiri  : tanggal cetak
   * Kanan : nomor halaman
   */
  const addFooter = (doc, marginLeft, marginRight, marginBottom) => {
    const pageCount  = doc.internal.getNumberOfPages();
    const pageWidth  = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      const footerY = pageHeight - marginBottom + 4;

      // Garis tipis di atas footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, footerY - 2, pageWidth - marginRight, footerY - 2);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 130);

      // Kiri: tanggal cetak
      doc.text(`Smart Access - Dicetak: ${today}`, marginLeft, footerY + 3);

      // Kanan: nomor halaman
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth - marginRight,
        footerY + 3,
        { align: 'right' }
      );
    }
  };

  /**
   * Membuat PDF lengkap dengan kop PNM, tabel, dan footer.
   */
  const exportPDF = async (adjustConfig) => {
    const doc = new jsPDF({
      orientation: adjustConfig.orientation,
      unit: 'mm',
      format: adjustConfig.paperSize.toLowerCase(),
    });

    const marginLeft   = parseFloat(adjustConfig.marginLeft);
    const marginTop    = parseFloat(adjustConfig.marginTop);
    const marginRight  = parseFloat(adjustConfig.marginRight);
    const marginBottom = parseFloat(adjustConfig.marginBottom);

    const startY = await addHeader(doc, marginLeft, marginTop, marginRight);

    autoTable(doc, {
      startY,
      head: [['No', 'Nama', 'NIM', 'Prodi', 'Kelas', 'Ruang', 'No HP', 'Keterangan', 'Status']],
      body: dataLaporanBarang.map((item, i) => [
        i + 1,
        item.nama        || '-',
        item.nim         || '-',
        item.prodi       || '-',
        item.kelas       || '-',
        item.ruang       || '-',
        item.noHp        || '-',
        capitalize(item.keterangan) || '-',
        capitalize(item.status)     || '-',
      ]),
      margin: {
        left: marginLeft,
        right: marginRight,
        bottom: marginBottom + 10,
      },
      // ── Gaya umum sel ──────────────────────────────────────────────────
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        textColor: [40, 40, 40],
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        lineColor: [220, 225, 230],
        lineWidth: 0.25,
        valign: 'middle',
      },
      // ── Header tabel ───────────────────────────────────────────────────
      headStyles: {
        fillColor: [30, 60, 100],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
        halign: 'center',
      },
      // ── Baris ganjil (putih bersih) ─────────────────────────────────────
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      // ── Baris genap (abu sangat muda) ───────────────────────────────────
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      // ── Lebar kolom spesifik ────────────────────────────────────────────
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 }, // No
        4: { cellWidth: 18 },                   // Kelas
        5: { cellWidth: 18 },                   // Ruang
        8: { halign: 'center', cellWidth: 20 }, // Status
      },
      // ── Kop ulang di halaman berikutnya ────────────────────────────────
      didDrawPage: async (data) => {
        if (data.pageNumber > 1) {
          await addHeader(doc, marginLeft, marginTop, marginRight);
        }
      },
    });

    addFooter(doc, marginLeft, marginRight, marginBottom);

    return doc.output('datauristring');
  };

  /**
   * Export ke Excel (.xlsx)
   */
  const exportExcel = () => {
    const dataExcel = dataLaporanBarang.map((item, i) => ({
      No:            i + 1,
      Nama:          item.nama        || '-',
      NIM:           item.nim         || '-',
      Prodi:         item.prodi       || '-',
      Kelas:         item.kelas       || '-',
      Ruang:         item.ruang       || '-',
      'No HP':       item.noHp        || '-',
      Keterangan:    capitalize(item.keterangan) || '-',
      Status:        capitalize(item.status)     || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Barang');
    XLSX.writeFile(wb, 'Laporan_Barang_Lab.xlsx');
  };

  const handleExportPdf = async () => {
    try {
      setLoadingExport(true);
      const pdfDataUrl = await exportPDF(dataAdjust);
      setPdfUrl(pdfDataUrl);
      setFileName('Laporan_Barang_Lab');
      setAdjustDialog(false);
      setJsPdfPreviewOpen(true);
    } catch (error) {
      console.error('Gagal export PDF:', error);
    } finally {
      setLoadingExport(false);
    }
  };

  const footerButtons = () => (
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

        {/* ── Margin ─────────────────────────────────────────────────────── */}
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

        {/* ── Kertas ─────────────────────────────────────────────────────── */}
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

      <Toolbar className="py-2 justify-content-end" end={footerButtons} />
    </Dialog>
  );
}