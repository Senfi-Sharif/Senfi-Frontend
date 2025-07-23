import React, { useState } from 'react';
import Layout from '@theme/Layout';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { useNotification } from '../contexts/NotificationContext';
import { SecureTokenManager } from '../utils/security';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { campaignCreatePageStyles } from '../css/campaignsStyles';
import RichTextEditor from '../components/RichTextEditor';
import { useEffect } from 'react';

export default function PollCreatePage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const { showNotification } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [deadline, setDeadline] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [maxChoices, setMaxChoices] = useState(2);
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);
  const [category, setCategory] = useState('مسائل دانشگاهی');
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserFaculty(localStorage.getItem('faculty') || '');
      setUserDormitory(localStorage.getItem('dormitory') || '');
      setUserRole(SecureTokenManager.getRole() || '');
    }
  }, []);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => i === idx ? { text: value } : opt));
  };
  const addOption = () => setOptions(opts => [...opts, { text: '' }]);
  const removeOption = (idx: number) => setOptions(opts => opts.length > 2 ? opts.filter((_, i) => i !== idx) : opts);

  // Ensure maxChoices is always valid if options change
  useEffect(() => {
    if (isMultipleChoice) {
      if (maxChoices > options.length) {
        setMaxChoices(options.length);
      }
      if (maxChoices < 2) {
        setMaxChoices(2);
      }
    }
  }, [options.length, isMultipleChoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showNotification('عنوان و توضیحات الزامی است.', 'warning');
      return;
    }
    if (options.some(opt => !opt.text.trim()) || options.length < 2) {
      showNotification('حداقل دو گزینه معتبر وارد کنید.', 'warning');
      return;
    }
    if (!deadline) {
      showNotification('تاریخ پایان الزامی است.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const token = SecureTokenManager.getToken();
      const res = await fetch(`${API_BASE}/api/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          options,
          is_anonymous: isAnonymous,
          is_multiple_choice: isMultipleChoice,
          category,
          deadline: deadline?.toDate ? deadline.toDate().toISOString() : deadline,
          image_url: imageUrl,
          ...(isMultipleChoice ? { max_choices: maxChoices === -1 ? null : maxChoices } : {})
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('نظرسنجی با موفقیت ثبت شد و در انتظار تایید ادمین است.', 'success');
        setTitle(''); setDescription(''); setOptions([{ text: '' }, { text: '' }]); setIsAnonymous(true); setIsMultipleChoice(false); setDeadline(null); setImageUrl('');
      } else {
        showNotification(data.detail || 'خطا در ثبت نظرسنجی', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{...campaignCreatePageStyles.container, backgroundColor: 'var(--ifm-color-primary-lightest)'}}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>ایجاد نظرسنجی جدید</h1>
        <form onSubmit={handleSubmit} style={campaignCreatePageStyles.form}>
          <div>
            <label style={campaignCreatePageStyles.label}>عنوان نظرسنجی:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={255}
              style={campaignCreatePageStyles.input}
            />
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>توضیحات:</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="توضیحات نظرسنجی را بنویسید..."
              height="250px"
            />
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>گزینه‌ها:</label>
            <div>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 as const, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    required
                    maxLength={255}
                    style={{ ...campaignCreatePageStyles.input, flex: 1 }}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      style={{ ...campaignCreatePageStyles.button, background: '#e74c3c', color: '#fff', padding: '8px 12px', fontSize: 14, marginTop: 0, marginLeft: 8 }}
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                style={{ ...campaignCreatePageStyles.button, background: 'var(--ifm-color-primary-light)', color: '#222', fontSize: 15, marginTop: 0 }}
              >
                افزودن گزینه
              </button>
            </div>
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>تاریخ و ساعت پایان:</label>
            <DatePicker
              value={deadline}
              onChange={setDeadline}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD HH:mm"
              calendarPosition="bottom-right"
              plugins={[<TimePicker position="bottom" hideSeconds />]}
              minDate={new Date()}
              required
              portal
              inputClass="custom-date-input"
              placeholder="انتخاب تاریخ و ساعت..."
            />
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
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={campaignCreatePageStyles.select}
              required
            >
              {categoryChoices.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>نوع رأی:</label>
            <div style={campaignCreatePageStyles.radioGroup}>
              <label style={{...campaignCreatePageStyles.radioLabel, color: 'var(--ifm-color-primary-lightest-duplicate)'}}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  style={{ marginLeft: 4}}
                /> رأی مخفی
              </label>
              <label style={{...campaignCreatePageStyles.radioLabel, color: 'var(--ifm-color-primary-lightest-duplicate)'}}>
                <input
                  type="checkbox"
                  checked={isMultipleChoice}
                  onChange={e => setIsMultipleChoice(e.target.checked)}
                  style={{ marginLeft: 4 }}
                /> چندگزینه‌ای
              </label>
            </div>
            {isMultipleChoice && options.length > 2 && (
              <div style={{ marginTop: 12 }}>
                <label style={campaignCreatePageStyles.label}>حداکثر تعداد انتخاب مجاز:</label>
                <select
                  value={maxChoices}
                  onChange={e => setMaxChoices(Number(e.target.value))}
                  style={campaignCreatePageStyles.select}
                >
                  {Array.from({ length: options.length - 2 }, (_, i) => i + 2).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value={-1}>نامحدود</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label style={campaignCreatePageStyles.label}>آدرس تصویر (اختیاری):</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              style={campaignCreatePageStyles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={campaignCreatePageStyles.button}>
            {loading ? 'در حال ارسال...' : 'ثبت نظرسنجی'}
          </button>
        </form>
      </div>
    </Layout>
  );
} 