import { useRef, useState } from 'react';
import { formatWon, formatBillion, getActivitySaving } from '../../hooks/useCompanyData';
import type { CompanyWithSavings, Activity, DemandCompany, ReferenceData, CompanyUnitPrice, ProjectSettings } from '../../types';

interface Props {
  companies: CompanyWithSavings[];
  activities: Activity[];
  demandCompanies: DemandCompany[];
  referenceData: ReferenceData[];
  unitPrices: CompanyUnitPrice[];
  settings: ProjectSettings;
  onGeneratePdf: (element: HTMLElement) => void;
}

export default function MonthlyPdfReport({
  companies, activities, demandCompanies, referenceData, unitPrices, settings, onGeneratePdf,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  const handleGenerate = () => {
    if (reportRef.current) onGeneratePdf(reportRef.current);
  };

  // 전체 월 목록
  const months = [...new Set(demandCompanies.map(d => d.month))].sort();

  // 선택된 월의 데이터
  const monthDemands = demandCompanies.filter(d => d.month === selectedMonth);
  const monthDemandIds = new Set(monthDemands.map(d => d.id));
  const monthActivities = activities.filter(a => a.month === selectedMonth && monthDemandIds.has(a.demand_company_id));

  // 기업별 현황
  const companyData = companies.map(comp => {
    const cDemands = monthDemands.filter(d => d.company_id === comp.id);
    const cDemandIds = new Set(cDemands.map(d => d.id));
    const cActs = monthActivities.filter(a => cDemandIds.has(a.demand_company_id));
    const cPrices = unitPrices.filter(u => u.company_id === comp.id);
    const saving = cActs.reduce((s, a) => s + getActivitySaving(a, referenceData, cPrices), 0);
    const actCount = cActs.reduce((s, a) => s + a.activity_count, 0);
    return { ...comp, monthDemandCount: cDemands.length, monthActCount: actCount, monthSaving: saving };
  }).filter(c => c.monthSaving > 0 || c.monthDemandCount > 0)
    .sort((a, b) => b.monthSaving - a.monthSaving);

  const monthTotalSaving = companyData.reduce((s, c) => s + c.monthSaving, 0);
  const monthTotalActs = companyData.reduce((s, c) => s + c.monthActCount, 0);
  const monthTotalDemands = companyData.reduce((s, c) => s + c.monthDemandCount, 0);

  // 위험요인별
  const riskData = referenceData.map(ref => {
    const rActs = monthActivities.filter(a => a.risk_no === ref.no);
    const engineering = rActs.filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const ppe = rActs.filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const education = rActs.filter(a => a.activity_type === 'education')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    return { risk_no: ref.no, risk_name: ref.risk_name, engineering, ppe, education, total: engineering + ppe + education };
  }).filter(r => r.total > 0);

  return (
    <div>
      <div className="report-controls">
        <select
          className="form-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          <option value="">월을 선택하세요</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={handleGenerate} disabled={!selectedMonth}>
          PDF 다운로드
        </button>
      </div>

      {selectedMonth && (
        <div ref={reportRef} className="pdf-report">
          <div className="report-header">
            <h1>{selectedMonth} 월별 사회비용 절감 보고서</h1>
            <p className="report-date">생성일: {new Date().toLocaleDateString('ko-KR')}</p>
            <p className="report-phase">{settings.project_phase}</p>
          </div>

          <div className="report-section">
            <h2>1. 월간 요약</h2>
            <table className="report-table">
              <tbody>
                <tr><td>대상 월</td><td>{selectedMonth}</td></tr>
                <tr><td>참여 기업 수</td><td>{companyData.length}개</td></tr>
                <tr><td>수요기업 합계</td><td>{monthTotalDemands}개</td></tr>
                <tr><td>활동건수 합계</td><td>{monthTotalActs}건</td></tr>
                <tr><td>월간 절감액</td><td><strong>{formatBillion(monthTotalSaving)}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>2. 기업별 현황</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>기업명</th>
                  <th>유형</th>
                  <th>수요기업</th>
                  <th>활동건수</th>
                  <th>절감액</th>
                </tr>
              </thead>
              <tbody>
                {companyData.map((c, idx) => (
                  <tr key={c.id}>
                    <td>{idx + 1}</td>
                    <td>{c.company_name}</td>
                    <td>{c.solution_type}</td>
                    <td>{c.monthDemandCount}개</td>
                    <td>{c.monthActCount}건</td>
                    <td className="text-right">{formatWon(c.monthSaving)}</td>
                  </tr>
                ))}
                <tr className="report-total-row">
                  <td colSpan={3}><strong>합계</strong></td>
                  <td><strong>{monthTotalDemands}개</strong></td>
                  <td><strong>{monthTotalActs}건</strong></td>
                  <td className="text-right"><strong>{formatWon(monthTotalSaving)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>3. 위험요인별 절감 현황</h2>
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
                {riskData.map(r => (
                  <tr key={r.risk_no}>
                    <td>{r.risk_name}</td>
                    <td className="text-right">{formatWon(r.engineering)}</td>
                    <td className="text-right">{formatWon(r.ppe)}</td>
                    <td className="text-right">{formatWon(r.education)}</td>
                    <td className="text-right"><strong>{formatWon(r.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
