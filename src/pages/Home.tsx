import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { useCompanyData } from '../hooks/useCompanyData';
import { useCompanyDashboard } from '../hooks/useCompanyDashboard';
import KpiCards from '../components/dashboard/KpiCards';
import CompanyKpiCards from '../components/dashboard/CompanyKpiCards';
import SavingsChart from '../components/dashboard/SavingsChart';
import RiskBarChart from '../components/dashboard/RiskBarChart';
import CompanyRankTable from '../components/dashboard/CompanyRankTable';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart';

function CompanyView({ companyId }: { companyId: string }) {
  const {
    company, totalSaving, savingsRate, savingsByType, riskSummary,
    monthlyTrend, demandCompanies, loading,
  } = useCompanyDashboard(companyId);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!company) return <div className="chart-empty">기업을 찾을 수 없습니다.</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>{company.company_name} 대시보드</h1>
            <p>No.{company.company_no} · {company.solution_type} · 담당자: {company.manager_name || '-'}</p>
          </div>
          <Link to={`/companies/${companyId}`} className="btn-secondary btn-sm">
            <FiEdit2 size={14} /> 데이터 입력/관리
          </Link>
        </div>
      </div>

      <CompanyKpiCards
        budget={company.budget || 0}
        totalSaving={totalSaving}
        savingsRate={savingsRate}
        demandCount={demandCompanies.length}
      />

      <div className="dashboard-bottom">
        <div className="chart-card">
          <SavingsChart savingsByType={savingsByType} />
        </div>
        <div className="chart-card">
          <RiskBarChart riskSummary={riskSummary} />
        </div>
        <div className="chart-card">
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
      </div>
    </>
  );
}

// Phase별 월 그룹핑 상수
const PHASE_MONTHS: Record<number, number[]> = {
  1: [4, 5, 6, 7],
  2: [8, 9, 10, 11, 12],
  0: [4, 5, 6, 7, 8, 9, 10, 11, 12],
};

export default function Home() {
  const [dashPhase, setDashPhase] = useState<number>(0);
  const [dashMonths, setDashMonths] = useState<string[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const phaseArg = dashPhase === 0 ? undefined : dashPhase;
  const monthArg = dashMonths.length > 0 ? dashMonths : undefined;

  const {
    companies, companiesWithSavings, totalSaving, performance, settings,
    savingsByType, riskSummary, allMonths, loading,
  } = useCompanyData(phaseArg, monthArg);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const isCompanyView = selectedCompanyId !== '';
  const phaseLabel = dashPhase === 0 ? '1+2차 통합' : `${dashPhase}차 사업`;
  const monthLabel = dashMonths.length === 0
    ? ''
    : dashMonths.length === 1
      ? ` (${dashMonths[0]})`
      : ` (${dashMonths[0]}~${dashMonths[dashMonths.length - 1]}, ${dashMonths.length}개월)`;

  const toggleMonth = (m: string) => {
    setDashMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m].sort()
    );
  };

  return (
    <div className="page dashboard-page dashboard-fit">
      {/* 필터 바: 기업 드롭다운 + Phase 버튼 + 월 체크박스 */}
      <div className="dashboard-filter-bar">
        <select
          value={selectedCompanyId}
          onChange={e => setSelectedCompanyId(e.target.value)}
          className="view-select"
        >
          <option value="">전체 통합집계</option>
          <optgroup label="기업별 대시보드">
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.company_no}. {c.company_name}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="dash-phase-group">
          {([
            { value: 1, label: '1차' },
            { value: 2, label: '2차' },
            { value: 0, label: '1+2차' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              className={`dash-phase-btn${dashPhase === opt.value ? ' active' : ''}`}
              onClick={() => {
                setDashPhase(opt.value);
                setDashMonths([]);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="dash-month-row">
          <span className="dash-month-label">1차</span>
          {PHASE_MONTHS[1].map(mon => {
            const year = new Date().getFullYear();
            const key = `${year}-${String(mon).padStart(2, '0')}`;
            const hasData = allMonths.includes(key);
            return (
              <label
                key={key}
                className={`dash-month-check${!hasData ? ' disabled' : ''}`}
                title={!hasData ? '데이터 없음' : ''}
              >
                <input
                  type="checkbox"
                  checked={dashMonths.includes(key)}
                  onChange={() => toggleMonth(key)}
                  disabled={!hasData}
                />
                {mon}월
              </label>
            );
          })}
          <span className="dash-month-divider" />
          <span className="dash-month-label">2차</span>
          {PHASE_MONTHS[2].map(mon => {
            const year = new Date().getFullYear();
            const key = `${year}-${String(mon).padStart(2, '0')}`;
            const hasData = allMonths.includes(key);
            return (
              <label
                key={key}
                className={`dash-month-check${!hasData ? ' disabled' : ''}`}
                title={!hasData ? '데이터 없음' : ''}
              >
                <input
                  type="checkbox"
                  checked={dashMonths.includes(key)}
                  onChange={() => toggleMonth(key)}
                  disabled={!hasData}
                />
                {mon}월
              </label>
            );
          })}
        </div>
      </div>

      {isCompanyView ? (
        <CompanyView companyId={selectedCompanyId} />
      ) : (
        <>
          <div className="page-header">
            <h1>{phaseLabel} 대시보드</h1>
            <p>{settings.project_phase} 사회비용 절감 성과 현황{monthLabel}</p>
          </div>

          <KpiCards
            totalInvestment={settings.total_investment}
            totalSaving={totalSaving}
            performance={performance}
            settings={settings}
            companyCount={companiesWithSavings.length}
          />

          <div className="dashboard-bottom">
            <div className="chart-card">
              <SavingsChart savingsByType={savingsByType} />
            </div>
            <div className="chart-card">
              <CompanyRankTable companies={companiesWithSavings} />
            </div>
            <div className="chart-card">
              <RiskBarChart riskSummary={riskSummary} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
