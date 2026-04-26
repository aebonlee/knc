import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase';
import { DEFAULT_REFERENCE_DATA } from '../data/referenceData';
import { getCompanyTotal, getActivitySaving } from './useCompanyData';
import type {
  Company, DemandCompany, Activity, ReferenceData,
  ProjectSettings, RiskSummary, CompanyMonth, CompanyUnitPrice,
} from '../types';

const DEFAULT_SETTINGS: ProjectSettings = {
  id: 1,
  project_phase: '1차 사업',
  total_investment: 3_300_000_000,
  underperformance_threshold: 3_500_000_000,
  max_target: 6_600_000_000,
  phase: 1,
  updated_at: new Date().toISOString(),
};

export function useCompanyDashboard(companyId: string | undefined) {
  const [company, setCompany] = useState<Company | null>(null);
  const [demandCompanies, setDemandCompanies] = useState<DemandCompany[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>(DEFAULT_REFERENCE_DATA);
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_SETTINGS);
  const [companyMonths, setCompanyMonths] = useState<CompanyMonth[]>([]);
  const [unitPrices, setUnitPrices] = useState<CompanyUnitPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!supabase || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes, priceRes, setRes, monthRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').eq('id', companyId).single(),
        supabase.from(TABLES.demand_companies).select('*').eq('company_id', companyId).order('demand_no'),
        supabase.from(TABLES.activities).select('*').eq('company_id', companyId),
        supabase.from(TABLES.reference_data).select('*').order('no'),
        supabase.from(TABLES.company_unit_prices).select('*').eq('company_id', companyId),
        supabase.from(TABLES.project_settings).select('*').limit(1).single(),
        supabase.from(TABLES.company_months).select('*').eq('company_id', companyId).order('month'),
      ]);
      if (compRes.data) setCompany(compRes.data);
      if (demandRes.data) setDemandCompanies(demandRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
      if (priceRes.data) setUnitPrices(priceRes.data);
      if (setRes.data) setSettings(setRes.data);
      if (monthRes.data) setCompanyMonths(monthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 기업 총 절감액 (커스텀 단가 반영)
  const totalSaving = getCompanyTotal(activities, referenceData, unitPrices);

  // 절감률 (사업비 대비)
  const savingsRate = company?.budget ? (totalSaving / company.budget) * 100 : 0;

  // 활동유형별 절감액 (커스텀 단가 반영)
  const savingsByType = {
    engineering: activities
      .filter(a => a.activity_type === 'engineering')
      .reduce((sum, act) => sum + getActivitySaving(act, referenceData, unitPrices), 0),
    ppe: activities
      .filter(a => a.activity_type === 'ppe')
      .reduce((sum, act) => sum + getActivitySaving(act, referenceData, unitPrices), 0),
    education: activities
      .filter(a => a.activity_type === 'education')
      .reduce((sum, act) => sum + getActivitySaving(act, referenceData, unitPrices), 0),
  };

  // 위험요인별 분석 (커스텀 단가 반영)
  const riskSummary: RiskSummary[] = referenceData.map(ref => {
    const riskActs = activities.filter(a => a.risk_no === ref.no);
    const engineering_total = riskActs
      .filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const ppe_total = riskActs
      .filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const education_total = riskActs
      .filter(a => a.activity_type === 'education')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    return {
      risk_no: ref.no,
      risk_name: ref.risk_name,
      engineering_total,
      ppe_total,
      education_total,
      total_saving: engineering_total + ppe_total + education_total,
    };
  });

  // 월별 추이 데이터 (커스텀 단가 반영)
  const monthlyTrend = companyMonths.map(cm => {
    const monthDemands = demandCompanies.filter(d => d.month === cm.month);
    const monthDemandIds = new Set(monthDemands.map(d => d.id));
    const monthActs = activities.filter(a => a.month === cm.month && monthDemandIds.has(a.demand_company_id));
    const monthSaving = monthActs.reduce((sum, act) => sum + getActivitySaving(act, referenceData, unitPrices), 0);
    return {
      month: cm.month,
      saving: monthSaving,
      demandCount: monthDemands.length,
    };
  });

  return {
    company, demandCompanies, activities, referenceData, unitPrices, settings, companyMonths,
    totalSaving, savingsRate, savingsByType, riskSummary, monthlyTrend,
    loading, refetch: fetchAll,
  };
}
