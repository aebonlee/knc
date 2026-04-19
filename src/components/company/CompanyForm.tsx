import { useState } from 'react';
import { supabase, TABLES } from '../../utils/supabase';
import type { Company, SolutionType } from '../../types';

interface Props {
  company?: Company | null;
  nextNo: number;
  onSaved: () => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, nextNo, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    company_no: company?.company_no ?? nextNo,
    company_name: company?.company_name ?? '',
    biz_number: company?.biz_number ?? '',
    manager_name: company?.manager_name ?? '',
    manager_title: company?.manager_title ?? '',
    manager_email: company?.manager_email ?? '',
    manager_phone: company?.manager_phone ?? '',
    sub_manager_name: company?.sub_manager_name ?? '',
    sub_manager_title: company?.sub_manager_title ?? '',
    sub_manager_email: company?.sub_manager_email ?? '',
    sub_manager_phone: company?.sub_manager_phone ?? '',
    budget: company?.budget ?? 0,
    solution_type: (company?.solution_type ?? '공학') as SolutionType,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !form.company_name.trim()) return;
    setSaving(true);
    try {
      if (company) {
        await supabase.from(TABLES.companies).update(form).eq('id', company.id);
      } else {
        await supabase.from(TABLES.companies).insert(form);
      }
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string | number) => setForm(p => ({ ...p, [key]: value }));

  return (
    <form className="company-form" onSubmit={handleSubmit}>
      <h3>{company ? '기업 정보 수정' : '새 기업 등록'}</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>기업번호</label>
          <input type="number" value={form.company_no} onChange={e => set('company_no', Number(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>기업명 *</label>
          <input value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>사업자등록번호</label>
          <input value={form.biz_number} onChange={e => set('biz_number', e.target.value)} />
        </div>
        <div className="form-group">
          <label>솔루션 유형</label>
          <select value={form.solution_type} onChange={e => set('solution_type', e.target.value)}>
            <option value="공학">공학적 조치</option>
            <option value="보호구">보호구</option>
            <option value="행동교정">행동교정</option>
          </select>
        </div>
        <div className="form-group">
          <label>사업비(백만원)</label>
          <input type="number" value={form.budget} onChange={e => set('budget', Number(e.target.value))} />
        </div>
      </div>

      <h4>담당자 정보</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>성명</label>
          <input value={form.manager_name} onChange={e => set('manager_name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>직책</label>
          <input value={form.manager_title} onChange={e => set('manager_title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={form.manager_email} onChange={e => set('manager_email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input value={form.manager_phone} onChange={e => set('manager_phone', e.target.value)} />
        </div>
      </div>

      <h4>부담당자 정보</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>성명</label>
          <input value={form.sub_manager_name} onChange={e => set('sub_manager_name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>직책</label>
          <input value={form.sub_manager_title} onChange={e => set('sub_manager_title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={form.sub_manager_email} onChange={e => set('sub_manager_email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input value={form.sub_manager_phone} onChange={e => set('sub_manager_phone', e.target.value)} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>취소</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '저장 중...' : company ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}
