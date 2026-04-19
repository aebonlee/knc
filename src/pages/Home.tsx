import { useCompanyData } from '../hooks/useCompanyData';
import KpiCards from '../components/dashboard/KpiCards';
import SavingsChart from '../components/dashboard/SavingsChart';
import RiskBarChart from '../components/dashboard/RiskBarChart';
import CompanyRankTable from '../components/dashboard/CompanyRankTable';

export default function Home() {
  const {
    companiesWithSavings, totalSaving, performance, settings,
    savingsByType, riskSummary, loading,
  } = useCompanyData();

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page dashboard-page dashboard-fit">
      <div className="page-header">
        <h1>전체 통합집계 대시보드</h1>
        <p>{settings.project_phase} 사회비용 절감 성과 현황</p>
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
    </div>
  );
}
