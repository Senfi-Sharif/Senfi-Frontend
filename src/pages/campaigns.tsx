import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import { getApprovedCampaigns, signCampaign, checkUserSignature, getUserRole, updateCampaignStatus } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import ApprovedCampaigns from '../components/ApprovedCampaigns';
import NewCampaignForm from '../components/NewCampaignForm';
import styles from '../css/campaignsStyles';
import { useColorMode } from '@docusaurus/theme-common';

const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";

// تابع بررسی لاگین
function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('auth_token'));
}

function HeaderBanner() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const bg = isDark
    ? 'linear-gradient(120deg, #23263a 0%, #181a23 100%)'
    : 'linear-gradient(120deg, var(--ifm-color-primary-lightest) 0%, transparent 80%)';
  const border = isDark
    ? '1px solid #637eda'
    : '1px solid var(--ifm-color-primary-lighter)';
  const titleColor = isDark
    ? 'var(--ifm-color-primary-lightest)'
    : 'var(--ifm-color-primary-darker)';
  const subtitleColor = isDark
    ? 'var(--ifm-font-color-base, #f3f6fa)'
    : 'var(--ifm-color-primary-dark)';
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
      <div className="header-banner-campaigns" style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        background: bg,
        borderRadius: '1rem',
        border: border,
      }}>
        <div className="header-banner-campaigns-title" style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: titleColor,
          margin: '0 0 0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <span className="header-banner-campaigns-icon" style={{
            fontSize: '2.5rem',
            background: isDark
              ? 'linear-gradient(120deg, #23263a 25%, #637eda 100%)'
              : 'linear-gradient(120deg, #fff3 25%, var(--ifm-color-primary-lighter))',
            borderRadius: '50%',
            boxShadow: isDark
              ? '0 2px 17px #637eda44'
              : '0 2px 17px var(--ifm-color-primary-lightest)',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>📢</span>
          کارزارها
        </div>
        <div className="header-banner-campaigns-subtitle" style={{
          fontSize: '1.1rem',
          color: subtitleColor,
          opacity: 0.8,
          margin: 0,
          fontWeight: 500,
        }}>
          ایجاد و مشارکت در کارزارهای صنفی دانشجویان
        </div>
      </div>
    </>
  );
}

// کامپوننت اصلی صفحه کارزارها
export default function CampaignsPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <Layout>
      <div className="main-campaigns-container" style={styles.container}>
        <HeaderBanner />
        
        {!loggedIn ? (
          <div style={styles.accessDenied}>
            <h3 style={styles.accessDeniedTitle}>🔒 دسترسی محدود</h3>
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