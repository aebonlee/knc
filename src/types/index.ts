export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  provider: string | null;
  role: string;
  signup_domain: string | null;
  visited_sites: string[];
  last_sign_in_at: string | null;
  created_at: string;
}

export interface ReferenceData {
  id: number;
  no: number;
  risk_name: string;
  social_cost: number;
  weight_engineering: number;
  weight_ppe: number;
  weight_education: number;
}

export type SolutionType = '공학' | '보호구' | '행동교정';
export type ActivityType = 'engineering' | 'ppe' | 'education';

export interface Company {
  id: string;
  company_no: number;
  company_name: string;
  biz_number: string | null;
  manager_name: string | null;
  manager_title: string | null;
  manager_email: string | null;
  manager_phone: string | null;
  sub_manager_name: string | null;
  sub_manager_title: string | null;
  sub_manager_email: string | null;
  sub_manager_phone: string | null;
  budget: number | null;
  solution_type: SolutionType;
  created_at: string;
}

export interface DemandCompany {
  id: string;
  company_id: string;
  demand_no: number;
  demand_name: string;
  created_at: string;
}

export interface Activity {
  id: string;
  company_id: string;
  demand_company_id: string;
  risk_no: number;
  activity_type: ActivityType;
  activity_count: number;
  updated_at: string;
}

export interface ProjectSettings {
  id: number;
  project_phase: string;
  total_investment: number;
  underperformance_threshold: number;
  max_target: number;
  updated_at: string;
}

export interface CompanyWithSavings extends Company {
  total_saving: number;
  demand_companies: DemandCompany[];
}

export interface RiskSummary {
  risk_no: number;
  risk_name: string;
  engineering_total: number;
  ppe_total: number;
  education_total: number;
  total_saving: number;
}
