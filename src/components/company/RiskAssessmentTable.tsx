import { useCallback } from 'react';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { supabase, TABLES } from '../../utils/supabase';
import type { ReferenceData, RiskAssessment } from '../../types';

interface Props {
  companyId: string;
  month: string;
  referenceData: ReferenceData[];
  assessments: RiskAssessment[];
  onChanged: () => void;
}

export default function RiskAssessmentTable({
  companyId, month, referenceData, assessments, onChanged,
}: Props) {

  const getAssessment = (riskNo: number) =>
    assessments.find(a => a.risk_no === riskNo);

  const upsert = useCallback(async (riskNo: number, field: 'frequency' | 'severity', value: number) => {
    if (!supabase) return;
    const existing = assessments.find(a => a.risk_no === riskNo);
    const row = {
      company_id: companyId,
      month,
      risk_no: riskNo,
      frequency: existing?.frequency ?? 1,
      severity: existing?.severity ?? 1,
      [field]: value,
    };
    await supabase.from(TABLES.risk_assessments).upsert(row, {
      onConflict: 'company_id,month,risk_no',
    });
    onChanged();
  }, [companyId, month, assessments, onChanged]);

  const targetCount = referenceData.filter(ref => {
    const a = getAssessment(ref.no);
    return a && a.frequency * a.severity >= 8;
  }).length;

  return (
    <div className="risk-assessment-wrap">
      <h4>
        <FiAlertTriangle size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />
        위험성평가
        <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem', marginLeft: 8 }}>({month})</span>
      </h4>

      <div className="risk-assessment-guide">
        <div className="risk-guide-formula">
          위험도 = <strong>빈도</strong> &times; <strong>강도</strong>
          <span className="risk-guide-target">8점 이상 &rarr; 활동횟수 입력 대상</span>
        </div>
        <div className="risk-guide-scales">
          <div className="risk-guide-scale">
            <span className="risk-guide-label">빈도</span>
            <span>1 거의 없음</span>
            <span>2 가끔</span>
            <span>3 보통</span>
            <span>4 자주</span>
            <span>5 매우 자주</span>
          </div>
          <div className="risk-guide-scale">
            <span className="risk-guide-label">강도</span>
            <span>1 경미</span>
            <span>2 경상</span>
            <span>3 중등</span>
            <span>4 중상</span>
            <span>5 사망/대형</span>
          </div>
        </div>
      </div>

      <div className="risk-assessment-table-scroll">
        <table className="risk-assessment-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>No</th>
              <th style={{ width: 130 }}>위험요인</th>
              <th style={{ width: 90 }}>빈도</th>
              <th style={{ width: 90 }}>강도</th>
              <th style={{ width: 70 }}>위험도</th>
              <th style={{ width: 60 }}>대상</th>
            </tr>
          </thead>
          <tbody>
            {referenceData.map(ref => {
              const a = getAssessment(ref.no);
              const freq = a?.frequency ?? 1;
              const sev = a?.severity ?? 1;
              const score = freq * sev;
              const isTarget = score >= 8;

              return (
                <tr key={ref.no} className={isTarget ? 'risk-row-target' : ''}>
                  <td className="cell-no">{ref.no}</td>
                  <td className="cell-risk">{ref.risk_name}</td>
                  <td>
                    <select
                      className="risk-select"
                      value={freq}
                      onChange={e => upsert(ref.no, 'frequency', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      className="risk-select"
                      value={sev}
                      onChange={e => upsert(ref.no, 'severity', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                  <td className={`risk-score ${isTarget ? 'risk-score-high' : ''}`}>
                    {score}
                  </td>
                  <td className="risk-target-cell">
                    {isTarget && <FiCheckCircle size={16} className="risk-target-icon" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="risk-assessment-summary">
        대상 항목: <strong>{targetCount}</strong>개 / {referenceData.length}개
      </div>
    </div>
  );
}
