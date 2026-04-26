import { useState, useCallback, useRef } from 'react';
import { supabase, TABLES } from '../../utils/supabase';
import { getWeight, formatWon } from '../../hooks/useCompanyData';
import { ACTIVITY_TYPE_LABELS } from '../../data/referenceData';
import type { ReferenceData, DemandCompany, Activity, ActivityType, CompanyUnitPrice } from '../../types';

/* 숫자 입력 셀: 클릭→전체선택, 자유 입력, blur/Enter 시 저장 */
function NumericCell({
  value, onSave, className, min = 0,
}: {
  value: number; onSave: (v: number) => void; className?: string; min?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const commit = () => {
    setEditing(false);
    const parsed = Math.max(min, Number(draft) || 0);
    if (parsed !== value) onSave(parsed);
  };

  return (
    <input
      ref={ref}
      type="number"
      min={min}
      className={className}
      value={editing ? draft : value}
      onFocus={e => {
        setEditing(true);
        setDraft(String(value));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); ref.current?.blur(); }
        if (e.key === 'Escape') { setEditing(false); setDraft(String(value)); ref.current?.blur(); }
      }}
    />
  );
}

interface Props {
  companyId: string;
  referenceData: ReferenceData[];
  demandCompanies: DemandCompany[];
  activities: Activity[];
  month: string;
  unitPrices: CompanyUnitPrice[];
  onChanged: () => void;
  onUnitPriceChanged: () => void;
}

export default function ActivityInputTable({
  companyId, referenceData, demandCompanies, activities,
  month, unitPrices, onChanged, onUnitPriceChanged,
}: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const monthDemands = demandCompanies.filter(d => d.month === month);
  const monthActivities = activities.filter(a => a.month === month);

  const getUnitPrice = (riskNo: number, type: ActivityType): number => {
    const custom = unitPrices.find(u => u.risk_no === riskNo && u.activity_type === type);
    if (custom) return custom.unit_price;
    const ref = referenceData.find(r => r.no === riskNo);
    if (!ref) return 0;
    return ref.social_cost * getWeight(ref, type);
  };

  const getActivityCount = (demandId: string, riskNo: number, type: ActivityType): number => {
    const act = monthActivities.find(
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

    const existing = monthActivities.find(
      a => a.demand_company_id === demandId && a.risk_no === riskNo && a.activity_type === type
    );

    if (existing) {
      const { error } = await supabase.from(TABLES.activities)
        .update({ activity_count: count, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) console.error('활동 수정 실패:', error);
    } else {
      const { error } = await supabase.from(TABLES.activities).insert({
        company_id: companyId,
        demand_company_id: demandId,
        risk_no: riskNo,
        activity_type: type,
        activity_count: count,
        month,
      });
      if (error) console.error('활동 추가 실패:', error);
    }
    onChanged();
    setSaving(null);
  }, [companyId, monthActivities, month, onChanged]);

  const updateUnitPrice = useCallback(async (riskNo: number, type: ActivityType, price: number) => {
    if (!supabase) return;
    const existing = unitPrices.find(u => u.risk_no === riskNo && u.activity_type === type);
    try {
      if (existing) {
        await supabase.from(TABLES.company_unit_prices)
          .update({ unit_price: price })
          .eq('id', existing.id);
      } else {
        await supabase.from(TABLES.company_unit_prices).insert({
          company_id: companyId,
          risk_no: riskNo,
          activity_type: type,
          unit_price: price,
        });
      }
      onUnitPriceChanged();
    } catch (err) {
      console.error(err);
    }
  }, [companyId, unitPrices, onUnitPriceChanged]);

  const activityTypes: ActivityType[] = ['engineering', 'ppe', 'education'];
  const hasDemands = monthDemands.length > 0;

  const getRiskSubtotal = (riskNo: number, type: ActivityType) => {
    const price = getUnitPrice(riskNo, type);
    return monthDemands.reduce((sum, dc) => {
      const count = getActivityCount(dc.id, riskNo, type);
      return sum + price * count;
    }, 0);
  };

  let grandTotal = 0;
  referenceData.forEach(ref => {
    activityTypes.forEach(type => {
      grandTotal += getRiskSubtotal(ref.no, type);
    });
  });

  return (
    <div className="activity-table-wrap">
      <h4>활동 횟수 입력 <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>({month})</span></h4>
      <div className="activity-table-scroll">
        <table className="activity-table">
          <thead>
            <tr>
              <th rowSpan={2}>No</th>
              <th rowSpan={2}>위험요인</th>
              <th rowSpan={2}>활동유형</th>
              <th rowSpan={2}>
                1건당 절감단가
                <span className="formula-tooltip-wrap">
                  <span className="formula-icon">?</span>
                  <span className="formula-balloon">= 사회비용 × 가중치{'\n'}(공학 0.70 / 보호구 0.15 / 교육 0.15)</span>
                </span>
              </th>
              {hasDemands ? monthDemands.map(dc => (
                <th key={dc.id}>{dc.demand_name}</th>
              )) : (
                <th style={{ color: 'var(--text-muted)', fontWeight: 400, fontStyle: 'italic' }}>수요기업 추가 필요</th>
              )}
              <th rowSpan={2}>
                소계(원)
                <span className="formula-tooltip-wrap">
                  <span className="formula-icon">?</span>
                  <span className="formula-balloon">= 절감단가 × Σ 수요기업 활동횟수</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {referenceData.map(ref =>
              activityTypes.map((type, typeIdx) => {
                const unitPrice = getUnitPrice(ref.no, type);
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
                    <td className="cell-unit">
                      <NumericCell
                        value={Math.round(unitPrice)}
                        className="unit-price-input"
                        onSave={val => updateUnitPrice(ref.no, type, val)}
                      />
                    </td>
                    {hasDemands ? monthDemands.map(dc => {
                      const count = getActivityCount(dc.id, ref.no, type);
                      const key = `${dc.id}-${ref.no}-${type}`;
                      return (
                        <td key={dc.id} className="cell-input">
                          <NumericCell
                            value={count}
                            className={saving === key ? 'saving' : ''}
                            onSave={val => updateActivity(dc.id, ref.no, type, val)}
                          />
                        </td>
                      );
                    }) : (
                      <td className="cell-input" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>-</td>
                    )}
                    <td className="cell-subtotal">{formatWon(rowSubtotal)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="grand-total-row">
              <td colSpan={3 + (hasDemands ? monthDemands.length : 1) + 1} className="text-right">
                <strong>
                  전체 합계
                  <span className="formula-tooltip-wrap" style={{ marginLeft: 4 }}>
                    <span className="formula-icon">?</span>
                    <span className="formula-balloon">= Σ (13개 위험요인 × 3개 활동유형 소계)</span>
                  </span>
                </strong>
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
