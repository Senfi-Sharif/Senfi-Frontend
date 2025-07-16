import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('auth_token');
        const apiBase = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE)
          ? process.env.REACT_APP_API_BASE
          : "http://localhost:8000";
        const res = await axios.get(`${apiBase}/api/auth/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'کاربر پیدا نشد یا خطا در دریافت اطلاعات کاربر');
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