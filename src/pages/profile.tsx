import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { getUserSignedCampaigns } from '@site/src/api/auth';

export default function Profile() {
  const [signedCampaigns, setSignedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // بررسی لاگین بودن کاربر
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('auth_email');
      const role = localStorage.getItem('auth_role');
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
        const data = await getUserSignedCampaigns();
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
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
      <div style={{maxWidth: 800, margin: '2em auto', background: '#f9fafd', borderRadius: 16, boxShadow: '0 2px 16px #244bb92a', padding: '2em'}}>
        <h1 style={{fontSize: '1.5em', fontWeight: 700, marginBottom: 20, textAlign: 'center'}}>
          پروفایل کاربر
        </h1>
        
        {/* اطلاعات کاربر */}
        <div style={{background: '#fff', borderRadius: 10, padding: '1.5em', marginBottom: 20, boxShadow: '0 1px 6px #244bb91a'}}>
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
        <div style={{background: '#fff', borderRadius: 10, padding: '1.5em', boxShadow: '0 1px 6px #244bb91a'}}>
          <h2 style={{fontSize: '1.2em', fontWeight: 600, marginBottom: 12}}>
            کارزارهای امضاشده ({signedCampaigns.length} کارزار)
          </h2>
          
          {error && (
            <div style={{color: '#b71c1c', fontWeight: 600, marginBottom: 20}}>{error}</div>
          )}
          
          {signedCampaigns.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888', padding: '2em'}}>
              هنوز هیچ کارزاری امضا نکرده‌اید.
            </div>
          ) : (
            <div style={{maxHeight: 500, overflowY: 'auto'}}>
              {signedCampaigns.map((campaign: any) => (
                <div key={campaign.campaign_id} style={{
                  background: '#f8f9fa',
                  borderRadius: 8,
                  padding: '1em',
                  marginBottom: 12,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{fontWeight: 600, fontSize: 16, marginBottom: 6}}>
                    {campaign.campaign_title}
                  </div>
                  <div style={{fontSize: 14, color: '#666', marginBottom: 8}}>
                    تاریخ امضا: {new Date(campaign.signed_at).toLocaleDateString('fa-IR')}
                  </div>
                  <div style={{fontSize: 13, color: '#888'}}>
                    نوع امضا: {campaign.is_anonymous === "anonymous" ? "ناشناس" : "عمومی"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 