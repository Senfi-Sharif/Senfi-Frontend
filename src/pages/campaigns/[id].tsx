import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import { FaCalendar, FaUser, FaTag, FaArrowRight } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

import { sanitizeHTML } from '../../utils/security';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const { siteConfig } = useDocusaurusContext();
const API_BASE = siteConfig.customFields.apiUrl;

interface Campaign {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  image_url: string;
  created_at: string;
  deadline: string;
  author_email: string;
  status: string;
}

export default function CampaignDetailDynamic() {
  // گرفتن id از URL
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const id = urlParams.get('id') || location.pathname.split('/').pop();
  const history = useHistory();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/campaigns/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('کارزار مورد نظر یافت نشد');
          throw new Error('خطا در بارگذاری کارزار');
        }
        const data = await response.json();
        setCampaign(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری کارزار');
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id]);

  const formatDate = (dateString: string) => {
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
    history.push('/campaigns');
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
                {campaign.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
        </div>
      </div>
    </Layout>
  );
} 