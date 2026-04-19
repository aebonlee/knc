/**
 * Excel → Supabase SQL 변환 스크립트
 * 실행: node generate-sql.mjs
 * 출력: supabase-setup.sql (테이블 생성 + 데이터 INSERT + RLS)
 */
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const wb = XLSX.readFile('./(K&C)산업안전_RBF_사회비용 성과_1차_260417.xlsx');

// ─── 1. 기준데이터 파싱 ───
const refSheet = XLSX.utils.sheet_to_json(wb.Sheets['기준데이터'], { header: 1 });
const refData = [];
for (let i = 4; i <= 16; i++) {
  const row = refSheet[i];
  if (!row || row[0] == null) continue;
  refData.push({
    no: row[0],
    risk_name: row[1],
    social_cost: row[2],
    weight_engineering: row[3],
    weight_ppe: row[4],
    weight_education: row[5],
  });
}
console.log(`기준데이터: ${refData.length}개 위험요인`);

// ─── 2. 기업정보 파싱 ───
const compSheet = XLSX.utils.sheet_to_json(wb.Sheets['공급+수요기업'], { header: 1 });
const companies = [];
for (let i = 1; i <= 50; i++) {
  const row = compSheet[i];
  if (!row) continue;

  const companyNo = i;
  const companyName = row[1] || '';
  const bizNumber = row[2] || '';
  const managerName = row[3] || '';
  const managerTitle = row[4] || '';
  const managerEmail = row[5] || '';
  const managerPhone = row[6] || '';
  const subManagerName = row[7] || '';
  const subManagerTitle = row[8] || '';
  const subManagerEmail = row[9] || '';
  const subManagerPhone = row[10] || '';
  const budget = row[11] || 0;
  const solutionType = row[12] || '공학';

  companies.push({
    company_no: companyNo,
    company_name: companyName,
    biz_number: bizNumber,
    manager_name: managerName,
    manager_title: managerTitle,
    manager_email: managerEmail,
    manager_phone: managerPhone,
    sub_manager_name: subManagerName,
    sub_manager_title: subManagerTitle,
    sub_manager_email: subManagerEmail,
    sub_manager_phone: subManagerPhone,
    budget: budget,
    solution_type: solutionType,
  });
}
console.log(`기업정보: ${companies.length}개 기업`);

// ─── 3. 수요기업 + 활동 데이터 파싱 ───
const demandCompanies = [];
const activities = [];

for (let ci = 1; ci <= 50; ci++) {
  const sheetName = '기업' + String(ci).padStart(2, '0');
  const s = wb.Sheets[sheetName];
  if (!s) continue;
  const data = XLSX.utils.sheet_to_json(s, { header: 1 });

  const demandCount = data[4] ? (data[4][1] || 0) : 0;

  // 수요기업 생성 (count만큼)
  for (let d = 1; d <= demandCount; d++) {
    const name = (data[5] && data[5][5 + d]) || `수요기업${d}`;
    demandCompanies.push({
      company_no: ci,
      demand_no: d,
      demand_name: name,
    });
  }

  // 활동 데이터 (row 9~47, 13 위험요인 × 3 활동유형)
  const activityTypes = ['engineering', 'ppe', 'education'];
  for (let riskIdx = 0; riskIdx < 13; riskIdx++) {
    for (let actIdx = 0; actIdx < 3; actIdx++) {
      const rowIdx = 9 + riskIdx * 3 + actIdx;
      const row = data[rowIdx];
      if (!row) continue;

      const riskNo = riskIdx + 1;
      const actType = activityTypes[actIdx];

      // 각 수요기업별 활동횟수 (col 6~10)
      for (let d = 1; d <= demandCount; d++) {
        const count = row[5 + d] || 0;
        if (count > 0) {
          activities.push({
            company_no: ci,
            demand_no: d,
            risk_no: riskNo,
            activity_type: actType,
            activity_count: count,
          });
        }
      }
    }
  }
}
console.log(`수요기업: ${demandCompanies.length}개`);
console.log(`활동데이터: ${activities.length}개 (0 제외)`);

