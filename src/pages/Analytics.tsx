import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useCompanyData, formatBillion, getActivitySaving } from '../hooks/useCompanyData';
import { ACTIVITY_TYPE_LABELS } from '../data/referenceData';
import type { SolutionType, CompanyWithSavings } from '../types';

const COLORS = ['#2563EB', '#059669', '#F59E0B'];
const RADAR_COLORS = ['#2563EB', '#059669', '#F59E0B', '#7C3AED', '#DC2626'];

type AnalyticsMode = 'company' | 'type';

const formatAxis = (value: number) => {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(0)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  return String(value);
};

const formatTooltip = (value: number) =>
  new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';

export default function Analytics() {
  const {
    companiesWithSavings, activities, referenceData, unitPrices, loading,
  } = useCompanyData();

  const [mode, setMode] = useState<AnalyticsMode>('company');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SolutionType[]>(['공학', '보호구', '행동교정']);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 월 목록 추출
  const availableMonths = useMemo(() => {
    const months = [...new Set(activities.map(a => a.month))].filter(Boolean).sort();
    return months;
  }, [activities]);

  // 월별 필터된 활동
  const filteredActivities = useMemo(() => {
    if (!selectedMonth) return activities;
    return activities.filter(a => a.month === selectedMonth);
  }, [activities, selectedMonth]);

  // 월 필터 적용된 기업별 절감액 재계산
  const monthFilteredCompanies: CompanyWithSavings[] = useMemo(() => {
    return companiesWithSavings.map(comp => {
      const compActs = filteredActivities.filter(a => a.company_id === comp.id);
      const total = compActs.reduce((sum, act) => sum + getActivitySaving(act, referenceData, unitPrices), 0);
      return { ...comp, total_saving: total };
    });
  }, [companiesWithSavings, filteredActivities, referenceData, unitPrices]);

  // Filtered companies based on mode
  const filteredCompanies = useMemo(() => {
    if (mode === 'company') {
      if (selectedCompanyIds.length === 0) return monthFilteredCompanies;
      return monthFilteredCompanies.filter(c => selectedCompanyIds.includes(c.id));
    }
    return monthFilteredCompanies.filter(c => selectedTypes.includes(c.solution_type));
  }, [mode, selectedCompanyIds, selectedTypes, monthFilteredCompanies]);

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const toggleType = (type: SolutionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      return [...prev, type];
    });
  };

  // --- Chart 1: Bar Chart Data ---
  const barData = useMemo(() => {
    if (mode === 'company') {
      return filteredCompanies.map(comp => {
        const compActs = filteredActivities.filter(a => a.company_id === comp.id);
        let eng = 0, ppe = 0, edu = 0;
        compActs.forEach(act => {
          const saving = getActivitySaving(act, referenceData, unitPrices);
          if (act.activity_type === 'engineering') eng += saving;
          else if (act.activity_type === 'ppe') ppe += saving;
          else edu += saving;
        });
        return {
          name: comp.company_name.length > 8 ? comp.company_name.slice(0, 8) + '…' : comp.company_name,
          공학: eng, 보호구: ppe, 교육: edu,
        };
      }).sort((a, b) => (b.공학 + b.보호구 + b.교육) - (a.공학 + a.보호구 + a.교육));
    }
    // Type mode
    const typeMap: Record<string, number> = {};
    filteredCompanies.forEach(comp => {
      typeMap[comp.solution_type] = (typeMap[comp.solution_type] || 0) + comp.total_saving;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, 절감액: value }));
  }, [mode, filteredCompanies, filteredActivities, referenceData, unitPrices]);

  // --- Chart 2: Donut Pie Data ---
  const pieData = useMemo(() => {
    const companyIds = new Set(filteredCompanies.map(c => c.id));
    const filtered = filteredActivities.filter(a => companyIds.has(a.company_id));
    let eng = 0, ppe = 0, edu = 0;
    filtered.forEach(act => {
      const saving = getActivitySaving(act, referenceData, unitPrices);
      if (act.activity_type === 'engineering') eng += saving;
      else if (act.activity_type === 'ppe') ppe += saving;
      else edu += saving;
    });
    return [
      { name: ACTIVITY_TYPE_LABELS.engineering, value: eng },
      { name: ACTIVITY_TYPE_LABELS.ppe, value: ppe },
      { name: ACTIVITY_TYPE_LABELS.education, value: edu },
    ].filter(d => d.value > 0);
  }, [filteredCompanies, filteredActivities, referenceData, unitPrices]);

  // --- Chart 3: Radar Chart Data ---
  const radarData = useMemo(() => {
    if (mode === 'company' && selectedCompanyIds.length > 0) {
      const selectedComps = monthFilteredCompanies.filter(c => selectedCompanyIds.includes(c.id));
      return referenceData.map(ref => {
        const row: Record<string, string | number> = { risk: ref.risk_name };
        selectedComps.forEach(comp => {
          const compActs = filteredActivities.filter(a => a.company_id === comp.id && a.risk_no === ref.no);
          row[comp.company_name] = compActs.reduce((s, act) => s + getActivitySaving(act, referenceData, unitPrices), 0);
        });
        return row;
      });
    }
    // Type mode or no company selected: average by solution type
    const typeGroups: Record<string, string[]> = {};
    const compsToUse = mode === 'type' ? filteredCompanies : monthFilteredCompanies;
    compsToUse.forEach(comp => {
      if (!typeGroups[comp.solution_type]) typeGroups[comp.solution_type] = [];
      typeGroups[comp.solution_type].push(comp.id);
    });

    return referenceData.map(ref => {
      const row: Record<string, string | number> = { risk: ref.risk_name };
      Object.entries(typeGroups).forEach(([type, ids]) => {
        const total = ids.reduce((sum, compId) => {
          const compActs = filteredActivities.filter(a => a.company_id === compId && a.risk_no === ref.no);
          return sum + compActs.reduce((s, act) => s + getActivitySaving(act, referenceData, unitPrices), 0);
        }, 0);
        row[type] = ids.length > 0 ? total / ids.length : 0;
      });
      return row;
    });
  }, [mode, selectedCompanyIds, filteredCompanies, monthFilteredCompanies, filteredActivities, referenceData, unitPrices]);

  const radarKeys = useMemo(() => {
    if (radarData.length === 0) return [];
    return Object.keys(radarData[0]).filter(k => k !== 'risk');
  }, [radarData]);

  // --- Chart 4: Ranking ---
  const rankedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => b.total_saving - a.total_saving);
  }, [filteredCompanies]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>성과 분석</h1>
        <p>기업별 또는 솔루션 유형별로 절감 성과를 분석합니다</p>
      </div>

      {/* Filter Bar */}
      <div className="analytics-filter-bar">
        <div className="analytics-mode-toggle">
          <button
            className={`filter-btn ${mode === 'company' ? 'active' : ''}`}
            onClick={() => setMode('company')}
          >
            기업별
          </button>
          <button
            className={`filter-btn ${mode === 'type' ? 'active' : ''}`}
            onClick={() => setMode('type')}
          >
            유형별
          </button>
        </div>

        <div className="analytics-month-filter">
          <select
            className="month-filter-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="">전체 월</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {mode === 'company' ? (
          <div className="analytics-company-select">
            <div className="multi-select-wrap">
              <button
                className="multi-select-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedCompanyIds.length === 0
                  ? '기업 선택 (최대 5개)'
                  : `${selectedCompanyIds.length}개 기업 선택됨`}
                <span className="multi-select-arrow">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <div className="multi-select-dropdown">
                  {selectedCompanyIds.length > 0 && (
                    <button
                      className="multi-select-clear"
                      onClick={() => setSelectedCompanyIds([])}
                    >
                      선택 초기화
                    </button>
                  )}
                  {companiesWithSavings.map(comp => (
                    <label key={comp.id} className="multi-select-item">
                      <input
                        type="checkbox"
                        checked={selectedCompanyIds.includes(comp.id)}
                        onChange={() => toggleCompany(comp.id)}
                        disabled={!selectedCompanyIds.includes(comp.id) && selectedCompanyIds.length >= 5}
                      />
                      <span className={`badge badge-${comp.solution_type === '공학' ? 'blue' : comp.solution_type === '보호구' ? 'green' : 'amber'}`}>
                        {comp.solution_type}
                      </span>
                      {comp.company_name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedCompanyIds.length > 0 && (
              <div className="selected-tags">
                {companiesWithSavings
                  .filter(c => selectedCompanyIds.includes(c.id))
                  .map(comp => (
                    <span key={comp.id} className="selected-tag">
                      {comp.company_name}
                      <button onClick={() => toggleCompany(comp.id)}>×</button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="analytics-type-filter">
            {(['공학', '보호구', '행동교정'] as SolutionType[]).map(type => (
              <label key={type} className="type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                <span className={`badge badge-${type === '공학' ? 'blue' : type === '보호구' ? 'green' : 'amber'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* 1. Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">
            {mode === 'company' ? '기업별 절감액 비교' : '유형별 절감액 비교'}
          </h3>
          {barData.length === 0 ? (
            <div className="chart-empty">데이터가 없습니다</div>
          ) : mode === 'company' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tickFormatter={formatAxis} />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="공학" stackId="a" fill="#2563EB" />
                <Bar dataKey="보호구" stackId="a" fill="#059669" />
                <Bar dataKey="교육" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatAxis} />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="절감액" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. Donut Pie */}
        <div className="chart-card">
          <h3 className="chart-title">활동유형별 비율</h3>
          {pieData.length === 0 ? (
            <div className="chart-empty">데이터가 없습니다</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatBillion(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 3. Radar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">
            {mode === 'company' && selectedCompanyIds.length > 0
              ? '위험요인별 기업 비교'
              : '위험요인별 유형 평균'}
          </h3>
          {radarKeys.length === 0 ? (
            <div className="chart-empty">데이터가 없습니다</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="risk" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tickFormatter={formatAxis} tick={{ fontSize: 10 }} />
                {radarKeys.map((key, idx) => (
                  <Radar
                    key={key}
                    name={key}
                    dataKey={key}
                    stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend />
                <Tooltip formatter={formatTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 4. Ranking Table */}
        <div className="chart-card">
          <h3 className="chart-title">절감액 순위</h3>
          {rankedCompanies.length === 0 ? (
            <div className="chart-empty">해당 조건의 기업이 없습니다</div>
          ) : (
            <div className="analytics-rank-scroll">
              <table className="rank-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>기업명</th>
                    <th>유형</th>
                    <th>절감액</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCompanies.map((comp, idx) => (
                    <tr key={comp.id}>
                      <td className="rank-num">{idx + 1}</td>
                      <td>
                        <Link to={`/companies/${comp.id}`} className="link-text">
                          {comp.company_name}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${comp.solution_type === '공학' ? 'blue' : comp.solution_type === '보호구' ? 'green' : 'amber'}`}>
                          {comp.solution_type}
                        </span>
                      </td>
                      <td className="text-right">{formatBillion(comp.total_saving)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
