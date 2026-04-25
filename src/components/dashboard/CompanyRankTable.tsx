import { Link } from 'react-router-dom';
import { formatBillion } from '../../hooks/useCompanyData';
import type { CompanyWithSavings } from '../../types';

interface Props {
  companies: CompanyWithSavings[];
}

export default function CompanyRankTable({ companies }: Props) {
  const sorted = [...companies].sort((a, b) => b.total_saving - a.total_saving).slice(0, 10);

  return (
    <>
      <h3 className="chart-title">
        절감액 Top 10 기업
        <span className="formula-tooltip-wrap">
          <span className="formula-icon">?</span>
          <span className="formula-balloon">기업별 절감액 = Σ (사회비용 × 가중치 × 활동횟수){'\n'}전체 활동의 절감액 합계 기준 상위 10개</span>
        </span>
      </h3>
      {sorted.length === 0 ? (
        <div className="chart-empty">등록된 기업이 없습니다</div>
      ) : (
        <div className="table-scroll-area">
          <table className="rank-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>기업명</th>
                <th>유형</th>
                <th>절감액</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((comp, idx) => (
                <tr key={comp.id}>
                  <td className="rank-num">{idx + 1}</td>
                  <td>
                    <Link to={`/companies/${comp.id}`} className="link-text">
                      {comp.company_name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${comp.solution_type === '공학' ? 'blue' : comp.solution_type === '보호구' ? 'green' : 'amber'}`}>
                      {comp.solution_type}
                    </span>
                  </td>
                  <td className="text-right">{formatBillion(comp.total_saving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
