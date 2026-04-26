import { supabase, TABLES } from './supabase';
import type { NotificationType } from '../types';

interface NotifyParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({ userId, type, title, message, link }: NotifyParams) {
  if (!supabase) return;
  try {
    await supabase.from(TABLES.notifications).insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
    });
  } catch (err) {
    console.error('알림 생성 실패:', err);
  }
}

// 여러 사용자에게 동시 알림
export async function notifyMultiple(users: string[], params: Omit<NotifyParams, 'userId'>) {
  if (!supabase || users.length === 0) return;
  try {
    const rows = users.map(userId => ({
      user_id: userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    }));
    await supabase.from(TABLES.notifications).insert(rows);
  } catch (err) {
    console.error('일괄 알림 생�� 실패:', err);
  }
}
