import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';

function getQueryParam(name: string) {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function ProfileUserContent({ user, loading, error, role, setRole, myRole, updating, success, handleRoleChange }) {
  return (
    <div className="profile-user-card">
      <h1 className="profile-user-title">پروفایل کاربر</h1>
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : error ? (
        <div className="profile-user-error">{error}</div>
      ) : user ? (
        <>
          <div className="profile-user-row"><strong>ایمیل:</strong> {user.email}</div>
          <div className="profile-user-row"><strong>نقش فعلی:</strong> {user.role}</div>
          <div className="profile-user-row"><strong>واحد:</strong> {user.unit || '-'}</div>
          {myRole === 'superadmin' || myRole === 'head' ? (
            <form onSubmit={handleRoleChange} className="profile-user-form">
              <label className="profile-user-label">تغییر نقش کاربر:</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="profile-user-select">
                <option value="user">کاربر عادی</option>
                <option value="center_member">عضو مرکز</option>
                <option value="head">مدیر</option>
                <option value="superadmin">سوپرادمین</option>
              </select>
              <button type="submit" disabled={updating} className="profile-user-btn">
                {updating ? '...' : 'ثبت تغییر نقش'}
              </button>
              {success && <span className="profile-user-success">{success}</span>}
              {error && <span className="profile-user-error">{error}</span>}
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