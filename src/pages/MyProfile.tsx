import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiLock, FiSave, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TABLES } from '../utils/supabase';
import { changePassword } from '../utils/auth';
import type { Company } from '../types';

export default function MyProfile() {
  const { user, profile, isCompanyMember, companyId, refreshProfile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // 담당자 정보 폼
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // 비밀번호 변경
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const isKncAccount = user?.email?.endsWith('@knc.id') ?? false;

  useEffect(() => {
    const load = async () => {
      if (!supabase || !companyId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from(TABLES.companies)
        .select('*')
        .eq('id', companyId)
        .single();
      if (data) {
        setCompany(data as Company);
        setDisplayName(data.manager_name || profile?.display_name || '');
        setPhone(data.manager_phone || profile?.phone || '');
        setManagerEmail(data.manager_email || '');
      } else {
        setDisplayName(profile?.display_name || '');
        setPhone(profile?.phone || '');
      }
      setLoading(false);
    };
    load();
  }, [companyId, profile]);

  const handleSaveProfile = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    setSaveMsg('');
    try {
      // user_profiles 업데이트
      await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim(), phone: phone.trim() })
        .eq('id', user.id);

      // knc_companies manager 필드 동기화
      if (isCompanyMember && companyId) {
        await supabase
          .from(TABLES.companies)
          .update({
            manager_name: displayName.trim(),
            manager_phone: phone.trim(),
            manager_email: managerEmail.trim(),
          })
          .eq('id', companyId);
      }

      await refreshProfile();
      setSaveMsg('저장되었습니다.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMsg('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePw = async () => {
    if (!newPw || newPw !== confirmPw) {
      setPwMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPw.length < 6) {
      setPwMsg('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setPwSaving(true);
    setPwMsg('');
    try {
      await changePassword(newPw);
      setNewPw('');
      setConfirmPw('');
      setPwMsg('비밀번호가 변경되었습니다.');
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setPwMsg('비밀번호 변경에 실패했습니다.');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  // 로그인 아이디 표시 (eng-01@knc.id → eng-01)
  const displayLoginId = user?.email?.replace('@knc.id', '') || user?.email || '';

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>내 프로필</h1>
        <p>담당자 정보를 등록하고 관리하세요</p>
      </div>

      <div className="profile-grid">
        {/* 담당자 정보 */}
        <div className="profile-card">
          <h2 className="profile-card-title">
            <FiUser size={18} /> 담당자 정보
          </h2>

          {company && (
            <div className="profile-company-info">
              <span className="profile-company-badge">{company.solution_type}</span>
              <strong>No.{company.company_no} {company.company_name}</strong>
            </div>
          )}

          <div className="profile-field">
            <label>로그인 아이디</label>
            <input type="text" value={displayLoginId} disabled />
          </div>

          <div className="profile-field">
            <label><FiUser size={14} /> 이름 (담당자명)</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label><FiPhone size={14} /> 연락처</label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {isCompanyMember && (
            <div className="profile-field">
              <label><FiMail size={14} /> 이메일 (실제 연락용)</label>
              <input
                type="email"
                placeholder="example@company.com"
                value={managerEmail}
                onChange={e => setManagerEmail(e.target.value)}
              />
              <span className="profile-field-hint">로그인 아이디와 별개의 실제 연락 이메일입니다</span>
            </div>
          )}

          <div className="profile-actions">
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <><FiSave size={14} /> 저장 중...</> : <><FiSave size={14} /> 저장</>}
            </button>
            {saveMsg && (
              <span className={`profile-msg ${saveMsg.includes('오류') ? 'error' : 'success'}`}>
                {!saveMsg.includes('오류') && <FiCheck size={14} />} {saveMsg}
              </span>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 (KNC 아이디 계정만) */}
        {isKncAccount && (
          <div className="profile-card">
            <h2 className="profile-card-title">
              <FiLock size={18} /> 비밀번호 변경
            </h2>

            <div className="profile-field">
              <label>새 비밀번호</label>
              <input
                type="password"
                placeholder="6자 이상"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="profile-field">
              <label>비밀번호 확인</label>
              <input
                type="password"
                placeholder="다시 한번 입력"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="profile-actions">
              <button
                className="btn-primary"
                onClick={handleChangePw}
                disabled={pwSaving || !newPw || !confirmPw}
              >
                {pwSaving ? '변경 중...' : '비밀번호 변경'}
              </button>
              {pwMsg && (
                <span className={`profile-msg ${pwMsg.includes('실패') || pwMsg.includes('일치') || pwMsg.includes('6자') ? 'error' : 'success'}`}>
                  {pwMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
