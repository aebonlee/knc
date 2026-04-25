import { FiClock, FiLogOut, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
  const { profile, signOut, refreshProfile } = useAuth();

  return (
    <div className="page pending-page">
      <div className="pending-card">
        <div className="pending-icon">
          <FiClock size={48} />
        </div>
        <h1>승인 대기 중</h1>
        <p className="pending-desc">
          로그인이 완료되었습니다.<br />
          총괄 관리자가 역할을 배정하면 대시보드를 이용할 수 있습니다.
        </p>

        <div className="pending-info">
          <div className="pending-info-row">
            <FiMail size={16} />
            <span>{profile?.email || '-'}</span>
          </div>
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
