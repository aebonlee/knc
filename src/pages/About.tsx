import { Link } from 'react-router-dom';
import { FiBarChart2, FiBriefcase, FiAlertTriangle, FiTrendingUp, FiFileText, FiInfo, FiCheckCircle } from 'react-icons/fi';

const MENUS = [
  { icon: <FiBarChart2 size={20} />, title: '대시보드', desc: '전체 50개 기업의 통합 성과 현황을 KPI 카드, 활동유형별 도넛 차트, 위험요인별 바 차트, 기업 순위 테이블로 한눈에 파악합니다.' },
  { icon: <FiBriefcase size={20} />, title: '기업 관리', desc: '50개 기업의 정보 관리, 수요기업 등록, 월별 활동 데이터 입력, 스냅샷 저장/복원 등 기업 단위 데이터 관리를 수행합니다.' },
  { icon: <FiAlertTriangle size={20} />, title: '위험요인 분석', desc: '13개 위험요인(떨어짐, 넘어짐, 끼임 등)별 절감액을 공학/보호구/교육 유형으로 분석하여 위험 감소 효과를 파악합니다.' },
  { icon: <FiTrendingUp size={20} />, title: '성과 분석', desc: '사업비 대비 절감 성과를 분석하고, 성과목표 달성 여부를 판정합니다. 기업별 성과 비교가 가능합니다.' },
  { icon: <FiFileText size={20} />, title: '보고서', desc: '성과 데이터를 기반으로 PDF 보고서를 자동 생성합니다. 인쇄 및 다운로드가 가능합니다.' },
];

const STEPS = [
  { step: 1, title: '기업 선택', desc: '기업 관리 페이지에서 대상 기업을 선택합니다.' },
  { step: 2, title: '월 추가', desc: '해당 기업의 데이터 입력 월을 추가합니다.' },
  { step: 3, title: '수요기업 등록', desc: '해당 월에 대응하는 수요기업(최대 3개)을 등록합니다.' },
  { step: 4, title: '활동 데이터 입력', desc: '수요기업별로 13개 위험요인 × 3개 유형의 활동 횟수를 입력합니다.' },
  { step: 5, title: '스냅샷 저장', desc: '입력 데이터를 스냅샷으로 저장하여 이력을 관리합니다.' },
];

const ROLES = [
  { role: '총괄 관리자', code: 'superadmin', access: '모든 기능 + 사용자 관리', color: '#DC2626' },
  { role: '업무담당자', code: 'manager', access: '모든 기업 데이터 열람/편집', color: '#2563EB' },
  { role: '기업 입력회원', code: 'company_member', access: '자기 기업만 열람/입력', color: '#059669' },
];

export default function About() {
  return (
    <div className="page about-page">
      <div className="page-header">
        <h1>이용안내</h1>
        <p>2026 산업안전 RBF 성과 대시보드 사용 가이드</p>
      </div>

      {/* 시스템 소개 */}
      <section className="about-section">
        <h2><FiInfo size={20} /> 시스템 소개</h2>
        <div className="about-intro-card">
          <p>
            <strong>2026 산업안전 RBF(Results-Based Financing) 대시보드</strong>는
            산업재해 사회비용 절감 성과를 데이터 기반으로 분석하고 관리하는 시스템입니다.
          </p>
          <ul>
            <li>50개 참여기업의 산업안전 활동 데이터를 통합 관리</li>
            <li>13개 위험요인 × 3개 활동유형(공학·관리적, 개인보호구, 행동교정)별 절감액 산출</li>
            <li>사회비용 기반 성과목표 달성률 실시간 모니터링</li>
            <li>기업별·유형별·위험요인별 다차원 분석 대시보드</li>
          </ul>
        </div>
      </section>

      {/* 메뉴별 안내 */}
      <section className="about-section">
        <h2><FiBarChart2 size={20} /> 메뉴별 안내</h2>
        <div className="about-menu-grid">
          {MENUS.map(m => (
            <div key={m.title} className="about-menu-card">
              <div className="about-menu-icon">{m.icon}</div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 입력 방법 */}
      <section className="about-section">
        <h2><FiCheckCircle size={20} /> 데이터 입력 방법</h2>
        <div className="about-steps">
          {STEPS.map(s => (
            <div key={s.step} className="about-step">
              <div className="step-number">{s.step}</div>
              <div className="step-content">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 역할별 권한 */}
      <section className="about-section">
        <h2><FiBriefcase size={20} /> 역할별 권한</h2>
        <table className="data-table about-role-table">
          <thead>
            <tr>
              <th>역할</th>
              <th>코드</th>
              <th>접근 범위</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map(r => (
              <tr key={r.code}>
                <td><span className="role-dot" style={{ background: r.color }} />{r.role}</td>
                <td><code>{r.code}</code></td>
                <td>{r.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 산출기준 링크 */}
      <section className="about-section about-cta">
        <h2>산출 기준</h2>
        <p>절감단가, 절감액, 달성률 등 모든 계산 공식과 1건당 절감단가 표, 절감액 계산기를 확인하세요.</p>
        <Link to="/formulas" className="btn-primary">산출기준 보기 &rarr;</Link>
      </section>
    </div>
  );
}
