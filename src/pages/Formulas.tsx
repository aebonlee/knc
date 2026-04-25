import { useState } from 'react';
import { DEFAULT_REFERENCE_DATA, ACTIVITY_TYPE_LABELS } from '../data/referenceData';
import type { ActivityType } from '../types';

const formatWon = (v: number) => new Intl.NumberFormat('ko-KR').format(Math.round(v)) + '원';

const FORMULAS = [
  {
    title: '1건당 절감단가',
    formula: '사회비용 × 유형별 가중치',
    example: '떨어짐(공학) = 37,216,793 × 0.70 = 26,051,755원',
  },
  {
    title: '수요기업 절감액',
    formula: '사회비용 × 유형별 가중치 × 활동횟수',
    example: '떨어짐(공학) 3건 = 37,216,793 × 0.70 × 3 = 78,155,265원',
  },
  {
    title: '기업 총 절감액',
    formula: 'Σ (사회비용 × 유형별 가중치 × 활동횟수)',
    example: '모든 위험요인 × 모든 활동유형의 절감액 합산',
  },
  {
    title: '달성률',
    formula: '총 절감액 ÷ 최대 성과목표(66억원) × 100',
    example: '40억원 ÷ 66억원 × 100 = 60.6%',
  },
];

const PERFORMANCE_CRITERIA = [
  { level: '최대 성과목표 달성', condition: '총 절감액 ≥ 66억원 (100%)', color: '#059669' },
  { level: '성과 달성', condition: '총 절감액 > 35억원', color: '#2563EB' },
  { level: '성과 미달', condition: '총 절감액 ≤ 35억원', color: '#DC2626' },
];

export default function Formulas() {
  const [calcRisk, setCalcRisk] = useState(1);
  const [calcType, setCalcType] = useState<ActivityType>('engineering');
  const [calcCount, setCalcCount] = useState(1);

  const ref = DEFAULT_REFERENCE_DATA.find(r => r.no === calcRisk)!;
  const weight = calcType === 'engineering' ? ref.weight_engineering
    : calcType === 'ppe' ? ref.weight_ppe : ref.weight_education;
  const unitSaving = ref.social_cost * weight;
  const totalCalc = unitSaving * calcCount;

  return (
    <div className="page formulas-page">
      <div className="page-header">
        <h1>산출기준</h1>
        <p>사회비용 절감액 산출 공식 및 기준 데이터</p>
      </div>

      {/* 위험요인별 사회비용 */}
      <section className="formula-section">
        <h2>위험요인별 사회비용</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>위험요인</th>
                <th>사회비용 (원)</th>
                <th>공학 (0.70)</th>
                <th>보호구 (0.15)</th>
                <th>교육 (0.15)</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_REFERENCE_DATA.map(r => (
                <tr key={r.no}>
                  <td>{r.no}</td>
                  <td><strong>{r.risk_name}</strong></td>
                  <td className="text-right">{formatWon(r.social_cost)}</td>
                  <td className="text-right">{formatWon(r.social_cost * r.weight_engineering)}</td>
                  <td className="text-right">{formatWon(r.social_cost * r.weight_ppe)}</td>
                  <td className="text-right">{formatWon(r.social_cost * r.weight_education)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 산출 공식 */}
      <section className="formula-section">
        <h2>산출 공식</h2>
        <div className="formula-cards">
          {FORMULAS.map(f => (
            <div key={f.title} className="formula-card">
              <h3>{f.title}</h3>
              <div className="formula-expression">{f.formula}</div>
              <p className="formula-example">{f.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 성과 판정 기준 */}
      <section className="formula-section">
        <h2>성과 판정 기준</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>판정</th>
              <th>조건</th>
            </tr>
          </thead>
          <tbody>
            {PERFORMANCE_CRITERIA.map(p => (
              <tr key={p.level}>
                <td><span style={{ color: p.color, fontWeight: 700 }}>{p.level}</span></td>
                <td>{p.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 절감액 계산기 */}
      <section className="formula-section">
        <h2>절감액 계산기</h2>
        <div className="calculator-card">
          <div className="calc-inputs">
            <div className="calc-field">
              <label>위험요인</label>
              <select value={calcRisk} onChange={e => setCalcRisk(Number(e.target.value))}>
                {DEFAULT_REFERENCE_DATA.map(r => (
                  <option key={r.no} value={r.no}>{r.no}. {r.risk_name}</option>
                ))}
              </select>
            </div>
            <div className="calc-field">
              <label>활동유형</label>
              <select value={calcType} onChange={e => setCalcType(e.target.value as ActivityType)}>
                <option value="engineering">{ACTIVITY_TYPE_LABELS.engineering}</option>
                <option value="ppe">{ACTIVITY_TYPE_LABELS.ppe}</option>
                <option value="education">{ACTIVITY_TYPE_LABELS.education}</option>
              </select>
            </div>
            <div className="calc-field">
              <label>활동횟수</label>
              <input
                type="number"
                min={0}
                value={calcCount}
                onChange={e => setCalcCount(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <div className="calc-result">
            <div className="calc-row">
              <span>사회비용</span>
              <span>{formatWon(ref.social_cost)}</span>
            </div>
            <div className="calc-row">
              <span>가중치</span>
              <span>{weight}</span>
            </div>
            <div className="calc-row">
              <span>1건당 절감단가</span>
              <span>{formatWon(unitSaving)}</span>
            </div>
            <div className="calc-row calc-total">
              <span>총 절감액 ({calcCount}건)</span>
              <span>{formatWon(totalCalc)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
