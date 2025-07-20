import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import { FaCalendar, FaClock, FaUser, FaTag, FaArrowRight } from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  published_at: string;
  reading_time: number;
  author_email: string;
}

export default function BlogPostDetail(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const location = useLocation();
  
  // Extract slug from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const slug = urlParams.get('slug') || location.pathname.split('/').pop();
  
  // Debug logging
  console.log('Location pathname:', location.pathname);
  console.log('URL search:', location.search);
  console.log('Extracted slug:', slug);
  console.log('API_BASE:', API_BASE);
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE}/api/blog/posts/${slug}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('مطلب مورد نظر یافت نشد');
          }
          throw new Error('خطا در بارگذاری مطلب');
        }
        
        const postData = await response.json();
        console.log('Post data:', postData);
        setPost(postData);
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری مطلب');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, API_BASE]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackToBlog = () => {
    window.location.href = '/blog-enhanced';
  };

  if (loading) {
    return (
      <Layout
        title="در حال بارگذاری..."
        description="در حال بارگذاری مطلب"
      >
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-loading">
              <div className="loading-spinner"></div>
              <p>در حال بارگذاری مطلب...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="خطا"
        description="خطا در بارگذاری مطلب"
      >
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-error">
              <h2>خطا در بارگذاری مطلب</h2>
              <p>{error}</p>
              <button onClick={handleBackToBlog} className="btn btn-primary">
                <FaArrowRight /> بازگشت به بلاگ
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout
        title="مطلب یافت نشد"
        description="مطلب مورد نظر یافت نشد"
      >
        <div className="blog-post-detail-page">
          <div className="container">
            <div className="blog-post-error">
              <h2>مطلب یافت نشد</h2>
              <p>متأسفانه مطلب مورد نظر شما یافت نشد.</p>
              <button onClick={handleBackToBlog} className="btn btn-primary">
                <FaArrowRight /> بازگشت به بلاگ
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={post.title}
      description={post.excerpt}
    >
      <div className="blog-post-detail-page">
        <div className="container">
          <div className="blog-post-header">
            <button onClick={handleBackToBlog} className="back-button">
              <FaArrowRight /> بازگشت به بلاگ
            </button>
            
            <h1 className="blog-post-title">{post.title}</h1>
            
            <div className="blog-post-meta">
              <div className="meta-item">
                <FaUser />
                <span>{post.author_email}</span>
              </div>
              <div className="meta-item">
                <FaCalendar />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              <div className="meta-item">
                <FaClock />
                <span>{post.reading_time} دقیقه مطالعه</span>
              </div>
              <div className="meta-item">
                <FaTag />
                <span>{post.category}</span>
              </div>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="blog-post-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="blog-post-content">
            <div 
              className="content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 