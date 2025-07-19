import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { FaUser, FaEnvelope, FaUserShield, FaSign, FaCheckCircle, FaExclamationCircle, FaRegListAlt } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';

function AdminUserList() {
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
        setError('خطا در دریافت لیست کاربران');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);
  return (
    <div className="profile-card">
      <h2 className="profile-admin-title"><FaUserShield style={{marginLeft:8}}/>لیست کاربران ثبت‌نامی</h2>
      {loading ? <div className="profile-loading"><FaRegListAlt style={{marginLeft:8}}/>در حال بارگذاری...</div> : error ? <div className="profile-error"><FaExclamationCircle style={{marginLeft:8}}/>{error}</div> : (
        <div className="profile-users-list">
          {users.map((u) => (
            <div key={u.id} className="profile-user-item" onClick={()=>window.location.href=`/profile-user?id=${u.id}`}
              tabIndex={0} role="button" aria-label={`نمایش پروفایل ${u.email}`}
              >
              <span className="profile-user-email"><FaEnvelope style={{marginLeft:4}}/>{u.email}</span>
              <span className="profile-user-role"><FaUser style={{marginLeft:4}}/>{u.role}{u.unit ? ` | ${u.unit}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileContent({ signedCampaigns, userEmail, userRole, error, handleLogout }) {
  return (
    <div className="profile-main-content">
      <h1 className="profile-main-title"><FaUser style={{marginLeft:8}}/>پروفایل کاربر</h1>
      {/* فقط برای سوپرادمین و head */}
      {(userRole === 'superadmin' || userRole === 'head') && <AdminUserList />}
      {/* اطلاعات کاربر */}
      <div className="profile-info-card">
        <h2 className="profile-info-title"><FaUser style={{marginLeft:8}}/>اطلاعات شخصی</h2>
        <div className="profile-info-item"><FaEnvelope style={{marginLeft:4}}/><strong>ایمیل:</strong> {userEmail}</div>
        <div className="profile-info-item"><FaUserShield style={{marginLeft:4}}/><strong>نقش:</strong> {userRole}</div>
        <button 
          onClick={handleLogout}
          className="profile-logout-button"
        >
          <FaSign style={{marginLeft:4}}/>خروج از حساب
        </button>
      </div>
      {/* کارزارهای امضاشده */}
      <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaCheckCircle style={{marginLeft:8}}/>کارزارهای امضاشده <span style={{fontWeight:400}}>({signedCampaigns.length} کارزار)</span></h2>
        {error && (
          <div className="profile-campaigns-error"><FaExclamationCircle style={{marginLeft:4}}/>{error}</div>
        )}
        {signedCampaigns.length === 0 ? (
          <div className="profile-campaigns-empty"><FaRegListAlt style={{marginLeft:4}}/>هنوز هیچ کارزاری امضا نکرده‌اید.</div>
        ) : (
          <div className="profile-campaigns-list">
            {signedCampaigns.map((campaign: any) => (
              <div key={campaign.campaign_id} className="profile-signed-campaign-item">
                <div className="profile-signed-campaign-title"><FaCheckCircle style={{marginLeft:4}}/>{campaign.campaign_title}</div>
                <div className="profile-faded">تاریخ امضا: {new Date(campaign.signed_at).toLocaleDateString('fa-IR')}</div>
                <div className="profile-faded">نوع امضا: {campaign.is_anonymous === "anonymous" ? "ناشناس" : "عمومی"}</div>
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
      const email = SecureTokenManager.getEmail();
      const role = SecureTokenManager.getRole();
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
      SecureTokenManager.clearAuth();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <Layout title="پروفایل کاربر">
        <div className="profile-loading-container">در حال بارگذاری...</div>
      </Layout>
    );
  }

  if (error && !userEmail) {
    return (
      <Layout title="پروفایل کاربر">
        <div className="profile-error-container">
          <div className="profile-error-message">{error}</div>
          <a href="/" className="profile-return-link">بازگشت به صفحه اصلی</a>
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