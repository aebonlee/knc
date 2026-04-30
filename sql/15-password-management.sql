-- =====================================================
-- KNC 비밀번호 관리 시스템
-- 생성일: 2026-04-30
--
-- 1. knc_companies에 initial_password 컬럼 추가
-- 2. 50개 기업에 랜덤 비밀번호 생성 (영문소문자4 + 숫자4 + "!")
-- 3. auth.users 기존 비밀번호를 새 랜덤 비밀번호로 업데이트
-- 4. 비밀번호 초기화 RPC 함수 생성
-- =====================================================

-- 1. initial_password 컬럼 추가
ALTER TABLE knc_companies
  ADD COLUMN IF NOT EXISTS initial_password TEXT;

-- 2. 랜덤 비밀번호 생성 및 auth.users 업데이트
DO $$
DECLARE
  rec RECORD;
  new_pw TEXT;
  letters TEXT := 'abcdefghijklmnopqrstuvwxyz';
  digits TEXT := '0123456789';
  login_id TEXT;
  login_email TEXT;
  pw_hash TEXT;
BEGIN
  FOR rec IN
    SELECT id, company_no, solution_type,
           ROW_NUMBER() OVER (PARTITION BY solution_type ORDER BY company_no)::INT AS seq_num
    FROM knc_companies
    ORDER BY company_no
  LOOP
    -- 랜덤 비밀번호: 영문소문자4 + 숫자4 + "!"
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

    -- knc_companies에 초기 비밀번호 저장
    UPDATE knc_companies SET initial_password = new_pw WHERE id = rec.id;

    -- 로그인 이메일 파생
    IF rec.solution_type = '공학' THEN
      login_id := 'eng-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '보호구' THEN
      login_id := 'ppe-' || LPAD(rec.seq_num::TEXT, 2, '0');
    ELSIF rec.solution_type = '행동교정' THEN
      login_id := 'edu-' || LPAD(rec.seq_num::TEXT, 2, '0');
    END IF;

    login_email := login_id || '@knc.id';

    -- auth.users 비밀번호 업데이트
    pw_hash := crypt(new_pw, gen_salt('bf'));
    UPDATE auth.users
      SET encrypted_password = pw_hash, updated_at = now()
      WHERE email = login_email;
  END LOOP;
END $$;

-- 3. 비밀번호 초기화 RPC 함수
CREATE OR REPLACE FUNCTION reset_company_password(target_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  caller_role TEXT;
  company_rec RECORD;
  login_id TEXT;
  login_email TEXT;
  new_pw TEXT;
  letters TEXT := 'abcdefghijklmnopqrstuvwxyz';
  digits TEXT := '0123456789';
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
  SELECT c.id, c.company_no, c.solution_type,
         (SELECT COUNT(*) FROM knc_companies c2
           WHERE c2.solution_type = c.solution_type
             AND c2.company_no <= c.company_no)::INT AS seq_num
    INTO company_rec
    FROM knc_companies c
    WHERE c.id = target_company_id;

  IF company_rec IS NULL THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  -- 새 랜덤 비밀번호 생성
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

  -- knc_companies에 초기 비밀번호 저장
  UPDATE knc_companies SET initial_password = new_pw WHERE id = target_company_id;

  -- 로그인 이메일 파생
  IF company_rec.solution_type = '공학' THEN
    login_id := 'eng-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  ELSIF company_rec.solution_type = '보호구' THEN
    login_id := 'ppe-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  ELSIF company_rec.solution_type = '행동교정' THEN
    login_id := 'edu-' || LPAD(company_rec.seq_num::TEXT, 2, '0');
  END IF;

  login_email := login_id || '@knc.id';

  -- auth.users 비밀번호 업데이트
  pw_hash := crypt(new_pw, gen_salt('bf'));
  UPDATE auth.users
    SET encrypted_password = pw_hash, updated_at = now()
    WHERE email = login_email;

  RETURN new_pw;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
