import { useState } from 'react';
import { FiClock, FiLogOut, FiMail, FiUser, FiPhone, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

export default function PendingApproval() {
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    try {
      await supabase
        .from('user_profiles')
        .update({
          display_name: displayName.trim(),
          name: displayName.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      refreshProfile();
    } catch (err) {
      console.error('프로필 저장 실패:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page pending-page">
      <div className="pending-card">
        <div className="pending-icon">
          <FiClock size={48} />
        </div>
        <h1>승인 대기 중</h1>
        <p className="pending-desc">
          로그인이 완료되었습니다.<br />
          아래 정보를 입력하시면 관리자가 빠르게 확인할 수 있습니다.
        </p>

        {/* 프로필 입력 폼 */}
        <div className="pending-profile-form">
          <div className="pending-field">
            <label><FiMail size={14} /> 이메일</label>
            <input type="text" value={profile?.email || '-'} disabled className="pending-input" />
          </div>
          <div className="pending-field">
            <label><FiUser size={14} /> 이름 (실명)</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="홍길동"
              className="pending-input"
              maxLength={30}
            />
          </div>
          <div className="pending-field">
            <label><FiPhone size={14} /> 연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              className="pending-input"
              maxLength={20}
            />
          </div>
          <button
            className="btn-primary pending-save-btn"
            onClick={handleSaveProfile}
            disabled={saving || !displayName.trim()}
          >
            {saved ? <><FiCheck size={16} /> 저장 완료</> : saving ? '저장 중...' : '정보 저장'}
          </button>
        </div>

        <div className="pending-info">
          <div className="pending-info-row">
            <span className="pending-status-badge">승인 대기</span>
          </div>
        </div>

        <div className="pending-notice">
          <h3>안내사항</h3>
          <ul>
            <li>총괄 관리자가 <strong>사용자 관리</strong> 메뉴에서 역할을 배정합니다.</li>
            <li><strong>기업 입력회원</strong>으로 배정되면 해당 기업의 데이터만 열람/입력할 수 있습니다.</li>
            <li><strong>업무담당자</strong>로 배정되면 모든 기업 데이터를 관리할 수 있습니다.</li>
            <li>역할이 배정되면 새로고침 시 자동으로 대시보드에 접근됩니다.</li>
          </ul>
        </div>

        <div className="pending-actions">
          <button className="btn-primary" onClick={refreshProfile}>
            승인 확인 (새로고침)
          </button>
          <button className="btn-secondary" onClick={signOut}>
            <FiLogOut size={16} /> 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
