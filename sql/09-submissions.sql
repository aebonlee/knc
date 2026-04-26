-- =====================================================
-- KNC 제출/승인 워크플로우 (2026-04-26)
-- =====================================================

-- 1) 제출 테이블
CREATE TABLE IF NOT EXISTS knc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES knc_companies(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  snapshot_id UUID REFERENCES knc_activity_snapshots(id) ON DELETE SET NULL,
  submitted_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'approved', 'revision', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_knc_submissions_company ON knc_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_knc_submissions_status ON knc_submissions(status);

-- 2) 코멘트 테이블
CREATE TABLE IF NOT EXISTS knc_submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES knc_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knc_sub_comments_submission ON knc_submission_comments(submission_id);

-- 3) RLS
ALTER TABLE knc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_submission_comments ENABLE ROW LEVEL SECURITY;

-- 인증 사용자 전체 접근 (KNC 내부에서 역할 체크)
CREATE POLICY knc_submissions_all ON knc_submissions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY knc_sub_comments_all ON knc_submission_comments
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 확인
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('knc_submissions', 'knc_submission_comments');
