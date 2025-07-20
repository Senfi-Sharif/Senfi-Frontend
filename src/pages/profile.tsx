import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { FaUser, FaCheckCircle } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import UserInfoCard from '../components/UserInfoCard';
import CampaignListItem from '../components/CampaignListItem';
import AdminUserList from '../components/AdminUserList';



function ProfileContent({ signedCampaigns, userEmail, userRole, error, handleLogout }) {
  return (
    <div className="profile-main-content">
      <h1 className="profile-main-title"><FaUser style={{marginLeft:8}}/>پروفایل کاربر</h1>
      {/* فقط برای سوپرادمین و head */}
      {(userRole === 'superadmin' || userRole === 'head') && <AdminUserList />}
      {/* اطلاعات کاربر */}
      <UserInfoCard 
        user={{ email: userEmail, role: userRole }}
        onLogout={handleLogout}
      />
      {/* کارزارهای امضاشده */}
      <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaCheckCircle style={{marginLeft:8}}/>کارزارهای امضاشده <span style={{fontWeight:400}}>({signedCampaigns.length} کارزار)</span></h2>
        {error && (
          <ErrorMessage message={error} />
        )}
        {signedCampaigns.length === 0 ? (
          <EmptyState 
            icon="📋"
            title="هنوز هیچ کارزاری امضا نکرده‌اید"
            subtitle="پس از امضای کارزارها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-campaigns-list">
            {signedCampaigns.map((campaign: any) => (
              <CampaignListItem
                key={campaign.campaign_id}
                campaign={{
                  id: campaign.campaign_id,
                  title: campaign.campaign_title,
                  signed_at: campaign.signed_at,
                  is_anonymous: campaign.is_anonymous
                }}
              />
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
        <LoadingSpinner message="در حال بارگذاری پروفایل..." />
      </Layout>
    );
  }

  if (error && !userEmail) {
    return (
      <Layout title="پروفایل کاربر">
        <div className="profile-error-container">
          <ErrorMessage message={error} />
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