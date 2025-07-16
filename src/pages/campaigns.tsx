import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import { getApprovedCampaigns, signCampaign, checkUserSignature, getUserRole, updateCampaignStatus } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import ApprovedCampaigns from '../components/ApprovedCampaigns';
import NewCampaignForm from '../components/NewCampaignForm';
import styles from '../css/campaignsStyles';

const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";

// تابع بررسی لاگین
function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('auth_token'));
}

// کامپوننت اصلی صفحه کارزارها
export default function CampaignsPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>📢 کارزارها</h1>
          <p style={styles.headerSubtitle}>
            ایجاد و مشارکت در کارزارهای صنفی دانشجویان
          </p>
        </div>
        
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