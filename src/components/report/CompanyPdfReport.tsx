import { useRef, useState } from 'react';
import { formatWon, getActivitySaving } from '../../hooks/useCompanyData';
import type { CompanyWithSavings, RiskSummary, Activity, DemandCompany, ReferenceData, CompanyUnitPrice } from '../../types';

interface Props {
  companies: CompanyWithSavings[];
  activities: Activity[];
  demandCompanies: DemandCompany[];
  referenceData: ReferenceData[];
  unitPrices: CompanyUnitPrice[];
  onGeneratePdf: (element: HTMLElement) => void;
}

export default function CompanyPdfReport({
  companies, activities, demandCompanies, referenceData, unitPrices, onGeneratePdf,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('');

  const handleGenerate = () => {
    if (reportRef.current) onGeneratePdf(reportRef.current);
  };

  const company = companies.find(c => c.id === selectedId);
  const compActivities = activities.filter(a => a.company_id === selectedId);
  const compDemands = demandCompanies.filter(d => d.company_id === selectedId);
  const compPrices = unitPrices.filter(u => u.company_id === selectedId);

  // 월별 집계
  const months = [...new Set(compDemands.map(d => d.month))].sort();
  const monthData = months.map(month => {
    const mDemands = compDemands.filter(d => d.month === month);
    const mDemandIds = new Set(mDemands.map(d => d.id));
    const mActs = compActivities.filter(a => a.month === month && mDemandIds.has(a.demand_company_id));
    const saving = mActs.reduce((s, a) => s + getActivitySaving(a, referenceData, compPrices), 0);
    const actCount = mActs.reduce((s, a) => s + a.activity_count, 0);
    return { month, demandCount: mDemands.length, actCount, saving };
  });

  // 위험요인별
  const riskBreakdown: RiskSummary[] = referenceData.map(ref => {
    const rActs = compActivities.filter(a => a.risk_no === ref.no);
    const engineering_total = rActs.filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, compPrices), 0);
    const ppe_total = rActs.filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, compPrices), 0);
    const education_total = rActs.filter(a => a.activity_type === 'education')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, compPrices), 0);
    return {
      risk_no: ref.no, risk_name: ref.risk_name,
      engineering_total, ppe_total, education_total,
      total_saving: engineering_total + ppe_total + education_total,
    };
  }).filter(r => r.total_saving > 0);

  return (
    <div>
      <div className="report-controls">
        <select
          className="form-select"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">기업을 선택하세요</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.company_no}. {c.company_name} ({formatWon(c.total_saving)})
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={handleGenerate} disabled={!selectedId}>
          PDF 다운로드
        </button>
      </div>

      {company && (
        <div ref={reportRef} className="pdf-report">
          <div className="report-header">
            <h1>{company.company_name} — 사회비용 절감 보고서</h1>
            <p className="report-date">생성일: {new Date().toLocaleDateString('ko-KR')}</p>
          </div>

          <div className="report-section">
            <h2>1. 기업 정보</h2>
            <table className="report-table">
              <tbody>
                <tr><td>기업번호</td><td>{company.company_no}</td></tr>
                <tr><td>기업명</td><td>{company.company_name}</td></tr>
                <tr><td>솔루션 유형</td><td>{company.solution_type}</td></tr>
                <tr><td>사업자등록번호</td><td>{company.biz_number || '-'}</td></tr>
                <tr><td>총 수요기업 수</td><td>{compDemands.length}개</td></tr>
                <tr><td>총 절감액</td><td><strong>{formatWon(company.total_saving)}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>2. 월별 실적</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>월</th>
                  <th>수요기업 수</th>
                  <th>활동건수</th>
                  <th>절감액</th>
                </tr>
              </thead>
              <tbody>
                {monthData.map(m => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{m.demandCount}개</td>
                    <td>{m.actCount}건</td>
                    <td className="text-right">{formatWon(m.saving)}</td>
                  </tr>
                ))}
                <tr className="report-total-row">
                  <td><strong>합계</strong></td>
                  <td><strong>{compDemands.length}개</strong></td>
                  <td><strong>{monthData.reduce((s, m) => s + m.actCount, 0)}건</strong></td>
                  <td className="text-right"><strong>{formatWon(company.total_saving)}</strong></td>
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
                {riskBreakdown.map(r => (
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
            <h2>4. 수요기업별 현황</h2>
            {months.map(month => {
              const mDemands = compDemands.filter(d => d.month === month);
              return (
                <div key={month} className="report-subsection">
                  <h3>{month}</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>수요기업명</th>
                        <th>활동건수</th>
                        <th>절감액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mDemands.map(d => {
                        const dActs = compActivities.filter(a => a.demand_company_id === d.id);
                        const dSaving = dActs.reduce((s, a) => s + getActivitySaving(a, referenceData, compPrices), 0);
                        const dCount = dActs.reduce((s, a) => s + a.activity_count, 0);
                        return (
                          <tr key={d.id}>
                            <td>{d.demand_no}</td>
                            <td>{d.demand_name}</td>
                            <td>{dCount}건</td>
                            <td className="text-right">{formatWon(dSaving)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
