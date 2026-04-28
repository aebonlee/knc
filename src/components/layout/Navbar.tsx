import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiUser, FiEye, FiXCircle } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import { supabase, TABLES } from '../../utils/supabase';
import site from '../../config/site';
import type { Company } from '../../types';

const COLOR_THEMES = site.colors as { name: string; color: string }[];

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  superadmin: { label: '총괄 관리자', className: 'role-badge role-badge-superadmin' },
  manager: { label: '업무담당자', className: 'role-badge role-badge-manager' },
  company_member: { label: '기업회원', className: 'role-badge role-badge-company' },
};

export default function Navbar() {
  const { isLoggedIn, profile, isAdmin, kncRole, isSuperadmin, isCompanyMember, isPending, companyId, canEdit, impersonateCompanyId, setImpersonateCompany, signOut } = useAuth();
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // 관리자일 때 기업 목록 로드 (기업 모드 전환용)
  useEffect(() => {
    if (!canEdit || !supabase) return;
    supabase.from(TABLES.companies).select('id, company_name, company_no').order('company_no')
      .then(({ data }) => { if (data) setCompanies(data as Company[]); });
  }, [canEdit]);

  const impersonatedCompany = companies.find(c => c.id === impersonateCompanyId);

  // 역할별 내비게이션 아이템
  const getNavItems = () => {
    // 승인 대기 중이면 공개 메뉴만
    if (isPending) {
      return [
        { path: '/about', label: '이용안내' },
        { path: '/formulas', label: '산출기준' },
      ];
    }
    // 기업 모드 전환 활성 시 — 기업회원용 메뉴
    if (impersonateCompanyId) {
      return [
        { path: `/companies/${impersonateCompanyId}/dashboard`, label: '내 기업 대시보드' },
        { path: `/companies/${impersonateCompanyId}`, label: '데이터 입력' },
        { path: '/about', label: '이용안내' },
        { path: '/formulas', label: '산출기준' },
      ];
    }
    if (isCompanyMember && companyId) {
      return [
        { path: `/companies/${companyId}/dashboard`, label: '내 기업 대시보드' },
        { path: `/companies/${companyId}`, label: '데이터 입력' },
        { path: '/about', label: '이용안내' },
        { path: '/formulas', label: '산출기준' },
      ];
    }
    const items = [
      { path: '/', label: '대시보드' },
      { path: '/companies', label: '기업 관리' },
      { path: '/risk-analysis', label: '위험요인 분석' },
      { path: '/analytics', label: '성과 분석' },
      { path: '/report', label: '보고서' },
      { path: '/about', label: '이용안내' },
      { path: '/formulas', label: '산출기준' },
    ];
    if (isSuperadmin || kncRole === 'manager') {
      items.push({ path: '/admin/submissions', label: '제출 관리' });
    }
    if (isSuperadmin) {
      items.push({ path: '/admin/unit-prices', label: '절감단가 관리' });
      items.push({ path: '/admin/users', label: '사용자 관리' });
    }
    return items;
  };

  const navItems = getNavItems();

  const externalLinks: { href: string; label: string }[] = [];

  const isActive = (path: string) => location.pathname === path;

  const badge = isPending
    ? { label: '승인대기', className: 'role-badge role-badge-pending' }
    : kncRole ? ROLE_BADGE[kncRole] : null;

  return (
    <>
    <nav className={`navbar${impersonateCompanyId ? ' navbar-impersonate' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-dash">산업안전 RBF</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {externalLinks.map(item => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link nav-link-external"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            {/* 기업 모드 전환 드롭다운 (관리자 전용) */}
            {canEdit && companies.length > 0 && (
              <select
                className="impersonate-select"
                value={impersonateCompanyId || ''}
                onChange={e => setImpersonateCompany(e.target.value || null)}
                title="기업 모드 전환"
              >
                <option value="">기업 모드 ▾</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_no}. {c.company_name}
                  </option>
                ))}
              </select>
            )}

            {/* Color picker */}
            <div className="color-picker-wrap">
              <button
                className="theme-toggle"
                onClick={() => setColorOpen(!colorOpen)}
                title="컬러 테마"
              >
                <span className="color-dot" style={{ background: COLOR_THEMES.find(c => c.name === colorTheme)?.color || '#0F2B5B' }} />
              </button>
              {colorOpen && (
                <div className="color-dropdown">
                  {COLOR_THEMES.map(c => (
                    <button
                      key={c.name}
                      className={`color-option ${colorTheme === c.name ? 'active' : ''}`}
                      onClick={() => { setColorTheme(c.name as typeof colorTheme); setColorOpen(false); }}
                      title={c.name}
                    >
                      <span className="color-dot" style={{ background: c.color }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="theme-toggle" onClick={toggleTheme} title="테마 변경">
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>

            {isLoggedIn && <NotificationBell />}

            {isLoggedIn ? (
              <div className="nav-user">
                <Link to="/profile" className="user-name user-name-link" title={profile?.display_name || profile?.email || '사용자'}>
                  <FiUser size={18} />
                </Link>
                <button className="btn-logout" onClick={signOut}>
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
    {/* 기업 모드 전환 배너 — navbar 바로 아래 */}
    {impersonateCompanyId && impersonatedCompany && (
      <div className="impersonate-bar">
        <FiEye size={16} />
        <strong>{impersonatedCompany.company_name}</strong> 기업 모드 보기 중
        <button className="impersonate-bar-close" onClick={() => setImpersonateCompany(null)}>
          <FiXCircle size={16} /> 해제
        </button>
      </div>
    )}
    </>
  );
}
