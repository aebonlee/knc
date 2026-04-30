import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCompanyData } from '../hooks/useCompanyData';
import { usePhase } from '../contexts/PhaseContext';
import PdfReport from '../components/report/PdfReport';
import CompanyPdfReport from '../components/report/CompanyPdfReport';
import MonthlyPdfReport from '../components/report/MonthlyPdfReport';
import { FiFileText, FiUsers, FiCalendar } from 'react-icons/fi';

type ReportTab = 'overall' | 'company' | 'monthly';

const TABS: { key: ReportTab; label: string; icon: typeof FiFileText; desc: string }[] = [
  { key: 'overall', label: '전체 보고서', icon: FiFileText, desc: '전체 통합집계 성과 보고서' },
  { key: 'company', label: '기업별 보고서', icon: FiUsers, desc: '기업 개별 실적 보고서' },
  { key: 'monthly', label: '월별 보고서', icon: FiCalendar, desc: '월간 실적 보고서' },
];

export default function Report() {
  const { phase } = usePhase();
  const {
    companiesWithSavings, riskSummary, totalSaving, performance, settings,
    activities, demandCompanies, referenceData, unitPrices, loading,
  } = useCompanyData(phase);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<ReportTab>('overall');

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
      const prefix = tab === 'overall' ? '전체' : tab === 'company' ? '기업별' : '월별';
      pdf.save(`KNC_산업안전_${prefix}_보고서_${date}.pdf`);
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
        <p>전체, 기업별, 월별 보고서를 PDF로 다운로드할 수 있습니다</p>
      </div>

      {/* 보고서 유형 탭 */}
      <div className="report-type-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`report-type-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <t.icon size={18} />
            <div>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {generating && (
        <div className="generating-overlay">
          <div className="spinner" />
          <p>PDF 생성 중...</p>
        </div>
      )}

      {tab === 'overall' && (
        <PdfReport
          companies={companiesWithSavings}
          riskSummary={riskSummary}
          totalSaving={totalSaving}
          performance={performance}
          settings={settings}
          onGeneratePdf={handleGeneratePdf}
        />
      )}

      {tab === 'company' && (
        <CompanyPdfReport
          companies={companiesWithSavings}
          activities={activities}
          demandCompanies={demandCompanies}
          referenceData={referenceData}
          unitPrices={unitPrices}
          onGeneratePdf={handleGeneratePdf}
        />
      )}

      {tab === 'monthly' && (
        <MonthlyPdfReport
          companies={companiesWithSavings}
          activities={activities}
          demandCompanies={demandCompanies}
          referenceData={referenceData}
          unitPrices={unitPrices}
          settings={settings}
          onGeneratePdf={handleGeneratePdf}
        />
      )}
    </div>
  );
}
