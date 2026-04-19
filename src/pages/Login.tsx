import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signUp } from '../utils/auth';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        navigate('/');
      } else {
        await signUp(email, password, name);
        setError('회원가입 완료! 이메일을 확인해주세요.');
        setMode('login');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1><span className="brand-k">K&C</span> 산업안전 RBF</h1>
          <p>사회비용 성과 대시보드</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            로그인
          </button>
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className={`login-error ${error.includes('완료') ? 'success' : ''}`}>{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}
