import React, { useState, useEffect } from 'react';
import Layout from '@theme-original/Layout';
import { NotificationProvider, useNotification } from '@site/src/contexts/NotificationContext';
import Modal from '@site/src/components/Modal';
import Header from '@site/src/components/Header';
import { useAuthApi } from '../../api/auth';

function LayoutContent(props) {
  const { showNotification } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: ایمیل، 2: رمز یا کد
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [hasAccount, setHasAccount] = useState(null); // null: هنوز بررسی نشده، true/false: نتیجه
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeAccepted, setCodeAccepted] = useState(false); // اگر کد درست بود
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const authApi = useAuthApi();

  // مقداردهی اولیه و sync با localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      const role = localStorage.getItem('role');
      setIsLoggedIn(Boolean(token));
      setUserEmail(email || '');
      setUserRole(role || '');
    }
    // sync با تغییرات localStorage (مثلاً در تب دیگر)
    const handleStorage = () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      const role = localStorage.getItem('role');
      setIsLoggedIn(Boolean(token));
      setUserEmail(email || '');
      setUserRole(role || '');
    };

    // Handle auth logout event from auth.js
    const handleAuthLogout = () => {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
      showNotification('جلسه شما منقضی شده است. به صفحه اصلی هدایت می‌شوید.', 'error');
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [showNotification]);

  // تایمر بررسی اعتبار توکن (هر 5 دقیقه)
  useEffect(() => {
    if (!isLoggedIn) return; // اگر لاگین نیست، نیازی به بررسی نیست

    const checkTokenValidity = async () => {
      try {
        const isValid = await authApi.validateToken();
        if (!isValid) {
          // پاک کردن اطلاعات کاربر و خروج
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          setIsLoggedIn(false);
          setUserEmail('');
          setUserRole('');
          showNotification('جلسه شما منقضی شده است. شما به صفحه اصلی هدایت می‌شوید.', 'error');
          // هدایت به صفحه اصلی
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      } catch (err) {
        // در صورت خطا، کاربر را خارج می‌کنیم
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserEmail('');
        setUserRole('');
        showNotification('خطا در بررسی اعتبار جلسه. شما به صفحه اصلی هدایت می‌شوید.', 'error');
        // هدایت به صفحه اصلی
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    };

    // بررسی اولیه
    checkTokenValidity();

    // تنظیم تایمر برای بررسی هر 5 دقیقه (300000 میلی‌ثانیه)
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, authApi]);

  const handleEmailSubmit = async e => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@sharif\.edu$/.test(value)) {
      setEmailError('ایمیل باید با @sharif.edu تمام شود.');
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      const exists = await authApi.checkEmailExists(value);
      setHasAccount(exists);
      if (exists) {
        setStep(2); // فرم رمز عبور
      } else {
        const sent = await authApi.sendVerificationCode(value);
        if (sent) {
          setStep(2); // فرم کد ۶ رقمی
        } else {
          setEmailError('ارسال کد تایید با خطا مواجه شد.');
        }
      }
    } catch (err) {
      setEmailError('خطا: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async e => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(code)) {
      setCodeError('کد باید ۶ رقم باشد.');
      return;
    }
    setCodeError('');
    setLoading(true);
    try {
      const valid = await authApi.verifyCode(email, code);
      if (valid) {
        setCodeAccepted(true);
      } else {
        setCodeError('کد وارد شده صحیح نیست.');
      }
    } catch (err) {
      setCodeError('خطا: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (password !== password2) {
      setPasswordError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }
    setPasswordError('');
    setLoading(true);
    try {
      const res = await authApi.register(email, password);
      if (res.success) {
        showNotification('ثبت‌نام با موفقیت انجام شد!', 'success');
        handleClose();
      } else {
        setPasswordError('ثبت‌نام با خطا مواجه شد.');
      }
    } catch (err) {
      setPasswordError('خطا: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async e => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    setPasswordError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      // Debug log to localStorage
      localStorage.setItem('debug_login_res', JSON.stringify(res));
      localStorage.setItem('debug_login_email', email);
      localStorage.setItem('debug_login_time', new Date().toISOString());
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.user?.role || '');
        localStorage.setItem('email', email); // ایمیل را هم ذخیره کن
        setIsLoggedIn(true);
        setUserEmail(email);
        setUserRole(res.user?.role || '');
        showNotification('ورود موفقیت‌آمیز بود!', 'success');
        handleClose();
      } else {
        setPasswordError('ایمیل یا رمز عبور اشتباه است.');
      }
    } catch (err) {
      localStorage.setItem('debug_login_error', err?.message || String(err));
      setPasswordError('خطا: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setStep(1);
    setEmail('');
    setEmailError('');
    setHasAccount(null);
    setCode('');
    setCodeError('');
    setCodeAccepted(false);
    setPassword('');
    setPassword2('');
    setPasswordError('');
    setLoading(false);
  };

  // تابع خروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserEmail('');
    setUserRole('');
    
    // انتقال به صفحه اصلی
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // تابع بررسی دسترسی ادمین
  const hasAdminAccess = () => {
    return userRole === 'superadmin' || userRole === 'head' || userRole === 'center_member';
  };

  // لاگ وضعیت ورود برای دیباگ
  console.log('isLoggedIn:', isLoggedIn, 'userEmail:', userEmail, 'userRole:', userRole, 'hasAdminAccess:', hasAdminAccess());

  return (
    <Layout {...props}>
      {/* Header جدید */}
      <Header
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        userRole={userRole}
        onLoginClick={() => {
          setModalOpen(true);
          setStep(1);
          setEmail('');
          setEmailError('');
          setHasAccount(null);
          setCode('');
          setCodeError('');
          setCodeAccepted(false);
          setPassword('');
          setPassword2('');
          setPasswordError('');
          setLoading(false);
        }}
        onLogout={handleLogout}
      />

      {/* BG overlays start */}
      <div
        className="home-bg-logo"
        aria-hidden="true"
      />
      {/* BG overlays end */}

      {/* کل محتوا میاد روی پس‌زمینه */}
      <div className="layout-content-wrapper"> 
        {props.children}
      </div>
      {/* Modal ورود/ثبت‌نام */}
      <Modal open={modalOpen} onClose={handleClose}>
        <h2 className="auth-modal-title">ورود / ثبت‌نام</h2>
        {step === 1 && (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <label className="auth-form-label">ایمیل دانشگاه شریف:</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="yourname@sharif.edu" 
              className="auth-form-input"
              dir="ltr"
              required 
              pattern="^[^@\s]+@sharif\.edu$" 
              disabled={loading} 
            />
            {emailError && <div className="auth-form-error">{emailError}</div>}
            <button type="submit" className="auth-form-button" disabled={loading}>
              {loading ? '...' : 'ادامه'}
            </button>
          </form>
        )}
        {step === 2 && hasAccount === true && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-form-label">رمز عبور:</label>
            <input 
              type="password" 
              value={password} 
              dir="ltr"
              onChange={e=>setPassword(e.target.value)} 
              placeholder="رمز عبور" 
              className="auth-form-input"
              required 
              disabled={loading} 
            />
            {passwordError && <div className="auth-form-error">{passwordError}</div>}
            <button type="submit" className="auth-form-button" disabled={loading}>
              {loading ? '...' : 'ورود'}
            </button>
          </form>
        )}
        {step === 2 && hasAccount === false && !codeAccepted && (
          <form className="auth-form" onSubmit={handleCodeSubmit}>
            <label className="auth-form-label">کد ۶ رقمی ارسال‌شده به ایمیل:</label>
            <input 
              type="text" 
              maxLength={6} 
              pattern="[0-9]{6}" 
              value={code} 
              dir="ltr"
              onChange={e=>setCode(e.target.value)} 
              placeholder="کد تایید" 
              className="auth-form-input auth-form-input-code"
              required 
              disabled={loading} 
            />
            {codeError && <div className="auth-form-error">{codeError}</div>}
            <button type="submit" className="auth-form-button" disabled={loading}>
              {loading ? '...' : 'تایید کد'}
            </button>
          </form>
        )}
        {step === 2 && hasAccount === false && codeAccepted && (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <label className="auth-form-label">رمز عبور جدید:</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="رمز عبور جدید" 
              dir="ltr"
              className="auth-form-input"
              required 
              disabled={loading} 
            />
            <label className="auth-form-label" dir="ltr">تکرار رمز عبور:</label>
            <input 
              type="password" 
              value={password2} 
              onChange={e=>setPassword2(e.target.value)} 
              placeholder="تکرار رمز عبور" 
              className="auth-form-input"
              required 
              disabled={loading} 
            />
            {passwordError && <div className="auth-form-error">{passwordError}</div>}
            <button type="submit" className="auth-form-button" disabled={loading}>
              {loading ? '...' : 'ثبت رمز عبور'}
            </button>
          </form>
        )}
      </Modal>
    </Layout>
  );
}

export default function LayoutWrapper(props) {
  return (
    <NotificationProvider>
      <LayoutContent {...props} />
    </NotificationProvider>
  );
}
