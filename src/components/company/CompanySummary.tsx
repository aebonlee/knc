import { formatBillion, formatWon } from '../../hooks/useCompanyData';
import type { Company } from '../../types';

interface Props {
  company: Company;
  totalSaving: number;
  monthSaving?: number;
}

export default function CompanySummary({ company, totalSaving, monthSaving }: Props) {
  return (
    <div className="company-summary">
      <div className="summary-header">
        <div>
          <h2>{company.company_name}</h2>
          <span className={`badge badge-${company.solution_type === '공학' ? 'blue' : company.solution_type === '보호구' ? 'green' : 'amber'}`}>
            {company.solution_type}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {monthSaving !== undefined && (
            <div className="summary-total">
              <span className="summary-label">당월 절감액</span>
              <span className="summary-value" style={{ fontSize: '1.3rem' }}>{formatBillion(monthSaving)}</span>
              <span className="summary-sub">{formatWon(monthSaving)}</span>
            </div>
          )}
          <div className="summary-total">
            <span className="summary-label">총 절감액 (전체 월)</span>
            <span className="summary-value">{formatBillion(totalSaving)}</span>
            <span className="summary-sub">{formatWon(totalSaving)}</span>
          </div>
        </div>
      </div>
      <div className="summary-info">
        {company.biz_number && <span>사업자번호: {company.biz_number}</span>}
        {company.budget && <span>사업비: {company.budget}백만원</span>}
        {company.manager_name && <span>담당자: {company.manager_name} {company.manager_title || ''}</span>}
        {company.manager_phone && <span>연락처: {company.manager_phone}</span>}
      </div>
    </div>
  );
}
