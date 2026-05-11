'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from 'primereact/button';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function PDFViewer({ pdfUrl, fileName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const handleLastPage = () => {
    setCurrentPage(numPages);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;

    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `${fileName || 'document'}.pdf`;
    downloadLink.click();
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    if (pdfUrl.startsWith('data:application/pdf')) {
      const base64Data = pdfUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, '_blank');
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!pdfUrl) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
        }}
      >
        <Button
          icon="pi pi-angle-double-left"
          style={{ margin: '5px' }}
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="p-button-secondary pdf-toolbar-button"
        />

        <Button
          icon="pi pi-angle-left"
          style={{ margin: '5px' }}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-button-secondary pdf-toolbar-button"
        />

        <Button
          icon="pi pi-search-plus"
          style={{ margin: '5px' }}
          onClick={handleZoomIn}
          disabled={scale >= 2}
          className="p-button-info pdf-toolbar-button"
        />

        <Button
          icon="pi pi-search-minus"
          style={{ margin: '5px' }}
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="p-button-info pdf-toolbar-button"
        />

        <Button
          icon="pi pi-angle-right"
          style={{ margin: '5px' }}
          onClick={handleNextPage}
          disabled={!numPages || currentPage === numPages}
          className="p-button-secondary pdf-toolbar-button"
        />

        <Button
          icon="pi pi-angle-double-right"
          style={{ margin: '5px' }}
          onClick={handleLastPage}
          disabled={!numPages || currentPage === numPages}
          className="p-button-secondary pdf-toolbar-button"
        />

        <Button
          icon="pi pi-download"
          style={{ margin: '5px' }}
          onClick={handleDownloadPDF}
          className="p-button-success pdf-toolbar-button"
        />

        <Button
          icon="pi pi-print"
          style={{ margin: '5px' }}
          onClick={handlePrint}
          className="p-button-success pdf-toolbar-button"
        />
      </div>

      <div
        style={{
          overflow: 'auto',
          height: '65vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '20px',
          backgroundColor: '#e5e5e5',
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('PDF load error:', error)}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
          />
        </Document>
      </div>

      {numPages && (
        <div
          className="pdf-page-info"
          style={{
            textAlign: 'center',
            marginTop: '10px',
            color: 'gray',
            fontSize: '12px',
          }}
        >
          Page {currentPage} of {numPages}
        </div>
      )}
    </div>
  );
}

export default PDFViewer;