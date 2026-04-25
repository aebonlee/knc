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

function FormulaTooltip({ formula }: { formula: string }) {
  return (
    <span className="formula-tooltip-wrap">
      <span className="formula-icon">?</span>
      <span className="formula-balloon">{formula}</span>
    </span>
  );
}

export default function KpiCards({ totalInvestment, totalSaving, performance, settings, companyCount }: Props) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
          <FiDollarSign size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">
            투입금액
            <FormulaTooltip formula="= Σ (기업별 사업비 합계)" />
          </span>
          <span className="kpi-value">{formatBillion(totalInvestment)}</span>
          <span className="kpi-sub">{companyCount}개 기업</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
          <FiTrendingDown size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">
            총 절감액
            <FormulaTooltip formula="= Σ (사회비용 × 가중치 × 활동횟수)" />
          </span>
          <span className="kpi-value">{formatBillion(totalSaving)}</span>
          <span className="kpi-sub">사회비용 절감</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#FFF7ED', color: '#C2410C' }}>
          <FiPercent size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">
            달성률
            <FormulaTooltip formula={`= 총 절감액 ÷ 최대 성과목표(${formatBillion(settings.max_target)}) × 100`} />
          </span>
          <span className="kpi-value">{performance.rate.toFixed(1)}%</span>
          <span className="kpi-sub">최대 성과목표 대비</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon" style={{ background: '#F5F3FF', color: performance.color }}>
          <FiAward size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">
            성과 판정
            <FormulaTooltip formula={`≥ ${formatBillion(settings.max_target)}: 최대 달성\n> ${formatBillion(settings.underperformance_threshold)}: 성과 달성\n≤ ${formatBillion(settings.underperformance_threshold)}: 성과 미달`} />
          </span>
          <span className="kpi-value" style={{ color: performance.color, fontSize: '1.1rem' }}>
            {performance.label}
          </span>
          <span className="kpi-sub">
            목표: {formatBillion(settings.underperformance_threshold)} ~ {formatBillion(settings.max_target)}
          </span>
        </div>
      </div>
    </div>
  );
}
