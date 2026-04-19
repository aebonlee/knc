import { useState } from 'react';
import { signInWithGoogle, signInWithKakao } from '../utils/auth';
import { FiMail } from 'react-icons/fi';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '구글 로그인 오류');
      setLoading('');
    }
  };

  const handleKakao = async () => {
    setError('');
    setLoading('kakao');
    try {
      await signInWithKakao();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '카카오 로그인 오류');
      setLoading('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1><span className="brand-k">K&C</span> 산업안전 RBF</h1>
          <p>사회비용 성과 대시보드</p>
        </div>

        <div className="login-desc">
          <FiMail size={16} />
          <span>소셜 계정으로 간편하게 시작하세요</span>
        </div>

        <div className="oauth-buttons">
          <button
            className="oauth-btn google-btn"
            onClick={handleGoogle}
            disabled={!!loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{loading === 'google' ? '로그인 중...' : 'Google 계정으로 로그인'}</span>
          </button>

          <button
            className="oauth-btn kakao-btn"
            onClick={handleKakao}
            disabled={!!loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#000000" d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.37 6.23l-1.12 4.12c-.1.35.3.64.6.44l4.8-3.18c.44.06.89.09 1.35.09 5.52 0 10-3.36 10-7.7S17.52 3 12 3z"/>
            </svg>
            <span>{loading === 'kakao' ? '로그인 중...' : '카카오 계정으로 로그인'}</span>
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="login-footer-text">
          <p>로그인 시 서비스 이용약관에 동의하게 됩니다</p>
        </div>
      </div>
    </div>
  );
}
