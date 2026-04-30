-- =====================================================
-- 에일리언테크놀로지아시아 카테고리 전환 (보호구 → 공학)
-- 실행일: 2026-04-30
--
-- 변경 내역:
--   1) knc_companies: company_no=42 solution_type '보호구' → '공학'
--   2) auth.users: ppe-06@knc.id → eng-37@knc.id (비밀번호: eng-37!)
--   3) auth.users: ppe-07@knc.id → ppe-06@knc.id (비밀번호: ppe-06!)
--   4) auth.identities, user_profiles 동기화
-- =====================================================

-- 1. knc_companies 카테고리 변경
UPDATE knc_companies
SET solution_type = '공학'
WHERE company_no = 42;

-- 2. 에일리언테크놀로지아시아: ppe-06@knc.id → eng-37@knc.id
--    (기존 eng-37@knc.id 중복 계정이 있으면 먼저 제거)
DO $$
DECLARE
  v_uid UUID;          -- ppe-06 (에일리언테크놀로지아시아) 실제 uid
  v_dup_uid UUID;      -- eng-37 중복 계정 uid
  v_new_email TEXT := 'eng-37@knc.id';
  v_new_pw TEXT := 'eng-37!';
  v_pw_hash TEXT;
BEGIN
  -- 중복 eng-37@knc.id 계정 제거
  SELECT id INTO v_dup_uid FROM auth.users WHERE email = v_new_email;
  IF v_dup_uid IS NOT NULL THEN
    DELETE FROM knc_user_roles WHERE user_id = v_dup_uid;
    DELETE FROM user_profiles WHERE id = v_dup_uid;
    DELETE FROM auth.identities WHERE user_id = v_dup_uid;
    DELETE FROM auth.users WHERE id = v_dup_uid;
    RAISE NOTICE '중복 eng-37@knc.id 계정 제거 (uid=%)', v_dup_uid;
  END IF;

  -- 실제 에일리언테크놀로지아시아 계정 찾기
  SELECT id INTO v_uid FROM auth.users WHERE email = 'ppe-06@knc.id';

  IF v_uid IS NOT NULL THEN
    v_pw_hash := crypt(v_new_pw, gen_salt('bf'));

    UPDATE auth.users
    SET email = v_new_email,
        encrypted_password = v_pw_hash,
        raw_user_meta_data = raw_user_meta_data || '{"company_no": 42}'::jsonb,
        updated_at = now()
    WHERE id = v_uid;

    UPDATE auth.identities
    SET provider_id = v_new_email,
        identity_data = jsonb_build_object('sub', v_uid::TEXT, 'email', v_new_email),
        updated_at = now()
    WHERE user_id = v_uid AND provider = 'email';

    UPDATE user_profiles
    SET email = v_new_email,
        updated_at = now()
    WHERE id = v_uid;

    RAISE NOTICE '에일리언테크놀로지아시아: ppe-06 → eng-37 완료 (uid=%)', v_uid;
  ELSE
    RAISE NOTICE 'ppe-06@knc.id 계정을 찾을 수 없습니다';
  END IF;
END $$;

-- 3. 유니드: ppe-07@knc.id → ppe-06@knc.id
--    (기존 ppe-06@knc.id 중복 계정이 있으면 먼저 제거 — 위 단계에서 이미 eng-37로 이동됨)
DO $$
DECLARE
  v_uid UUID;
  v_dup_uid UUID;
  v_new_email TEXT := 'ppe-06@knc.id';
  v_new_pw TEXT := 'ppe-06!';
  v_pw_hash TEXT;
BEGIN
  -- 혹시 ppe-06@knc.id가 아직 남아있으면 제거
  SELECT id INTO v_dup_uid FROM auth.users WHERE email = v_new_email;
  IF v_dup_uid IS NOT NULL THEN
    DELETE FROM knc_user_roles WHERE user_id = v_dup_uid;
    DELETE FROM user_profiles WHERE id = v_dup_uid;
    DELETE FROM auth.identities WHERE user_id = v_dup_uid;
    DELETE FROM auth.users WHERE id = v_dup_uid;
    RAISE NOTICE '중복 ppe-06@knc.id 계정 제거 (uid=%)', v_dup_uid;
  END IF;

  SELECT id INTO v_uid FROM auth.users WHERE email = 'ppe-07@knc.id';

  IF v_uid IS NOT NULL THEN
    v_pw_hash := crypt(v_new_pw, gen_salt('bf'));

    UPDATE auth.users
    SET email = v_new_email,
        encrypted_password = v_pw_hash,
        raw_user_meta_data = raw_user_meta_data || '{"company_no": 43}'::jsonb,
        updated_at = now()
    WHERE id = v_uid;

    UPDATE auth.identities
    SET provider_id = v_new_email,
        identity_data = jsonb_build_object('sub', v_uid::TEXT, 'email', v_new_email),
        updated_at = now()
    WHERE user_id = v_uid AND provider = 'email';

    UPDATE user_profiles
    SET email = v_new_email,
        updated_at = now()
    WHERE id = v_uid;

    RAISE NOTICE '유니드: ppe-07 → ppe-06 완료 (uid=%)', v_uid;
  ELSE
    RAISE NOTICE 'ppe-07@knc.id 계정을 찾을 수 없습니다';
  END IF;
END $$;

-- 4. 확인 쿼리
-- SELECT u.email, c.company_name, c.company_no, c.solution_type
-- FROM auth.users u
-- JOIN knc_user_roles ur ON ur.user_id = u.id
-- JOIN knc_companies c ON c.id = ur.company_id
-- WHERE c.company_no IN (42, 43)
-- ORDER BY c.company_no;
