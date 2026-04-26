import { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiTrash2, FiClock, FiSend, FiCheck, FiAlertCircle, FiXCircle, FiPlus, FiX, FiLink, FiUpload } from 'react-icons/fi';
import { formatWon } from '../../hooks/useCompanyData';
import type { ActivitySnapshot, ReferenceData, Submission } from '../../types';
import { getWeight } from '../../hooks/useCompanyData';

const STATUS_INFO: Record<Submission['status'], { label: string; icon: typeof FiCheck; color: string; bg: string }> = {
  submitted: { label: '검토대기', icon: FiClock, color: '#F59E0B', bg: '#FFF7ED' },
  approved: { label: '승인완료', icon: FiCheck, color: '#059669', bg: '#ECFDF5' },
  revision: { label: '보완요청', icon: FiAlertCircle, color: '#2563EB', bg: '#EFF6FF' },
  rejected: { label: '반려', icon: FiXCircle, color: '#DC2626', bg: '#FEF2F2' },
};

interface EvidenceLink {
  url: string;
  label: string;
}

interface Props {
  snapshots: ActivitySnapshot[];
  month: string;
  referenceData: ReferenceData[];
  saving: boolean;
  onSave: (memo: string) => void;
  onRestore: (snapshot: ActivitySnapshot) => void;
  onDelete: (snapshotId: string) => void;
  // 제출 관련
  submission?: Submission | null;
  submitting?: boolean;
  onSubmit?: (evidenceLinks: EvidenceLink[]) => void;
  cancelling?: boolean;
  onCancel?: () => void;
  updatingEvidence?: boolean;
  onUpdateEvidence?: (evidenceLinks: EvidenceLink[]) => void;
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
  snapshots, month, referenceData, saving, onSave, onRestore, onDelete,
  submission, submitting, onSubmit, cancelling, onCancel,
  updatingEvidence, onUpdateEvidence,
}: Props) {
  const [memo, setMemo] = useState('');
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  // 기존 제출의 증빙자료를 로드
  useEffect(() => {
    if (submission?.evidence_links && Array.isArray(submission.evidence_links)) {
      setEvidenceLinks(submission.evidence_links as EvidenceLink[]);
    } else {
      setEvidenceLinks([]);
    }
  }, [submission?.id]);

  const handleSave = () => {
    onSave(memo.trim() || '수동 저장');
    setMemo('');
  };

  const addEvidenceLink = () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) return;
    try {
      new URL(trimmedUrl);
    } catch {
      alert('올바른 URL 형식을 입력해주세요. (예: https://drive.google.com/...)');
      return;
    }
    setEvidenceLinks(prev => [...prev, { url: trimmedUrl, label: linkLabel.trim() || trimmedUrl }]);
    setLinkUrl('');
    setLinkLabel('');
  };

  const removeEvidenceLink = (index: number) => {
    setEvidenceLinks(prev => prev.filter((_, i) => i !== index));
  };

  const statusInfo = submission ? STATUS_INFO[submission.status] : null;
  const canSubmit = !submission || submission.status === 'revision' || submission.status === 'rejected';

  // 기존 증빙과 현재 상태 비교하여 변경 여부 확인
  const existingLinks = (submission?.evidence_links as EvidenceLink[] | null) || [];
  const evidenceChanged = JSON.stringify(evidenceLinks) !== JSON.stringify(existingLinks);

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

      {/* 저장 바 */}
      <div className="snap-save-bar">
        <div className="snap-save-left">
          <FiSave size={18} className="snap-save-icon" />
          <div className="snap-save-info">
            <strong>{month} 데이터 저장</strong>
            <span>현재 입력 상태를 히스토리에 기록합니다</span>
          </div>
        </div>
        <div className="snap-save-right">
          <input
            type="text"
            className="snap-memo-input"
            placeholder="메모 (예: 1차 입력 완료)"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            maxLength={50}
          />
          <button className="snap-save-btn" onClick={handleSave} disabled={saving}>
            <FiSave size={15} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 증빙 링크 입력 — 항상 표시 */}
      {onSubmit && (
        <div className="snap-evidence-section">
          <div className="snap-evidence-header">
            <FiLink size={15} />
            <span>증빙자료 링크 첨부</span>
          </div>
          <div className="snap-evidence-inputs">
            <input
              type="url"
              className="snap-evidence-url"
              placeholder="URL (예: https://drive.google.com/...)"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addEvidenceLink(); }}
            />
            <input
              type="text"
              className="snap-evidence-label"
              placeholder="파일명 (예: 4월_안전교육_수료증.pdf)"
              value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addEvidenceLink(); }}
              maxLength={50}
            />
            <button className="snap-evidence-add" onClick={addEvidenceLink} disabled={!linkUrl.trim()}>
              <FiPlus size={14} /> 추가
            </button>
          </div>

          {evidenceLinks.length > 0 && (
            <ul className="snap-evidence-list">
              {evidenceLinks.map((link, idx) => (
                <li key={idx} className="snap-evidence-item">
                  <FiLink size={12} />
                  <span className="snap-evidence-item-label">{link.label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="snap-evidence-item-url">
                    {link.url.length > 50 ? link.url.slice(0, 50) + '...' : link.url}
                  </a>
                  <button className="snap-evidence-remove" onClick={() => removeEvidenceLink(idx)}>
                    <FiX size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* 제출 or 증빙 업데이트 버튼 */}
          <div className="snap-evidence-actions">
            {canSubmit && (
              <button
                className="snap-submit-btn"
                onClick={() => {
                  if (confirm(`${month} 데이터를 관리자에게 제출하시겠습니까?\n제출 후 관리자 검토가 진행됩니다.`)) {
                    onSubmit(evidenceLinks);
                  }
                }}
                disabled={submitting}
              >
                <FiSend size={15} />
                {submitting ? '제출 중...' : submission ? '재제출' : '관리자에게 제출'}
                {evidenceLinks.length > 0 && ` (증빙 ${evidenceLinks.length}건)`}
              </button>
            )}
            {!canSubmit && onUpdateEvidence && evidenceChanged && (
              <button
                className="snap-evidence-update-btn"
                onClick={() => {
                  if (confirm('증빙자료를 업데이트하시겠습니까?')) {
                    onUpdateEvidence(evidenceLinks);
                  }
                }}
                disabled={updatingEvidence}
              >
                <FiUpload size={15} />
                {updatingEvidence ? '업데이트 중...' : '증빙자료 업데이트'}
              </button>
            )}
          </div>
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
            아직 저장된 기록이 없습니다. 위 저장 버튼으로 현재 상태를 기록하세요.
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
