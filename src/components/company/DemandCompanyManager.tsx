import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { supabase, TABLES } from '../../utils/supabase';
import type { DemandCompany } from '../../types';

interface Props {
  companyId: string;
  demandCompanies: DemandCompany[];
  onChanged: () => void;
}

export default function DemandCompanyManager({ companyId, demandCompanies, onChanged }: Props) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const addDemand = async () => {
    if (!supabase || !newName.trim()) return;
    setAdding(true);
    const nextNo = demandCompanies.length > 0
      ? Math.max(...demandCompanies.map(d => d.demand_no)) + 1
      : 1;
    try {
      await supabase.from(TABLES.demand_companies).insert({
        company_id: companyId,
        demand_no: nextNo,
        demand_name: newName.trim(),
      });
      setNewName('');
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const deleteDemand = async (id: string) => {
    if (!supabase) return;
    if (!confirm('이 수요기업을 삭제하시겠습니까? 관련 활동 데이터도 모두 삭제됩니다.')) return;
    // 먼저 관련 활동 데이터 삭제
    await supabase.from(TABLES.activities).delete().eq('demand_company_id', id);
    await supabase.from(TABLES.demand_companies).delete().eq('id', id);
    onChanged();
  };

  return (
    <div className="demand-manager">
      <h4>수요기업 관리</h4>
      <div className="demand-list">
        {demandCompanies.map(d => (
          <div key={d.id} className="demand-item">
            <span className="demand-no">{d.demand_no}</span>
            <span className="demand-name">{d.demand_name}</span>
            <button className="btn-icon btn-danger" onClick={() => deleteDemand(d.id)} title="삭제">
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="demand-add">
        <input
          placeholder="수요기업명 입력"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDemand())}
        />
        <button className="btn-primary btn-sm" onClick={addDemand} disabled={adding || !newName.trim()}>
          <FiPlus size={14} /> 추가
        </button>
      </div>
    </div>
  );
}
