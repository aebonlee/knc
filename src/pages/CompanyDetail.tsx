import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { supabase, TABLES } from '../utils/supabase';
import { DEFAULT_REFERENCE_DATA } from '../data/referenceData';
import { getCompanyTotal } from '../hooks/useCompanyData';
import { useAuth } from '../contexts/AuthContext';
import CompanySummary from '../components/company/CompanySummary';
import CompanyForm from '../components/company/CompanyForm';
import DemandCompanyManager from '../components/company/DemandCompanyManager';
import ActivityInputTable from '../components/company/ActivityInputTable';
import SnapshotPanel from '../components/company/SnapshotPanel';
import type {
  Company, DemandCompany, Activity, ReferenceData,
  CompanyMonth, CompanyUnitPrice, ActivitySnapshot,
} from '../types';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { isCompanyMember, companyId } = useAuth();

  // company_member가 다른 기업 접근 시 리다이렉트
  if (isCompanyMember && companyId && id !== companyId) {
    return <Navigate to={`/companies/${companyId}/dashboard`} replace />;
  }
  const [company, setCompany] = useState<Company | null>(null);
  const [demandCompanies, setDemandCompanies] = useState<DemandCompany[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>(DEFAULT_REFERENCE_DATA);
  const [companyMonths, setCompanyMonths] = useState<CompanyMonth[]>([]);
  const [unitPrices, setUnitPrices] = useState<CompanyUnitPrice[]>([]);
  const [snapshots, setSnapshots] = useState<ActivitySnapshot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingMonth, setAddingMonth] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase || !id) return;
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes, monthRes, priceRes, snapRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').eq('id', id).single(),
        supabase.from(TABLES.demand_companies).select('*').eq('company_id', id).order('demand_no'),
        supabase.from(TABLES.activities).select('*').eq('company_id', id),
        supabase.from(TABLES.reference_data).select('*').order('no'),
        supabase.from(TABLES.company_months).select('*').eq('company_id', id).order('month'),
        supabase.from(TABLES.company_unit_prices).select('*').eq('company_id', id),
        supabase.from(TABLES.activity_snapshots).select('*').eq('company_id', id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (compRes.data) setCompany(compRes.data);
      if (demandRes.data) setDemandCompanies(demandRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
      if (monthRes.data) {
        setCompanyMonths(monthRes.data);
        if (monthRes.data.length > 0 && !selectedMonth) {
          setSelectedMonth(monthRes.data[0].month);
        }
      }
      if (priceRes.data) setUnitPrices(priceRes.data);
      if (snapRes.data) setSnapshots(snapRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addMonth = async () => {
    if (!supabase || !id || !newMonth) return;
    setAddingMonth(true);
    const { error } = await supabase.from(TABLES.company_months).insert({
      company_id: id,
      month: newMonth,
    });
    if (error) {
      console.error('월 추가 실패:', error);
      alert(error.message?.includes('duplicate') ? '이미 존재하는 월입니다.' : `월 추가 실패: ${error.message}`);
    } else {
      setSelectedMonth(newMonth);
      setNewMonth('');
      await fetchData();
    }
    setAddingMonth(false);
  };

  const deleteMonth = async (month: string) => {
    if (!supabase || !id) return;
    if (!confirm(`${month} 데이터를 모두 삭제하시겠습니까? 해당 월의 수요기업과 활동 데이터가 모두 삭제됩니다.`)) return;

    // 해당 월의 수요기업 ID 목록 조회
    const monthDemands = demandCompanies.filter(d => d.month === month);
    const demandIds = monthDemands.map(d => d.id);

    // 활동 삭제 → 수요기업 삭제 → 월 삭제
    if (demandIds.length > 0) {
      await supabase.from(TABLES.activities).delete().in('demand_company_id', demandIds);
    }
    await supabase.from(TABLES.demand_companies).delete().eq('company_id', id).eq('month', month);
    await supabase.from(TABLES.company_months).delete().eq('company_id', id).eq('month', month);

    if (selectedMonth === month) {
      const remaining = companyMonths.filter(m => m.month !== month);
      setSelectedMonth(remaining.length > 0 ? remaining[0].month : '');
    }
    fetchData();
  };

  const getMonthSaving = (month: string): number => {
    const monthDemands = demandCompanies.filter(d => d.month === month);
    const monthDemandIds = new Set(monthDemands.map(d => d.id));
    const monthActs = activities.filter(a => a.month === month && monthDemandIds.has(a.demand_company_id));

    return monthActs.reduce((sum, act) => {
      const custom = unitPrices.find(u => u.risk_no === act.risk_no && u.activity_type === act.activity_type);
      if (custom) return sum + custom.unit_price * act.activity_count;
      const ref = referenceData.find(r => r.no === act.risk_no);
      if (!ref) return sum;
      const weight = act.activity_type === 'engineering' ? ref.weight_engineering
        : act.activity_type === 'ppe' ? ref.weight_ppe : ref.weight_education;
      return sum + ref.social_cost * weight * act.activity_count;
    }, 0);
  };

  const saveSnapshot = async (description: string = '수동 저장') => {
    if (!supabase || !id || !selectedMonth) return;
    setSavingSnapshot(true);
    try {
      const monthDemands = demandCompanies.filter(d => d.month === selectedMonth);
      const monthDemandIds = new Set(monthDemands.map(d => d.id));
      const monthActs = activities.filter(a => a.month === selectedMonth && monthDemandIds.has(a.demand_company_id));

      await supabase.from(TABLES.activity_snapshots).insert({
        company_id: id,
        month: selectedMonth,
        snapshot: {
          demand_companies: monthDemands,
          activities: monthActs,
          unit_prices: unitPrices,
        },
        description,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSnapshot(false);
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    if (!supabase) return;
    try {
      await supabase.from(TABLES.activity_snapshots).delete().eq('id', snapshotId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const restoreSnapshot = async (snapshot: ActivitySnapshot) => {
    if (!supabase || !id) return;

    // 현재 상태를 자동 저장 (안전장치)
    await saveSnapshot('복원 전 자동 저장');

    const { demand_companies: snapDemands, activities: snapActs, unit_prices: snapPrices } = snapshot.snapshot;
    const month = snapshot.month;

    try {
      // 기존 데이터 삭제
      const currentMonthDemands = demandCompanies.filter(d => d.month === month);
      const demandIds = currentMonthDemands.map(d => d.id);
      if (demandIds.length > 0) {
        await supabase.from(TABLES.activities).delete().in('demand_company_id', demandIds);
      }
      await supabase.from(TABLES.demand_companies).delete().eq('company_id', id).eq('month', month);

      // 스냅샷 수요기업 복원
      if (snapDemands.length > 0) {
        const demandsToInsert = snapDemands.map(d => ({
          company_id: id,
          demand_no: d.demand_no,
          demand_name: d.demand_name,
          month: d.month,
        }));
        const { data: insertedDemands } = await supabase.from(TABLES.demand_companies).insert(demandsToInsert).select();

        // 스냅샷 활동 복원 (새로 생성된 demand_company_id로 매핑)
        if (insertedDemands && snapActs.length > 0) {
          const demandIdMap = new Map<number, string>();
          insertedDemands.forEach((d: DemandCompany) => {
            demandIdMap.set(d.demand_no, d.id);
          });

          const actsToInsert = snapActs.map(a => {
            const oldDemand = snapDemands.find(d => d.id === a.demand_company_id);
            const newDemandId = oldDemand ? demandIdMap.get(oldDemand.demand_no) : undefined;
            return {
              company_id: id,
              demand_company_id: newDemandId || a.demand_company_id,
              risk_no: a.risk_no,
              activity_type: a.activity_type,
              activity_count: a.activity_count,
              month: a.month,
            };
          }).filter(a => a.demand_company_id);

          if (actsToInsert.length > 0) {
            await supabase.from(TABLES.activities).insert(actsToInsert);
          }
        }
      }

      // 단가 복원
      if (snapPrices && snapPrices.length > 0) {
        await supabase.from(TABLES.company_unit_prices).delete().eq('company_id', id);
        const pricesToInsert = snapPrices.map(p => ({
          company_id: id,
          risk_no: p.risk_no,
          activity_type: p.activity_type,
          unit_price: p.unit_price,
        }));
        await supabase.from(TABLES.company_unit_prices).insert(pricesToInsert);
      }

      fetchData();
    } catch (err) {
      console.error('Restore failed:', err);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (!company) {
    return (
      <div className="page">
        <p>기업을 찾을 수 없습니다.</p>
        <Link to="/companies" className="btn-secondary">기업 목록으로</Link>
      </div>
    );
  }

  const totalSaving = getCompanyTotal(activities, referenceData);
  const currentMonthSaving = selectedMonth ? getMonthSaving(selectedMonth) : 0;
  const monthSnapshots = snapshots.filter(s => s.month === selectedMonth);

  return (
    <div className="page">
      <div className="page-top-nav">
        <Link to="/companies" className="btn-back">
          <FiArrowLeft size={16} /> 기업 목록
        </Link>
        <button className="btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
          <FiEdit2 size={14} /> {editing ? '닫기' : '정보 수정'}
        </button>
      </div>

      {editing ? (
        <CompanyForm
          company={company}
          nextNo={company.company_no}
          onSaved={() => { setEditing(false); fetchData(); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <CompanySummary
          company={company}
          totalSaving={totalSaving}
          monthSaving={selectedMonth ? currentMonthSaving : undefined}
        />
      )}

      {/* 월 탭 바 */}
      <div className="month-tab-bar">
        {companyMonths.map(cm => (
          <div key={cm.month} className={`month-tab ${cm.month === selectedMonth ? 'active' : ''}`}>
            <button
              className="month-tab-btn"
              onClick={() => setSelectedMonth(cm.month)}
            >
              {cm.month}
            </button>
            <button
              className="month-tab-delete"
              onClick={() => deleteMonth(cm.month)}
              title="월 삭제"
            >
              <FiTrash2 size={11} />
            </button>
          </div>
        ))}
        <div className="month-add-area">
          {addingMonth ? (
            <div className="month-add-form">
              <input
                type="month"
                value={newMonth}
                onChange={e => setNewMonth(e.target.value)}
                className="month-add-input"
              />
              <button className="btn-primary btn-sm" onClick={addMonth} disabled={!newMonth}>
                추가
              </button>
              <button className="btn-secondary btn-sm" onClick={() => setAddingMonth(false)}>
                취소
              </button>
            </div>
          ) : (
            <button className="month-add-btn" onClick={() => setAddingMonth(true)}>
              <FiPlus size={14} /> 월 추가
            </button>
          )}
        </div>
      </div>

      {/* 선택된 월의 컨텐츠 */}
      {selectedMonth ? (
        <div className="month-content">
          <DemandCompanyManager
            companyId={company.id}
            demandCompanies={demandCompanies}
            month={selectedMonth}
            onChanged={fetchData}
          />

          <ActivityInputTable
            companyId={company.id}
            referenceData={referenceData}
            demandCompanies={demandCompanies}
            activities={activities}
            month={selectedMonth}
            unitPrices={unitPrices}
            onChanged={fetchData}
            onUnitPriceChanged={fetchData}
          />

          {/* 저장 바 */}
          <div className="save-bar">
            <button
              className="btn-primary"
              onClick={() => saveSnapshot()}
              disabled={savingSnapshot}
            >
              <FiSave size={16} /> {savingSnapshot ? '저장 중...' : `${selectedMonth} 스냅샷 저장`}
            </button>
          </div>

          <SnapshotPanel
            snapshots={monthSnapshots}
            onRestore={restoreSnapshot}
            onDelete={deleteSnapshot}
          />
        </div>
      ) : (
        <div className="empty-state">
          <p>월을 추가하여 시작하세요.</p>
        </div>
      )}
    </div>
  );
}
