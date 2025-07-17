import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthApi } from '../../api/auth';

const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authApi = useAuthApi();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('توکن احراز هویت یافت نشد');
          return;
        }
        
        const res = await authApi.getUser(id);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.detail || 'کاربر پیدا نشد یا خطا در دریافت اطلاعات کاربر');
        }
        
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err?.message || 'کاربر پیدا نشد یا خطا در دریافت اطلاعات کاربر');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchUser();
  }, [id]);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!user) return <div>کاربری پیدا نشد.</div>;

  return (
    <div style={{maxWidth: 500, margin: '0 auto', padding: 24, background: 'var(--ifm-background-color)', borderRadius: 12}}>
      <h2>پروفایل کاربر</h2>
      <p><b>ایمیل:</b> {user.email}</p>
      <p><b>نقش:</b> {user.role}</p>
      {user.unit && <p><b>واحد:</b> {user.unit}</p>}
      {/* اطلاعات بیشتر در صورت نیاز */}
    </div>
  );
};

export default UserProfile; 