-- =====================================================
-- KNC 수요기업 UNIQUE 제약조건 수정 (2026-04-26)
-- 기존: UNIQUE(company_id, demand_no) → 새 월에서 같은 번호 추가 불가
-- 수정: UNIQUE(company_id, demand_no, month)
-- =====================================================

-- 가능한 모든 기존 제약조건 이름을 시도하여 삭제
ALTER TABLE knc_demand_companies DROP CONSTRAINT IF EXISTS knc_demand_companies_company_id_demand_no_key;
ALTER TABLE knc_demand_companies DROP CONSTRAINT IF EXISTS knc_demand_companies_uniq;
ALTER TABLE knc_demand_companies DROP CONSTRAINT IF EXISTS knc_demand_companies_company_id_demand_no_month_key;

-- month 포함한 새 UNIQUE 제약조건 추가
ALTER TABLE knc_demand_companies ADD CONSTRAINT knc_demand_companies_uniq UNIQUE(company_id, demand_no, month);

-- 확인: 제약조건 목록 확인
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'knc_demand_companies'::regclass
ORDER BY conname;
