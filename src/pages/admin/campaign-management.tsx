import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes, FaCheck, FaBan } from 'react-icons/fa';
import RichTextEditor from '../../components/RichTextEditor';
import { SecureTokenManager } from '../../utils/security';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import moment from 'moment';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import AdminSidebar from '../../components/AdminSidebar';

interface Campaign {
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
  updated_at: string;
  published_at: string | null;
  deadline: string;
  author_email: string;
  status: string;
  anonymous_allowed: boolean;
}

interface CampaignFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  category: string;
  image_url: string;
  deadline: any;
  anonymous_allowed: boolean;
}

export default function CampaignManagement(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    category: 'عمومی',
    image_url: '',
    deadline: null,
    anonymous_allowed: true
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  // اضافه کردن state برای دسته‌بندی‌ها
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    if (token) {
      setUserToken(token);
      checkUserRole(token);
    }
  }, []);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/campaigns/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setCategoryChoices(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(() => {
        setCategoryChoices(["مسائل دانشگاهی"]);
        setCategoriesLoading(false);
      });
  }, [API_BASE]);

  const checkUserRole = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(['superadmin', 'head', 'center_member', 'dorm_member', 'faculty_member'].includes(userData.role));
      }
    } catch {}
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/campaigns`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری کارزارها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && isAdmin) fetchCampaigns();
  }, [userToken, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const generateSlug = (title: string) => {
    let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    slug = slug.replace(/[^a-z0-9\-_]/g, '');
    if (!slug) slug = 'campaign-' + Date.now();
    return slug;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) { setError('لطفاً ابتدا وارد شوید'); return; }
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(', '),
        deadline: formData.deadline ? moment(formData.deadline?.toDate ? formData.deadline.toDate() : formData.deadline).toISOString() : '',
      };
      const url = editingCampaign
        ? `${API_BASE}/api/campaigns/${editingCampaign.id}`
        : `${API_BASE}/api/campaigns/submit`;
      const method = editingCampaign ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('خطا در ذخیره کارزار');
      setFormData({
        title: '', slug: '', content: '', excerpt: '', tags: '', category: 'عمومی', image_url: '', deadline: null, anonymous_allowed: true
      });
      setShowForm(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      setError('خطا در ذخیره کارزار');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      slug: campaign.slug,
      content: campaign.content,
      excerpt: campaign.excerpt,
      tags: (campaign.tags || []).join(', '),
      category: campaign.category,
      image_url: campaign.image_url,
      deadline: campaign.deadline ? moment(campaign.deadline) : null,
      anonymous_allowed: campaign.anonymous_allowed
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کارزار را حذف کنید؟')) return;
    try {
      const response = await fetch(`${API_BASE}/api/campaigns/${id}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (!response.ok) throw new Error('خطا در حذف کارزار');
      fetchCampaigns();
    } catch (err) {
      setError('خطا در حذف کارزار');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      const response = await fetch(`${API_BASE}/api/campaigns/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('خطا در تغییر وضعیت کارزار');
      await fetchCampaigns();
    } catch (err) {
      setError('خطا در تغییر وضعیت کارزار');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  if (!userToken) {
    return (
      <Layout title="مدیریت کارزارها" description="مدیریت کارزارها">
          <div className="container">
            <div className="auth-required">
              <h2>نیاز به ورود</h2>
              <p>لطفاً ابتدا وارد شوید تا بتوانید کارزارها را مدیریت کنید.</p>
            </div>
          </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="مدیریت کارزارها" description="مدیریت کارزارها">
          <div className="container">
            <div className="access-denied">
              <h2>دسترسی محدود</h2>
              <p>فقط ادمین یا عضو دانشکده/خوابگاه می‌تواند کارزارها را مدیریت کند.</p>
            </div>
          </div>
      </Layout>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar current="campaign" />
      <div style={{ flex: 1 }}>
    <Layout title="مدیریت کارزارها" description="مدیریت کارزارها">
        <div className="container">
          <div className="blog-management-header">
            <h1>مدیریت کارزارها</h1>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Campaign Form */}
          {showForm && (
            <div className="blog-form-overlay">
              <div className="blog-form">
                <div className="form-header">
                  <h2>{editingCampaign ? 'ویرایش کارزار' : 'کارزار جدید'}</h2>
                  <button onClick={() => setShowForm(false)} className="close-button">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">عنوان *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="slug">نامک</label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="content">متن کامل *</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="متن کامل کارزار را بنویسید..."
                      height="300px"
                      className="blog-management-editor"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="excerpt">خلاصه</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">دسته‌بندی</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        {categoryChoices.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="deadline">ددلاین</label>
                      <DatePicker
                        value={formData.deadline ? moment(formData.deadline).toDate() : null}
                        onChange={date => setFormData(prev => ({ ...prev, deadline: date }))}
                        calendar={persian}
                        locale={persian_fa}
                        format="YYYY/MM/DD HH:mm"
                        calendarPosition="bottom-right"
                        editable={false}
                        disableDayPicker={false}
                        className="new-campaign-date-picker"
                        plugins={[<TimePicker position="bottom" hideSeconds />]}
                        showOtherDays
                        disableMonthPicker={false}
                        disableYearPicker={false}
                        inputClass="custom-date-input"
                        placeholder="انتخاب تاریخ و ساعت..."
                        minDate={new Date()}
                        required
                        portal
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="مثال: رفاهی، آموزشی، خوابگاه"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image_url">آدرس تصویر</label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label>نوع امضا:</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="radio"
                          name="anonymous_allowed"
                          value="true"
                          checked={formData.anonymous_allowed === true}
                          onChange={() => setFormData(prev => ({ ...prev, anonymous_allowed: true }))}
                        />
                        ناشناس مجاز
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="radio"
                          name="anonymous_allowed"
                          value="false"
                          checked={formData.anonymous_allowed === false}
                          onChange={() => setFormData(prev => ({ ...prev, anonymous_allowed: false }))}
                        />
                        فقط شناس
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      <FaSave />
                      {editingCampaign ? 'به‌روزرسانی' : 'ذخیره'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="cancel-button"
                    >
                      <FaTimes />
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Campaigns List */}
          {loading ? (
            <div className="loading">
              <p>در حال بارگذاری...</p>
            </div>
          ) : (
            <div className="blog-posts-list">
              {campaigns.length === 0 ? (
                <div className="empty-state">
                  <p>هیچ کارزاری یافت نشد.</p>
                </div>
              ) : (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="blog-post-item">
                    <div className="post-info">
                      <h3>{campaign.title}</h3>
                      <div className="post-meta">
                        <span className="post-date">{formatDate(campaign.created_at)}</span>
                        <span className="post-author">{campaign.author_email}</span>
                        <span className="post-category">{campaign.category}</span>
                        <span className={`post-status ${campaign.status}`}>{campaign.status === 'approved' ? 'تایید شده' : campaign.status === 'pending' ? 'در انتظار تایید' : 'رد شده'}</span>
                      </div>
                    </div>
                    <div className="post-actions">
                      <button
                        onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                        className={campaign.status === 'approved' ? 'publish-button' : 'unpublish-button'}
                        title={campaign.status === 'approved' ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        {campaign.status === 'approved' ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="edit-button"
                        title="ویرایش"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="delete-button"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </Layout>
      </div>
    </div>
  );
} 