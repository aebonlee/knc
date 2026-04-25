import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatBillion } from '../../hooks/useCompanyData';
import { ACTIVITY_TYPE_LABELS } from '../../data/referenceData';

interface Props {
  savingsByType: {
    engineering: number;
    ppe: number;
    education: number;
  };
}

const COLORS = ['#2563EB', '#059669', '#F59E0B'];

export default function SavingsChart({ savingsByType }: Props) {
  const total = savingsByType.engineering + savingsByType.ppe + savingsByType.education;
  const data = [
    { name: ACTIVITY_TYPE_LABELS.engineering, value: savingsByType.engineering },
    { name: ACTIVITY_TYPE_LABELS.ppe, value: savingsByType.ppe },
    { name: ACTIVITY_TYPE_LABELS.education, value: savingsByType.education },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <>
        <h3 className="chart-title">활동유형별 절감액</h3>
        <div className="chart-empty">데이터가 없습니다</div>
      </>
    );
  }

  return (
    <>
      <h3 className="chart-title">
        활동유형별 절감액
        <span className="formula-tooltip-wrap">
          <span className="formula-icon">?</span>
          <span className="formula-balloon">= 사회비용 × 유형별 가중치 × 활동횟수{'\n'}(공학 0.70 / 보호구 0.15 / 교육 0.15)</span>
        </span>
      </h3>
      <div className="chart-fill">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatBillion(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
