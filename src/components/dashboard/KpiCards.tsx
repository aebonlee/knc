import { FiDollarSign, FiTrendingDown, FiPercent, FiAward } from 'react-icons/fi';
import { formatBillion } from '../../hooks/useCompanyData';
import type { ProjectSettings } from '../../types';

interface Props {
  totalInvestment: number;
  totalSaving: number;
  performance: { label: string; color: string; rate: number };
  settings: ProjectSettings;
  companyCount: number;
}

export default function KpiCards({ totalInvestment, totalSaving, performance, companyCount }: Props) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
          <FiDollarSign size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">투입금액</span>
          <span className="kpi-value">{formatBillion(totalInvestment)}</span>
          <span className="kpi-sub">{companyCount}개 기업</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
          <FiTrendingDown size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">총 절감액</span>
          <span className="kpi-value">{formatBillion(totalSaving)}</span>
          <span className="kpi-sub">사회비용 절감</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#FFF7ED', color: '#C2410C' }}>
          <FiPercent size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">달성률</span>
          <span className="kpi-value">{performance.rate.toFixed(1)}%</span>
          <span className="kpi-sub">투입금액 대비</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#F5F3FF', color: performance.color }}>
          <FiAward size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">성과 판정</span>
          <span className="kpi-value" style={{ color: performance.color, fontSize: '1.1rem' }}>
            {performance.label}
          </span>
          <span className="kpi-sub">
            목표: {formatBillion(3_500_000_000)} ~ {formatBillion(6_600_000_000)}
          </span>
        </div>
      </div>
    </div>
  );
}
