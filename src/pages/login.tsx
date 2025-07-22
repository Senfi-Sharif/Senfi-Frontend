import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authApi = useAuthApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password, remember_me: rememberMe });
      if (res.success && res.token) {
        if (rememberMe) {
          localStorage.setItem('auth_token', res.token);
        } else {
          sessionStorage.setItem('auth_token', res.token);
        }
        window.location.href = '/';
      } else {
        setError(res.detail || 'خطا در ورود');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="ورود">
      <div className="login-page-container" style={{ maxWidth: 400, margin: '3rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07)', padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>ورود به سامانه</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>ایمیل شریف:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>رمز عبور:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ marginLeft: 8 }} />
            <label htmlFor="rememberMe">من را به یاد بسپار (۱۴ روز)</label>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1e40af', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', marginTop: 8 }}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </Layout>
  );
} 
 
 
 
 
 
 
 