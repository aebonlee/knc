import { useParams, Link, Navigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyDashboard } from '../hooks/useCompanyDashboard';
import { getPadletUrl } from '../hooks/useCompanyData';
import CompanyKpiCards from '../components/dashboard/CompanyKpiCards';
import SavingsChart from '../components/dashboard/SavingsChart';
import RiskBarChart from '../components/dashboard/RiskBarChart';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart';

export default function CompanyDashboard() {
  const { id } = useParams<{ id: string }>();
  const { isCompanyMember, companyId, impersonateCompanyId } = useAuth();

  // company_member가 다른 기업 접근 시 리다이렉트 (impersonate 모드 제외)
  if (!impersonateCompanyId && isCompanyMember && companyId && id !== companyId) {
    return <Navigate to={`/companies/${companyId}/dashboard`} replace />;
  }

  const {
    company, totalSaving, savingsRate, savingsByType, riskSummary,
    monthlyTrend, demandCompanies, loading,
  } = useCompanyDashboard(id);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (!company) {
    return (
      <div className="page">
        <p>기업을 찾을 수 없습니다.</p>
        <Link to="/companies" className="btn-secondary">기업 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="page dashboard-page dashboard-fit">
      <div className="page-top-nav">
        {!isCompanyMember && (
          <Link to="/companies" className="btn-back">
            <FiArrowLeft size={16} /> 기업 목록
          </Link>
        )}
        <div className="page-top-right">
          <Link to={`/companies/${id}`} className="btn-secondary btn-sm">
            <FiEdit2 size={14} /> 데이터 입력/관리
          </Link>
        </div>
      </div>

      <div className="page-header">
        <div className="summary-name-row">
          <h1>{company.company_name} 대시보드</h1>
          <a href={getPadletUrl(company)} target="_blank" rel="noopener noreferrer" className="padlet-link" title="패들릿 자료실">
            <FiExternalLink size={16} /> 패들릿
          </a>
        </div>
        <p>
          No.{company.company_no} · {company.solution_type} ·
          담당자: {company.manager_name || '-'}
        </p>
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
    </div>
  );
}
