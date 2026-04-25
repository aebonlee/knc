-- =====================================================
-- KNC 3단계 회원 권한 시스템
-- 역할: superadmin / manager / company_member
-- =====================================================

-- 1. knc_user_roles 테이블 생성
CREATE TABLE IF NOT EXISTS knc_user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superadmin','manager','company_member')),
  company_id UUID REFERENCES knc_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  CONSTRAINT chk_company CHECK (role != 'company_member' OR company_id IS NOT NULL)
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_knc_ur_user ON knc_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_knc_ur_company ON knc_user_roles(company_id);

-- 3. RLS 활성화
ALTER TABLE knc_user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 본인 SELECT + superadmin FULL
CREATE POLICY "knc_ur_select_own"
  ON knc_user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "knc_ur_superadmin_all"
  ON knc_user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knc_user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- 5. 시드: 기존 3인 superadmin
INSERT INTO knc_user_roles (user_id, role)
SELECT id, 'superadmin' FROM auth.users
WHERE email IN ('aebon@kakao.com','radical8566@gmail.com','aebon@kyonggi.ac.kr','sourcing.kim@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
