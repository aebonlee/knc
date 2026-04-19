import { useCompanyData, formatWon, formatBillion } from '../hooks/useCompanyData';
import RiskBarChart from '../components/dashboard/RiskBarChart';
import { ACTIVITY_TYPE_LABELS } from '../data/referenceData';

export default function RiskAnalysis() {
  const { riskSummary, referenceData, companiesWithSavings, activities, loading } = useCompanyData();

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  // 기업×위험요인 히트맵 데이터
  const heatmapData = companiesWithSavings.slice(0, 20).map(comp => {
    const compActivities = activities.filter(a => a.company_id === comp.id);
    const riskValues = referenceData.map(ref => {
      const refActs = compActivities.filter(a => a.risk_no === ref.no);
      return refActs.reduce((sum, a) => {
        const w = a.activity_type === 'engineering' ? ref.weight_engineering
                : a.activity_type === 'ppe' ? ref.weight_ppe : ref.weight_education;
        return sum + ref.social_cost * w * a.activity_count;
      }, 0);
    });
    return { name: comp.company_name, values: riskValues };
  });

  const maxHeatValue = Math.max(...heatmapData.flatMap(d => d.values), 1);

  return (
    <div className="page">
      <div className="page-header">
        <h1>위험요인별 분석</h1>
        <p>13개 위험요인에 대한 전체 기업 현황</p>
      </div>

      <RiskBarChart riskSummary={riskSummary} />

      <div className="chart-card chart-wide" style={{ marginTop: 24 }}>
        <h3 className="chart-title">위험요인별 상세 분석</h3>
        <div className="risk-detail-table-scroll">
          <table className="risk-detail-table">
            <thead>
              <tr>
                <th>No</th>
                <th>위험요인</th>
                <th>사회비용(원)</th>
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              {riskSummary.map(r => (
                <tr key={r.risk_no}>
                  <td>{r.risk_no}</td>
                  <td>{r.risk_name}</td>
                  <td className="text-right">{formatWon(referenceData[r.risk_no - 1]?.social_cost ?? 0)}</td>
                  <td className="text-right">{formatWon(r.engineering_total)}</td>
                  <td className="text-right">{formatWon(r.ppe_total)}</td>
                  <td className="text-right">{formatWon(r.education_total)}</td>
                  <td className="text-right"><strong>{formatBillion(r.total_saving)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>합계</strong></td>
                <td className="text-right"><strong>{formatBillion(riskSummary.reduce((s, r) => s + r.engineering_total, 0))}</strong></td>
                <td className="text-right"><strong>{formatBillion(riskSummary.reduce((s, r) => s + r.ppe_total, 0))}</strong></td>
                <td className="text-right"><strong>{formatBillion(riskSummary.reduce((s, r) => s + r.education_total, 0))}</strong></td>
                <td className="text-right"><strong>{formatBillion(riskSummary.reduce((s, r) => s + r.total_saving, 0))}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {heatmapData.length > 0 && (
        <div className="chart-card chart-wide" style={{ marginTop: 24 }}>
          <h3 className="chart-title">기업 x 위험요인 히트맵 (상위 20개 기업)</h3>
          <div className="heatmap-scroll">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>기업</th>
                  {referenceData.map(r => (
                    <th key={r.no} title={r.risk_name}>{r.risk_name.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, i) => (
                  <tr key={i}>
                    <td className="heatmap-name">{row.name}</td>
                    {row.values.map((val, j) => {
                      const intensity = val / maxHeatValue;
                      const bg = val === 0
                        ? 'transparent'
                        : `rgba(37, 99, 235, ${0.1 + intensity * 0.8})`;
                      const color = intensity > 0.5 ? '#fff' : '#1E293B';
                      return (
                        <td
                          key={j}
                          className="heatmap-cell"
                          style={{ background: bg, color }}
                          title={`${row.name} - ${referenceData[j].risk_name}: ${formatWon(val)}`}
                        >
                          {val > 0 ? formatBillion(val) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
