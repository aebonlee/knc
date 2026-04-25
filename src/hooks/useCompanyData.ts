import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase';
import { DEFAULT_REFERENCE_DATA } from '../data/referenceData';
import type {
  Company, DemandCompany, Activity, ReferenceData,
  ProjectSettings, CompanyWithSavings, RiskSummary, ActivityType,
} from '../types';

// 1건당 절감단가
export const getUnitSaving = (socialCost: number, weight: number): number => {
  return socialCost * weight;
};

// 수요기업별 절감액
export const getDemandSaving = (socialCost: number, weight: number, count: number): number => {
  return socialCost * weight * count;
};

// 활동유형별 가중치
export const getWeight = (ref: ReferenceData, activityType: ActivityType): number => {
  switch (activityType) {
    case 'engineering': return ref.weight_engineering;
    case 'ppe': return ref.weight_ppe;
    case 'education': return ref.weight_education;
  }
};

// 기업 전체 절감액
export const getCompanyTotal = (activities: Activity[], refData: ReferenceData[]): number => {
  return activities.reduce((sum, act) => {
    const ref = refData.find(r => r.no === act.risk_no);
    if (!ref) return sum;
    const weight = getWeight(ref, act.activity_type);
    return sum + ref.social_cost * weight * act.activity_count;
  }, 0);
};

// 성과 판정 (달성률 = 총 절감액 ÷ 최대 성과목표 × 100)
export const getPerformanceResult = (totalSaving: number, settings: ProjectSettings) => {
  const rate = totalSaving / settings.max_target * 100;
  if (totalSaving >= settings.max_target) return { label: '최대 성과목표 달성', color: '#059669', rate };
  if (totalSaving > settings.underperformance_threshold) return { label: '성과 달성', color: '#2563EB', rate };
  return { label: '성과 미달', color: '#DC2626', rate };
};

// 숫자 포맷 (억원 단위)
export const formatBillion = (value: number): string => {
  const billions = value / 100_000_000;
  return `${billions.toFixed(1)}억원`;
};

// 숫자 포맷 (원 단위)
export const formatWon = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
};

// 숫자 포맷 (백만원 단위)
export const formatMillion = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '백만원';
};

const DEFAULT_SETTINGS: ProjectSettings = {
  id: 1,
  project_phase: '1차 사업',
  total_investment: 3_300_000_000,
  underperformance_threshold: 3_500_000_000,
  max_target: 6_600_000_000,
  updated_at: new Date().toISOString(),
};

export function useCompanyData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [demandCompanies, setDemandCompanies] = useState<DemandCompany[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>(DEFAULT_REFERENCE_DATA);
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes, setRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').order('company_no'),
        supabase.from(TABLES.demand_companies).select('*').order('demand_no'),
        supabase.from(TABLES.activities).select('*'),
        supabase.from(TABLES.reference_data).select('*').order('no'),
        supabase.from(TABLES.project_settings).select('*').limit(1).single(),
      ]);

      if (compRes.data) setCompanies(compRes.data);
      if (demandRes.data) setDemandCompanies(demandRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
      if (setRes.data) setSettings(setRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 기업별 절감액 계산
  const companiesWithSavings: CompanyWithSavings[] = companies.map(comp => {
    const compActivities = activities.filter(a => a.company_id === comp.id);
    const compDemands = demandCompanies.filter(d => d.company_id === comp.id);
    return {
      ...comp,
      total_saving: getCompanyTotal(compActivities, referenceData),
      demand_companies: compDemands,
    };
  });

  // 총 절감액
  const totalSaving = companiesWithSavings.reduce((sum, c) => sum + c.total_saving, 0);

  // 성과 판정
  const performance = getPerformanceResult(totalSaving, settings);

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
    const riskActivities = activities.filter(a => a.risk_no === ref.no);
    const engineering_total = riskActivities
      .filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + ref.social_cost * ref.weight_engineering * a.activity_count, 0);
    const ppe_total = riskActivities
      .filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + ref.social_cost * ref.weight_ppe * a.activity_count, 0);
    const education_total = riskActivities
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

  return {
    companies, demandCompanies, activities, referenceData, settings,
    companiesWithSavings, totalSaving, performance, savingsByType, riskSummary,
    loading, refetch: fetchAll,
  };
}
