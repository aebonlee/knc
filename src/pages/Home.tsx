import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { useCompanyData } from '../hooks/useCompanyData';
import { usePhase } from '../contexts/PhaseContext';
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

export default function Home() {
  const { phase } = usePhase();
  const [dashPhase, setDashPhase] = useState<number>(phase);
  const [dashMonth, setDashMonth] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const phaseArg = dashPhase === 0 ? undefined : dashPhase;
  const monthArg = dashMonth || undefined;

  const {
    companies, companiesWithSavings, totalSaving, performance, settings,
    savingsByType, riskSummary, allMonths, loading,
  } = useCompanyData(phaseArg, monthArg);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const isCompanyView = selectedCompanyId !== '';
  const phaseLabel = dashPhase === 0 ? '1+2차 통합' : `${dashPhase}차 사업`;

  return (
    <div className="page dashboard-page dashboard-fit">
      {/* 필터 바: 기업 드롭다운 + Phase 버튼 + 월 드롭다운 */}
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
                setDashMonth('');
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          className="view-select dash-month-select"
          value={dashMonth}
          onChange={e => setDashMonth(e.target.value)}
        >
          <option value="">전체 월</option>
          {allMonths.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {isCompanyView ? (
        <CompanyView companyId={selectedCompanyId} />
      ) : (
        <>
          <div className="page-header">
            <h1>{phaseLabel} 대시보드</h1>
            <p>{settings.project_phase} 사회비용 절감 성과 현황{dashMonth ? ` (${dashMonth})` : ''}</p>
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
