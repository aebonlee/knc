import { FiDollarSign, FiTrendingDown, FiPercent, FiUsers } from 'react-icons/fi';
import { formatBillion } from '../../hooks/useCompanyData';

interface Props {
  budget: number;
  totalSaving: number;
  savingsRate: number;
  demandCount: number;
}

export default function CompanyKpiCards({ budget, totalSaving, savingsRate, demandCount }: Props) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
          <FiDollarSign size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">사업비</span>
          <span className="kpi-value">{formatBillion(budget)}</span>
          <span className="kpi-sub">배정 예산</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
          <FiTrendingDown size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">기업 절감액</span>
          <span className="kpi-value">{formatBillion(totalSaving)}</span>
          <span className="kpi-sub">사회비용 절감</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#FFF7ED', color: '#C2410C' }}>
          <FiPercent size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">절감률</span>
          <span className="kpi-value">{savingsRate.toFixed(1)}%</span>
          <span className="kpi-sub">사업비 대비</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
          <FiUsers size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">수요기업 수</span>
          <span className="kpi-value">{demandCount}개</span>
          <span className="kpi-sub">등록 수요기업</span>
        </div>
      </div>
    </div>
  );
}
