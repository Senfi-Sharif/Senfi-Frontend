import React from 'react';
import { FaVoteYea, FaEye } from 'react-icons/fa';
import { sanitizeHTML } from '../utils/security';

interface VotedPollListItemProps {
  poll: {
    id: number;
    title: string;
    description: string;
    category: string;
    is_multiple_choice: boolean;
    max_choices: number;
    is_anonymous: boolean;
    status: string;
    deadline: string;
    created_at: string;
    total_votes: number;
    options: Array<{
      id: number;
      text: string;
      votes_count: number;
    }>;
    user_vote: Array<{
      option_id: number;
      option_text: string;
      voted_at: string;
    }> | null;
  };
}

const VotedPollListItem: React.FC<VotedPollListItemProps> = ({ poll }) => {
  const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
  const isClosed = poll.status === 'closed' || isExpired;

  return (
    <article className="blog-enhanced-post voted-poll-item">
      {isExpired && (
        <div style={{ 
          background: '#cfa7a7', 
          color: '#a11d1d', 
          textAlign: 'center', 
          fontWeight: 500, 
          fontSize: '1.15em', 
          padding: '12px 0', 
          borderRadius: '40px 40px 40px 40px' 
        }}>
          این نظرسنجی به پایان رسیده است
        </div>
      )}
      
      <div className="sign-campaign-success" style={{ 
        margin: '1rem 0 0.5rem 0', 
        color: '#16a34a', 
        background: '#e6fbe8', 
        borderRadius: 8, 
        padding: '0.7em 1em', 
        display: 'flex', 
        alignItems: 'center', 
        fontWeight: 500, 
        fontSize: '1.08em' 
      }}>
        <FaVoteYea style={{ marginLeft: 8 }} />
        شما در این نظرسنجی شرکت کرده‌اید
        {poll.user_vote && (
          <span style={{ marginRight: 8, fontSize: '0.9em', opacity: 0.8 }}>
            - رأی شما: {poll.user_vote.map(v => v.option_text).join(', ')}
          </span>
        )}
      </div>

      <h2 className="blog-enhanced-post-title">
        <a href={`/poll-detail?id=${poll.id}`} className="blog-enhanced-post-link">
          {poll.title}
        </a>
      </h2>

      <div className="blog-enhanced-post-meta">
        <span>دسته‌بندی: <b style={{ color: '#1976d2' }}>{poll.category}</b></span>
        <span>تعداد گزینه‌ها: <b style={{ color: '#16a34a' }}>{poll.options ? poll.options.length : '-'}</b></span>
        <span>نوع رأی: <b style={{ color: '#dc2626' }}>{poll.is_multiple_choice ? 'چندگزینه‌ای' : 'تکی'}</b></span>
        {poll.is_multiple_choice && (
          <span>حداکثر انتخاب مجاز: <b style={{ color: '#7c3aed' }}>{poll.max_choices ? (poll.max_choices === -1 ? 'نامحدود' : poll.max_choices) : 'نامحدود'}</b></span>
        )}
        <span>رأی: <b style={{ color: '#ea580c' }}>{poll.is_anonymous ? 'ناشناس' : 'شناس'}</b></span>
        {typeof poll.total_votes !== 'undefined' && (
          <span>تعداد کل رأی‌ها: <b style={{ color: '#059669' }}>{poll.total_votes}</b></span>
        )}
        <span>ددلاین: {new Date(poll.deadline).toLocaleString('fa-IR')}</span>
      </div>

      <div className="blog-enhanced-post-excerpt">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(poll.description) }} />
      </div>

      {poll.options && poll.total_votes > 0 && (
        <div style={{ margin: '18px 0 10px 0' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>نتایج فعلی:</div>
          {poll.options.map((opt) => {
            const percent = poll.total_votes > 0 ? Math.round((opt.votes_count / poll.total_votes) * 100) : 0;
            const isUserVote = poll.user_vote && poll.user_vote.some(v => v.option_id === opt.id);
            return (
              <div key={opt.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 15 }}>
                  <span style={{ 
                    fontWeight: isUserVote ? 700 : 400,
                    color: isUserVote ? '#16a34a' : 'inherit'
                  }}>
                    {opt.text}
                    {isUserVote && <span style={{ marginRight: 4 }}>✓</span>}
                  </span>
                  <span style={{ fontWeight: 700 }}>{percent}%</span>
                </div>
                <div style={{ background: '#e0e7ef', borderRadius: 8, height: 14, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: percent + '%',
                    background: percent > 0 ? (isUserVote ? '#16a34a' : 'linear-gradient(90deg, #1976d2 60%, #16a34a 100%)') : '#e0e7ef',
                    height: '100%',
                    borderRadius: 8,
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="blog-enhanced-post-footer">
        <a href={`/poll-detail?id=${poll.id}`} className="blog-enhanced-read-more">
          <FaEye style={{ marginLeft: 4 }} />
          مشاهده
        </a>
      </footer>
    </article>
  );
};

export default VotedPollListItem; 