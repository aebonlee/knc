import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { useCompanyData, formatBillion } from '../hooks/useCompanyData';
import { useAuth } from '../contexts/AuthContext';
import CompanyForm from '../components/company/CompanyForm';
import type { SolutionType } from '../types';

export default function CompanyList() {
  const { impersonateCompanyId } = useAuth();
  // phase 필터 없이 전체 기업 표시
  const { companiesWithSavings, loading, refetch } = useCompanyData();

  // 기업 모드 전환 시 해당 기업 상세로 리다이렉트
  if (impersonateCompanyId) {
    return <Navigate to={`/companies/${impersonateCompanyId}`} replace />;
  }
  const [filter, setFilter] = useState<SolutionType | ''>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = companiesWithSavings
    .filter(c => !filter || c.solution_type === filter)
    .filter(c => !search || c.company_name.includes(search));

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const nextNo = companiesWithSavings.length > 0
    ? Math.max(...companiesWithSavings.map(c => c.company_no)) + 1
    : 1;

  return (
    <div className="page">
      <div className="page-header">
        <h1>기업 관리</h1>
        <p>총 {companiesWithSavings.length}개 기업</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch size={16} />
          <input
            placeholder="기업명 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn-icon" onClick={() => setSearch('')}><FiX size={14} /></button>
          )}
        </div>

        <div className="filter-group">
          <button className={`filter-btn ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>전체</button>
          <button className={`filter-btn ${filter === '공학' ? 'active' : ''}`} onClick={() => setFilter('공학')}>공학</button>
          <button className={`filter-btn ${filter === '보호구' ? 'active' : ''}`} onClick={() => setFilter('보호구')}>보호구</button>
          <button className={`filter-btn ${filter === '행동교정' ? 'active' : ''}`} onClick={() => setFilter('행동교정')}>행동교정</button>
        </div>

        <button className="btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <FiPlus size={14} /> 기업 등록
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CompanyForm
              nextNo={nextNo}
              onSaved={() => { setShowForm(false); refetch(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>등록된 기업이 없습니다.</p>
        </div>
      ) : (
        <div className="company-grid">
          {filtered.map(comp => (
            <Link key={comp.id} to={`/companies/${comp.id}`} className="company-card">
              <div className="card-header">
                <span className="card-no">No.{comp.company_no}</span>
                <span className={`badge badge-${comp.solution_type === '공학' ? 'blue' : comp.solution_type === '보호구' ? 'green' : 'amber'}`}>
                  {comp.solution_type}
                </span>
              </div>
              <h3 className="card-name">{comp.company_name}</h3>
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-label">절감액</span>
                  <span className="stat-value">{formatBillion(comp.total_saving)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">수요기업</span>
                  <span className="stat-value">{comp.demand_companies.length}개</span>
                </div>
                {comp.budget ? (
                  <div className="stat">
                    <span className="stat-label">사업비</span>
                    <span className="stat-value">{comp.budget}백만</span>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
