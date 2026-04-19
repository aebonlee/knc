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

-- 활동데이터 344개 INSERT (activity_count > 0)
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)