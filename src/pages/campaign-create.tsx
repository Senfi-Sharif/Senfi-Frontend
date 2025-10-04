import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useNotification } from '../contexts/NotificationContext';
import { useAuthApi } from '../api/auth';
import { SecureTokenManager } from '../utils/security';
import RichTextEditor from '../components/RichTextEditor';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import moment from 'moment';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { campaignCreatePageStyles } from '../css/campaignsStyles';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function CampaignCreatePage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('مسائل دانشگاهی');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState<any>(null);
  const [anonymousAllowed, setAnonymousAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const authApi = useAuthApi();

  // Add state for user info
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    const email = SecureTokenManager.getEmail();
    if (!token || !email) {
      window.location.href = '/';
      return;
    }
  }, []);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/campaigns/categories`, {
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserFaculty(localStorage.getItem('faculty') || '');
      setUserDormitory(localStorage.getItem('dormitory') || '');
      setUserRole(SecureTokenManager.getRole() || '');
    }
  }, []);

  // اگر جایی دسته‌بندی‌ها را فیلتر می‌کردی (مثلاً categoryChoices.filter(...))، حذف کن و فقط از categoryChoices استفاده کن
  // مقدار اولیه category را به اولین مقدار مجاز تنظیم کن
  useEffect(() => {
    if (categoryChoices.length > 0 && !categoryChoices.includes(category)) {
      setCategory(categoryChoices[0]);
    }
    // eslint-disable-next-line
  }, [categoryChoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showNotification('عنوان و متن کامل الزامی است.', 'warning');
      return;
    }
    if (!deadline) {
      showNotification('تاریخ پایان الزامی است.', 'warning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        title,
        content,
        description: content,
        excerpt,
        tags,
        category,
        image_url: imageUrl,
        deadline: moment(deadline?.toDate()).toISOString(),
        anonymous_allowed: anonymousAllowed,
        is_anonymous: anonymousAllowed ? 'anonymous' : 'public',
        email: SecureTokenManager.getEmail() || ''
      };
      const res = await authApi.submitCampaign(payload);
      if (res.success) {
        showNotification('کارزار با موفقیت ثبت شد و در انتظار تایید ادمین است.', 'success');
        setTitle('');
        setExcerpt('');
        setContent('');
        setTags('');
        setCategory('مسائل دانشگاهی');
        setImageUrl('');
        setDeadline(null);
        setAnonymousAllowed(true);
      } else {
        showNotification(res.detail || 'خطا در ثبت کارزار', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="campaign-create-page" style={{...campaignCreatePageStyles.container, backgroundColor: 'var(--ifm-color-primary-lightest)'}}>
        <h1>ایجاد کارزار جدید</h1>
        <form onSubmit={handleSubmit} style={campaignCreatePageStyles.form as React.CSSProperties}>
          <div>
            <label style={campaignCreatePageStyles.label}>عنوان کارزار:</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} style={campaignCreatePageStyles.input} />
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>خلاصه مطلب (اختیاری):</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)} maxLength={500} style={campaignCreatePageStyles.input} />
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>متن کامل کارزار:</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="متن کامل کارزار..." height="300px" />
          </div>
          {userRole === 'simple_user' && (
            <div style={{ marginBottom: 8, fontSize: 15, color: '#555' }}>
              {userFaculty && userFaculty !== 'نامشخص' && (
                <span style={{ marginLeft: 12 }}>دانشکده: <b>{userFaculty}</b></span>
              )}
              {userDormitory && userDormitory !== 'خوابگاهی نیستم' && (
                <span>خوابگاه: <b>{userDormitory}</b></span>
              )}
            </div>
          )}
          <div>
            <label style={campaignCreatePageStyles.label}>دسته‌بندی:</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={campaignCreatePageStyles.select} required>
              {categoryChoices.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>تاریخ و ساعت پایان کارزار:</label>
            <DatePicker
              value={deadline}
              onChange={setDeadline}
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
          <div className="column-flex">
            <label style={campaignCreatePageStyles.label}>نوع امضا:</label>
            {/* Radio group for anonymous/public */}
              <label style={campaignCreatePageStyles.radioLabel}>
                <input
                  type="radio"
                name="anonymousAllowed"
                checked={anonymousAllowed}
                onChange={() => setAnonymousAllowed(true)}
                />
              ناشناس (نام شما نمایش داده نمی‌شود)
              </label>
              <label style={campaignCreatePageStyles.radioLabel}>
                <input
                  type="radio"
                name="anonymousAllowed"
                checked={!anonymousAllowed}
                onChange={() => setAnonymousAllowed(false)}
                />
              عمومی (نام شما نمایش داده می‌شود)
              </label>
          </div>
          <button type="submit" disabled={loading} style={campaignCreatePageStyles.button}>
            {loading ? 'در حال ارسال...' : 'ثبت کارزار'}
          </button>
          {error && <div style={campaignCreatePageStyles.error}>{error}</div>}
        </form>
      </div>
    </Layout>
  );
} 