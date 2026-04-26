-- =====================================================
-- KNC 알림 시스템 테이블
-- 실행: Supabase SQL Editor에서 수동 실행
-- =====================================================

-- 알림 테이블
CREATE TABLE IF NOT EXISTS knc_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('submission', 'approved', 'revision', 'rejected', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,  -- 클릭 시 이동할 경로 (예: /companies/xxx, /admin/submissions)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_knc_notifications_user_id ON knc_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_knc_notifications_is_read ON knc_notifications(user_id, is_read);

-- RLS 정책
ALTER TABLE knc_notifications ENABLE ROW LEVEL SECURITY;

-- 읽기: 본인 알림만
CREATE POLICY "knc_notifications_select" ON knc_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 삽입: 인증된 사용자
CREATE POLICY "knc_notifications_insert" ON knc_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 업데이트: 본인 알림만 (읽음 처리)
CREATE POLICY "knc_notifications_update" ON knc_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 삭제: 본인 알림만
CREATE POLICY "knc_notifications_delete" ON knc_notifications
  FOR DELETE USING (auth.uid() = user_id);