// ─── SQL 생성 ───
const esc = (s) => String(s || '').replace(/'/g, "''");

let sql = `-- =============================================================
-- K&C 산업안전 RBF 사회비용 성과 대시보드 — Supabase DB 설정
-- 생성일: ${new Date().toISOString().slice(0, 10)}
-- 엑셀: (K&C)산업안전_RBF_사회비용 성과_1차_260417.xlsx
-- =============================================================

-- 기존 테이블 삭제 (의존성 순서)
DROP TABLE IF EXISTS knc_activities CASCADE;
DROP TABLE IF EXISTS knc_demand_companies CASCADE;
DROP TABLE IF EXISTS knc_companies CASCADE;
DROP TABLE IF EXISTS knc_reference_data CASCADE;
DROP TABLE IF EXISTS knc_project_settings CASCADE;

-- =============================================================
-- 1. 기준데이터 (13개 위험요인)
-- =============================================================
CREATE TABLE knc_reference_data (
  id SERIAL PRIMARY KEY,
  no INTEGER NOT NULL UNIQUE,
  risk_name TEXT NOT NULL,
  social_cost NUMERIC NOT NULL,
  weight_engineering NUMERIC DEFAULT 0.70,
  weight_ppe NUMERIC DEFAULT 0.15,
  weight_education NUMERIC DEFAULT 0.15
);

`;

// Reference data INSERT
sql += `INSERT INTO knc_reference_data (no, risk_name, social_cost, weight_engineering, weight_ppe, weight_education) VALUES\n`;
sql += refData
  .map(
    (r, i) =>
      `(${r.no}, '${esc(r.risk_name)}', ${r.social_cost}, ${r.weight_engineering}, ${r.weight_ppe}, ${r.weight_education})${i < refData.length - 1 ? ',' : ';'}`
  )
  .join('\n');

sql += `

-- =============================================================
-- 2. 기업 정보 (50개)
-- =============================================================
CREATE TABLE knc_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_no INTEGER NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  biz_number TEXT,
  manager_name TEXT,
  manager_title TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  sub_manager_name TEXT,
  sub_manager_title TEXT,
  sub_manager_email TEXT,
  sub_manager_phone TEXT,
  budget NUMERIC,
  solution_type TEXT DEFAULT '공학',
  created_at TIMESTAMPTZ DEFAULT now()
);

`;

// Companies INSERT
sql += `INSERT INTO knc_companies (company_no, company_name, biz_number, manager_name, manager_title, manager_email, manager_phone, sub_manager_name, sub_manager_title, sub_manager_email, sub_manager_phone, budget, solution_type) VALUES\n`;
sql += companies
  .map(
    (c, i) =>
      `(${c.company_no}, '${esc(c.company_name)}', '${esc(c.biz_number)}', '${esc(c.manager_name)}', '${esc(c.manager_title)}', '${esc(c.manager_email)}', '${esc(c.manager_phone)}', '${esc(c.sub_manager_name)}', '${esc(c.sub_manager_title)}', '${esc(c.sub_manager_email)}', '${esc(c.sub_manager_phone)}', ${c.budget}, '${esc(c.solution_type)}')${i < companies.length - 1 ? ',' : ';'}`
  )
  .join('\n');

sql += `

-- =============================================================
-- 3. 수요기업 (동적 추가)
-- =============================================================
CREATE TABLE knc_demand_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_no INTEGER NOT NULL,
  demand_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_no)
);

`;

// Demand companies INSERT (using subquery for company_id)
sql += `-- 수요기업 ${demandCompanies.length}개 INSERT\n`;
for (const dc of demandCompanies) {
  sql += `INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, ${dc.demand_no}, '${esc(dc.demand_name)}' FROM knc_companies WHERE company_no = ${dc.company_no};\n`;
}

sql += `
-- =============================================================
-- 4. 활동 횟수 (핵심 데이터)
-- =============================================================
CREATE TABLE knc_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_company_id UUID REFERENCES knc_demand_companies(id) ON DELETE CASCADE,
  risk_no INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_company_id, risk_no, activity_type)
);

`;

// Activities INSERT (using subqueries)
sql += `-- 활동데이터 ${activities.length}개 INSERT (activity_count > 0)\n`;
for (const a of activities) {
  sql += `INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, ${a.risk_no}, '${a.activity_type}', ${a.activity_count}
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = ${a.demand_no}
WHERE c.company_no = ${a.company_no};\n`;
}

sql += `
-- =============================================================
-- 5. 사업 설정
-- =============================================================
CREATE TABLE knc_project_settings (
  id SERIAL PRIMARY KEY,
  project_phase TEXT DEFAULT '1차 사업',
  total_investment NUMERIC DEFAULT 3300000000,
  underperformance_threshold NUMERIC DEFAULT 3500000000,
  max_target NUMERIC DEFAULT 6600000000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO knc_project_settings (project_phase, total_investment, underperformance_threshold, max_target)
VALUES ('1차 사업', 3300000000, 3500000000, 6600000000);

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
ALTER TABLE knc_reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_demand_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_project_settings ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자: SELECT, INSERT, UPDATE
CREATE POLICY "knc_ref_select" ON knc_reference_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_ref_insert" ON knc_reference_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_ref_update" ON knc_reference_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "knc_companies_select" ON knc_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_companies_insert" ON knc_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_companies_update" ON knc_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_companies_delete" ON knc_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_demand_select" ON knc_demand_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_demand_insert" ON knc_demand_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_demand_update" ON knc_demand_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_demand_delete" ON knc_demand_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_activities_select" ON knc_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_activities_insert" ON knc_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_activities_update" ON knc_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_activities_delete" ON knc_activities FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_settings_select" ON knc_project_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_settings_update" ON knc_project_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
`;

writeFileSync('supabase-setup.sql', sql, 'utf-8');
console.log(`\nSQL 파일 생성 완료: supabase-setup.sql (${(sql.length / 1024).toFixed(1)} KB)`);
console.log(`총 SQL 라인: ${sql.split('\n').length}줄`);
