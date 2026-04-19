import type { ReferenceData } from '../types';

// 13개 위험요인 기준데이터
// 가중치: 공학적 0.70, 개인보호구 0.15, 행동교정(교육) 0.15
export const DEFAULT_REFERENCE_DATA: ReferenceData[] = [
  { id: 1, no: 1, risk_name: '떨어짐', social_cost: 37_216_793, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 2, no: 2, risk_name: '넘어짐', social_cost: 13_387_391, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 3, no: 3, risk_name: '깔림·뒤집힘', social_cost: 35_663_798, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 4, no: 4, risk_name: '부딪힘', social_cost: 24_227_840, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 5, no: 5, risk_name: '물체에 맞음', social_cost: 23_091_624, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 6, no: 6, risk_name: '무너짐', social_cost: 75_765_595, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 7, no: 7, risk_name: '끼임', social_cost: 21_532_128, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 8, no: 8, risk_name: '절단·베임·찔림', social_cost: 11_123_148, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 9, no: 9, risk_name: '화재·폭발·파열', social_cost: 98_121_824, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 10, no: 10, risk_name: '교통사고', social_cost: 25_437_247, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 11, no: 11, risk_name: '무리한 동작', social_cost: 11_158_448, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 12, no: 12, risk_name: '감전', social_cost: 61_427_885, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
  { id: 13, no: 13, risk_name: '기타', social_cost: 19_618_150, weight_engineering: 0.70, weight_ppe: 0.15, weight_education: 0.15 },
];

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  engineering: '공학·관리적',
  ppe: '개인보호구',
  education: '행동교정(교육)',
};

export const SOLUTION_TYPE_MAP: Record<string, string> = {
  '공학': 'engineering',
  '보호구': 'ppe',
  '행동교정': 'education',
};
