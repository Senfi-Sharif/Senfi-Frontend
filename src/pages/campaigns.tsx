import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import ApprovedCampaigns from '../components/ApprovedCampaigns';
import NewCampaignForm from '../components/NewCampaignForm';
import styles from '../css/campaignsStyles';
import { FaLock } from 'react-icons/fa';

// تابع بررسی لاگین
function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('token'));
}

function HeaderBanner() {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .header-banner-campaigns {
            padding: 1.1rem !important;
            margin-bottom: 1.5rem !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            width: 100vw !important;
            box-sizing: border-box !important;
            overflow-x: auto !important;
          }
          .main-campaigns-container {
            min-width: 100vw !important;
            max-width: 100vw !important;
            width: 100vw !important;
            box-sizing: border-box !important;
            overflow-x: auto !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .header-banner-campaigns-title {
            font-size: 1.4rem !important;
            gap: 0.5rem !important;
          }
          .header-banner-campaigns-icon {
            font-size: 1.4rem !important;
            padding: 0.25rem !important;
          }
          .header-banner-campaigns-subtitle {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </>
  );
}

// کامپوننت اصلی صفحه کارزارها
export default function CampaignsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const authApi = useAuthApi();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <Layout>
      <div className="main-campaigns-container" style={styles.container}>
        <HeaderBanner />
        
        {!loggedIn ? (
          <div style={styles.accessDenied}>
            <h3 style={styles.accessDeniedTitle}><FaLock /> دسترسی محدود</h3>
            <p style={styles.accessDeniedText}>
              برای مشاهده و ایجاد کارزار، ابتدا وارد شوید.
            </p>
          </div>
        ) : (
          <>
            <NewCampaignForm />
            <ApprovedCampaigns />
          </>
        )}
      </div>
    </Layout>
  );
} 