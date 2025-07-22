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

const FACULTY_CHOICES = [
  "فیزیک", "صنایع", "کامپیوتر", "برق", "عمران", "مواد", "مهندسی شیمی و نفت", "ریاضی", "هوافضا", "انرژی", "مدیریت و اقتصاد", "شیمی", "مکانیک"
];
const DORMITORY_CHOICES = [
  "احمدی روشن", "طرشت ۲", "طرشت ۳"
];
let userRole = SecureTokenManager.getRole() || '';
let userFaculty = '';
let userDormitory = '';
if (typeof window !== 'undefined') {
  userFaculty = localStorage.getItem('faculty') || '';
  userDormitory = localStorage.getItem('dormitory') || '';
}

export default function CampaignCreatePage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [categoryChoices, setCategoryChoices] = useState<string[]>(["مسائل دانشگاهی"]);
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
      <div className="campaign-create-page" style={campaignCreatePageStyles.container}>
        <h1>ایجاد کارزار جدید</h1>
        <form onSubmit={handleSubmit} style={campaignCreatePageStyles.form}>
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
          <div>
            <label style={campaignCreatePageStyles.label}>دسته‌بندی:</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={campaignCreatePageStyles.select}>
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
          <div>
            <label style={campaignCreatePageStyles.label}>نوع امضا:</label>
            <div style={campaignCreatePageStyles.radioGroup}>
              <label style={campaignCreatePageStyles.radioLabel}>
                <input
                  type="radio"
                  name="anonymous"
                  checked={!anonymousAllowed}
                  onChange={() => setAnonymousAllowed(false)}
                />
                شناس (امضاکنندگان نمایش داده می‌شوند)
              </label>
              <label style={campaignCreatePageStyles.radioLabel}>
                <input
                  type="radio"
                  name="anonymous"
                  checked={anonymousAllowed}
                  onChange={() => setAnonymousAllowed(true)}
                />
                ناشناس (فقط تعداد امضاها نمایش داده می‌شود)
              </label>
            </div>
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