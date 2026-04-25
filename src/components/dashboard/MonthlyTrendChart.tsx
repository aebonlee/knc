import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrendData {
  month: string;
  saving: number;
  demandCount: number;
}

interface Props {
  data: TrendData[];
}

const formatAxis = (value: number) => {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  return String(value);
};

const formatTooltip = (value: number) => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
};

export default function MonthlyTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <>
        <h3 className="chart-title">월별 절감액 추이</h3>
        <div className="chart-empty">월별 데이터가 없습니다</div>
      </>
    );
  }

  return (
    <>
      <h3 className="chart-title">월별 절감액 추이</h3>
      <div className="chart-fill">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'saving') return [formatTooltip(value), '절감액'];
                return [value, '수요기업'];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="saving"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="saving"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
