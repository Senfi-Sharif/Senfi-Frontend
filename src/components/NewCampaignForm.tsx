import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import styles from '../css/campaignsStyles';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import moment from 'moment';

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
      const res = await fetch(`${API_BASE}/api/campaigns/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description: desc, 
          ...(email ? {email} : {}),
          is_anonymous: isAnonymous ? "anonymous" : "public",
          end_datetime
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('کارزار با موفقیت ایجاد شد!', 'success');
        setTitle('');
        setDesc('');
        setIsAnonymous(false);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 3000);
      } else {
        showNotification(data.message || 'خطا در ثبت کارزار', 'error');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      showNotification('خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.newCampaignSection}>
      <button 
        onClick={() => setOpen(v => !v)} 
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
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>ایجاد کارزار جدید</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>📋 تیتر کارزار:</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                style={styles.formInput}
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
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>📄 متن کارزار:</label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                rows={5} 
                style={styles.formTextarea}
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
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>🔒 نوع کارزار:</label>
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
              <label style={styles.formLabel}>⏰ تاریخ و ساعت پایان کارزار (اجباری):</label>
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
                  minWidth: 180,
                  maxWidth: 250,
                  background: '#fff',
                  border: '1px solid var(--ifm-color-primary-lightest)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 16,
                  marginTop: 4,
                }}
                plugins={[]}
                showOtherDays
                disableMonthPicker={false}
                disableYearPicker={false}
                inputClass="custom-date-input"
                placeholder="انتخاب تاریخ و ساعت..."
                minDate={new Date()}
                required
              />
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
      )}
    </div>
  );
}

export default NewCampaignForm; 