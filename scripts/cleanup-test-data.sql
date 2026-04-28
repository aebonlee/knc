-- KNC 전체 테스트/더미 데이터 초기화
-- 실행 전 백업 권장!
-- knc_companies, knc_project_settings, knc_user_roles는 유지

DELETE FROM knc_submission_comments;
DELETE FROM knc_submissions;
DELETE FROM knc_activity_snapshots;
DELETE FROM knc_activities;
DELETE FROM knc_risk_assessments;
DELETE FROM knc_demand_companies;
DELETE FROM knc_company_months;
DELETE FROM knc_company_unit_prices;
DELETE FROM knc_notifications;
DELETE FROM knc_reference_data;
