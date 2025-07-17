import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function useAuthApi() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;

  async function safeJson(res) {
    try {
      return await res.json();
    } catch (err) {
      throw new Error('پاسخ سرور معتبر نیست');
    }
  }

  function handleNoCredentials() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    window.location.href = '/';
  }

  async function processResponse(res) {
    const data = await safeJson(res);
    if (!res.ok) {
      if (res.status === 401 || data?.detail?.includes('no credentials')) {
        handleNoCredentials();
      }
      throw new Error(data?.detail || 'خطا در ارتباط با سرور');
    }
    return data;
  }

  async function checkEmailExists(email) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await processResponse(res);
    return data.exists;
  }

  async function sendVerificationCode(email) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await processResponse(res);
    return data.success;
  }

  async function verifyCode(email, code) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await processResponse(res);
    return data.valid;
  }

  async function register(email, password) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function login(email, password) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  function decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      return null;
    }
  }

  function getUserRole() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('role') || null;
  }

  function hasAdminAccess() {
    const role = getUserRole();
    return role === 'superadmin' || role === 'head' || role === 'center_member';
  }

  async function getPendingCampaigns() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/admin/campaigns`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function updateCampaignStatus(campaignId, approved, status) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(status ? { status } : { approved }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function getApprovedCampaigns() {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/approved`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.detail || 'خطا در دریافت لیست کارزارها');
    }
    return data;
  }

  async function signCampaign(campaignId, isAnonymous = false) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/sign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_anonymous: isAnonymous ? 'anonymous' : 'public' }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function getCampaignSignatures(campaignId) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/signatures`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.detail || 'خطا در دریافت امضاها');
    }
    return data;
  }

  async function getUserSignedCampaigns() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/user/signed-campaigns`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.detail || 'خطا در دریافت کارزارها');
    }
    return data;
  }

  async function checkUserSignature(campaignId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/check-signature`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.detail || 'خطا در بررسی امضا');
    }
    return data;
  }

  async function validateToken() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/validate`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.detail || 'توکن نامعتبر است');
    }
    return data;
  }

  async function getUser(userId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function updateUserRole(userId, newRole) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/user/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_role: newRole })
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function submitCampaign({ title, description, email, is_anonymous, end_datetime }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/campaigns/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, email, is_anonymous, end_datetime })
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await res.json();
  }

  async function getUsers() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  return {
    checkEmailExists,
    sendVerificationCode,
    verifyCode,
    register,
    login,
    decodeJWT,
    getUserRole,
    hasAdminAccess,
    getPendingCampaigns,
    updateCampaignStatus,
    getApprovedCampaigns,
    signCampaign,
    getCampaignSignatures,
    getUserSignedCampaigns,
    checkUserSignature,
    validateToken,
    getUser,
    updateUserRole,
    submitCampaign,
    getUsers,
  };
}
