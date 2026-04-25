# 2026 산업안전 RBF 성과 대시보드

산업재해 사회비용 절감 성과를 데이터 기반으로 분석하고 관리하는 대시보드 시스템입니다.

**URL**: https://knc.dreamitbiz.com

---

## 주요 기능

### 대시보드
- **전체 통합집계**: 50개 기업 전체의 KPI(투입금액, 총 절감액, 달성률, 성과 판정) + 차트
- **기업별 대시보드**: 드롭다운으로 특정 기업 선택 시 해당 기업의 KPI + 차트 표시
- 활동유형별 도넛 차트 (공학/보호구/교육)
- 위험요인별 바 차트 (13개 위험요인)
- 기업 순위 테이블 (전체) / 월별 추이 라인 차트 (기업별)

### 기업 관리
- 50개 기업 정보 관리 (담당자, 사업비, 솔루션 유형)
- 월별 수요기업 등록 및 활동 데이터 입력
- 스냅샷 저장/복원 기능

### 위험요인 분석
- 13개 위험요인별 절감액 분석
- 공학·관리적 / 개인보호구 / 행동교정(교육) 유형별 분류

### 성과 분석
- 사업비 대비 절감 성과 분석
- 성과목표 달성률 판정 (최대 달성 / 성과 달성 / 성과 미달)

### 보고서
- PDF 보고서 자동 생성 및 다운로드

### 3단계 회원 권한 시스템
| 역할 | 코드 | 접근 범위 |
|------|------|-----------|
| 총괄 관리자 | `superadmin` | 모든 기능 + 사용자 관리 |
| 업무담당자 | `manager` | 모든 기업 데이터 열람/편집 |
| 기업 입력회원 | `company_member` | 자기 기업만 열람/입력 |

- 신규 가입자 → 승인대기 → 관리자가 역할 배정 + 기업 매칭 → 접근 허용

### 이용안내 / 산출기준
- 시스템 사용 가이드 (공개 페이지)
- 절감액 산출 공식, 성과 판정 기준, 절감액 계산기 (공개 페이지)

---

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite 7
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Recharts (PieChart, BarChart, LineChart)
- **Auth**: OAuth 2.0 (Google, Kakao) via Supabase PKCE
- **Deployment**: GitHub Pages (`gh-pages`)
- **Domain**: knc.dreamitbiz.com

---

## 프로젝트 구조

```
knc/
├── sql/                          # DB 스키마
│   ├── 01-reference-data.sql     # 13개 위험요인 기준데이터
│   ├── 02-companies.sql          # 50개 기업
│   ├── 03-demand-activities.sql  # 수요기업 + 활동 데이터
│   ├── 04-project-settings.sql   # 사업 설정
│   ├── 05-snapshots.sql          # 스냅샷 시스템
│   └── 06-user-roles.sql         # 3단계 권한 시스템
├── src/
│   ├── components/
│   │   ├── layout/               # Navbar, Footer
│   │   ├── dashboard/            # KpiCards, SavingsChart, RiskBarChart, CompanyRankTable, CompanyKpiCards, MonthlyTrendChart
│   │   ├── company/              # CompanyForm, CompanySummary, DemandCompanyManager, ActivityInputTable, SnapshotPanel
│   │   └── report/               # PdfReport
│   ├── pages/                    # Home, CompanyList, CompanyDetail, CompanyDashboard, RiskAnalysis, Analytics, Report, Login, About, Formulas, UserManagement, PendingApproval, NotFound
│   ├── hooks/                    # useCompanyData, useCompanyDashboard
│   ├── contexts/                 # AuthContext, ThemeContext
│   ├── types/                    # TypeScript 인터페이스
│   ├── utils/                    # supabase, auth
│   ├── data/                     # referenceData (13개 위험요인)
│   ├── config/                   # site, admin
│   └── styles/                   # global.css, index.css
├── docs/                         # 개발이력 문서
└── public/
```

---

## Supabase 테이블 (knc_ 프리픽스)

| 테이블 | 설명 |
|--------|------|
| `knc_reference_data` | 13개 위험요인 사회비용 + 가중치 |
| `knc_companies` | 50개 기업 정보 |
| `knc_demand_companies` | 수요기업 (기업당 최대 3개/월) |
| `knc_activities` | 활동 데이터 (위험요인 × 유형 × 횟수) |
| `knc_project_settings` | 사업 설정 (투입금액, 목표) |
| `knc_company_months` | 기업별 월 관리 |
| `knc_company_unit_prices` | 기업별 커스텀 단가 |
| `knc_activity_snapshots` | 활동 데이터 스냅샷 |
| `knc_user_roles` | 3단계 회원 권한 |

---

## 개발 및 배포

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 배포
npx gh-pages -d dist
```

---

## 개발이력

[개발이력 문서](docs/CHANGELOG.md) 참조
