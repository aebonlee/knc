-- 증빙자료 외부 링크(URL) 컬럼 추가
-- knc_submissions 테이블에 evidence_links JSONB 컬럼 추가
-- 형식: [{"url": "https://...", "label": "증빙1"}, ...]

ALTER TABLE knc_submissions
ADD COLUMN IF NOT EXISTS evidence_links JSONB DEFAULT '[]';

COMMENT ON COLUMN knc_submissions.evidence_links IS '증빙자료 외부 링크 목록 [{url, label}]';
