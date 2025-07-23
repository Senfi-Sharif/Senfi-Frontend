import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { FaNewspaper, FaSave, FaTimes, FaUser, FaTag, FaList } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RichTextEditor from '../components/RichTextEditor';

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  image_url: string;
}

export default function BlogCreate(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'اخبار',
    tags: '',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);

  // Check authentication on component mount
  useEffect(() => {
    const token = SecureTokenManager.getToken();
    const email = SecureTokenManager.getEmail();
    if (!token || !email) {
      window.location.href = '/';
      return;
    }
    const role = SecureTokenManager.getRole();
    
    if (token && email) {
      const userData = {
        email: email,
        role: role || 'user'
      };
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/campaigns/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched blog categories:', data.categories);
        setCategoryChoices(data.categories || []);
      })
      .catch(() => {
        setCategoryChoices(["مسائل دانشگاهی"]);
      });
  }, [API_BASE]);

  // مقدار اولیه category را به اولین مقدار مجاز تنظیم کن
  useEffect(() => {
    if (categoryChoices.length > 0 && !categoryChoices.includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: categoryChoices[0] }));
    }
    // eslint-disable-next-line
  }, [categoryChoices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = SecureTokenManager.getToken();
      if (!token) {
        throw new Error('توکن احراز هویت یافت نشد');
      }

      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`${API_BASE}/api/admin/blog/posts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: tagsArray.join(', '),
          image_url: formData.image_url || '',
          is_published: false // Always start as unpublished
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: 'اخبار',
          tags: '',
          image_url: ''
        });
      } else {
        // Handle detailed error messages from backend
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.join('\n'));
        } else {
          throw new Error(data.detail);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/blog-enhanced';
  };

  // دسته‌بندی‌ها را فیلتر نکن، فقط از categoryChoices استفاده کن

  if (!isAuthenticated) {
    return (
      <Layout title="ایجاد مطلب جدید">
        <div className="blog-create-page">
          <div className="container">
            <div className="blog-create-loading">
              <p>در حال بررسی احراز هویت...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="ایجاد مطلب جدید"
      description="ایجاد مطلب جدید برای بلاگ شورای صنفی"
    >
        <div className="container">
          <div className="blog-create-header">
            <h1 className="blog-create-title">
              <FaNewspaper className="blog-create-title-icon" />
              ایجاد مطلب جدید
            </h1>
            <p className="blog-create-description">
              مطلب شما پس از تایید ادمین منتشر خواهد شد
            </p>
          </div>

          <div className="blog-create-content">
            <form onSubmit={handleSubmit} className="blog-create-form">
              {/* Error and Success Messages */}
              {error && (
                <div className="blog-create-error">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="blog-create-success">
                  <p>{success}</p>
                </div>
              )}

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  عنوان مطلب *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="عنوان مطلب را وارد کنید"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  دسته‌بندی *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {categoryChoices.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div className="form-group">
                <label htmlFor="excerpt" className="form-label">
                  خلاصه مطلب *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="خلاصه کوتاهی از مطلب بنویسید"
                  maxLength={500}
                />
                <div className="form-help">
                  {formData.excerpt.length}/500 کاراکتر
                </div>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  برچسب‌ها
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="برچسب‌ها را با کاما جدا کنید (مثال: اخبار، دانشگاه، دانشجو)"
                />
                <div className="form-help">
                  برچسب‌ها را با کاما (,) از هم جدا کنید
                </div>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label htmlFor="image_url" className="form-label">
                  آدرس تصویر
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="آدرس تصویر مطلب (اختیاری)"
                />
              </div>

              {/* Content */}
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  محتوای اصلی *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="محتوای اصلی مطلب را بنویسید..."
                  height="400px"
                  className="blog-content-editor"
                />
                <div className="form-help">
                  از نوار ابزار بالا برای فرمت‌بندی متن استفاده کنید
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <FaTimes className="btn-icon" />
                  انصراف
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <FaSave className="btn-icon" />
                  {loading ? 'در حال ذخیره...' : 'ذخیره مطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </Layout>
  );
} 