-- =====================================================
-- KNC 50개 기업 담당자 계정 일괄 생성
-- 생성일: 2026-04-28
--
-- 아이디 규칙 (solution_type 그룹 내 company_no 순번):
--   공학(37개):     eng-01 ~ eng-37  / 비밀번호: eng-01! ~ eng-37!
--   보호구(6개):    ppe-01 ~ ppe-06  / 비밀번호: ppe-01! ~ ppe-06!
--   행동교정(7개):  edu-01 ~ edu-07  / 비밀번호: edu-01! ~ edu-07!
--
-- 내부 이메일: {아이디}@knc.id (Supabase auth 필수 형식)
-- UI에서는 @knc.id 숨기고 아이디만 표시
-- =====================================================

-- 1. 계정 생성 함수 (트랜잭션 내에서 auth.users + auth.identities + user_profiles + knc_user_roles 일괄 처리)
CREATE OR REPLACE FUNCTION create_knc_bulk_accounts()
RETURNS void AS $$
DECLARE
  rec RECORD;
  new_uid UUID;
  login_id TEXT;
  login_email TEXT;
  login_pw TEXT;
  pw_hash TEXT;
BEGIN
  FOR rec IN
    SELECT id, company_no, company_name, solution_type,
           ROW_NUMBER() OVER (PARTITION BY solution_type ORDER BY company_no)::INT AS seq_num
    FROM knc_companies
    ORDER BY company_no
  LOOP
    -- 아이디/비밀번호 생성 (solution_type 그룹 내 순번)
    IF rec.solution_type = '공학' THEN
      login_id := 'eng-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '보호구' THEN
      login_id := 'ppe-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '행동교정' THEN
      login_id := 'edu-' || LPAD(rec.seq_num::TEXT, 2, '0');
    END IF;

    login_email := login_id || '@knc.id';
    login_pw := login_id || '!';

    -- 이미 존재하면 건너뛰기
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = login_email) THEN
      CONTINUE;
    END IF;

    -- UUID 생성
    new_uid := gen_random_uuid();

    -- bcrypt 해싱 (Supabase 내장 crypt 사용)
    pw_hash := crypt(login_pw, gen_salt('bf'));

    -- auth.users INSERT
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password,
      email_confirmed_at, confirmation_sent_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid, 'authenticated', 'authenticated',
      login_email, pw_hash,
      now(), now(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('display_name', rec.company_name, 'company_no', rec.company_no),
      now(), now()
    );

    -- auth.identities INSERT
    INSERT INTO auth.identities (
      id, user_id, provider_id, provider,
      identity_data, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_uid, new_uid, login_email, 'email',
      jsonb_build_object('sub', new_uid::TEXT, 'email', login_email),
      now(), now(), now()
    );

    -- user_profiles UPSERT (기존 auth 트리거와 충돌 방지)
    INSERT INTO user_profiles (
      id, email, name, display_name, provider, role, signup_domain, visited_sites
    ) VALUES (
      new_uid, login_email, rec.company_name, rec.company_name,
      'email', 'member', 'https://knc.dreamitbiz.com', ARRAY['knc']
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      visited_sites = EXCLUDED.visited_sites;

    -- knc_user_roles INSERT
    INSERT INTO knc_user_roles (user_id, role, company_id)
    VALUES (new_uid, 'company_member', rec.id)
    ON CONFLICT (user_id) DO NOTHING;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 실행
SELECT create_knc_bulk_accounts();

-- 3. 함수 정리
DROP FUNCTION IF EXISTS create_knc_bulk_accounts();

-- 4. 기업 담당자가 자기 회사의 manager 필드를 업데이트할 수 있는 RLS 정책
-- (기존 정책이 없는 경우에만 추가)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'knc_companies' AND policyname = 'knc_company_member_update_manager'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "knc_company_member_update_manager"
        ON knc_companies FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM knc_user_roles
            WHERE user_id = auth.uid()
              AND role = 'company_member'
              AND company_id = knc_companies.id
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM knc_user_roles
            WHERE user_id = auth.uid()
              AND role = 'company_member'
              AND company_id = knc_companies.id
          )
        )
    $policy$;
  END IF;
END $$;

-- 5. 확인 쿼리 (실행 후 검증용)
-- SELECT u.email, ur.role, c.company_name, c.company_no
-- FROM auth.users u
-- JOIN knc_user_roles ur ON ur.user_id = u.id
-- JOIN knc_companies c ON c.id = ur.company_id
-- WHERE u.email LIKE '%@knc.id'
-- ORDER BY c.company_no;
