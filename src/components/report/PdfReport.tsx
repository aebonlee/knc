import { useRef } from 'react';
import { formatBillion, formatWon } from '../../hooks/useCompanyData';
import type { CompanyWithSavings, RiskSummary, ProjectSettings } from '../../types';

interface Props {
  companies: CompanyWithSavings[];
  riskSummary: RiskSummary[];
  totalSaving: number;
  performance: { label: string; rate: number };
  settings: ProjectSettings;
  onGeneratePdf: (element: HTMLElement) => void;
}

export default function PdfReport({
  companies, riskSummary, totalSaving, performance, settings, onGeneratePdf,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (reportRef.current) onGeneratePdf(reportRef.current);
  };

  const sorted = [...companies].sort((a, b) => b.total_saving - a.total_saving);

  return (
    <div>
      <button className="btn-primary" onClick={handleGenerate} style={{ marginBottom: 20 }}>
        PDF 다운로드
      </button>

      <div ref={reportRef} className="pdf-report">
        <div className="report-header">
          <h1>K&C 산업안전 RBF 사회비용 성과 보고서</h1>
          <p className="report-date">생성일: {new Date().toLocaleDateString('ko-KR')}</p>
          <p className="report-phase">{settings.project_phase}</p>
        </div>

        <div className="report-section">
          <h2>1. 성과 요약</h2>
          <table className="report-table">
            <tbody>
              <tr><td>투입금액</td><td>{formatBillion(settings.total_investment)}</td></tr>
              <tr><td>총 절감액</td><td>{formatBillion(totalSaving)}</td></tr>
              <tr><td>달성률</td><td>{performance.rate.toFixed(1)}%</td></tr>
              <tr><td>성과 판정</td><td><strong>{performance.label}</strong></td></tr>
              <tr><td>참여 기업 수</td><td>{companies.length}개</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>2. 위험요인별 절감 현황</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>위험요인</th>
                <th>공학</th>
                <th>보호구</th>
                <th>교육</th>
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              {riskSummary.map(r => (
                <tr key={r.risk_no}>
                  <td>{r.risk_name}</td>
                  <td className="text-right">{formatWon(r.engineering_total)}</td>
                  <td className="text-right">{formatWon(r.ppe_total)}</td>
                  <td className="text-right">{formatWon(r.education_total)}</td>
                  <td className="text-right"><strong>{formatWon(r.total_saving)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2>3. 기업별 절감 순위</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>기업명</th>
                <th>유형</th>
                <th>수요기업 수</th>
                <th>절감액</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((comp, idx) => (
                <tr key={comp.id}>
                  <td>{idx + 1}</td>
                  <td>{comp.company_name}</td>
                  <td>{comp.solution_type}</td>
                  <td>{comp.demand_companies.length}</td>
                  <td className="text-right">{formatWon(comp.total_saving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
