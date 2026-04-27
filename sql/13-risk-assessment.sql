-- 13-risk-assessment.sql
-- 위험성평가 테이블: 기업별 월별 13개 위험요인의 빈도×강도 평가

CREATE TABLE knc_risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES knc_companies(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  risk_no INTEGER NOT NULL,       -- 1~13
  frequency INTEGER DEFAULT 1,    -- 빈도 1~5
  severity INTEGER DEFAULT 1,     -- 강도 1~5
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, month, risk_no)
);

-- RLS
ALTER TABLE knc_risk_assessments ENABLE ROW LEVEL SECURITY;

-- superadmin/manager: 전체 접근
CREATE POLICY "risk_assessments_admin_all" ON knc_risk_assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM knc_user_roles
      WHERE user_id = auth.uid()
        AND role IN ('superadmin', 'manager')
    )
  );

-- company_member: 본인 회사만
CREATE POLICY "risk_assessments_member_own" ON knc_risk_assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM knc_user_roles
      WHERE user_id = auth.uid()
        AND role = 'company_member'
        AND company_id = knc_risk_assessments.company_id
    )
  );
