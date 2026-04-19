import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithKakao } from '../utils/auth';

export default function Login() {
  const { isLoggedIn, loading } = useAuth();
  const [error, setError] = useState('');

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (isLoggedIn) return <Navigate to="/" replace />;

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setError('');
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithKakao();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="login-page">
      {/* 좌측: 비주얼 영역 */}
      <div className="login-visual">
        <div className="login-visual-bg" />
        <div className="login-grid-overlay" />
        <div className="login-float login-float-1" />
        <div className="login-float login-float-2" />
        <div className="login-float login-float-3" />
        <div className="login-float login-float-4" />

        <div className="login-visual-content">
          <div className="login-visual-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            산업안전 RBF 성과 분석
          </div>
          <h2 className="login-visual-title">
            {'사회비용 절감,\n데이터로 증명하다'}
          </h2>
          <p className="login-visual-desc">
            산업재해 사회비용 분석부터 기업별 성과 추적까지 — RBF 기반 성과 대시보드
          </p>

          {/* 대시보드 미리보기 일러스트 */}
          <div className="login-illustration">
            <svg viewBox="0 0 420 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* 배경 */}
              <circle cx="210" cy="100" r="95" fill="white" opacity="0.02" />

              {/* 좌측: 대시보드 카드 */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="130" height="80" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <rect x="12" y="12" width="40" height="6" rx="3" fill="rgba(96,165,250,0.4)" />
                <rect x="12" y="24" width="60" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
                <text x="12" y="55" fill="rgba(96,165,250,0.8)" fontSize="20" fontWeight="800">₩2.4B</text>
                <rect x="12" y="64" width="50" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
                {/* 미니 스파크라인 */}
                <polyline points="80,60 90,50 100,55 110,40 120,35" stroke="rgba(16,185,129,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>

              {/* 좌측 하단: 기업 리스트 카드 */}
              <g transform="translate(20, 115)">
                <rect x="0" y="0" width="130" height="70" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                {['18', '30', '42', '55'].map((y, i) => (
                  <g key={i}>
                    <circle cx="16" cy={y} r="4" fill={['rgba(96,165,250,0.4)', 'rgba(16,185,129,0.4)', 'rgba(251,191,36,0.4)', 'rgba(139,92,246,0.4)'][i]} />
                    <rect x="26" y={String(Number(y) - 3)} width={[50, 40, 55, 35][i]} height="4" rx="2" fill="rgba(255,255,255,0.1)" />
                    <rect x="90" y={String(Number(y) - 3)} width="30" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
                  </g>
                ))}
              </g>

              {/* 중앙: 큰 도넛 차트 */}
              <g transform="translate(210, 95)">
                <circle cx="0" cy="0" r="55" fill="rgba(255,255,255,0.03)" />
                <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                {/* 세그먼트들 */}
                <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(96,165,250,0.6)" strokeWidth="14"
                  strokeDasharray="105 159" strokeDashoffset="0" />
                <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="14"
                  strokeDasharray="66 198" strokeDashoffset="-105" />
                <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="14"
                  strokeDasharray="53 211" strokeDashoffset="-171" />
                <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="14"
                  strokeDasharray="35 229" strokeDashoffset="-224" />
                {/* 중앙 텍스트 */}
                <circle cx="0" cy="0" r="28" fill="rgba(15,23,42,0.8)" />
                <text x="0" y="-4" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="14" fontWeight="800">68%</text>
                <text x="0" y="10" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7">절감률</text>
              </g>

              {/* 우측: 바 차트 */}
              <g transform="translate(300, 20)">
                <rect x="0" y="0" width="105" height="165" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <rect x="12" y="12" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
                {/* 수평 바 */}
                {[
                  { y: 32, w: 70, c: 'rgba(96,165,250,0.6)', label: '건설' },
                  { y: 50, w: 55, c: 'rgba(16,185,129,0.5)', label: '제조' },
                  { y: 68, w: 45, c: 'rgba(251,191,36,0.5)', label: '물류' },
                  { y: 86, w: 60, c: 'rgba(139,92,246,0.45)', label: '화학' },
                  { y: 104, w: 38, c: 'rgba(244,63,94,0.45)', label: '전기' },
                ].map(({ y, w, c }, i) => (
                  <g key={i}>
                    <rect x="12" y={y} width={w} height="10" rx="5" fill={c} />
                    <rect x={12 + w + 6} y={y + 2} width="16" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
                  </g>
                ))}
                {/* 하단 트렌드 미니 차트 */}
                <rect x="12" y="125" width="80" height="30" rx="4" fill="rgba(255,255,255,0.03)" />
                <polyline points="18,148 30,142 42,145 54,135 66,130 78,128 86,122"
                  stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="86" cy="122" r="2.5" fill="#60A5FA" />
              </g>
            </svg>
          </div>

          <div className="login-features">
            <div className="login-feature-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
              <span>기업별 성과 분석</span>
            </div>
            <div className="login-feature-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>실시간 모니터링</span>
            </div>
            <div className="login-feature-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              <span>보고서 자동 생성</span>
            </div>
          </div>
        </div>
      </div>

      {/* 우측: 로그인 카드 */}
      <div className="login-form-area">
        <div className="login-form-decor login-form-decor-1" />
        <div className="login-form-decor login-form-decor-2" />

        <div className="login-card">
          <div className="login-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="login-header">
            <h1><span className="brand-k">K&C</span> 산업안전 RBF</h1>
            <p>사회비용 성과 대시보드</p>
          </div>

          <div className="login-desc">
            <span>소셜 계정으로 간편하게 시작하세요</span>
          </div>

          <div className="oauth-buttons">
            <button
              className="oauth-btn google-btn"
              onClick={() => handleSocialLogin('google')}
              aria-label="Google 계정으로 로그인"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google 로그인</span>
            </button>

            <button
              className="oauth-btn kakao-btn"
              onClick={() => handleSocialLogin('kakao')}
              aria-label="카카오 계정으로 로그인"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#000000" d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.37 6.23l-1.12 4.12c-.1.35.3.64.6.44l4.8-3.18c.44.06.89.09 1.35.09 5.52 0 10-3.36 10-7.7S17.52 3 12 3z"/>
              </svg>
              <span>카카오 로그인</span>
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <div className="login-divider">
            <span>안전한 성과 관리의 시작</span>
          </div>

          <div className="login-trust">
            <div className="login-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>안전한 로그인</span>
            </div>
            <div className="login-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>데이터 보호</span>
            </div>
          </div>

          <div className="login-footer-text">
            <p>로그인 시 서비스 이용약관에 동의하게 됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
