import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { SecureTokenManager } from '../../utils/security';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import RichTextEditor from '../../components/RichTextEditor';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import moment from 'moment';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import AdminSidebar from '../../components/AdminSidebar';

export default function PollManagementPage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    deadline: null,
    is_anonymous: true,
    is_multiple_choice: false,
    max_choices: 2,
    image_url: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  // Add state for category, categoryChoices, options, maxChoices, and fetch logic
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);
  const [category, setCategory] = useState('مسائل دانشگاهی');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [maxChoices, setMaxChoices] = useState(2);

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
      })
      .catch(() => {
        setCategoryChoices(["مسائل دانشگاهی"]);
      });
  }, [API_BASE]);

  const checkUserRole = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.role !== 'simple_user');
      }
    } catch {}
  };

  const fetchPolls = () => {
    setLoading(true);
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/admin/polls`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPolls(data.polls || []);
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('خطا در دریافت لیست نظرسنجیها');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (userToken && isAdmin) fetchPolls();
  }, [userToken, isAdmin]);

  const handleToggleStatus = async (pollId: number, currentStatus: string) => {
    setActionLoading(true);
    const token = SecureTokenManager.getToken();
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    await fetch(`${API_BASE}/api/polls/${pollId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchPolls();
    setActionLoading(false);
  };

  const handleDelete = async (pollId: number) => {
    if (!window.confirm('آیا مطمئن هستید؟')) return;
    setActionLoading(true);
    const token = SecureTokenManager.getToken();
    await fetch(`${API_BASE}/api/polls/${pollId}/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPolls();
    setActionLoading(false);
  };

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => i === idx ? { text: value } : opt));
  };
  const addOption = () => setOptions(opts => [...opts, { text: '' }]);
  const removeOption = (idx: number) => setOptions(opts => opts.length > 2 ? opts.filter((_, i) => i !== idx) : opts);

  // Ensure maxChoices is always valid if options change
  useEffect(() => {
    if (formData.is_multiple_choice) {
      if (maxChoices > options.length) {
        setMaxChoices(options.length);
      }
      if (maxChoices < 2) {
        setMaxChoices(2);
      }
    }
  }, [options.length, formData.is_multiple_choice]);

  const handleEdit = (poll: any) => {
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description,
      deadline: poll.deadline ? moment(poll.deadline) : null,
      is_anonymous: poll.is_anonymous,
      is_multiple_choice: poll.is_multiple_choice,
      max_choices: poll.max_choices ?? 2,
      image_url: poll.image_url || '',
    });
    setCategory(poll.category || 'مسائل دانشگاهی');
    setOptions(poll.options ? poll.options.map((o: any) => ({ text: o.text })) : [{ text: '' }, { text: '' }]);
    setMaxChoices(poll.max_choices ?? 2);
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDescriptionChange = (desc: string) => {
    setFormData((prev: any) => ({ ...prev, description: desc }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = SecureTokenManager.getToken();
    const payload = {
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline ? moment(formData.deadline?.toDate ? formData.deadline.toDate() : formData.deadline).toISOString() : '',
      is_anonymous: formData.is_anonymous,
      is_multiple_choice: formData.is_multiple_choice,
      max_choices: formData.is_multiple_choice ? (maxChoices === -1 ? null : maxChoices) : null,
      image_url: formData.image_url,
      category,
      options,
    };
    const url = editingPoll ? `${API_BASE}/api/polls/${editingPoll.id}` : `${API_BASE}/api/polls`;
    const method = editingPoll ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowForm(false);
      setEditingPoll(null);
      fetchPolls();
    } else {
      setError('خطا در ذخیره نظرسنجی');
    }
    setActionLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  if (!userToken) {
    return (
      <Layout title="مدیریت نظرسنجی‌ها" description="مدیریت نظرسنجی‌ها">
          <div className="container">
            <div className="auth-required">
              <h2>نیاز به ورود</h2>
              <p>لطفاً ابتدا وارد شوید تا بتوانید نظرسنجی‌ها را مدیریت کنید.</p>
            </div>
          </div>
      </Layout>
    );
  }
  if (!isAdmin) {
    return (
      <Layout title="مدیریت نظرسنجی‌ها" description="مدیریت نظرسنجی‌ها">
          <div className="container">
            <div className="access-denied">
              <h2>دسترسی محدود</h2>
              <p>فقط ادمین یا عضو دانشکده/خوابگاه می‌تواند نظرسنجی‌ها را مدیریت کند.</p>
            </div>
          </div>
      </Layout>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar current="poll" />
      <div style={{ flex: 1 }}>
    <Layout>
        <div className="container">
          <div className="blog-management-header">
            <h1>مدیریت نظرسنجیها</h1>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError('')}></button>
            </div>
          )}

          {showForm && (
            <div className="blog-form-overlay">
              <div className="blog-form">
                <div className="form-header">
                  <h2>{editingPoll ? 'ویرایش نظرسنجی' : 'نظرسنجی جدید'}</h2>
                  <button onClick={() => setShowForm(false)} className="close-button">
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">عنوان *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">توضیحات *</label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="توضیحات نظرسنجی را بنویسید..."
                      height="200px"
                    />
                  </div>
                  <div className="form-group">
                    <label>گزینه‌ها:</label>
                    <div>
                      {options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            required
                            maxLength={255}
                            style={{ flex: 1 }}
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              style={{ background: '#e74c3c', color: '#fff', padding: '8px 12px', fontSize: 14, marginTop: 0, marginLeft: 8 }}
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        style={{ background: 'var(--ifm-color-primary-light)', color: '#222', fontSize: 15, marginTop: 0 }}
                      >
                        افزودن گزینه
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>دسته‌بندی:</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    >
                      {categoryChoices.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>تاریخ و ساعت پایان:</label>
                    <DatePicker
                      value={formData.deadline ? moment(formData.deadline).toDate() : null}
                      onChange={date => setFormData((prev: any) => ({ ...prev, deadline: date }))}
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
                  <div className="form-group">
                    <label>نوع رأی:</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="checkbox"
                          name="is_anonymous"
                          checked={formData.is_anonymous}
                          onChange={e => setFormData((prev: any) => ({ ...prev, is_anonymous: e.target.checked }))}
                        />
                        رأی مخفی
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="checkbox"
                          name="is_multiple_choice"
                          checked={formData.is_multiple_choice}
                          onChange={e => setFormData((prev: any) => ({ ...prev, is_multiple_choice: e.target.checked }))}
                        />
                        چندگزینه‌ای
                      </label>
                    </div>
                    {formData.is_multiple_choice && options.length > 2 && (
                      <div style={{ marginTop: 12 }}>
                        <label>حداکثر تعداد انتخاب مجاز:</label>
                        <select
                          value={maxChoices}
                          onChange={e => setMaxChoices(Number(e.target.value))}
                        >
                          {Array.from({ length: options.length - 2 }, (_, i) => i + 2).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                          <option value={-1}>نامحدود</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="image_url">آدرس تصویر</label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleFormChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      <FaSave />
                      {editingPoll ? 'به‌روزرسانی' : 'ذخیره'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">
                      <FaTimes />
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <p>در حال بارگذاری...</p>
            </div>
          ) : (
            <div className="blog-posts-list">
              {polls.length === 0 ? (
                <div className="empty-state">
                  <p>هیچ نظرسنجی یافت نشد.</p>
                </div>
              ) : (
                polls.map(poll => (
                  <div key={poll.id} className="blog-post-item">
                    <div className="post-info">
                      <h3>
                        <a 
                          href={`/poll-detail?id=${poll.id}`}
                          style={{ 
                            color: 'inherit', 
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {poll.title}
                        </a>
                      </h3>
                      <div className="post-meta">
                        <span className="post-date">{formatDate(poll.created_at)}</span>
                        <span className="post-category">{poll.status === 'approved' ? 'تایید شده' : poll.status === 'pending' ? 'در انتظار تایید' : poll.status === 'rejected' ? 'رد شده' : 'بسته شده'}</span>
                      </div>
                    </div>
                    <div className="post-actions">
                      <button
                        onClick={() => handleToggleStatus(poll.id, poll.status)}
                        className={poll.status === 'approved' ? 'publish-button' : 'unpublish-button'}
                        title={poll.status === 'approved' ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        {poll.status === 'approved' ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleEdit(poll)}
                        className="edit-button"
                        title="ویرایش"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(poll.id)}
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