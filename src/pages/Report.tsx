import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCompanyData } from '../hooks/useCompanyData';
import PdfReport from '../components/report/PdfReport';

export default function Report() {
  const {
    companiesWithSavings, riskSummary, totalSaving, performance, settings, loading,
  } = useCompanyData();
  const [generating, setGenerating] = useState(false);

  const handleGeneratePdf = async (element: HTMLElement) => {
    setGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -(pdfHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`KNC_산업안전_RBF_성과보고서_${date}.pdf`);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>보고서 생성</h1>
        <p>전체 통합집계 보고서를 PDF로 다운로드할 수 있습니다</p>
      </div>

      {generating && (
        <div className="generating-overlay">
          <div className="spinner" />
          <p>PDF 생성 중...</p>
        </div>
      )}

      <PdfReport
        companies={companiesWithSavings}
        riskSummary={riskSummary}
        totalSaving={totalSaving}
        performance={performance}
        settings={settings}
        onGeneratePdf={handleGeneratePdf}
      />
    </div>
  );
}
