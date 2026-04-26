import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { supabase, TABLES } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { KncNotification } from '../../types';

const TYPE_ICON: Record<string, string> = {
  submission: '📤',
  approved: '✅',
  revision: '🔄',
  rejected: '❌',
  system: '🔔',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<KncNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from(TABLES.notifications)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // 30초마다 갱신
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    if (!supabase) return;
    await supabase.from(TABLES.notifications).update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!supabase || !user) return;
    await supabase.from(TABLES.notifications).update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleClick = (n: KncNotification) => {
    markAsRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60_000);
    if (min < 1) return '방금';
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    return `${day}일 전`;
  };

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen(!open)} title="알림">
        <FiBell size={18} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <strong>알림</strong>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                모두 읽음
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">알림이 없습니다</div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  className={`notif-item ${n.is_read ? '' : 'notif-unread'}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="notif-type-icon">{TYPE_ICON[n.type] || '🔔'}</span>
                  <div className="notif-content">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">{formatTime(n.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
