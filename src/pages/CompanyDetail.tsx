import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { supabase, TABLES } from '../utils/supabase';
import { DEFAULT_REFERENCE_DATA } from '../data/referenceData';
import { getCompanyTotal } from '../hooks/useCompanyData';
import CompanySummary from '../components/company/CompanySummary';
import CompanyForm from '../components/company/CompanyForm';
import DemandCompanyManager from '../components/company/DemandCompanyManager';
import ActivityInputTable from '../components/company/ActivityInputTable';
import type { Company, DemandCompany, Activity, ReferenceData } from '../types';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [demandCompanies, setDemandCompanies] = useState<DemandCompany[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>(DEFAULT_REFERENCE_DATA);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase || !id) return;
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').eq('id', id).single(),
        supabase.from(TABLES.demand_companies).select('*').eq('company_id', id).order('demand_no'),
        supabase.from(TABLES.activities).select('*').eq('company_id', id),
        supabase.from(TABLES.reference_data).select('*').order('no'),
      ]);
      if (compRes.data) setCompany(compRes.data);
      if (demandRes.data) setDemandCompanies(demandRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        <CompanySummary company={company} totalSaving={totalSaving} />
      )}

      <DemandCompanyManager
        companyId={company.id}
        demandCompanies={demandCompanies}
        onChanged={fetchData}
      />

      <ActivityInputTable
        companyId={company.id}
        referenceData={referenceData}
        demandCompanies={demandCompanies}
        activities={activities}
        onChanged={fetchData}
      />
    </div>
  );
}
