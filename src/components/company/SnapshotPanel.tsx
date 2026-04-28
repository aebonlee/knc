import { useState } from 'react';
import { FiRotateCcw, FiTrash2, FiClock, FiSend, FiCheck, FiAlertCircle, FiXCircle, FiFileText, FiExternalLink } from 'react-icons/fi';
import { formatWon } from '../../hooks/useCompanyData';
import type { ActivitySnapshot, ReferenceData, Submission } from '../../types';
import { getWeight } from '../../hooks/useCompanyData';

const STATUS_INFO: Record<Submission['status'], { label: string; icon: typeof FiCheck; color: string; bg: string }> = {
  submitted: { label: '검토대기', icon: FiClock, color: '#F59E0B', bg: '#FFF7ED' },
  approved: { label: '승인완료', icon: FiCheck, color: '#059669', bg: '#ECFDF5' },
  revision: { label: '보완요청', icon: FiAlertCircle, color: '#2563EB', bg: '#EFF6FF' },
  rejected: { label: '반려', icon: FiXCircle, color: '#DC2626', bg: '#FEF2F2' },
};

interface Props {
  snapshots: ActivitySnapshot[];
  month: string;
  referenceData: ReferenceData[];
  saving: boolean;
  onSave: (memo: string) => void;
  onRestore: (snapshot: ActivitySnapshot) => void;
  onDelete: (snapshotId: string) => void;
  // 패들릿
  padletUrl?: string;
  // 제출 관련
  submission?: Submission | null;
  submitting?: boolean;
  onSubmit?: (memo: string) => void;
  cancelling?: boolean;
  onCancel?: () => void;
}

function getSnapshotStats(snap: ActivitySnapshot, refData: ReferenceData[]) {
  const { demand_companies, activities, unit_prices } = snap.snapshot;
  const totalCount = activities.reduce((s, a) => s + a.activity_count, 0);
  const totalSaving = activities.reduce((sum, act) => {
    const custom = unit_prices?.find(u => u.risk_no === act.risk_no && u.activity_type === act.activity_type);
    if (custom) return sum + custom.unit_price * act.activity_count;
    const ref = refData.find(r => r.no === act.risk_no);
    if (!ref) return sum;
    return sum + ref.social_cost * getWeight(ref, act.activity_type) * act.activity_count;
  }, 0);
  return { demandCount: demand_companies.length, totalCount, totalSaving };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
}

