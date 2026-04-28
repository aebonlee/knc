import type { ReferenceData } from '../types';

// 기준데이터는 DB(knc_reference_data)에서 관리 — 하드코딩 제거
export const DEFAULT_REFERENCE_DATA: ReferenceData[] = [];

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
