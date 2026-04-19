-- 5. 사업 설정
-- =============================================================
CREATE TABLE knc_project_settings (
  id SERIAL PRIMARY KEY,
  project_phase TEXT DEFAULT '1차 사업',
  total_investment NUMERIC DEFAULT 3300000000,
  underperformance_threshold NUMERIC DEFAULT 3500000000,
  max_target NUMERIC DEFAULT 6600000000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO knc_project_settings (project_phase, total_investment, underperformance_threshold, max_target)
VALUES ('1차 사업', 3300000000, 3500000000, 6600000000);

-- =============================================================
-- RLS (Row Level Security)
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
