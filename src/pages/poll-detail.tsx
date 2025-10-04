import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { SecureTokenManager } from '../utils/security';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaCheckCircle, FaTag, FaListUl, FaVoteYea, FaUserSecret, FaUsers, FaChartBar, FaEye } from 'react-icons/fa';

import { sanitizeHTML } from '../utils/security';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PollDetailPage() {
  const query = useQuery();
  const id = query.get('id');
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const { showNotification } = useNotification();
  const [poll, setPoll] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [voters, setVoters] = useState<any>(null);
  const [showVoters, setShowVoters] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const isAuthenticated = typeof window !== 'undefined' && !!SecureTokenManager.getToken();
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/polls/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setPoll(data.poll);
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('خطا در دریافت اطلاعات نظرسنجی');
        setLoading(false);
      });
  }, [id, API_BASE]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserFaculty(localStorage.getItem('faculty') || '');
      setUserDormitory(localStorage.getItem('dormitory') || '');
      setUserRole(SecureTokenManager.getRole() || '');
    }
  }, []);

  const fetchResults = () => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/polls/${id}/results`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setResults(data.results))
      .catch(() => {});
  };

  const fetchVoters = () => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/polls/${id}/voters`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVoters(data.voters);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (poll) {
      // برای نظرسنجی‌های شناس، همیشه نتایج را fetch کن
      // برای نظرسنجی‌های ناشناس، فقط اگر رأی داده یا ددلاین گذشته باشد
      if (!poll.is_anonymous || poll.has_voted || new Date(poll.deadline) < new Date()) {
        fetchResults();
      }
    }
  }, [poll]);

  const handleVote = async () => {
    setWarning('');
    if (!isAuthenticated) {
      showNotification('برای رأی دادن باید وارد شوید.', 'warning');
      return;
    }
    if (selectedOptions.length === 0) {
      showNotification('حداقل یک گزینه را انتخاب کنید.', 'warning');
      return;
    }
    setVoting(true);
    try {
      const token = SecureTokenManager.getToken();
      const res = await fetch(`${API_BASE}/polls/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ option_ids: selectedOptions })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('رأی شما ثبت شد.', 'success');
        fetchResults();
        setPoll({ ...poll, has_voted: true });
      } else {
        showNotification(data.detail || 'خطا در رأی‌گیری', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'خطا در ارتباط با سرور', 'error');
    } finally {
      setVoting(false);
    }
  };

  // --- max_choices logic ---
  const maxChoices = poll?.is_multiple_choice ? (poll.max_choices && poll.max_choices > 0 ? poll.max_choices : null) : 1;
  const canSelectMore = !maxChoices || selectedOptions.length < maxChoices;

  // --- CSS styles ---
  const cardStyle = {
    maxWidth: 600,
    margin: '40px auto',
    padding: 32,
    background: 'var(--ifm-color-primary-lightest)',
    borderRadius: 16,
    boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
    border: '1.5px solid var(--ifm-color-emphasis-200, #2a2d3a)',
    position: 'relative' as const,
    color: 'var(--ifm-font-color-base, #fff)',
    transition: 'background 0.2s, color 0.2s',
  };
  const infoBoxStyle = {
    background: 'var(--ifm-color-primary-lightest, #f7fafd)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    fontSize: 15,
    color: 'var(--ifm-font-color-base, #222)',
    border: '1px solid var(--ifm-color-emphasis-200, #e3e3e3)',
    transition: 'background 0.2s, color 0.2s',
  };

  if (loading) return <Layout><div style={{ padding: 32 }}>در حال بارگذاری...</div></Layout>;
  if (error) return <Layout><div style={{ padding: 32 }}>{error}</div></Layout>;
  if (!poll) return <Layout><div style={{ padding: 32 }}>نظرسنجی پیدا نشد.</div></Layout>;

  const isExpired = new Date(poll.deadline) < new Date();
  const canVote = isAuthenticated && !poll.has_voted && !isExpired && poll.status === 'approved';

  return (
    <Layout>
      <div className="poll-detail-page" style={cardStyle}>
        {/* Status indicator for pending/rejected polls */}
        {poll.status === 'pending' && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '1.15em',
            padding: '12px 0',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            ⏳ این نظرسنجی در انتظار تایید ادمین است
          </div>
        )}
        {poll.status === 'rejected' && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '1.15em',
            padding: '12px 0',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ این نظرسنجی رد شده است
          </div>
        )}
        <h1 style={{ textAlign: 'center', marginBottom: 18, color: 'var(--ifm-font-color-base, #fff)' }}>{poll.title}</h1>
        {poll.has_voted && (
          <div style={{
            margin: '1rem 0 0.5rem 0',
            color: '#16a34a',
            background: '#e6fbe8',
            borderRadius: 8,
            padding: '0.7em 1em',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
            fontSize: '1.08em',
            justifyContent: 'center'
          }}>
            <FaCheckCircle style={{ marginLeft: 8 }} />
            شما در این نظرسنجی شرکت کرده‌اید
          </div>
        )}
        {userRole === 'simple_user' && (
          <div style={{ margin: '12px 0', fontSize: 15, color: '#555' }}>
            {userFaculty && userFaculty !== 'نامشخص' && (
              <span style={{ marginLeft: 12 }}>دانشکده کاربر: <b>{userFaculty}</b></span>
            )}
            {userDormitory && userDormitory !== 'خوابگاهی نیستم' && (
              <span>خوابگاه کاربر: <b>{userDormitory}</b></span>
            )}
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(poll.description) }} />
        </div>
        <div style={{
          background: 'var(--ifm-color-primary-lightest, #f7fafd)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          fontSize: 15,
          color: 'var(--ifm-font-color-base, #222)',
          border: '1px solid var(--ifm-color-emphasis-200, #e3e3e3)',
          transition: 'background 0.2s, color 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <FaTag style={{ marginLeft: 8, color: '#1976d2' }} />
            <span>دسته‌بندی: <b style={{ color: '#1976d2' }}>{poll.category}</b></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <FaVoteYea style={{ marginLeft: 8, color: '#dc2626' }} />
            <span>نوع رأی: <b style={{ color: '#dc2626' }}>{poll.is_multiple_choice ? 'چندگزینه‌ای' : 'تکی'}</b></span>
          </div>
          {poll.is_multiple_choice && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <FaChartBar style={{ marginLeft: 8, color: '#7c3aed' }} />
              <span>حداکثر انتخاب مجاز: <b style={{ color: '#7c3aed' }}>{poll.max_choices ? (poll.max_choices === -1 ? 'نامحدود' : poll.max_choices) : 'نامحدود'}</b></span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <FaUserSecret style={{ marginLeft: 8, color: '#ea580c' }} />
            <span>رأی: <b style={{ color: '#ea580c' }}>{poll.is_anonymous ? 'ناشناس' : 'شناس'}</b></span>
          </div>
          {typeof poll.total_votes !== 'undefined' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaUsers style={{ marginLeft: 8, color: '#059669' }} />
              <span>تعداد کل رأی‌ها: <b style={{ color: '#059669' }}>{poll.total_votes}</b></span>
            </div>
          )}
        </div>
        <p style={{ color: 'var(--ifm-font-color-base, #ccc)', marginBottom: 8 }}>ددلاین: {new Date(poll.deadline).toLocaleString('fa-IR')}</p>
        {poll.image_url && <img src={poll.image_url} alt="poll" style={{ maxWidth: '100%', margin: '16px 0', borderRadius: 8, background: '#222' }} />}
        {/* نمایش نتایج برای نظرسنجی‌های شناس یا وقتی رأی داده/ددلاین گذشته */}
        {((!poll.is_anonymous && results) || (poll.has_voted && results) || (isExpired && results)) ? (
          <div style={{ marginTop: 24 }}>
            <h3>نتایج:</h3>
            <div style={{ maxWidth: 480 }}>
              {results.options.map((opt: any) => {
                const percent = results.total_votes ? Math.round(100 * opt.votes_count / results.total_votes) : 0;
                return (
                  <div key={opt.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 15 }}>
                      <span>{opt.text}</span>
                      <span style={{ fontWeight: 700 }}>{percent}% <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>({opt.votes_count} رأی)</span></span>
                    </div>
                    <div style={{ background: '#e0e7ef', borderRadius: 8, height: 14, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: percent + '%',
                        background: percent > 0 ? 'linear-gradient(90deg, #1976d2 60%, #16a34a 100%)' : '#e0e7ef',
                        height: '100%',
                        borderRadius: 8,
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ marginTop: 10, color: '#555' }}>مجموع آرا: {results.total_votes}</p>
            {/* اگر نظرسنجی شناس باشد، دکمه مشاهده لیست رأی‌دهندگان */}
            {!poll.is_anonymous && (
              <button 
                onClick={() => {
                  if (!voters) {
                    fetchVoters();
                  }
                  setShowVoters(!showVoters);
                }}
                style={{ 
                  marginTop: 16, 
                  padding: '8px 16px', 
                  fontSize: 14, 
                  borderRadius: 6, 
                  background: '#6b7280', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FaEye />
                {showVoters ? 'مخفی کردن لیست رأی‌دهندگان' : 'مشاهده لیست رأی‌دهندگان'}
              </button>
            )}
            {/* نمایش لیست رأی‌دهندگان */}
            {showVoters && voters && (
              <div style={{ 
                marginTop: 16, 
                padding: 16, 
                background: 'var(--ifm-color-primary-lightest, #f8f9fa)', 
                borderRadius: 8, 
                border: '1px solid var(--ifm-color-emphasis-200, #e9ecef)',
                color: 'var(--ifm-font-color-base, #222)'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--ifm-font-color-base, #495057)',
                  fontSize: 18,
                  fontWeight: 600
                }}>لیست رأی‌دهندگان:</h4>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {voters.map((voter: any, index: number) => (
                    <div key={index} style={{ 
                      padding: '8px 12px', 
                      marginBottom: 8, 
                      background: 'var(--ifm-background-color, #fff)', 
                      borderRadius: 6, 
                      border: '1px solid var(--ifm-color-emphasis-200, #dee2e6)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s, border 0.2s'
                    }}>
                      <span style={{ 
                        fontWeight: 500, 
                        color: 'var(--ifm-font-color-base, #495057)',
                        fontSize: 14
                      }}>{voter.user_email}</span>
                      <span style={{ 
                        color: 'var(--ifm-color-emphasis-700, #6c757d)', 
                        fontSize: 14,
                        margin: '0 12px'
                      }}>رأی: {voter.option_text}</span>
                      <span style={{ 
                        color: 'var(--ifm-color-emphasis-600, #6c757d)', 
                        fontSize: 12,
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(voter.voted_at).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // اگر هنوز رأی نداده و ددلاین نگذشته، فرم رأی‌گیری را نمایش بده
        <div>
            <h3 style={{ margin: '18px 0 10px 0', color: 'var(--ifm-font-color-base, #fff)' }}>گزینه‌ها:</h3>
          {poll.options.map((opt: any) => (
              <div key={opt.id} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 16, cursor: canVote ? 'pointer' : 'default', color: 'var(--ifm-font-color-base, #fff)' }}>
                <input
                  type={poll.is_multiple_choice ? 'checkbox' : 'radio'}
                  name="poll-option"
                  value={opt.id}
                  checked={selectedOptions.includes(opt.id)}
                    disabled={!canVote || (poll.is_multiple_choice && !selectedOptions.includes(opt.id) && !canSelectMore)}
                  onChange={e => {
                      setWarning('');
                    if (poll.is_multiple_choice) {
                        if (e.target.checked) {
                          if (maxChoices && selectedOptions.length >= maxChoices) {
                            setWarning(`حداکثر ${maxChoices} گزینه می‌توانید انتخاب کنید.`);
                            return;
                          }
                          setSelectedOptions(sel => [...sel, opt.id]);
                        } else {
                          setSelectedOptions(sel => sel.filter(x => x !== opt.id));
                        }
                    } else {
                      setSelectedOptions([opt.id]);
                    }
                  }}
                />
                {opt.text}
              </label>
            </div>
          ))}
            {warning && <div style={{ color: 'var(--ifm-color-danger, #ff5252)', margin: '8px 0' }}>{warning}</div>}
            {canVote && !poll.has_voted && <button onClick={handleVote} disabled={voting} style={{ marginTop: 12, padding: '8px 28px', fontSize: 16, borderRadius: 8, background: 'var(--ifm-color-primary, #1976d2)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>{voting ? 'در حال ارسال...' : 'ثبت رأی'}</button>}
          </div>
        )}
        {isExpired && <div style={{ marginTop: 16, color: 'var(--ifm-color-danger, #ff5252)' }}>مهلت رأی دادن به پایان رسیده است</div>}
      </div>
    </Layout>
  );
} 