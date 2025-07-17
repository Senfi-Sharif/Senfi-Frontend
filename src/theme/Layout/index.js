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
        className="opacity-10"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div
        className="home-bg-logo"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/img/maini_colors.png)',
          backgroundSize: 'contain',
          opacity: .1,
        }}
        aria-hidden="true"
      />
      {/* BG overlays end */}

      {/* کل محتوا میاد روی پس‌زمینه */}
      <div style={{position: 'relative', zIndex: 1}}> 
        {props.children}
      </div>
      {/* Modal ورود/ثبت‌نام */}
      <Modal open={modalOpen} onClose={handleClose}>
        <h2 style={{marginBottom: 18, fontWeight: 800, fontSize: 22}}>ورود / ثبت‌نام</h2>
        {step === 1 && (
          <form style={{display:'flex', flexDirection:'column', gap:14}} onSubmit={handleEmailSubmit}>
            <label style={{fontWeight:600, fontSize:16}}>ایمیل دانشگاه شریف:</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="yourname@sharif.edu" style={{fontSize:17, padding:'0.7em 1em', borderRadius:8, border:'1.5px solid #bfcbe6', fontFamily:'inherit', textAlign:'left'}} required pattern="^[^@\s]+@sharif\.edu$" disabled={loading} />
            {emailError && <div style={{color:'#b71c1c', fontWeight:600, fontSize:15}}>{emailError}</div>}
            <button type="submit" style={{marginTop:10, fontSize:17, background:'var(--ifm-color-primary)', color:'#fff', border:'none', borderRadius:8, padding:'0.7em 0', fontWeight:700, cursor:'pointer'}} disabled={loading}>{loading ? '...' : 'ادامه'}</button>
          </form>
        )}
        {step === 2 && hasAccount === true && (
          <form style={{display:'flex', flexDirection:'column', gap:14}} onSubmit={handleLoginSubmit}>
            <label style={{fontWeight:600, fontSize:16}}>رمز عبور:</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="رمز عبور" style={{fontSize:17, padding:'0.7em 1em', borderRadius:8, border:'1.5px solid #bfcbe6', fontFamily:'inherit', textAlign:'left'}} required disabled={loading} />
            {passwordError && <div style={{color:'#b71c1c', fontWeight:600, fontSize:15}}>{passwordError}</div>}
            <button type="submit" style={{marginTop:10, fontSize:17, background:'var(--ifm-color-primary)', color:'#fff', border:'none', borderRadius:8, padding:'0.7em 0', fontWeight:700, cursor:'pointer'}} disabled={loading}>{loading ? '...' : 'ورود'}</button>
          </form>
        )}
        {step === 2 && hasAccount === false && !codeAccepted && (
          <form style={{display:'flex', flexDirection:'column', gap:14}} onSubmit={handleCodeSubmit}>
            <label style={{fontWeight:600, fontSize:16}}>کد ۶ رقمی ارسال‌شده به ایمیل:</label>
            <input type="text" maxLength={6} pattern="[0-9]{6}" value={code} onChange={e=>setCode(e.target.value)} placeholder="کد تایید" style={{fontSize:17, padding:'0.7em 1em', borderRadius:8, border:'1.5px solid #bfcbe6', fontFamily:'inherit', letterSpacing:'0.25em'}} required disabled={loading} />
            {codeError && <div style={{color:'#b71c1c', fontWeight:600, fontSize:15}}>{codeError}</div>}
            <button type="submit" style={{marginTop:10, fontSize:17, background:'var(--ifm-color-primary)', color:'#fff', border:'none', borderRadius:8, padding:'0.7em 0', fontWeight:700, cursor:'pointer'}} disabled={loading}>{loading ? '...' : 'تایید کد'}</button>
          </form>
        )}
        {step === 2 && hasAccount === false && codeAccepted && (
          <form style={{display:'flex', flexDirection:'column', gap:14}} onSubmit={handlePasswordSubmit}>
            <label style={{fontWeight:600, fontSize:16}}>رمز عبور جدید:</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="رمز عبور جدید" style={{fontSize:17, padding:'0.7em 1em', borderRadius:8, border:'1.5px solid #bfcbe6', fontFamily:'inherit', textAlign:'left'}} required disabled={loading} />
            <label style={{fontWeight:600, fontSize:16}}>تکرار رمز عبور:</label>
            <input type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="تکرار رمز عبور" style={{fontSize:17, padding:'0.7em 1em', borderRadius:8, border:'1.5px solid #bfcbe6', fontFamily:'inherit', textAlign:'left'}} required disabled={loading} />
            {passwordError && <div style={{color:'#b71c1c', fontWeight:600, fontSize:15}}>{passwordError}</div>}
            <button type="submit" style={{marginTop:10, fontSize:17, background:'var(--ifm-color-primary)', color:'#fff', border:'none', borderRadius:8, padding:'0.7em 0', fontWeight:700, cursor:'pointer'}} disabled={loading}>{loading ? '...' : 'ثبت رمز عبور'}</button>
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
