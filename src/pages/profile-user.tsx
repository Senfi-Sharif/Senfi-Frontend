import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { useColorMode } from '@docusaurus/theme-common';

function getQueryParam(name: string) {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function ProfileUserContent({ user, loading, error, role, setRole, myRole, updating, success, handleRoleChange }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const cardBg = isDark ? 'rgba(30,34,54,0.98)' : '#fff';
  const cardBorder = isDark ? '1.5px solid #637eda' : '1px solid #e0e7ff';
  const textColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  return (
    <div style={{maxWidth: 600, margin: '2em auto', background: cardBg, border: cardBorder, borderRadius: 16, boxShadow: '0 2px 16px #244bb92a', padding: '2em', color: textColor}}>
      <h1 style={{fontSize: '1.5em', fontWeight: 700, marginBottom: 20, textAlign: 'center'}}>پروفایل کاربر</h1>
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : error ? (
        <div style={{color: '#b71c1c', fontWeight: 600}}>{error}</div>
      ) : user ? (
        <>
          <div style={{fontSize: 16, marginBottom: 8}}><strong>ایمیل:</strong> {user.email}</div>
          <div style={{fontSize: 16, marginBottom: 8}}><strong>نقش فعلی:</strong> {user.role}</div>
          <div style={{fontSize: 16, marginBottom: 8}}><strong>واحد:</strong> {user.unit || '-'}</div>
          {myRole === 'superadmin' || myRole === 'head' ? (
            <form onSubmit={handleRoleChange} style={{marginTop: 24}}>
              <label style={{fontWeight: 600, fontSize: 15}}>تغییر نقش کاربر:</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{margin: '0 0.5em', padding: '0.4em 1em', borderRadius: 6, border: '1px solid #bfcbe6', fontFamily: 'inherit'}}>
                <option value="user">کاربر عادی</option>
                <option value="center_member">عضو مرکز</option>
                <option value="head">مدیر</option>
                <option value="superadmin">سوپرادمین</option>
              </select>
              <button type="submit" disabled={updating} style={{marginRight: 8, padding: '0.4em 1.2em', borderRadius: 6, border: 'none', background: '#244bb9', color: '#fff', fontWeight: 600, cursor: 'pointer'}}>
                {updating ? '...' : 'ثبت تغییر نقش'}
              </button>
              {success && <span style={{color: 'green', marginRight: 12}}>{success}</span>}
              {error && <span style={{color: '#b71c1c', marginRight: 12}}>{error}</span>}
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default function ProfileUser() {
  const authApi = useAuthApi();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  // نقش فعلی لاگین‌شده
  const [myRole, setMyRole] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMyRole(localStorage.getItem('role') || '');
    }
  }, []);
  useEffect(() => {
    const userId = getQueryParam('id');
    if (!userId) {
      setError('شناسه کاربر مشخص نیست.');
      setLoading(false);
      return;
    }
    setLoading(true);
    authApi.getUser(userId)
      .then(data => {
        setUser(data);
        setRole(data.role || '');
        setError('');
      })
      .catch(err => {
        setError(err.message || 'خطا در دریافت اطلاعات کاربر');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !role) return;
    setUpdating(true);
    setSuccess('');
    setError('');
    try {
      const res = await authApi.updateUserRole(user.id, role);
      if (res.success) {
        setSuccess('نقش کاربر با موفقیت تغییر کرد.');
        setUser({ ...user, role });
      } else {
        setError(res.message || 'خطا در تغییر نقش کاربر');
      }
    } catch (err) {
      setError(err.message || 'خطا در تغییر نقش کاربر');
    } finally {
      setUpdating(false);
    }
  };
  return (
    <Layout title="پروفایل کاربر" description="مشاهده و ویرایش اطلاعات کاربر">
      <ProfileUserContent
        user={user}
        loading={loading}
        error={error}
        role={role}
        setRole={setRole}
        myRole={myRole}
        updating={updating}
        success={success}
        handleRoleChange={handleRoleChange}
      />
    </Layout>
  );
} 