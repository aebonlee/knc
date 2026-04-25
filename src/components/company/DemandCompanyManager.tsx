import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { supabase, TABLES } from '../../utils/supabase';
import type { DemandCompany } from '../../types';

interface Props {
  companyId: string;
  demandCompanies: DemandCompany[];
  month: string;
  onChanged: () => void;
}

export default function DemandCompanyManager({ companyId, demandCompanies, month, onChanged }: Props) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthDemands = demandCompanies.filter(d => d.month === month);

  const addDemand = async () => {
    if (!supabase || !newName.trim()) return;
    setAdding(true);
    setError(null);

    // 현재 월 기준으로 다음 번호 계산
    const nextNo = monthDemands.length > 0
      ? Math.max(...monthDemands.map(d => d.demand_no)) + 1
      : 1;

    const { error: insertError } = await supabase.from(TABLES.demand_companies).insert({
      company_id: companyId,
      demand_no: nextNo,
      demand_name: newName.trim(),
      month,
    });

    if (insertError) {
      console.error('수요기업 추가 실패:', insertError);
      setError(insertError.message || '수요기업 추가에 실패했습니다.');
    } else {
      setNewName('');
      onChanged();
    }
    setAdding(false);
  };

  const deleteDemand = async (id: string) => {
    if (!supabase) return;
    if (!confirm('이 수요기업을 삭제하시겠습니까? 관련 활동 데이터도 모두 삭제됩니다.')) return;
    await supabase.from(TABLES.activities).delete().eq('demand_company_id', id);
    await supabase.from(TABLES.demand_companies).delete().eq('id', id);
    onChanged();
  };

  return (
    <div className="demand-manager">
      <h4>수요기업 관리 <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>({month})</span></h4>
      <div className="demand-list">
        {monthDemands.map(d => (
          <div key={d.id} className="demand-item">
            <span className="demand-no">{d.demand_no}</span>
            <span className="demand-name">{d.demand_name}</span>
            <button className="btn-icon btn-danger" onClick={() => deleteDemand(d.id)} title="삭제">
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div className="demand-error" style={{ color: '#ef4444', fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', marginBottom: '8px' }}>
          {error}
        </div>
      )}
      <div className="demand-add">
        <input
          placeholder="수요기업명 입력"
          value={newName}
          onChange={e => { setNewName(e.target.value); setError(null); }}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDemand())}
        />
        <button className="btn-primary btn-sm" onClick={addDemand} disabled={adding || !newName.trim()}>
          <FiPlus size={14} /> {adding ? '추가 중...' : '추가'}
        </button>
      </div>
    </div>
  );
}
