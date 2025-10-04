import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { SecureTokenManager } from '../utils/security';

export default function AdminGuidePage() {
  const { siteConfig } = useDocusaurusContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const token = SecureTokenManager.getToken();
        if (!token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Check user info to get role
        const response = await fetch(`${siteConfig.customFields.apiUrl}/auth/user-info/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const role = userData.user?.role;
          setUserRole(role);
          
          // Check if user has admin role
          const adminRoles = ['superadmin', 'head', 'center_member', 'faculty_member', 'dorm_member'];
          if (adminRoles.includes(role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [siteConfig.customFields.apiUrl]);

  if (isLoading) {
    return (
      <Layout title="راهنمای ادمین" description="راهنمای مدیریت و اداره پلتفرم شورای صنفی">
        <Head>
          <title>راهنمای ادمین | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        </Head>
        <main className="admin-guide-page">
          <div className="container">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '50vh',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div className="loading-spinner"></div>
              <p>در حال بررسی دسترسی...</p>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout title="دسترسی محدود" description="شما دسترسی به این صفحه ندارید">
        <Head>
          <title>دسترسی محدود | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        </Head>
        <main className="admin-guide-page">
          <div className="container">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '50vh',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', color: '#e74c3c' }}>🚫</div>
              <h1>دسترسی محدود</h1>
              <p>شما دسترسی به راهنمای ادمین ندارید.</p>
              <p>این صفحه فقط برای ادمین‌ها و مدیران پلتفرم قابل دسترسی است.</p>
              <div style={{ marginTop: '20px' }}>
                <a 
                  href="/docs/user-guide" 
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--ifm-color-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    display: 'inline-block'
                  }}
                >
                  بازگشت به راهنمای کاربری
                </a>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // If authorized, redirect to the actual admin guide documentation
  useEffect(() => {
    if (isAuthorized) {
      window.location.href = '/docs/admin-guide';
    }
  }, [isAuthorized]);

  return (
    <Layout title="راهنمای ادمین" description="راهنمای مدیریت و اداره پلتفرم شورای صنفی">
      <Head>
        <title>راهنمای ادمین | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
      </Head>
      <main className="admin-guide-page">
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div className="loading-spinner"></div>
            <p>در حال هدایت به راهنمای ادمین...</p>
          </div>
        </div>
      </main>
    </Layout>
  );
} 