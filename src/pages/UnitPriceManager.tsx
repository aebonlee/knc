import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { supabase, TABLES } from '../utils/supabase';
import type { ReferenceData } from '../types';

interface EditableRow {
  id: number | null;
  no: number;
  risk_name: string;
  social_cost: number;
  weight_engineering: number;
  weight_ppe: number;
  weight_education: number;
}

const DEFAULT_RISK_NAMES = [
  '떨어짐', '넘어짐', '깔림·뒤집힘', '부딪힘', '물체에 맞음',
  '무너짐', '끼임', '절단·베임·찔림', '화재·폭발·파열', '교통사고',
  '무리한 동작', '감전', '기타',
];

const createDefaultRows = (): EditableRow[] =>
  DEFAULT_RISK_NAMES.map((name, i) => ({
    id: null,
    no: i + 1,
    risk_name: name,
    social_cost: 0,
    weight_engineering: 0.70,
    weight_ppe: 0.15,
    weight_education: 0.15,
  }));

export default function UnitPriceManager() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from(TABLES.reference_data).select('*').order('no');
    if (data && data.length > 0) {
      setRows(data.map((r: ReferenceData) => ({
        id: r.id,
        no: r.no,
        risk_name: r.risk_name,
        social_cost: r.social_cost,
        weight_engineering: r.weight_engineering,
        weight_ppe: r.weight_ppe,
        weight_education: r.weight_education,
      })));
    } else {
      setRows(createDefaultRows());
    }
    setLoading(false);
  };

  const addRow = () => {
    const nextNo = rows.length > 0 ? Math.max(...rows.map(r => r.no)) + 1 : 1;
    setRows([...rows, {
      id: null,
      no: nextNo,
      risk_name: '',
      social_cost: 0,
      weight_engineering: 0.70,
      weight_ppe: 0.15,
      weight_education: 0.15,
    }]);
  };

  const removeRow = (idx: number) => {
    if (!confirm(`"${rows[idx].risk_name || '새 항목'}"을(를) 삭제하시겠습니까?`)) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, field: keyof EditableRow, value: string | number) => {
    setRows(rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  // 사회비용 변경 시 절감단가 자동 재계산 (가중치 유지)
  const updateSocialCost = (idx: number, value: number) => {
    updateField(idx, 'social_cost', value);
  };

  // 절감단가 직접 수정 시 가중치 역산
  const updateUnitPrice = (idx: number, type: 'engineering' | 'ppe' | 'education', unitPrice: number) => {
    const row = rows[idx];
    if (row.social_cost === 0) return;
    const newWeight = unitPrice / row.social_cost;
    const weightField = type === 'engineering' ? 'weight_engineering'
      : type === 'ppe' ? 'weight_ppe' : 'weight_education';
    updateField(idx, weightField, Math.round(newWeight * 10000) / 10000);
  };

  const saveAll = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      // 기존 데이터 모두 삭제 후 재삽입 (upsert 대체)
      await supabase.from(TABLES.reference_data).delete().gte('no', 0);

      const insertData = rows.map((r, i) => ({
        no: i + 1,
        risk_name: r.risk_name,
        social_cost: r.social_cost,
        weight_engineering: r.weight_engineering,
        weight_ppe: r.weight_ppe,
        weight_education: r.weight_education,
      }));

      const { error } = await supabase.from(TABLES.reference_data).insert(insertData);
      if (error) {
        alert(`저장 실패: ${error.message}`);
      } else {
        alert('절감단가가 저장되었습니다.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page unit-price-page">
      <div className="page-header">
        <h1>절감단가 관리</h1>
        <p>위험요인별 사회비용 및 1건당 절감단가를 관리합니다</p>
      </div>

      <div className="unit-price-toolbar">
        <button className="btn-secondary" onClick={addRow}>
          <FiPlus size={16} /> 위험요인 추가
        </button>
        <button className="btn-primary" onClick={saveAll} disabled={saving}>
          <FiSave size={16} /> {saving ? '저장 중...' : '일괄 저장'}
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table unit-price-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>No</th>
              <th style={{ width: 140 }}>위험요인명</th>
              <th style={{ width: 140 }}>사회비용 (원)</th>
              <th style={{ width: 160 }}>공학 절감단가</th>
              <th style={{ width: 160 }}>보호구 절감단가</th>
              <th style={{ width: 160 }}>교육 절감단가</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="text-center">{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    className="unit-price-input"
                    value={row.risk_name}
                    onChange={e => updateField(idx, 'risk_name', e.target.value)}
                    placeholder="위험요인명"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="unit-price-input text-right"
                    value={row.social_cost || ''}
                    onChange={e => updateSocialCost(idx, Number(e.target.value))}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="unit-price-input text-right"
                    value={Math.round(row.social_cost * row.weight_engineering) || ''}
                    onChange={e => updateUnitPrice(idx, 'engineering', Number(e.target.value))}
                    placeholder="0"
                  />
                  <span className="weight-label">w={row.weight_engineering.toFixed(2)}</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="unit-price-input text-right"
                    value={Math.round(row.social_cost * row.weight_ppe) || ''}
                    onChange={e => updateUnitPrice(idx, 'ppe', Number(e.target.value))}
                    placeholder="0"
                  />
                  <span className="weight-label">w={row.weight_ppe.toFixed(2)}</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="unit-price-input text-right"
                    value={Math.round(row.social_cost * row.weight_education) || ''}
                    onChange={e => updateUnitPrice(idx, 'education', Number(e.target.value))}
                    placeholder="0"
                  />
                  <span className="weight-label">w={row.weight_education.toFixed(2)}</span>
                </td>
                <td className="text-center">
                  <button className="btn-icon btn-danger-icon" onClick={() => removeRow(idx)} title="삭제">
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '2rem' }}>
                  위험요인을 추가해주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="unit-price-summary">
          <p><strong>{rows.length}개</strong> 위험요인 등록됨</p>
          <p className="text-muted">
            사회비용을 수정하면 절감단가가 자동 계산됩니다. 절감단가를 직접 수정하면 가중치가 역산됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
