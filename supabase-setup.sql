-- =============================================================
-- K&C 산업안전 RBF 사회비용 성과 대시보드 — Supabase DB 설정
-- 테이블 prefix: knc_
-- =============================================================

-- 1. 기준데이터 (13개 위험요인)
CREATE TABLE IF NOT EXISTS knc_reference_data (
  id SERIAL PRIMARY KEY,
  no INTEGER NOT NULL,
  risk_name TEXT NOT NULL,
  social_cost NUMERIC NOT NULL,
  weight_engineering NUMERIC DEFAULT 0.70,
  weight_ppe NUMERIC DEFAULT 0.15,
  weight_education NUMERIC DEFAULT 0.15
);

-- 2. 기업 정보 (50개 + 확장)
CREATE TABLE IF NOT EXISTS knc_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_no INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  biz_number TEXT,
  manager_name TEXT,
  manager_title TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  sub_manager_name TEXT,
  sub_manager_title TEXT,
  sub_manager_email TEXT,
  sub_manager_phone TEXT,
  budget NUMERIC,
  solution_type TEXT DEFAULT '공학',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 수요기업 (동적 추가)
CREATE TABLE IF NOT EXISTS knc_demand_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_no INTEGER NOT NULL,
  demand_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_no)
);

-- 4. 활동 횟수 (핵심 데이터)
CREATE TABLE IF NOT EXISTS knc_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_company_id UUID REFERENCES knc_demand_companies(id) ON DELETE CASCADE,
  risk_no INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_company_id, risk_no, activity_type)
);

-- 5. 사업 설정
CREATE TABLE IF NOT EXISTS knc_project_settings (
  id SERIAL PRIMARY KEY,
  project_phase TEXT DEFAULT '1차 사업',
  total_investment NUMERIC DEFAULT 3300000000,
  underperformance_threshold NUMERIC DEFAULT 3500000000,
  max_target NUMERIC DEFAULT 6600000000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 기준 데이터 INSERT (13개 위험요인)
-- =============================================================
INSERT INTO knc_reference_data (no, risk_name, social_cost, weight_engineering, weight_ppe, weight_education) VALUES
(1, '떨어짐', 218980000, 0.70, 0.15, 0.15),
(2, '넘어짐', 99850000, 0.70, 0.15, 0.15),
(3, '깔림·뒤집힘', 339780000, 0.70, 0.15, 0.15),
(4, '부딪힘', 112950000, 0.70, 0.15, 0.15),
(5, '맞음', 137830000, 0.70, 0.15, 0.15),
(6, '무너짐', 339780000, 0.70, 0.15, 0.15),
(7, '끼임', 151580000, 0.70, 0.15, 0.15),
(8, '절단·베임·찔림', 110430000, 0.70, 0.15, 0.15),
(9, '감전', 339780000, 0.70, 0.15, 0.15),
(10, '폭발·파열', 339780000, 0.70, 0.15, 0.15),
(11, '화재', 339780000, 0.70, 0.15, 0.15),
(12, '불균형 및 무리한 동작', 47780000, 0.70, 0.15, 0.15),
(13, '화학물질 누출·접촉', 339780000, 0.70, 0.15, 0.15);

-- 사업 설정 초기값
INSERT INTO knc_project_settings (project_phase, total_investment, underperformance_threshold, max_target)
VALUES ('1차 사업', 3300000000, 3500000000, 6600000000);

-- =============================================================
-- RLS (Row Level Security) 정책
-- =============================================================
ALTER TABLE knc_reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_demand_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_project_settings ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자: SELECT, INSERT, UPDATE
CREATE POLICY "knc_ref_select" ON knc_reference_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_ref_insert" ON knc_reference_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_ref_update" ON knc_reference_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "knc_companies_select" ON knc_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_companies_insert" ON knc_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_companies_update" ON knc_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_companies_delete" ON knc_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_demand_select" ON knc_demand_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_demand_insert" ON knc_demand_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_demand_update" ON knc_demand_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_demand_delete" ON knc_demand_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_activities_select" ON knc_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_activities_insert" ON knc_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_activities_update" ON knc_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_activities_delete" ON knc_activities FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_settings_select" ON knc_project_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_settings_update" ON knc_project_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