export default function SnapshotPanel({
  snapshots, month, referenceData, onRestore, onDelete,
  padletUrl, submission, submitting, onSubmit, cancelling, onCancel,
}: Props) {
  const [approvalMemo, setApprovalMemo] = useState('');

  const statusInfo = submission ? STATUS_INFO[submission.status] : null;
  const canSubmit = !submission || submission.status === 'revision' || submission.status === 'rejected';

  return (
    <div className="snapshot-panel-v2">
      {/* 제출 상태 배너 */}
      {submission && statusInfo && (
        <div className="snap-submission-banner" style={{ borderColor: statusInfo.color, background: statusInfo.bg }}>
          <div className="snap-submission-left">
            <statusInfo.icon size={18} style={{ color: statusInfo.color }} />
            <div>
              <strong style={{ color: statusInfo.color }}>{statusInfo.label}</strong>
              <span className="snap-submission-date">
                {submission.status === 'submitted'
                  ? `제출일: ${new Date(submission.submitted_at).toLocaleDateString('ko-KR')}`
                  : `심사일: ${submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleDateString('ko-KR') : '-'}`
                }
              </span>
            </div>
          </div>
          {submission.status === 'submitted' && onCancel && (
            <button
              className="snap-cancel-btn"
              onClick={() => {
                if (confirm(`${month} 제출을 취소하시겠습니까?\n취소 후 데이터를 수정하여 다시 제출할 수 있습니다.`)) {
                  onCancel();
                }
              }}
              disabled={cancelling}
            >
              <FiXCircle size={14} />
              {cancelling ? '취소 중...' : '제출 취소'}
            </button>
          )}
          {(submission.status === 'revision' || submission.status === 'rejected') && (
            <span className="snap-submission-hint">
              데이터를 수정한 후 다시 제출할 수 있습니다
            </span>
          )}
        </div>
      )}

      {/* 패들릿 증빙 자료등록 */}
      {padletUrl && onSubmit && canSubmit && (
        <div className="snap-padlet-section">
          <a href={padletUrl} target="_blank" rel="noopener noreferrer" className="snap-padlet-btn">
            <FiExternalLink size={15} /> 증빙 자료등록 (Padlet)
          </a>
        </div>
      )}

      {/* 결재 메모 + 제출 버튼 */}
      {onSubmit && canSubmit && (
        <div className="snap-approval-section">
          <div className="snap-approval-header">
            <FiFileText size={15} />
            <span>결재 메모</span>
          </div>
          <textarea
            className="snap-approval-memo"
            placeholder="예) 강양HTS eng-01 패들릿에 증빙 3건 등록 완료"
            value={approvalMemo}
            onChange={e => setApprovalMemo(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <button
            className="snap-submit-btn"
            onClick={() => {
              if (confirm(`${month} 데이터를 관리자에게 제출하시겠습니까?\n제출 후 관리자 검토가 진행됩니다.`)) {
                onSubmit(approvalMemo.trim());
                setApprovalMemo('');
              }
            }}
            disabled={submitting}
          >
            <FiSend size={15} />
            {submitting ? '제출 중...' : submission ? '재제출' : '관리자에게 제출'}
          </button>
        </div>
      )}

      {/* 히스토리 타임라인 */}
      <div className="snap-history">
        <div className="snap-history-header">
          <FiClock size={15} />
          <span>저장 히스토리</span>
          <span className="snap-history-count">{snapshots.length}건</span>
        </div>

        {snapshots.length === 0 ? (
          <div className="snap-empty">
            아직 저장된 기록이 없습니다.
          </div>
        ) : (
          <div className="snap-timeline">
            {snapshots.map((snap, idx) => {
              const { date, time } = formatDateTime(snap.created_at);
              const stats = getSnapshotStats(snap, referenceData);
              const isAuto = snap.description.includes('자동');
              const stampNo = snapshots.length - idx;

              return (
                <div key={snap.id} className={`snap-stamp ${idx === 0 ? 'snap-stamp-latest' : ''}`}>
                  {/* 타임라인 연결선 */}
                  <div className="snap-timeline-line">
                    <div className={`snap-dot ${idx === 0 ? 'dot-latest' : isAuto ? 'dot-auto' : ''}`}>
                      {idx === 0 ? 'N' : stampNo}
                    </div>
                  </div>

                  {/* 스탬프 카드 */}
                  <div className="snap-card">
                    <div className="snap-card-top">
                      <div className="snap-card-time">
                        <span className="snap-date">{date}</span>
                        <span className="snap-time">{time}</span>
                      </div>
                      <span className={`snap-badge ${isAuto ? 'badge-auto' : 'badge-manual'}`}>
                        {isAuto ? '자동' : '수동'}
                      </span>
                    </div>

                    <div className="snap-card-memo">{snap.description}</div>

                    <div className="snap-card-stats">
                      <span>수요기업 <b>{stats.demandCount}</b>개</span>
                      <span className="snap-stat-sep" />
                      <span>활동 <b>{stats.totalCount}</b>건</span>
                      <span className="snap-stat-sep" />
                      <span>절감액 <b>{formatWon(stats.totalSaving)}</b></span>
                    </div>

                    <div className="snap-card-actions">
                      <button
                        className="snap-restore-btn"
                        onClick={() => {
                          if (confirm(`이 시점(${date} ${time})으로 복원하시겠습니까?\n현재 상태는 자동 저장됩니다.`)) {
                            onRestore(snap);
                          }
                        }}
                      >
                        <FiRotateCcw size={13} /> 이 시점으로 복원
                      </button>
                      <button
                        className="snap-delete-btn"
                        onClick={() => {
                          if (confirm('이 저장 기록을 삭제하시겠습니까?')) {
                            onDelete(snap.id);
                          }
                        }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
