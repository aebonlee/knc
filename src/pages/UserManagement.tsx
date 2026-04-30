import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUserPlus, FiTrash2, FiSave, FiUserCheck, FiEye, FiRotateCcw } from 'react-icons/fi';
import { supabase, TABLES } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { initCompanyLoginIds, getCompanyLoginId } from '../hooks/useCompanyData';
import type { KncRole, KncUserRole, Company } from '../types';

interface UserRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  phone: string | null;
  role: KncRole;
  company_id: string | null;
  company_name: string | null;
  created_at: string;
}

interface PendingUser {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  created_at: string;
}

// 개발자 계정 — 사용자 관리 목록에서 숨김
const HIDDEN_EMAILS = ['aebon@kakao.com', 'aebon@kyonggi.ac.kr'];

// 카테고리 탭 정의
const CATEGORY_TABS = [
  { key: 'eng', label: '공학', solutionType: '공학', prefix: 'eng', count: 37 },
  { key: 'ppe', label: '보호구', solutionType: '보호구', prefix: 'ppe', count: 6 },
  { key: 'edu', label: '행동교정', solutionType: '행동교정', prefix: 'edu', count: 7 },
] as const;

export default function UserManagement() {
  const { setImpersonateCompany } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  // tab: 'pending' | 'assigned' | 'eng' | 'ppe' | 'edu'
  const [tab, setTab] = useState<string>('pending');

  // 빠른 승인 폼
  const [approving, setApproving] = useState<string | null>(null);
  const [approveRole, setApproveRole] = useState<KncRole>('company_member');
  const [approveCompanyId, setApproveCompanyId] = useState('');

  // 비밀번호 초기화 중인 기업 ID
  const [resettingId, setResettingId] = useState<string | null>(null);

  // 새 사용자 추가 폼
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<KncRole>('company_member');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [addError, setAddError] = useState('');

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [rolesRes, compRes] = await Promise.all([
        supabase.from(TABLES.user_roles).select('*'),
        supabase.from(TABLES.companies).select('*').order('company_no'),
      ]);
      const roles: KncUserRole[] = rolesRes.data || [];
      const comps: Company[] = compRes.data || [];
      initCompanyLoginIds(comps);
      setCompanies(comps);

      // 역할 배정된 사용자
      const assignedUserIds = roles.map(r => r.user_id);
      let assignedProfiles: { id: string; email: string; display_name: string; phone: string | null }[] = [];
      if (assignedUserIds.length > 0) {
        const { data } = await supabase
          .from('user_profiles')
          .select('id, email, display_name, phone')
          .in('id', assignedUserIds);
        if (data) assignedProfiles = data;
      }

      const compMap = new Map(comps.map(c => [c.id, c.company_name]));
      const rows: UserRow[] = roles.map(r => {
        const p = assignedProfiles.find(pr => pr.id === r.user_id);
        return {
          id: r.id,
          user_id: r.user_id,
          email: p?.email || '',
          display_name: p?.display_name || '',
          phone: p?.phone || null,
          role: r.role,
          company_id: r.company_id,
          company_name: r.company_id ? (compMap.get(r.company_id) || '-') : null,
          created_at: r.created_at,
        };
      });
      setUsers(rows.sort((a, b) => {
        const order: Record<KncRole, number> = { superadmin: 0, manager: 1, company_member: 2 };
        return order[a.role] - order[b.role];
      }));

      // 승인 대기 사용자: knc 사이트를 방문했지만 역할이 없는 사용자
      const { data: allVisitors } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, phone, created_at')
        .contains('visited_sites', ['knc']);

      if (allVisitors) {
        const assignedSet = new Set(assignedUserIds);
        const pending = allVisitors
          .filter(v => !assignedSet.has(v.id))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPendingUsers(pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateRole = async (userId: string, role: KncRole, companyId: string | null) => {
    if (!supabase) return;
    setSaving(userId);
    try {
      await supabase
        .from(TABLES.user_roles)
        .update({ role, company_id: role === 'company_member' ? companyId : null })
        .eq('user_id', userId);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const deleteRole = async (userId: string, email: string) => {
    if (!supabase) return;
    if (!confirm(`${email}의 역할을 삭제하시겠습니까? 해당 사용자는 승인 대기 상태로 돌아갑니다.`)) return;
    try {
      await supabase.from(TABLES.user_roles).delete().eq('user_id', userId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const approveUser = async (userId: string) => {
    if (!supabase) return;
    setSaving(userId);
    try {
      const payload: { user_id: string; role: KncRole; company_id?: string } = {
        user_id: userId,
        role: approveRole,
      };
      if (approveRole === 'company_member' && approveCompanyId) {
        payload.company_id = approveCompanyId;
      }
      const { error } = await supabase.from(TABLES.user_roles).insert(payload);
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      setApproving(null);
      setApproveRole('company_member');
      setApproveCompanyId('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const addUser = async () => {
    if (!supabase || !newEmail.trim()) return;
    setAddError('');
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', newEmail.trim())
        .single();
      if (!profile) {
        setAddError('해당 이메일의 사용자를 찾을 수 없습니다. 먼저 로그인하여 가입해야 합니다.');
        return;
      }
      const payload: { user_id: string; role: KncRole; company_id?: string } = {
        user_id: profile.id,
        role: newRole,
      };
      if (newRole === 'company_member' && newCompanyId) {
        payload.company_id = newCompanyId;
      }
      const { error } = await supabase.from(TABLES.user_roles).insert(payload);
      if (error) {
        if (error.code === '23505') {
          setAddError('이미 역할이 배정된 사용자입니다.');
        } else {
          setAddError(error.message);
        }
        return;
      }
      setNewEmail('');
      setNewRole('company_member');
      setNewCompanyId('');
      setShowAdd(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAddError('추가 중 오류가 발생했습니다.');
    }
  };

  // 기업 모드 전환
  const handleImpersonate = (cid: string) => {
    setImpersonateCompany(cid);
    navigate(`/companies/${cid}/dashboard`);
  };

  // 비밀번호 초기화
  const handleResetPassword = async (companyId: string, companyName: string) => {
    if (!supabase) return;
    if (!confirm(`${companyName}의 비밀번호를 초기화하시겠습니까?`)) return;
    setResettingId(companyId);
    try {
      const { error } = await supabase.rpc('reset_company_password', {
        target_company_id: companyId,
      });
      if (error) {
        alert(`초기화 실패: ${error.message}`);
        return;
      }
      alert(`${companyName} 비밀번호가 초기화되었습니다.`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('비밀번호 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingId(null);
    }
  };

  const filteredAssigned = users.filter(u =>
    !HIDDEN_EMAILS.includes(u.email) &&
    (u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPending = pendingUsers.filter(u =>
    !HIDDEN_EMAILS.includes(u.email) &&
    (u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name || '').toLowerCase().includes(search.toLowerCase()))
  );

  // 카테고리 탭인지 확인
  const isCategoryTab = CATEGORY_TABS.some(c => c.key === tab);
  const currentCategory = CATEGORY_TABS.find(c => c.key === tab);
  const categoryCompanies = currentCategory
    ? companies.filter(c => c.solution_type === currentCategory.solutionType)
    : [];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>사용자 관리</h1>
        <p>KNC 대시보드 사용자 역할 관리 (총괄 관리자 전용)</p>
      </div>

      {/* 탭 */}
      <div className="user-tabs">
        <button
          className={`user-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          승인대기
          {filteredPending.length > 0 && (
            <span className="tab-count tab-count-pending">{filteredPending.length}</span>
          )}
        </button>
        <button
          className={`user-tab ${tab === 'assigned' ? 'active' : ''}`}
          onClick={() => setTab('assigned')}
        >
          배정완료
          <span className="tab-count">{filteredAssigned.length}</span>
        </button>
        <span className="tab-divider" />
        {CATEGORY_TABS.map(cat => (
          <button
            key={cat.key}
            className={`user-tab user-tab-company ${tab === cat.key ? 'active' : ''}`}
            onClick={() => setTab(cat.key)}
          >
            {cat.label}
            <span className="tab-count">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="user-mgmt-toolbar">
        <div className="search-box">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder={isCategoryTab ? '기업명 또는 담당자 검색...' : '이메일 또는 이름 검색...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {tab === 'assigned' && (
          <button className="btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <FiUserPlus size={16} /> 이메일로 추가
          </button>
        )}
      </div>

      {showAdd && tab === 'assigned' && (
        <div className="user-add-form">
          <div className="form-row">
            <input
              type="email"
              placeholder="이메일 주소"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="form-input"
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as KncRole)}
              className="form-select"
            >
              <option value="superadmin">총괄 관리자</option>
              <option value="manager">업무담당자</option>
              <option value="company_member">기업 입력회원</option>
            </select>
            {newRole === 'company_member' && (
              <select
                value={newCompanyId}
                onChange={e => setNewCompanyId(e.target.value)}
                className="form-select"
              >
                <option value="">기업 선택...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_no}. {c.company_name}
                  </option>
                ))}
              </select>
            )}
            <button className="btn-primary btn-sm" onClick={addUser}>
              <FiSave size={14} /> 추가
            </button>
          </div>
          {addError && <p className="form-error">{addError}</p>}
        </div>
      )}

      {/* 승인대기 탭 */}
      {tab === 'pending' && (
        <div className="user-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>이름</th>
                <th>연락처</th>
                <th>가입일</th>
                <th>승인</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">승인 대기 중인 사용자가 없습니다</td></tr>
              ) : (
                filteredPending.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.display_name || '-'}</td>
                    <td>{u.phone || '-'}</td>
                    <td className="text-muted">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                    <td>
                      {approving === u.id ? (
                        <div className="approve-inline">
                          <select
                            value={approveRole}
                            onChange={e => setApproveRole(e.target.value as KncRole)}
                            className="role-select"
                          >
                            <option value="company_member">기업 입력회원</option>
                            <option value="manager">업무담당자</option>
                            <option value="superadmin">총괄 관리자</option>
                          </select>
                          {approveRole === 'company_member' && (
                            <select
                              value={approveCompanyId}
                              onChange={e => setApproveCompanyId(e.target.value)}
                              className="company-select"
                            >
                              <option value="">기업 선택...</option>
                              {companies.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.company_no}. {c.company_name}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            className="btn-primary btn-xs"
                            onClick={() => approveUser(u.id)}
                            disabled={saving === u.id || (approveRole === 'company_member' && !approveCompanyId)}
                          >
                            확인
                          </button>
                          <button
                            className="btn-secondary btn-xs"
                            onClick={() => { setApproving(null); setApproveCompanyId(''); }}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => { setApproving(u.id); setApproveRole('company_member'); setApproveCompanyId(''); }}
                        >
                          <FiUserCheck size={14} /> 역할 배정
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 배정완료 탭 */}
      {tab === 'assigned' && (
        <div className="user-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>이름</th>
                <th>연락처</th>
                <th>역할</th>
                <th>기업</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssigned.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">배정된 사용자가 없습니다</td></tr>
              ) : (
                filteredAssigned.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.display_name || '-'}</td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => updateRole(u.user_id, e.target.value as KncRole, u.company_id)}
                        className="role-select"
                        disabled={saving === u.user_id}
                      >
                        <option value="superadmin">총괄 관리자</option>
                        <option value="manager">업무담당자</option>
                        <option value="company_member">기업 입력회원</option>
                      </select>
                    </td>
                    <td>
                      {u.role === 'company_member' ? (
                        <select
                          value={u.company_id || ''}
                          onChange={e => updateRole(u.user_id, u.role, e.target.value || null)}
                          className="company-select"
                          disabled={saving === u.user_id}
                        >
                          <option value="">기업 선택...</option>
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.company_no}. {c.company_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-muted">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <button
                        className="btn-icon btn-danger-icon"
                        onClick={() => deleteRole(u.user_id, u.email)}
                        title="역할 삭제"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 카테고리 탭 (공학 / 보호구 / 행동교정) */}
      {isCategoryTab && currentCategory && (
        <div className="user-table-wrap">
          <table className="data-table category-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>기업명</th>
                <th>아이디</th>
                <th>비밀번호</th>
                <th>담당자명</th>
                <th>연락처</th>
                <th>이메일</th>
                <th style={{ width: 90 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {categoryCompanies
                .filter(c =>
                  !search ||
                  c.company_name.toLowerCase().includes(search.toLowerCase()) ||
                  (c.manager_name || '').toLowerCase().includes(search.toLowerCase())
                )
                .map(c => {
                  const lid = getCompanyLoginId(c.company_no);
                  return (
                    <tr key={c.id}>
                      <td className="text-center">{c.company_no}</td>
                      <td><strong>{c.company_name}</strong></td>
                      <td><code className="login-id-code">{lid}</code></td>
                      <td>
                        <code className="login-pw-code">{c.initial_password || '-'}</code>
                        <button
                          className="btn-icon btn-xs"
                          onClick={() => handleResetPassword(c.id, c.company_name)}
                          disabled={resettingId === c.id}
                          title="비밀번호 초기화"
                          style={{ marginLeft: 4 }}
                        >
                          <FiRotateCcw size={14} />
                        </button>
                      </td>
                      <td>{c.manager_name || <span className="text-muted">미등록</span>}</td>
                      <td>{c.manager_phone || <span className="text-muted">-</span>}</td>
                      <td>{c.manager_email || <span className="text-muted">-</span>}</td>
                      <td>
                        <button
                          className="btn-impersonate btn-xs"
                          onClick={() => handleImpersonate(c.id)}
                          title="기업 모드 전환"
                        >
                          <FiEye size={14} /> 전환
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
