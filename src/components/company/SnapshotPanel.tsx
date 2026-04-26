import { useState } from 'react';
import { FiSave, FiRotateCcw, FiTrash2, FiClock } from 'react-icons/fi';
import { formatWon } from '../../hooks/useCompanyData';
import type { ActivitySnapshot, ReferenceData } from '../../types';
import { getWeight } from '../../hooks/useCompanyData';

interface Props {
  snapshots: ActivitySnapshot[];
  month: string;
  referenceData: ReferenceData[];
  saving: boolean;
  onSave: (memo: string) => void;
  onRestore: (snapshot: ActivitySnapshot) => void;
  onDelete: (snapshotId: string) => void;
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
}: Props) {
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    onSave(memo.trim() || '수동 저장');
    setMemo('');
  };

  return (
    <div className="snapshot-panel-v2">
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

      {/* 히스토리 타임라인 */}
      <div className="snap-history">
        <div className="snap-history-header">
          <FiClock size={15} />
          <span>저장 히스토��</span>
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
                          if (confirm('이 저장 기록을 ���제하시겠습니까?')) {
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
