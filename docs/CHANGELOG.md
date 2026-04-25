# KNC 산업안전 RBF 대시보드 — 개발이력

---

## 2026-04-25 (3차) — 대시보드 뷰 전환 + 문서 정리

### 대시보드 뷰 전환
- **Home.tsx** 대시보드에 드롭다운 셀렉터 추가
- "전체 통합집계" ↔ "기업별 대시보드" 전환 가능
- 기업 선택 시 해당 기업의 KPI + 차트 (도넛, 바, 라인) 표시
- 전체 선택 시 기존 통합 KPI + 기업 순위 테이블 표시

### 문서 정리
- `README.md` — 프로젝트 전체 문서 작성
- `docs/CHANGELOG.md` — 개발이력 문서 생성

### 변경 파일
| 파일 | 변경 |
|------|------|
| `src/pages/Home.tsx` | CompanyView 컴포넌트 + 뷰 전환 셀렉터 추가 |
| `src/styles/global.css` | `.dashboard-view-selector`, `.view-select` 스타일 추가 |
| `README.md` | 전체 프로젝트 문서 작성 |
| `docs/CHANGELOG.md` | 개발이력 문서 생성 |

---

## 2026-04-25 (2차) — 승인대기 시스템

### 개요
신규 사용자가 로그인 후 역할이 배정될 때까지 "승인 대기 중" 상태로 표시되는 시스템 추가.

### 흐름
1. 신규 사용자 로그인 → `knc_user_roles`에 레코드 없음 → 승인대기
2. 승인대기 페이지(`/pending`)로 자동 리다이렉트
3. 총괄 관리자가 사용자 관리 > 승인대기 탭에서 역할 배정 + 기업 매칭
4. 사용자가 "승인 확인" 버튼 또는 새로고침 → 배정된 역할로 접근

### 변경 파일
| 파일 | 변경 |
|------|------|
| `src/contexts/AuthContext.tsx` | `isPending` 상태 추가 |
| `src/pages/PendingApproval.tsx` | 승인대기 안내 페이지 (신규) |
| `src/App.tsx` | `PendingGuard` 추가, pending→`/pending` 리다이렉트 |
| `src/components/layout/Navbar.tsx` | pending 사용자 메뉴 제한, 승인대기 배지(주황) |
| `src/pages/Login.tsx` | pending → `/pending` 리다이렉트 |
| `src/pages/UserManagement.tsx` | 전면 개편: 승인대기/배정완료 탭 |
| `src/styles/global.css` | pending-page, user-tabs, approve-inline 스타일 |

### Navbar 역할별 메뉴
| 역할 | 메뉴 |
|------|------|
| 승인대기 | 이용안내, 산출기준 |
| 기업회원 | 내 기업 대시보드, 데이터 입력, 이용안내, 산출기준 |
| 업무담당자/총괄 | 대시보드, 기업 관리, 위험요인 분석, 성과 분석, 보고서, 이용안내, 산출기준, [사용자 관리] |

---

## 2026-04-25 (1차) — 4대 기능 추가 + 브랜드명 교체

### 개요
KNC 대시보드에 4가지 핵심 기능을 추가하고, 브랜드명 "K&C"를 "2026"으로 전면 교체.

| Phase | 기능 | 상태 |
|-------|------|------|
| 1 | 3단계 회원 권한 시스템 | 완료 |
| 2 | 이용안내(About) 페이지 | 완료 |
| 3 | 기업별 대시보드 | 완료 |
| 4 | 산출기준(Formulas) 페이지 | 완료 |
| - | K&C → 2026 브랜드명 교체 | 완료 |

### Phase 1: 3단계 회원 권한 시스템

#### 역할 정의
| 역할 | 코드 | 접근 범위 |
|------|------|-----------|
| 총괄 관리자 | `superadmin` | 모든 기능 + 사용자 관리 |
| 업무담당자 | `manager` | 모든 기업 데이터 열람/편집 |
| 기업 입력회원 | `company_member` | 자기 기업만 열람/입력 |

#### SQL 스키마
```sql
CREATE TABLE knc_user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superadmin','manager','company_member')),
  company_id UUID REFERENCES knc_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  CONSTRAINT chk_company CHECK (role != 'company_member' OR company_id IS NOT NULL)
);
```

#### RLS 정책
- 본인 SELECT (`user_id = auth.uid()`)
- superadmin FULL (모든 CRUD)

