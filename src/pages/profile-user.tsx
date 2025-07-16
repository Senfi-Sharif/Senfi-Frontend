import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import axios from 'axios';

function getQueryParam(name: string) {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const ROLE_LABELS: Record<string, string> = {
  'superadmin': 'سوپرادمین',
  'head': 'سرگروه',
  'center_member': 'عضو مرکز',
  'simple_senfi_member': 'عضو شورا',
  'simple_user': 'کاربر عادی',
};
const ROLE_OPTIONS = [
  { value: 'head', label: 'سرگروه' },
  { value: 'center_member', label: 'عضو مرکز' },
  { value: 'simple_senfi_member', label: 'عضو شورا' },
  { value: 'simple_user', label: 'کاربر عادی' },
];

function UserProfileContent({ user, signedCampaigns, currentUser }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const mainBg = isDark ? 'rgba(20,22,34,0.98)' : '#f9fafd';
  const mainBorder = isDark ? '1.5px solid #637eda' : 'none';
  const cardBg = isDark ? 'rgba(30,34,54,0.98)' : '#fff';
  const cardBorder = isDark ? '1.5px solid #637eda' : 'none';
  const cardShadow = isDark ? '0 1px 8px #637eda22' : '0 1px 6px #244bb91a';
  const subCardBg = isDark ? 'rgba(36,40,60,0.98)' : '#f8f9fa';
  const subCardBorder = isDark ? '1px solid #637eda' : '1px solid #e9ecef';
  const textColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  const fadedText = isDark ? '#bfcbe6' : '#888';
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  // Debug log for diagnosing role edit button
  console.log('DEBUG: currentUser:', currentUser, 'user:', user);

  const canEditRole = currentUser?.role === 'superadmin' && user.role !== 'superadmin';

  const handleRoleChange = async () => {
    setRoleLoading(true);
    setRoleError('');
    setRoleSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:8000/api/user/${user.id}/role`,
        { new_role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoleSuccess('نقش با موفقیت تغییر کرد!');
      setShowRoleModal(false);
      user.role = newRole;
    } catch (err: any) {
      setRoleError(err?.response?.data?.detail || 'خطا در تغییر نقش');
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div style={{maxWidth: 800, margin: '2em auto', background: mainBg, border: mainBorder, borderRadius: 16, boxShadow: '0 2px 16px #244bb92a', padding: '2em', color: textColor}}>
      <h1 style={{fontSize: '1.5em', fontWeight: 700, marginBottom: 20, textAlign: 'center', color: textColor}}>
        پروفایل کاربر
      </h1>
      {/* Debug warning if currentUser is not set or not superadmin */}
      {!currentUser && (
        <div style={{color: '#c00', marginBottom: 16, textAlign: 'center'}}>currentUser ست نشده! (توکن یا validate مشکل دارد)</div>
      )}
      {currentUser && currentUser.role !== 'superadmin' && (
        <div style={{color: '#c00', marginBottom: 16, textAlign: 'center'}}>شما سوپرادمین نیستید (role: {currentUser.role})</div>
      )}
      {/* اطلاعات کاربر */}
      <div style={{background: cardBg, border: cardBorder, borderRadius: 10, padding: '1.5em', marginBottom: 20, boxShadow: cardShadow, color: textColor}}>
        <h2 style={{fontSize: '1.2em', fontWeight: 600, marginBottom: 12}}>اطلاعات شخصی</h2>
        <div style={{fontSize: 16, marginBottom: 8}}>
          <strong>ایمیل:</strong> {user.email}
        </div>
        {user.unit && (
          <div style={{fontSize: 16, marginBottom: 8}}>
            <strong>واحد:</strong> {user.unit}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>نقش: {ROLE_LABELS[user.role] || user.role}</span>
          {canEditRole && (
            <button style={{ marginRight: 8, padding: '2px 8px', fontSize: 13 }} onClick={() => setShowRoleModal(true)}>
              تغییر نقش
            </button>
          )}
        </div>
      </div>
      {/* کارزارهای امضاشده */}
      <div style={{background: cardBg, border: cardBorder, borderRadius: 10, padding: '1.5em', boxShadow: cardShadow, color: textColor}}>
        <h2 style={{fontSize: '1.2em', fontWeight: 600, marginBottom: 12}}>
          کارزارهای امضاشده ({signedCampaigns.length} کارزار)
        </h2>
        {signedCampaigns.length === 0 ? (
          <div style={{textAlign: 'center', color: fadedText, padding: '2em'}}>
            هنوز هیچ کارزاری امضا نکرده است.
          </div>
        ) : (
          <div style={{maxHeight: 500, overflowY: 'auto'}}>
            {signedCampaigns.map((campaign) => (
              <div key={campaign.campaign_id} style={{
                background: subCardBg,
                borderRadius: 8,
                padding: '1em',
                marginBottom: 12,
                border: subCardBorder,
                color: textColor
              }}>
                <div style={{fontWeight: 600, fontSize: 16, marginBottom: 6}}>
                  {campaign.campaign_title}
                </div>
                <div style={{fontSize: 14, color: fadedText, marginBottom: 8}}>
                  تاریخ امضا: {new Date(campaign.signed_at).toLocaleDateString('fa-IR')}
                </div>
                <div style={{fontSize: 13, color: fadedText}}>
                  نوع امضا: {campaign.is_anonymous === "anonymous" ? "ناشناس" : "عمومی"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showRoleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow, borderRadius: 12, padding: 24, minWidth: 320 }}>
            <h4 style={{ marginBottom: 16 }}>تغییر نقش کاربر</h4>
            <div style={{ marginBottom: 16 }}>
              <label>نقش جدید:</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ marginRight: 8 }}>
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16, color: '#c00' }}>
              آیا مطمئن هستید که می‌خواهید نقش این کاربر را تغییر دهید؟
            </div>
            {roleError && <div style={{ color: '#c00', marginBottom: 8 }}>{roleError}</div>}
            {roleSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{roleSuccess}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleRoleChange} disabled={roleLoading} style={{ background: '#2e5', color: '#fff', padding: '6px 16px', borderRadius: 6 }}>
                تایید
              </button>
              <button onClick={() => setShowRoleModal(false)} style={{ background: '#eee', color: '#222', padding: '6px 16px', borderRadius: 6 }}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [signedCampaigns, setSignedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const id = getQueryParam('id');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUserAndCampaigns() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [userRes, campaignsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/auth/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8000/api/user/${id}/signed-campaigns`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUser(userRes.data);
        setSignedCampaigns(campaignsRes.data.campaigns || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'کاربر پیدا نشد یا خطا در دریافت اطلاعات کاربر');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchUserAndCampaigns();

    // Fetch current user info for role check
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8000/api/auth/validate', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCurrentUser(res.data.user))
        .catch(() => setCurrentUser(null));
    }
  }, [id]);

  if (loading) return (
    <Layout title="پروفایل کاربر">
      <div style={{textAlign: 'center', padding: '2em'}}>در حال بارگذاری...</div>
    </Layout>
  );
  if (error) return (
    <Layout title="پروفایل کاربر">
      <div style={{maxWidth: 600, margin: '2em auto', textAlign: 'center'}}>
        <div style={{color: '#b71c1c', fontWeight: 600, marginBottom: 20}}>{error}</div>
        <a href="/profile" style={{color: '#244bb9', textDecoration: 'none'}}>بازگشت به پروفایل</a>
      </div>
    </Layout>
  );
  if (!user) return (
    <Layout title="پروفایل کاربر">
      <div style={{textAlign: 'center', padding: '2em'}}>کاربری پیدا نشد.</div>
    </Layout>
  );

  return (
    <Layout title="پروفایل کاربر">
      <UserProfileContent user={user} signedCampaigns={signedCampaigns} currentUser={currentUser} />
    </Layout>
  );
};

export default UserProfile; 