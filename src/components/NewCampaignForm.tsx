import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import styles from '../css/campaignsStyles';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import moment from 'moment';
import { useColorMode } from '@docusaurus/theme-common';
import { useAuthApi } from '../api/auth';

const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";

function NewCampaignForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [endDate, setEndDate] = useState<any>(null);
  const { showNotification } = useNotification();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const authApi = useAuthApi();
  // Dynamic styles
  const formBg = isDark ? 'rgba(30,34,54,0.98)' : 'rgba(255,255,255,0.98)';
  const formBorder = isDark ? '1.5px solid #637eda' : '1px solid #e0e7ff';
  const inputBg = isDark ? 'rgba(36,40,60,0.98)' : '#fff';
  const inputColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  const inputBorder = isDark ? '1.5px solid #637eda' : '1.5px solid #bfcbe6';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      showNotification('لطفاً تیتر و متن را وارد کنید.', 'warning');
      return;
    }
    if (!endDate) {
      showNotification('لطفاً تاریخ و ساعت پایان را انتخاب کنید.', 'warning');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let email = '';
      if (typeof window !== 'undefined') {
        email = localStorage.getItem('auth_email') || '';
      }
      // تبدیل تاریخ جلالی به میلادی (ISO)
      const end_datetime = moment(endDate?.toDate()).format('YYYY-MM-DDTHH:mm:ss');
      const res = await authApi.submitCampaign({ 
          title, 
          description: desc, 
          ...(email ? {email} : {}),
          is_anonymous: isAnonymous ? "anonymous" : "public",
          end_datetime
        });
      if (res.success) {
        showNotification('کارزار با موفقیت ایجاد شد!', 'success');
        setTitle('');
        setDesc('');
        setIsAnonymous(false);
        setEndDate(null);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 3000);
      } else {
        showNotification(res.message || 'خطا در ثبت کارزار', 'error');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      showNotification('خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <button 
        onClick={() => {
          setOpen(v => !v);
          if (open) {
            setTitle('');
            setDesc('');
            setIsAnonymous(false);
            setEndDate(null);
            setError('');
            setSuccess(false);
          }
        }}
        style={{
          ...styles.newCampaignButton,
          ...(isHovered && styles.newCampaignButtonHover)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {open ? '✕ بستن فرم' : '📝 ایجاد کارزار جدید'}
      </button>
      {open && (
        <div style={{
          ...styles.newCampaignSection,
          background: formBg,
          border: formBorder,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          padding: 32,
          marginBottom: 32,
          color: inputColor,
        }}>
          <div style={{
            ...styles.formContainer,
            background: formBg,
            border: formBorder,
            borderRadius: 12,
            color: inputColor,
          }}>
            <h3 style={{...styles.formTitle, color: inputColor}}>ایجاد کارزار جدید</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={{...styles.formLabel, color: inputColor}}>📋 تیتر کارزار:</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  style={{
                    ...styles.formInput,
                    background: inputBg,
                    color: inputColor,
                    border: inputBorder,
                  }}
                  placeholder="مثلاً: درخواست بهبود غذای سلف" 
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--ifm-color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 51, 124, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--ifm-color-primary-lightest)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={{...styles.formLabel, color: inputColor}}> متن کارزار:</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  rows={5} 
                  style={{
                    ...styles.formTextarea,
                    background: inputBg,
                    color: inputColor,
                    border: inputBorder,
                  }}
                  placeholder="شرح کامل درخواست یا مشکل..." 
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--ifm-color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 51, 124, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--ifm-color-primary-lightest)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={{...styles.formLabel, color: inputColor}}>🔒 نوع کارزار:</label>
                <div style={styles.radioGroup}>
                  <label 
                    style={styles.radioOption}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(22, 51, 124, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <input 
                      type="radio" 
                      name="anonymous" 
                      checked={!isAnonymous} 
                      onChange={() => setIsAnonymous(false)}
                      disabled={loading}
                      style={styles.radioInput}
                    />
                    <span style={styles.radioLabel}>🌐 عمومی (امضاکنندگان نمایش داده می‌شوند)</span>
                  </label>
                  <label 
                    style={styles.radioOption}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(22, 51, 124, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <input 
                      type="radio" 
                      name="anonymous" 
                      checked={isAnonymous} 
                      onChange={() => setIsAnonymous(true)}
                      disabled={loading}
                      style={styles.radioInput}
                    />
                    <span style={styles.radioLabel}>🔒 ناشناس (فقط تعداد امضاها نمایش داده می‌شود)</span>
                  </label>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={{...styles.formLabel, color: inputColor}}>⏰ تاریخ و ساعت پایان کارزار (اجباری):</label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD HH:mm"
                  calendarPosition="bottom-right"
                  editable={false}
                  disableDayPicker={false}
                  style={{
                    ...styles.formInput,
                    direction: 'ltr',
                    fontFamily: 'inherit',
                    minWidth: 220,
                    maxWidth: 280,
                    background: '#fff',
                    border: '1px solid var(--ifm-color-primary-lightest)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 16,
                    marginTop: 4,
                  }}
                  plugins={[
                    <TimePicker position="bottom" hideSeconds />
                  ]}
                  showOtherDays
                  disableMonthPicker={false}
                  disableYearPicker={false}
                  inputClass="custom-date-input"
                  placeholder="انتخاب تاریخ و ساعت..."
                  minDate={new Date()}
                  required
                />
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--ifm-color-primary-dark)',
                  marginTop: '0.5rem',
                  opacity: 0.7
                }}>
                  💡 پس از انتخاب تاریخ، می‌توانید ساعت و دقیقه را نیز تنظیم کنید
                </div>
              </div>
              
              {error && <div style={styles.errorMessage}>⚠️ {error}</div>}
              
              <button 
                type="submit" 
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(22, 51, 124, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(22, 51, 124, 0.3)';
                  }
                }}
              >
                {loading ? '⏳ در حال ارسال...' : '📤 ارسال به نمایندگان صنف جهت بررسی'}
              </button>
              
              {success && <div style={styles.successMessage}>✅ کارزار با موفقیت ثبت شد و جهت بررسی ارسال شد.</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default NewCampaignForm; 