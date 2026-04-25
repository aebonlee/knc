import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { RiskSummary } from '../../types';

interface Props {
  riskSummary: RiskSummary[];
}

const formatAxis = (value: number) => {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(0)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  return String(value);
};

const formatTooltip = (value: number) => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
};

export default function RiskBarChart({ riskSummary }: Props) {
  const data = riskSummary.map(r => ({
    name: r.risk_name,
    공학: r.engineering_total,
    보호구: r.ppe_total,
    교육: r.education_total,
  }));

  return (
    <>
      <h3 className="chart-title">
        위험요인별 절감액
        <span className="formula-tooltip-wrap">
          <span className="formula-icon">?</span>
          <span className="formula-balloon">= 위험요인 사회비용 × 가중치 × Σ 활동횟수{'\n'}(13개 위험요인별 공학/보호구/교육 합산)</span>
        </span>
      </h3>
      <div className="chart-fill">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatAxis} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Bar dataKey="공학" stackId="a" fill="#2563EB" />
            <Bar dataKey="보호구" stackId="a" fill="#059669" />
            <Bar dataKey="교육" stackId="a" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
