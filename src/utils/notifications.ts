/**
 * KNC 알림 유틸리티
 * - 인앱 알림 (knc_notifications 테이블)
 * - 이메일 (Supabase Edge Function → Resend API)
 * - SMS (Supabase Edge Function → icode TCP)
 */
import { supabase, TABLES } from './supabase';
import type { NotificationType } from '../types';

// ── 인앱 알림 ─────────────────────────────────────────────────

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
    console.error('일괄 알림 생성 실패:', err);
  }
}

// ── 이메일 발송 ───────────────────────────────────────────────

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  type?: string;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
}

export async function sendEmail(params: EmailParams): Promise<NotificationResult> {
  if (!supabase) return { success: false, error: 'Supabase 초기화 실패' };
  try {
    const { data, error } = await supabase.functions.invoke('send-email', { body: params });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[notifications] sendEmail 오류:', msg);
    return { success: false, error: msg };
  }
}

// ── SMS 발송 ──────────────────────────────────────────────────

export interface SMSParams {
  receiver: string;
  message: string;
}

export async function sendSMS(params: SMSParams): Promise<NotificationResult> {
  if (!supabase) return { success: false, error: 'Supabase 초기화 실패' };
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', { body: params });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    if (!data?.success) throw new Error(data?.message || 'SMS 발송 실패');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[notifications] sendSMS 오류:', msg);
    return { success: false, error: msg };
  }
}

// ── 이메일 + SMS 동시 발송 ────────────────────────────────────

export async function sendBoth(params: {
  email: EmailParams;
  sms: SMSParams;
}): Promise<{ email: NotificationResult; sms: NotificationResult }> {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendEmail(params.email),
    sendSMS(params.sms),
  ]);
  return {
    email: emailResult.status === 'fulfilled'
      ? emailResult.value
      : { success: false, error: emailResult.reason?.message },
    sms: smsResult.status === 'fulfilled'
      ? smsResult.value
      : { success: false, error: smsResult.reason?.message },
  };
}

// ── 이메일 HTML 템플릿 ────────────────────────────────────────

export function buildEmailHtml(params: {
  title: string;
  body: string;
}): string {
  const { title, body } = params;
  const siteName = '산업안전 RBF';
  const siteUrl = 'https://knc.dreamitbiz.com';
  const primaryColor = '#0F2B5B';

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:${primaryColor};padding:24px 32px;">
          <a href="${siteUrl}" style="color:#fff;font-size:20px;font-weight:700;text-decoration:none;">2026 ${siteName}</a>
        </td></tr>
        <tr><td style="padding:32px;color:#333;font-size:15px;line-height:1.7;">
          <h2 style="margin:0 0 20px;font-size:18px;color:#111;">${title}</h2>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
          본 메일은 발신 전용입니다. 문의: <a href="mailto:admin@dreamitbiz.com" style="color:${primaryColor};">admin@dreamitbiz.com</a><br>
          &copy; ${new Date().getFullYear()} DreamIT. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 관리자 이메일/SMS 일괄 알림 ───────────────────────────────

interface AdminInfo {
  email: string;
  phone: string | null;
}

/**
 * 총괄관리자(superadmin) + 업무담당자(manager)에게 이메일+SMS 발송
 * user_profiles에서 이메일/전화번호 조회 후 발송
 */
export async function notifyAdminsEmailSMS(params: {
  subject: string;
  htmlBody: string;
  smsMessage: string;
}) {
  if (!supabase) return;
  try {
    // 관리자 user_id 목록
    const { data: roles } = await supabase
      .from(TABLES.user_roles)
      .select('user_id')
      .in('role', ['superadmin', 'manager']);
    if (!roles || roles.length === 0) return;

    const userIds = roles.map((r: { user_id: string }) => r.user_id);

    // user_profiles에서 이메일/전화번호 조회
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email, phone')
      .in('id', userIds);
    if (!profiles) return;

    const admins: AdminInfo[] = profiles.map((p: { email: string; phone: string | null }) => ({
      email: p.email,
      phone: p.phone,
    }));

    const html = buildEmailHtml({ title: params.subject, body: params.htmlBody });

    // 이메일 발송 (모든 관리자)
    const emailPromises = admins
      .filter(a => a.email)
      .map(a => sendEmail({ to: a.email, subject: params.subject, html }));

    // SMS 발송 (전화번호 있는 관리자만)
    const smsPromises = admins
      .filter(a => a.phone)
      .map(a => sendSMS({ receiver: a.phone!, message: params.smsMessage }));

    await Promise.allSettled([...emailPromises, ...smsPromises]);
  } catch (err) {
    console.error('관리자 이메일/SMS 발송 실패:', err);
  }
}
