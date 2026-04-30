import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase';
import type {
  Company, DemandCompany, Activity, ReferenceData,
  ProjectSettings, CompanyWithSavings, RiskSummary, ActivityType,
  CompanyUnitPrice,
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

// 활동 1건의 절감액 (커스텀 단가 우선)
export const getActivitySaving = (
  act: Activity, refData: ReferenceData[], unitPrices: CompanyUnitPrice[] = []
): number => {
  const custom = unitPrices.find(u => u.risk_no === act.risk_no && u.activity_type === act.activity_type);
  if (custom) return custom.unit_price * act.activity_count;
  const ref = refData.find(r => r.no === act.risk_no);
  if (!ref) return 0;
  return ref.social_cost * getWeight(ref, act.activity_type) * act.activity_count;
};

// 기업 전체 절감액 (커스텀 단가 반영)
export const getCompanyTotal = (
  activities: Activity[], refData: ReferenceData[], unitPrices: CompanyUnitPrice[] = []
): number => {
  return activities.reduce((sum, act) => sum + getActivitySaving(act, refData, unitPrices), 0);
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

// solution_type 그룹 내 순번 기반 로그인 ID 파생
let _loginCacheRef: any[] = [];
const _loginIdMap = new Map<number, string>();

export function initCompanyLoginIds(companies: { company_no: number; solution_type: string }[]) {
  if (_loginCacheRef === companies && _loginIdMap.size > 0) return;
  _loginCacheRef = companies;
  _loginIdMap.clear();
  const groups: Record<string, typeof companies> = { '공학': [], '보호구': [], '행동교정': [] };
  for (const c of companies) {
    if (groups[c.solution_type]) groups[c.solution_type].push(c);
  }
  const prefixMap: Record<string, string> = { '공학': 'eng', '보호구': 'ppe', '행동교정': 'edu' };
  for (const [type, list] of Object.entries(groups)) {
    list.sort((a, b) => a.company_no - b.company_no);
    list.forEach((c, i) => {
      _loginIdMap.set(c.company_no, `${prefixMap[type]}-${String(i + 1).padStart(2, '0')}`);
    });
  }
}

export function getCompanyLoginId(companyNo: number): string {
  return _loginIdMap.get(companyNo) || `unknown-${companyNo}`;
}

// 기업별 증빙 자료등록 URL (Padlet)
export const getPadletUrl = (company: { company_no: number; solution_type: string }): string => {
  const loginId = getCompanyLoginId(company.company_no);
  const slug = loginId.replace('-', '_');
  return `https://padlet.com/aebon/${slug}`;
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
  phase: 1,
  updated_at: new Date().toISOString(),
};

export function useCompanyData(phaseFilter?: number, monthFilter?: string[]) {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allDemandCompanies, setAllDemandCompanies] = useState<DemandCompany[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>([]);
  const [unitPrices, setUnitPrices] = useState<CompanyUnitPrice[]>([]);
  const [allSettings, setAllSettings] = useState<ProjectSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compRes, demandRes, actRes, refRes, priceRes, setRes] = await Promise.all([
        supabase.from(TABLES.companies).select('*').order('company_no'),
        supabase.from(TABLES.demand_companies).select('*').order('demand_no'),
        supabase.from(TABLES.activities).select('*'),
        supabase.from(TABLES.reference_data).select('*').order('no'),
        supabase.from(TABLES.company_unit_prices).select('*'),
        supabase.from(TABLES.project_settings).select('*').order('phase'),
      ]);

      if (compRes.data) { initCompanyLoginIds(compRes.data); setAllCompanies(compRes.data); }
      if (demandRes.data) setAllDemandCompanies(demandRes.data);
      if (actRes.data) setAllActivities(actRes.data);
      if (refRes.data && refRes.data.length > 0) setReferenceData(refRes.data);
      if (priceRes.data) setUnitPrices(priceRes.data);
      if (setRes.data) setAllSettings(Array.isArray(setRes.data) ? setRes.data : [setRes.data]);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // phase 필터 적용
  const companies = phaseFilter
    ? allCompanies.filter(c => (c.phase ?? 1) === phaseFilter)
    : allCompanies;
  const companyIds = new Set(companies.map(c => c.id));
  const demandCompaniesAll = allDemandCompanies.filter(d => companyIds.has(d.company_id));

  // 월 목록 추출 (해당 phase의 사용 가능한 월)
  const allMonths = [...new Set(
    allActivities.filter(a => companyIds.has(a.company_id)).map(a => a.month).filter(Boolean)
  )].sort();

  // 월 필터 적용 (배열: 선택된 월이 없으면 전체)
  const hasMonthFilter = monthFilter && monthFilter.length > 0;
  const monthSet = hasMonthFilter ? new Set(monthFilter) : null;
  const demandCompanies = monthSet
    ? demandCompaniesAll.filter(d => monthSet.has(d.month))
    : demandCompaniesAll;
  const activities = allActivities.filter(a => {
    if (!companyIds.has(a.company_id)) return false;
    if (monthSet && !monthSet.has(a.month)) return false;
    return true;
  });

  // settings: 전체(phaseFilter 없음)일 때 합산, 아니면 해당 phase
  const settings: ProjectSettings = phaseFilter
    ? (allSettings.find(s => s.phase === phaseFilter) || DEFAULT_SETTINGS)
    : allSettings.length > 0
      ? {
          ...allSettings[0],
          project_phase: '1+2차 통합',
          phase: 0,
          total_investment: allSettings.reduce((s, v) => s + v.total_investment, 0),
          underperformance_threshold: allSettings.reduce((s, v) => s + v.underperformance_threshold, 0),
          max_target: allSettings.reduce((s, v) => s + v.max_target, 0),
        }
      : DEFAULT_SETTINGS;

  // 기업별 절감액 계산 (커스텀 단가 반영)
  const companiesWithSavings: CompanyWithSavings[] = companies.map(comp => {
    const compActivities = activities.filter(a => a.company_id === comp.id);
    const compPrices = unitPrices.filter(u => u.company_id === comp.id);
    const compDemands = demandCompanies.filter(d => d.company_id === comp.id);
    return {
      ...comp,
      total_saving: getCompanyTotal(compActivities, referenceData, compPrices),
      demand_companies: compDemands,
    };
  });

  // 총 절감액
  const totalSaving = companiesWithSavings.reduce((sum, c) => sum + c.total_saving, 0);

  // 성과 판정
  const performance = getPerformanceResult(totalSaving, settings);

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
    const riskActivities = activities.filter(a => a.risk_no === ref.no);
    const engineering_total = riskActivities
      .filter(a => a.activity_type === 'engineering')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const ppe_total = riskActivities
      .filter(a => a.activity_type === 'ppe')
      .reduce((s, a) => s + getActivitySaving(a, referenceData, unitPrices), 0);
    const education_total = riskActivities
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

  return {
    companies, demandCompanies, activities, referenceData, unitPrices, settings,
    companiesWithSavings, totalSaving, performance, savingsByType, riskSummary,
    allMonths, loading, refetch: fetchAll,
  };
}
