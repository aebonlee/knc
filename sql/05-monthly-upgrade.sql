-- =====================================================
-- KNC 월별 관리 + 기업별 절감단가 + 저장 이력/복원
-- 2026-04-20
-- =====================================================

-- 1-1. knc_demand_companies에 month 컬럼 추가
ALTER TABLE knc_demand_companies ADD COLUMN IF NOT EXISTS month VARCHAR(7) DEFAULT '2026-01';

-- 기존 UNIQUE 제약조건 동적 삭제 (자동생성 이름이 잘릴 수 있어 동적 조회)
DO $$
DECLARE cname TEXT;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
  WHERE conrelid = 'knc_demand_companies'::regclass AND contype = 'u'
  AND conname LIKE 'knc_demand_companies_company_id_demand_no%';
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE knc_demand_companies DROP CONSTRAINT ' || cname;
  END IF;
END $$;
ALTER TABLE knc_demand_companies ADD CONSTRAINT knc_demand_companies_uniq UNIQUE(company_id, demand_no, month);

-- 1-2. knc_activities에 month 컬럼 추가
ALTER TABLE knc_activities ADD COLUMN IF NOT EXISTS month VARCHAR(7) DEFAULT '2026-01';

-- 기존 UNIQUE 제약조건 동적 삭제
DO $$
DECLARE cname TEXT;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
  WHERE conrelid = 'knc_activities'::regclass AND contype = 'u'
  AND conname LIKE 'knc_activities_company_id_demand_company%';
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE knc_activities DROP CONSTRAINT ' || cname;
  END IF;
END $$;
ALTER TABLE knc_activities ADD CONSTRAINT knc_activities_uniq UNIQUE(company_id, demand_company_id, risk_no, activity_type, month);

-- 1-3. knc_company_months (신규) — 기업별 활성 월 목록
CREATE TABLE knc_company_months (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, month)
);

-- 기존 데이터가 있는 기업에 '2026-01' 자동 삽입
INSERT INTO knc_company_months (company_id, month)
SELECT DISTINCT company_id, '2026-01' FROM knc_demand_companies
ON CONFLICT DO NOTHING;

-- 1-4. knc_company_unit_prices (신규) — 기업별 절감단가
CREATE TABLE knc_company_unit_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  risk_no INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  UNIQUE(company_id, risk_no, activity_type)
);

-- 1-5. knc_activity_snapshots (신규) — 저장 이력 + 복원
CREATE TABLE knc_activity_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  snapshot JSONB NOT NULL,
  description TEXT DEFAULT '수동 저장',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1-6. RLS 정책
ALTER TABLE knc_company_months ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knc_company_months_select" ON knc_company_months FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_company_months_insert" ON knc_company_months FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_company_months_update" ON knc_company_months FOR UPDATE TO authenticated USING (true);
CREATE POLICY "knc_company_months_delete" ON knc_company_months FOR DELETE TO authenticated USING (true);

ALTER TABLE knc_company_unit_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knc_company_unit_prices_select" ON knc_company_unit_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_company_unit_prices_insert" ON knc_company_unit_prices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_company_unit_prices_update" ON knc_company_unit_prices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "knc_company_unit_prices_delete" ON knc_company_unit_prices FOR DELETE TO authenticated USING (true);

ALTER TABLE knc_activity_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knc_activity_snapshots_select" ON knc_activity_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_activity_snapshots_insert" ON knc_activity_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_activity_snapshots_update" ON knc_activity_snapshots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "knc_activity_snapshots_delete" ON knc_activity_snapshots FOR DELETE TO authenticated USING (true);
