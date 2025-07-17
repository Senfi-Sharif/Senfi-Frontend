import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { useColorMode } from '@docusaurus/theme-common';

function AdminUserList() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const authApi = useAuthApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const users = await authApi.getUsers();
        setUsers(users);
        setError('');
      } catch (err) {
        console.error('DEBUG: error fetching users:', err);
        setError('خطا در دریافت لیست کاربران');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);
  const cardBg = isDark ? 'rgba(30,34,54,0.98)' : '#fff';
  const cardBorder = isDark ? '1.5px solid #637eda' : '1px solid #e0e7ff';
  const textColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  return (
    <div style={{background: cardBg, border: cardBorder, borderRadius: 12, padding: '1.5em', marginBottom: 32, color: textColor}}>
      <h2 style={{fontSize: '1.2em', fontWeight: 700, marginBottom: 16}}>لیست کاربران ثبت‌نامی</h2>
      {loading ? <div>در حال بارگذاری...</div> : error ? <div style={{color:'#e53935'}}>{error}</div> : (
        <div style={{maxHeight: 400, overflowY: 'auto'}}>
          {users.map((u) => (
            <div key={u.id} style={{padding: '0.7em 0.5em', borderBottom: '1px solid #bfcbe6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}} onClick={()=>window.location.href=`/profile-user?id=${u.id}`}>
              <span style={{fontWeight: 600}}>{u.email}</span>
              <span style={{fontSize: '0.95em', color: isDark ? '#bfcbe6' : '#888'}}>{u.role}{u.unit ? ` | ${u.unit}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileContent({ signedCampaigns, userEmail, userRole, error, handleLogout }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const mainBg = isDark ? 'rgba(20,22,34,0.98)' : '#f9fafd';
  const mainBorder = isDark ? '1.5px solid #637eda' : 'none';
  const cardBg = isDark ? 'rgba(30,34,54,0.98)' : '#fff';
  const cardBorder = isDark ? '1.5px solid #637eda' : 'none';
  const cardShadow = isDark ? '0 1px 8px #637eda22' : '0 1px 6px #244bb91a';
  const subCardBg = isDark ? 'rgba(36,40,60,0.98)' : '#f8f9fa';
  const subCardBorder = isDark ? '1px solid #637eda' : '1px solid #e9ecef';
  const textColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  const fadedText = isDark ? '#bfcbe6' : '#888';
  return (
    <div style={{maxWidth: 800, margin: '2em auto', background: mainBg, border: mainBorder, borderRadius: 16, boxShadow: '0 2px 16px #244bb92a', padding: '2em', color: textColor}}>
      <h1 style={{fontSize: '1.5em', fontWeight: 700, marginBottom: 20, textAlign: 'center', color: textColor}}>
        پروفایل کاربر
      </h1>
      {/* فقط برای سوپرادمین و head */}
      {(userRole === 'superadmin' || userRole === 'head') && <AdminUserList />}
      {/* اطلاعات کاربر */}
      <div style={{background: cardBg, border: cardBorder, borderRadius: 10, padding: '1.5em', marginBottom: 20, boxShadow: cardShadow, color: textColor}}>
        <h2 style={{fontSize: '1.2em', fontWeight: 600, marginBottom: 12}}>اطلاعات شخصی</h2>
        <div style={{fontSize: 16, marginBottom: 8}}>
          <strong>ایمیل:</strong> {userEmail}
        </div>
        <div style={{fontSize: 16, marginBottom: 8}}>
          <strong>نقش:</strong> {userRole}
        </div>
        <button 
          onClick={handleLogout}
          style={{
            fontSize: 14,
            background: '#b71c1c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.5em 1em',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 8
          }}
        >
          خروج از حساب
        </button>
      </div>
      {/* کارزارهای امضاشده */}
      <div style={{background: cardBg, border: cardBorder, borderRadius: 10, padding: '1.5em', boxShadow: cardShadow, color: textColor}}>
        <h2 style={{fontSize: '1.2em', fontWeight: 600, marginBottom: 12}}>
          کارزارهای امضاشده ({signedCampaigns.length} کارزار)
        </h2>
        {error && (
          <div style={{color: '#b71c1c', fontWeight: 600, marginBottom: 20}}>{error}</div>
        )}
        {signedCampaigns.length === 0 ? (
          <div style={{textAlign: 'center', color: fadedText, padding: '2em'}}>
            هنوز هیچ کارزاری امضا نکرده‌اید.
          </div>
        ) : (
          <div style={{maxHeight: 500, overflowY: 'auto'}}>
            {signedCampaigns.map((campaign: any) => (
              <div key={campaign.campaign_id} style={{
                background: subCardBg,
                borderRadius: 8,
                padding: '1em',
                marginBottom: 12,
                border: subCardBorder,
                color: textColor
              }}>
                <div style={{fontWeight: 600, fontSize: 16, marginBottom: 6}}>
                  {campaign.campaign_title}
                </div>
                <div style={{fontSize: 14, color: fadedText, marginBottom: 8}}>
                  تاریخ امضا: {new Date(campaign.signed_at).toLocaleDateString('fa-IR')}
                </div>
                <div style={{fontSize: 13, color: fadedText}}>
                  نوع امضا: {campaign.is_anonymous === "anonymous" ? "ناشناس" : "عمومی"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const [signedCampaigns, setSignedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const authApi = useAuthApi();

  useEffect(() => {
    // بررسی لاگین بودن کاربر
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('email');
      const role = localStorage.getItem('role');
      if (!email) {
        setError('برای مشاهده پروفایل ابتدا وارد شوید');
        setLoading(false);
        return;
      }
      setUserEmail(email);
      setUserRole(role || 'کاربر');
    }

    const fetchSignedCampaigns = async () => {
      try {
        setLoading(true);
        const data = await authApi.getUserSignedCampaigns();
        setSignedCampaigns(data.campaigns || []);
        setError(null);
      } catch (err) {
        setError('خطا در بارگذاری کارزارهای امضا شده');
        setSignedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedCampaigns();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <Layout title="پروفایل کاربر">
        <div style={{textAlign: 'center', padding: '2em'}}>در حال بارگذاری...</div>
      </Layout>
    );
  }

  if (error && !userEmail) {
    return (
      <Layout title="پروفایل کاربر">
        <div style={{maxWidth: 600, margin: '2em auto', textAlign: 'center'}}>
          <div style={{color: '#b71c1c', fontWeight: 600, marginBottom: 20}}>{error}</div>
          <a href="/" style={{color: '#244bb9', textDecoration: 'none'}}>بازگشت به صفحه اصلی</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="پروفایل کاربر">
      <ProfileContent signedCampaigns={signedCampaigns} userEmail={userEmail} userRole={userRole} error={error} handleLogout={handleLogout} />
    </Layout>
  );
} 