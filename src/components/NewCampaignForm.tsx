import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import styles from '../css/campaignsStyles';

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
  const { showNotification } = useNotification();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      showNotification('لطفاً تیتر و متن را وارد کنید.', 'warning');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let email = '';
      if (typeof window !== 'undefined') {
        email = localStorage.getItem('auth_email') || '';
      }
      const res = await fetch(`${API_BASE}/api/campaigns/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description: desc, 
          ...(email ? {email} : {}),
          is_anonymous: isAnonymous ? "anonymous" : "public"
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