#### 라우트 구조
| 경로 | 접근 권한 | 페이지 |
|------|-----------|--------|
| `/` | 인증 필요 (company_member → 리다이렉트) | 전체 대시보드 |
| `/companies` | 인증 필요 | 기업 목록 |
| `/companies/:id` | 인증 필요 (company_member 자기 기업만) | 기업 상세 |
| `/companies/:id/dashboard` | 인증 필요 | 기업별 대시보드 |
| `/risk-analysis` | 인증 필요 | 위험요인 분석 |
| `/analytics` | 인증 필요 | 성과 분석 |
| `/report` | 인증 필요 | 보고서 |
| `/admin/users` | superadmin 전용 | 사용자 관리 |
| `/about` | 공개 | 이용안내 |
| `/formulas` | 공개 | 산출기준 |
| `/login` | 공개 | 로그인 |
| `/pending` | 승인대기 전용 | 승인대기 안내 |

#### 변경 파일
| 파일 | 변경 |
|------|------|
| `sql/06-user-roles.sql` | knc_user_roles 테이블 + RLS + 시드 (신규) |
| `src/types/index.ts` | KncRole, KncUserRole 타입 추가 |
| `src/utils/supabase.ts` | TABLES.user_roles 추가 |
| `src/contexts/AuthContext.tsx` | 역할 조회, 새 context 값 |
| `src/App.tsx` | RoleGuard, HomeRedirect, 새 라우트 |
| `src/components/layout/Navbar.tsx` | 역할별 메뉴, 역할 배지 |
| `src/pages/UserManagement.tsx` | superadmin 전용 사용자 관리 (신규) |
| `src/pages/Login.tsx` | 역할 기반 리다이렉트 |
| `src/pages/CompanyDetail.tsx` | company_member 접근 제어 |

### Phase 2: 이용안내 (About) 페이지

| 섹션 | 내용 |
|------|------|
| 시스템 소개 | KNC RBF 사업 개요, 50개 기업 |
| 메뉴별 안내 | 대시보드, 기업 관리, 위험요인 분석, 성과 분석, 보고서 |
| 데이터 입력 방법 | Step 1~5 |
| 역할별 권한 | 3단계 역할 테이블 |
| 산출기준 링크 | `/formulas` |

파일: `src/pages/About.tsx` (신규), 라우트: `/about` (공개)

### Phase 3: 기업별 대시보드

#### KPI 카드 (4개)
| KPI | 설명 |
|-----|------|
| 사업비 | 기업 배정 예산 |
| 기업 절감액 | Σ(사회비용 × 가중치 × 활동횟수) |
| 절감률 | 기업 절감액 ÷ 사업비 × 100 |
| 수요기업 수 | 등록된 수요기업 수 |

#### 차트 (3개)
1. 유형별 도넛 차트 (공학/보호구/교육)
2. 위험요인별 바 차트 (13개 위험요인)
3. 월별 추이 라인 차트

#### 변경 파일
| 파일 | 변경 |
|------|------|
| `src/hooks/useCompanyDashboard.ts` | 단일 기업 데이터 훅 (신규) |
| `src/pages/CompanyDashboard.tsx` | 기업별 대시보드 페이지 (신규) |
| `src/components/dashboard/CompanyKpiCards.tsx` | KPI 4개 카드 (신규) |
| `src/components/dashboard/MonthlyTrendChart.tsx` | 월별 추이 차트 (신규) |

### Phase 4: 산출기준 (Formulas) 페이지

| 섹션 | 내용 |
|------|------|
| 위험요인별 사회비용 | 13개 위험요인 테이블 |
| 산출 공식 | 4개 공식 카드 |
| 성과 판정 기준 | 3단계 판정 |
| 절감액 계산기 | 위험요인/유형/횟수 → 실시간 계산 |

파일: `src/pages/Formulas.tsx` (신규), 라우트: `/formulas` (공개)

### 브랜드명 교체: K&C → 2026

변경 파일 (8개): Navbar, Footer, Login, About, site.ts, PdfReport, global.css

---

## 전체 생성 파일 목록

| # | 파일 | 설명 |
|---|------|------|
| 1 | `sql/06-user-roles.sql` | 회원 권한 SQL |
| 2 | `src/pages/UserManagement.tsx` | 사용자 관리 |
| 3 | `src/pages/About.tsx` | 이용안내 |
| 4 | `src/pages/CompanyDashboard.tsx` | 기업별 대시보드 |
| 5 | `src/hooks/useCompanyDashboard.ts` | 기업 데이터 훅 |
| 6 | `src/components/dashboard/CompanyKpiCards.tsx` | 기업 KPI 카드 |
| 7 | `src/components/dashboard/MonthlyTrendChart.tsx` | 월별 추이 차트 |
| 8 | `src/pages/Formulas.tsx` | 산출기준 |
| 9 | `src/pages/PendingApproval.tsx` | 승인대기 페이지 |
| 10 | `docs/CHANGELOG.md` | 개발이력 |
| 11 | `README.md` | 프로젝트 문서 |

---

## 검증 결과

- `npx tsc --noEmit` — TypeScript 0 에러
- `npm run build` — 빌드 성공
- 배포: `npx gh-pages -d dist` → knc.dreamitbiz.com
