-- =====================================================
-- KNC 비밀번호 관리 시스템
-- 생성일: 2026-04-30
--
-- 1. knc_companies에 initial_password 컬럼 추가
-- 2. 50개 기업에 랜덤 비밀번호 생성 (영문소문자4 + 숫자4 + "!")
-- 3. auth.users NULL 토큰 필드 수정 (GoTrue 호환)
-- 4. auth.users 비밀번호를 랜덤 비밀번호로 업데이트
-- 5. 비밀번호 초기화 RPC 함수 (initial_password로 복원)
-- =====================================================

-- 1. initial_password 컬럼 추가
ALTER TABLE knc_companies
  ADD COLUMN IF NOT EXISTS initial_password TEXT;

-- 2. 랜덤 비밀번호 생성 (initial_password가 비어있는 기업만)
DO $$
DECLARE
  rec RECORD;
  new_pw TEXT;
  letters TEXT := 'abcdefghijklmnopqrstuvwxyz';
  digits TEXT := '0123456789';
BEGIN
  FOR rec IN
    SELECT id FROM knc_companies
    WHERE initial_password IS NULL
    ORDER BY company_no
  LOOP
    new_pw :=
      substr(letters, floor(random()*26+1)::int, 1) ||
      substr(letters, floor(random()*26+1)::int, 1) ||
      substr(letters, floor(random()*26+1)::int, 1) ||
      substr(letters, floor(random()*26+1)::int, 1) ||
      substr(digits, floor(random()*10+1)::int, 1) ||
      substr(digits, floor(random()*10+1)::int, 1) ||
      substr(digits, floor(random()*10+1)::int, 1) ||
      substr(digits, floor(random()*10+1)::int, 1) ||
      '!';
    UPDATE knc_companies SET initial_password = new_pw WHERE id = rec.id;
  END LOOP;
END $$;

-- 3. auth.users NULL 토큰 필드 수정 (GoTrue가 NULL string을 처리 못하는 문제)
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE email LIKE '%@knc.id';

-- 4. auth.users 비밀번호를 initial_password로 업데이트
DO $$
DECLARE
  rec RECORD;
  login_id TEXT;
  login_email TEXT;
  pw_hash TEXT;
BEGIN
  FOR rec IN
    SELECT id, company_no, solution_type, initial_password,
           ROW_NUMBER() OVER (PARTITION BY solution_type ORDER BY company_no)::INT AS seq_num
    FROM knc_companies
    WHERE initial_password IS NOT NULL
    ORDER BY company_no
  LOOP
    IF rec.solution_type = '공학' THEN
      login_id := 'eng-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '보호구' THEN
      login_id := 'ppe-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '행동교정' THEN
      login_id := 'edu-' || LPAD(rec.seq_num::TEXT, 2, '0');
    END IF;

    login_email := login_id || '@knc.id';
    pw_hash := crypt(rec.initial_password, gen_salt('bf'));

    UPDATE auth.users
      SET encrypted_password = pw_hash, updated_at = now()
      WHERE email = login_email;
  END LOOP;
END $$;

-- 5. 비밀번호 초기화 RPC 함수 (initial_password로 복원)
CREATE OR REPLACE FUNCTION reset_company_password(target_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  caller_role TEXT;
  company_rec RECORD;
  login_id TEXT;
  login_email TEXT;
  pw_hash TEXT;
BEGIN
  -- 호출자 권한 확인: superadmin 또는 manager만 허용
  SELECT role INTO caller_role
    FROM knc_user_roles
    WHERE user_id = auth.uid();

  IF caller_role IS NULL OR caller_role NOT IN ('superadmin', 'manager') THEN
    RAISE EXCEPTION 'Permission denied: superadmin or manager role required';
  END IF;

  -- 대상 기업 조회 (그룹 내 순번 계산)
  SELECT c.id, c.company_no, c.solution_type, c.initial_password,
         (SELECT COUNT(*) FROM knc_companies c2
           WHERE c2.solution_type = c.solution_type
             AND c2.company_no <= c.company_no)::INT AS seq_num
    INTO company_rec
    FROM knc_companies c
    WHERE c.id = target_company_id;

  IF company_rec IS NULL THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  IF company_rec.initial_password IS NULL THEN
    RAISE EXCEPTION 'No initial password set for this company';
  END IF;

  -- 로그인 이메일 파생
  IF company_rec.solution_type = '공학' THEN
    login_id := 'eng-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  ELSIF company_rec.solution_type = '보호구' THEN
    login_id := 'ppe-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  ELSIF company_rec.solution_type = '행동교정' THEN
    login_id := 'edu-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  END IF;

  login_email := login_id || '@knc.id';

  -- auth.users 비밀번호를 initial_password로 복원
  pw_hash := crypt(company_rec.initial_password, gen_salt('bf'));
  UPDATE auth.users
    SET encrypted_password = pw_hash, updated_at = now()
    WHERE email = login_email;

  RETURN company_rec.initial_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
