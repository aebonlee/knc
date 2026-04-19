import { useState, useCallback } from 'react';
import { supabase, TABLES } from '../../utils/supabase';
import { getWeight, getDemandSaving, formatWon } from '../../hooks/useCompanyData';
import { ACTIVITY_TYPE_LABELS } from '../../data/referenceData';
import type { ReferenceData, DemandCompany, Activity, ActivityType } from '../../types';

interface Props {
  companyId: string;
  referenceData: ReferenceData[];
  demandCompanies: DemandCompany[];
  activities: Activity[];
  onChanged: () => void;
}

export default function ActivityInputTable({
  companyId, referenceData, demandCompanies, activities, onChanged,
}: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const getActivityCount = (demandId: string, riskNo: number, type: ActivityType): number => {
    const act = activities.find(
      a => a.demand_company_id === demandId && a.risk_no === riskNo && a.activity_type === type
    );
    return act?.activity_count ?? 0;
  };

  const updateActivity = useCallback(async (
    demandId: string, riskNo: number, type: ActivityType, count: number
  ) => {
    if (!supabase) return;
    const key = `${demandId}-${riskNo}-${type}`;
    setSaving(key);

    const existing = activities.find(
      a => a.demand_company_id === demandId && a.risk_no === riskNo && a.activity_type === type
    );

    try {
      if (existing) {
        await supabase.from(TABLES.activities)
          .update({ activity_count: count, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from(TABLES.activities).insert({
          company_id: companyId,
          demand_company_id: demandId,
          risk_no: riskNo,
          activity_type: type,
          activity_count: count,
        });
      }
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  }, [companyId, activities, onChanged]);

  const activityTypes: ActivityType[] = ['engineering', 'ppe', 'education'];

  if (demandCompanies.length === 0) {
    return (
      <div className="activity-table-wrap">
        <h4>활동 횟수 입력</h4>
        <p className="text-muted">먼저 수요기업을 추가해주세요.</p>
      </div>
    );
  }

  // 각 위험요인별 소계 계산
  const getRiskSubtotal = (riskNo: number, type: ActivityType) => {
    const ref = referenceData.find(r => r.no === riskNo);
    if (!ref) return 0;
    const weight = getWeight(ref, type);
    return demandCompanies.reduce((sum, dc) => {
      const count = getActivityCount(dc.id, riskNo, type);
      return sum + getDemandSaving(ref.social_cost, weight, count);
    }, 0);
  };

  // 전체 합계
  let grandTotal = 0;
  referenceData.forEach(ref => {
    activityTypes.forEach(type => {
      grandTotal += getRiskSubtotal(ref.no, type);
    });
  });

  return (
    <div className="activity-table-wrap">
      <h4>활동 횟수 입력</h4>
      <div className="activity-table-scroll">
        <table className="activity-table">
          <thead>
            <tr>
              <th rowSpan={2}>No</th>
              <th rowSpan={2}>위험요인</th>
              <th rowSpan={2}>활동유형</th>
              <th rowSpan={2}>1건당 절감단가</th>
              {demandCompanies.map(dc => (
                <th key={dc.id}>{dc.demand_name}</th>
              ))}
              <th rowSpan={2}>소계(원)</th>
            </tr>
          </thead>
          <tbody>
            {referenceData.map(ref =>
              activityTypes.map((type, typeIdx) => {
                const weight = getWeight(ref, type);
                const unitSaving = ref.social_cost * weight;
                const rowSubtotal = getRiskSubtotal(ref.no, type);

                return (
                  <tr key={`${ref.no}-${type}`} className={typeIdx === 0 ? 'risk-group-start' : ''}>
                    {typeIdx === 0 && (
                      <>
                        <td rowSpan={3} className="cell-no">{ref.no}</td>
                        <td rowSpan={3} className="cell-risk">{ref.risk_name}</td>
                      </>
                    )}
                    <td className="cell-type">
                      <span className={`type-badge type-${type}`}>
                        {ACTIVITY_TYPE_LABELS[type]}
                      </span>
                    </td>
                    <td className="cell-unit">{formatWon(unitSaving)}</td>
                    {demandCompanies.map(dc => {
                      const count = getActivityCount(dc.id, ref.no, type);
                      const key = `${dc.id}-${ref.no}-${type}`;
                      return (
                        <td key={dc.id} className="cell-input">
                          <input
                            type="number"
                            min={0}
                            value={count}
                            onChange={e => updateActivity(dc.id, ref.no, type, Math.max(0, Number(e.target.value)))}
                            className={saving === key ? 'saving' : ''}
                          />
                        </td>
                      );
                    })}
                    <td className="cell-subtotal">{formatWon(rowSubtotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="grand-total-row">
              <td colSpan={3 + demandCompanies.length + 1} className="text-right">
                <strong>전체 합계</strong>
              </td>
              <td className="cell-subtotal grand-total">
                <strong>{formatWon(grandTotal)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
