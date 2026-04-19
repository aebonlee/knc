import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRotateCcw } from 'react-icons/fi';
import type { ActivitySnapshot } from '../../types';

interface Props {
  snapshots: ActivitySnapshot[];
  onRestore: (snapshot: ActivitySnapshot) => void;
}

export default function SnapshotPanel({ snapshots, onRestore }: Props) {
  const [open, setOpen] = useState(false);

  if (snapshots.length === 0 && !open) return null;

  return (
    <div className="snapshot-panel">
      <button className="snapshot-toggle" onClick={() => setOpen(!open)}>
        <span>저장 이력 ({snapshots.length}건)</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && (
        <div className="snapshot-list">
          {snapshots.length === 0 ? (
            <p className="text-muted" style={{ padding: '12px', fontSize: '0.85rem' }}>
              저장 이력이 없습니다.
            </p>
          ) : (
            snapshots.map(snap => (
              <div key={snap.id} className="snapshot-item">
                <div className="snapshot-info">
                  <span className="snapshot-date">
                    {new Date(snap.created_at).toLocaleString('ko-KR')}
                  </span>
                  <span className="snapshot-desc">{snap.description}</span>
                </div>
                <button
                  className="snapshot-restore-btn"
                  onClick={() => {
                    if (confirm('이 시점으로 복원하시겠습니까? 현재 상태는 자동 저장됩니다.')) {
                      onRestore(snap);
                    }
                  }}
                >
                  <FiRotateCcw size={13} /> 복원
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
