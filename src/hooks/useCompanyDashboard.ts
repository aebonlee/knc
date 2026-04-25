import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase';
import { DEFAULT_REFERENCE_DATA } from '../data/referenceData';
import { getCompanyTotal, getWeight } from './useCompanyData';
import type {
  Company, DemandCompany, Activity, ReferenceData,
  ProjectSettings, RiskSummary, CompanyMonth,
} from '../types';

const DEFAULT_SETTINGS: ProjectSettings = {
  id: 1,
  project_phase: '1차 사업',
  total_investment: 3_300_000_000,
  underperformance_threshold: 3_500_000_000,
  max_target: 6_600_000_000,
  updated_at: new Date().toISOString(),
};

export function useCompanyDashboard(companyId: string | undefined) {
  const [company, setCompany] = useState<Company | null>(null);
  const [demandCompanies, setDemandCompanies] = useState<DemandCompany[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>(DEFAULT_REFERENCE_DATA);
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_SETTINGS);
  const [companyMonths, setCompanyMonths] = useState<CompanyMonth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!supabase || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes, setRes, monthRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').eq('id', companyId).single(),
        supabase.from(TABLES.demand_companies).select('*').eq('company_id', companyId).order('demand_no'),
        supabase.from(TABLES.activities).select('*').eq('company_id', companyId),
        supabase.from(TABLES.reference_data).select('*').order('no'),
        supabase.from(TABLES.project_settings).select('*').limit(1).single(),
        supabase.from(TABLES.company_months).select('*').eq('company_id', companyId).order('month'),
      ]);
      if (compRes.data) setCompany(compRes.data);
      if (demandRes.data) setDemandCompanies(demandRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
      if (setRes.data) setSettings(setRes.data);
      if (monthRes.data) setCompanyMonths(monthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 기업 총 절감액
  const totalSaving = getCompanyTotal(activities, referenceData);

  // 절감률 (사업비 대비)
  const savingsRate = company?.budget ? (totalSaving / company.budget) * 100 : 0;

  // 활동유형별 절감액
  const savingsByType = {
    engineering: activities.reduce((sum, act) => {
      if (act.activity_type !== 'engineering') return sum;
      const ref = referenceData.find(r => r.no === act.risk_no);
      return sum + (ref ? ref.social_cost * ref.weight_engineering * act.activity_count : 0);
    }, 0),
    ppe: activities.reduce((sum, act) => {
      if (act.activity_type !== 'ppe') return sum;
      const ref = referenceData.find(r => r.no === act.risk_no);
      return sum + (ref ? ref.social_cost * ref.weight_ppe * act.activity_count : 0);
    }, 0),
    education: activities.reduce((sum, act) => {
      if (act.activity_type !== 'education') return sum;
      const ref = referenceData.find(r => r.no === act.risk_no);
      return sum + (ref ? ref.social_cost * ref.weight_education * act.activity_count : 0);
    }, 0),
  };

  // 위험요인별 분석
  const riskSummary: RiskSummary[] = referenceData.map(ref => {
    const riskActs = activities.filter(a => a.risk_no === ref.no);
    const engineering_total = riskActs
      .filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + ref.social_cost * ref.weight_engineering * a.activity_count, 0);
    const ppe_total = riskActs
      .filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + ref.social_cost * ref.weight_ppe * a.activity_count, 0);
    const education_total = riskActs
      .filter(a => a.activity_type === 'education')
      .reduce((s, a) => s + ref.social_cost * ref.weight_education * a.activity_count, 0);
    return {
      risk_no: ref.no,
      risk_name: ref.risk_name,
      engineering_total,
      ppe_total,
      education_total,
      total_saving: engineering_total + ppe_total + education_total,
    };
  });

  // 월별 추이 데이터
  const monthlyTrend = companyMonths.map(cm => {
    const monthDemands = demandCompanies.filter(d => d.month === cm.month);
    const monthDemandIds = new Set(monthDemands.map(d => d.id));
    const monthActs = activities.filter(a => a.month === cm.month && monthDemandIds.has(a.demand_company_id));
    const monthSaving = monthActs.reduce((sum, act) => {
      const ref = referenceData.find(r => r.no === act.risk_no);
      if (!ref) return sum;
      const weight = getWeight(ref, act.activity_type);
      return sum + ref.social_cost * weight * act.activity_count;
    }, 0);
    return {
      month: cm.month,
      saving: monthSaving,
      demandCount: monthDemands.length,
    };
  });

  return {
    company, demandCompanies, activities, referenceData, settings, companyMonths,
    totalSaving, savingsRate, savingsByType, riskSummary, monthlyTrend,
    loading, refetch: fetchAll,
  };
}
