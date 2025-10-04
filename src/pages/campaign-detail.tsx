import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from 'react-router-dom';
import { useAuthApi } from '../api/auth';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaCalendar, FaUser, FaTag, FaArrowRight } from 'react-icons/fa';
import SignCampaignButtons from '../components/SignCampaignButtons';
import { SecureTokenManager } from '../utils/security';
import CampaignSignatures from '../components/CampaignSignatures';
import moment from 'moment-jalaali';

import { sanitizeHTML } from '../utils/security';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CampaignDetailPage = () => {
  const query = useQuery();
  const id = query.get('id');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const authApi = useAuthApi();
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const isAuthenticated = typeof window !== 'undefined' && !!SecureTokenManager.getToken();
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (!id) {
      setError('شناسه کارزار نامعتبر است.');
      setLoading(false);
      return;
    }
    setLoading(true);
    
    // Prepare headers with authentication if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = SecureTokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'GET',
      headers: headers
    })
      .then(res => {
        return res.json().then(data => ({ status: res.status, data }));
      })
      .then(({ status, data }) => {
        if (status === 404 || (data && data.detail && data.detail.includes('not found'))) {
          setError('کارزار پیدا نشد.');
        } else if (data && data.id) {
          setCampaign(data);
        } else {
          setError('خطا در دریافت اطلاعات کارزار');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('خطا در دریافت اطلاعات کارزار');
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    window.location.href = '/campaigns';
  };

  const toPersianDigits = (str: string) =>
    str.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 1728));
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const m = moment(dateString);
    const formatted = m.format('jYYYY/jMM/jDD [ساعت] HH:mm');
    return toPersianDigits(formatted);
  };
  const isCampaignExpired = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <Layout title="در حال بارگذاری...">
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-loading">
              <div className="loading-spinner"></div>
              <p>در حال بارگذاری کارزار...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title="خطا">
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-error">
              <h2>خطا در بارگذاری کارزار</h2>
              <p>{error}</p>
              <button onClick={handleBack} className="btn btn-primary">
                <FaArrowRight /> بازگشت به کارزارها
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (!campaign) {
    return (
      <Layout title="کارزار یافت نشد">
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-error">
              <h2>کارزار یافت نشد</h2>
              <p>متأسفانه کارزار مورد نظر شما یافت نشد.</p>
              <button onClick={handleBack} className="btn btn-primary">
                <FaArrowRight /> بازگشت به کارزارها
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout title={campaign.title} description={campaign.excerpt}>
      <div className="blog-post-detail-page">
        <div className="container">
          {/* Status indicator for pending/rejected campaigns */}
          {campaign.status === 'pending' && (
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
              ⏳ این کارزار در انتظار تایید ادمین است
            </div>
          )}
          {campaign.status === 'rejected' && (
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
              ❌ این کارزار رد شده است
            </div>
          )}
          <div className="blog-post-header">
            <button onClick={handleBack} className="back-button">
              <FaArrowRight /> بازگشت به کارزارها
            </button>
            <h1 className="blog-post-title">{campaign.title}</h1>
            <div className="blog-post-meta">
              <div className="meta-item">
                <FaUser />
                <span>{campaign.author_email}</span>
              </div>
              <div className="meta-item">
                <FaCalendar />
                <span>{formatDate(campaign.created_at)}</span>
              </div>
              <div className="meta-item">
                <FaTag />
                <span>{campaign.category}</span>
              </div>
              <div className="meta-item">
                <FaCalendar />
                <span>ددلاین: {formatDate(campaign.deadline)}</span>
              </div>
            </div>
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="blog-post-tags">
                {campaign.tags.map((tag: string, index: number) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div>
              {campaign.author_faculty && campaign.author_faculty !== 'نامشخص' && (
              <span style={{ marginLeft: 12 }}>دانشکده کاربر: <b>{campaign.author_faculty}</b></span>
              )}
              {campaign.author_dormitory && campaign.author_dormitory !== 'خوابگاهی نیستم' && (
                <span>خوابگاه کاربر: <b>{campaign.author_dormitory}</b></span>
              )}
            </div>
          </div>
          {campaign.image_url && (
            <div className="blog-post-featured-image">
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="featured-image"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="blog-post-content">
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(campaign.content) }}
            />
          </div>
          {/* نمایش لیست امضاکنندگان */}
          <div style={{ marginTop: '2.5rem' }}>
            <CampaignSignatures campaignId={campaign.id} />
          </div>
          {/* دکمه امضا زیر محتوا */}
          {isCampaignExpired(campaign.deadline) && (
            
              <div style={{
                background: '#cfa7a7',
                color: '#a11d1d',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '1.15em',
                padding: '12px 0',
                borderRadius: '16px 16px 16px 16px',
              }}>
                این کارزار به پایان رسیده است
              </div>
          )}
          {isAuthenticated && campaign.status === 'approved' && (
            <div style={{ marginTop: '2rem' }}>
              {!isCampaignExpired(campaign.deadline) && (
                <SignCampaignButtons 
                  campaignId={campaign.id} 
                  campaignIsAnonymous={campaign.anonymous_allowed ? 'anonymous' : 'public'} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetailPage; 