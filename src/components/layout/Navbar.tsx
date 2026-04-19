import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { isLoggedIn, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '대시보드' },
    { path: '/companies', label: '기업 관리' },
    { path: '/risk-analysis', label: '위험요인 분석' },
    { path: '/report', label: '보고서' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-k">K&C</span>
          <span className="brand-dash">산업안전 RBF</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <div className="nav-links">
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
            <button className="theme-toggle" onClick={toggleTheme} title="테마 변경">
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>

            {isLoggedIn ? (
              <div className="nav-user">
                <span className="user-name">
                  <FiUser size={14} />
                  {profile?.display_name || profile?.email?.split('@')[0] || '사용자'}
                  {isAdmin && <span className="admin-badge">관리자</span>}
                </span>
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
  );
}
