-- =====================================================
-- KNC 1차/2차 사업 구분 지원 (2026-04-26)
-- =====================================================

-- 1) knc_companies에 phase 컬럼 추가 (기본값 1)
ALTER TABLE knc_companies
  ADD COLUMN IF NOT EXISTS phase INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN knc_companies.phase IS '사업 차수 (1=1차, 2=2차)';

-- 2) knc_project_settings를 다중 행으로 확장
--    기존 1행(id=1)은 1차 사업으로 유지
--    2차 사업용 행 추가 (이미 있으면 무시)
ALTER TABLE knc_project_settings
  ADD COLUMN IF NOT EXISTS phase INTEGER NOT NULL DEFAULT 1;

-- UNIQUE 제약조건 (phase별 1행만)
ALTER TABLE knc_project_settings
  DROP CONSTRAINT IF EXISTS knc_project_settings_phase_key;
ALTER TABLE knc_project_settings
  ADD CONSTRAINT knc_project_settings_phase_key UNIQUE(phase);

-- 기존 행을 1차로 설정
UPDATE knc_project_settings SET phase = 1 WHERE phase IS NULL OR phase = 0;

-- 2차 사업 행 삽입 (없을 때만)
INSERT INTO knc_project_settings (project_phase, total_investment, underperformance_threshold, max_target, phase)
SELECT '2차 사업', 3300000000, 3500000000, 6600000000, 2
WHERE NOT EXISTS (SELECT 1 FROM knc_project_settings WHERE phase = 2);

-- 확인
SELECT id, project_phase, phase, total_investment, max_target
FROM knc_project_settings
ORDER BY phase;
