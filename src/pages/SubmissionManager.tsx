import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiAlertCircle, FiXCircle, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { supabase, TABLES } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createNotification, sendEmail, buildEmailHtml } from '../utils/notifications';
import type { Submission, SubmissionComment, Company } from '../types';

type StatusTab = 'all' | 'submitted' | 'approved' | 'revision' | 'rejected';

type ActionType = 'approved' | 'revision' | 'rejected';

const STATUS_LABELS: Record<Submission['status'], string> = {
  submitted: '검토대기',
  approved: '승인',
  revision: '보완요청',
  rejected: '반려',
};

const STATUS_COLORS: Record<Submission['status'], string> = {
  submitted: '#F59E0B',
  approved: '#059669',
  revision: '#2563EB',
  rejected: '#DC2626',
};

const TAB_LIST: { key: StatusTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'submitted', label: '제출완료' },
  { key: 'approved', label: '승인' },
  { key: 'revision', label: '보완요청' },
  { key: 'rejected', label: '반려' },
];

interface SubmissionWithCompany extends Submission {
  company_name: string;
  company_no: number;
}

export default function SubmissionManager() {
  const { user, profile } = useAuth();

  const [submissions, setSubmissions] = useState<SubmissionWithCompany[]>([]);
  const [, setCompanies] = useState<Company[]>([]);
  const [comments, setComments] = useState<Record<string, SubmissionComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>('all');

  // 액션 모달 상태
  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [actionSaving, setActionSaving] = useState(false);

  // 코멘트 펼침 상태
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [subRes, compRes] = await Promise.all([
        supabase
          .from(TABLES.submissions)
          .select('*')
          .order('submitted_at', { ascending: false }),
        supabase
          .from(TABLES.companies)
          .select('*')
          .order('company_no'),
      ]);

      const comps: Company[] = compRes.data || [];
      setCompanies(comps);

      const compMap = new Map(comps.map(c => [c.id, c]));
      const subs: SubmissionWithCompany[] = (subRes.data || []).map((s: Submission) => {
        const comp = compMap.get(s.company_id);
        return {
          ...s,
          company_name: comp?.company_name || '(알 수 없음)',
          company_no: comp?.company_no || 0,
        };
      });
      setSubmissions(subs);

      // 모든 제출건에 대한 코멘트 일괄 조회
      if (subs.length > 0) {
        const subIds = subs.map(s => s.id);
        const { data: allComments } = await supabase
          .from(TABLES.submission_comments)
          .select('*')
          .in('submission_id', subIds)
          .order('created_at', { ascending: true });

        const grouped: Record<string, SubmissionComment[]> = {};
        (allComments || []).forEach((c: SubmissionComment) => {
          if (!grouped[c.submission_id]) grouped[c.submission_id] = [];
          grouped[c.submission_id].push(c);
        });
        setComments(grouped);
      }
    } catch (err) {
      console.error('제출 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = tab === 'all'
    ? submissions
    : submissions.filter(s => s.status === tab);

  const tabCounts: Record<StatusTab, number> = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    revision: submissions.filter(s => s.status === 'revision').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const openAction = (submissionId: string, type: ActionType) => {
    setActionTarget(submissionId);
    setActionType(type);
    setActionComment('');
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
    setActionComment('');
  };

  const submitAction = async () => {
    if (!supabase || !actionTarget || !actionType || !user) return;

    // 보완요청/반려는 코멘트 필수
    if ((actionType === 'revision' || actionType === 'rejected') && !actionComment.trim()) {
      alert('보완요청 또는 반려 시 사유를 입력해야 합니다.');
      return;
    }

    setActionSaving(true);
    try {
      // 1. 제출 상태 업데이트
      const { error: updateErr } = await supabase
        .from(TABLES.submissions)
        .update({
          status: actionType,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', actionTarget);

      if (updateErr) {
        console.error('상태 업데이트 실패:', updateErr);
        alert('상태 변경에 실패했습니다: ' + updateErr.message);
        return;
      }

      // 2. 코멘트 삽입 (있는 경우)
      if (actionComment.trim()) {
        const { error: commentErr } = await supabase
          .from(TABLES.submission_comments)
          .insert({
            submission_id: actionTarget,
            user_id: user.id,
            user_name: profile?.display_name || profile?.email || '관리자',
            comment: actionComment.trim(),
          });

        if (commentErr) {
          console.error('코멘트 저장 실패:', commentErr);
        }
      }

      // 3. 제출자에게 인앱 알림 + 이메일
      const sub = submissions.find(s => s.id === actionTarget);
      if (sub) {
        const typeLabel = actionType === 'approved' ? '승인' : actionType === 'revision' ? '보완요청' : '반려';
        createNotification({
          userId: sub.submitted_by,
          type: actionType,
          title: `실적 ${typeLabel}`,
          message: `${sub.company_name} — ${sub.month} 제출건이 ${typeLabel} 처리되었습니다.`,
          link: `/companies/${sub.company_id}`,
        });

        // 제출자 이메일 조회 후 이메일 발송
        if (supabase) {
          const { data: submitter } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', sub.submitted_by)
            .single();
          if (submitter?.email) {
            const commentText = actionComment.trim() ? `<p style="margin-top:12px;padding:12px;background:#f5f5f5;border-radius:6px;"><strong>코멘트:</strong> ${actionComment.trim()}</p>` : '';
            sendEmail({
              to: submitter.email,
              subject: `[산업안전 RBF] ${sub.company_name} ${sub.month} 실적 ${typeLabel}`,
              html: buildEmailHtml({
                title: `실적 ${typeLabel} 알림`,
                body: `
                  <p><strong>${sub.company_name}</strong>의 <strong>${sub.month}</strong> 제출건이 <strong>${typeLabel}</strong> 처리되었습니다.</p>
                  ${commentText}
                  <p style="margin-top:20px;">
                    <a href="https://knc.dreamitbiz.com/companies/${sub.company_id}"
                       style="display:inline-block;padding:10px 24px;background:#0F2B5B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                      기업 페이지 바로가기
                    </a>
                  </p>`,
              }),
            });
          }
        }
      }

      closeAction();
      fetchData();
    } catch (err) {
      console.error('처리 실패:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setActionSaving(false);
    }
  };

  const toggleComments = (submissionId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(submissionId)) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>제출 관리</h1>
        <p>기업 월별 실적 제출 검토 및 승인 관리</p>
      </div>

      {/* 탭 필터 */}
      <div className="submission-tabs">
        {TAB_LIST.map(t => (
          <button
            key={t.key}
            className={`filter-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="tab-count">{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* 제출 목록 */}
      {filtered.length === 0 ? (
        <div className="submission-empty">
          <p>해당 상태의 제출건이 없습니다.</p>
        </div>
      ) : (
        <div className="submission-list">
          {filtered.map(sub => {
            const subComments = comments[sub.id] || [];
            const isExpanded = expandedComments.has(sub.id);
            const isActionOpen = actionTarget === sub.id;

            return (
              <div key={sub.id} className="submission-card">
                <div className="submission-card-header">
                  <div className="submission-card-info">
                    <h3 className="submission-company-name">
                      {sub.company_no}. {sub.company_name}
                    </h3>
                    <div className="submission-meta">
                      <span className="submission-month">{sub.month}</span>
                      <span className="submission-date">
                        제출일: {formatDate(sub.submitted_at)}
                      </span>
                    </div>
                  </div>

                  <div className="submission-card-actions">
                    <span
                      className="submission-status"
                      style={{
                        backgroundColor: STATUS_COLORS[sub.status] + '18',
                        color: STATUS_COLORS[sub.status],
                        borderColor: STATUS_COLORS[sub.status] + '40',
                      }}
                    >
                      {STATUS_LABELS[sub.status]}
                    </span>

                    {/* 액션 버튼: submitted 상태일 때만 승인/보완/반려 */}
                    {sub.status === 'submitted' && (
                      <div className="submission-action-btns">
                        <button
                          className="btn-action btn-approve"
                          onClick={() => openAction(sub.id, 'approved')}
                          title="승인"
                        >
                          <FiCheck size={14} /> 승인
                        </button>
                        <button
                          className="btn-action btn-revision"
                          onClick={() => openAction(sub.id, 'revision')}
                          title="보완요청"
                        >
                          <FiAlertCircle size={14} /> 보완요청
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => openAction(sub.id, 'rejected')}
                          title="반려"
                        >
                          <FiXCircle size={14} /> 반려
                        </button>
                      </div>
                    )}

                    {/* 코멘트 토글 */}
                    <button
                      className="btn-icon btn-comment-toggle"
                      onClick={() => toggleComments(sub.id)}
                      title="코멘트 보기"
                    >
                      <FiMessageSquare size={14} />
                      {subComments.length > 0 && (
                        <span className="comment-count">{subComments.length}</span>
                      )}
                      {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* 심사 정보 (reviewed) */}
                {sub.reviewed_at && (
                  <div className="submission-review-info">
                    심사일: {formatDateTime(sub.reviewed_at)}
                  </div>
                )}

                {/* 액션 입력 영역 */}
                {isActionOpen && actionType && (
                  <div className="submission-action-form">
                    <div className="action-form-header">
                      <strong>
                        {actionType === 'approved' && '승인 처리'}
                        {actionType === 'revision' && '보완요청 처리'}
                        {actionType === 'rejected' && '반려 처리'}
                      </strong>
                      {(actionType === 'revision' || actionType === 'rejected') && (
                        <span className="action-required">* 사유 필수</span>
                      )}
                    </div>
                    <textarea
                      className="action-comment-input"
                      placeholder={
                        actionType === 'approved'
                          ? '승인 코멘트 (선택사항)'
                          : '사유를 입력해주세요 (필수)'
                      }
                      value={actionComment}
                      onChange={e => setActionComment(e.target.value)}
                      rows={3}
                    />
                    <div className="action-form-buttons">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={closeAction}
                        disabled={actionSaving}
                      >
                        취소
                      </button>
                      <button
                        className={`btn-sm ${
                          actionType === 'approved' ? 'btn-approve' :
                          actionType === 'revision' ? 'btn-revision' :
                          'btn-reject'
                        }`}
                        onClick={submitAction}
                        disabled={actionSaving}
                      >
                        {actionSaving ? '처리 중...' : '확인'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 코멘트 히스토리 */}
                {isExpanded && (
                  <div className="submission-comments">
                    {subComments.length === 0 ? (
                      <p className="comment-empty">등록된 코멘트가 없습니다.</p>
                    ) : (
                      subComments.map(c => (
                        <div key={c.id} className="submission-comment">
                          <div className="comment-header">
                            <span className="comment-author">{c.user_name || '알 수 없음'}</span>
                            <span className="comment-date">{formatDateTime(c.created_at)}</span>
                          </div>
                          <p className="comment-body">{c.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
