import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { SecureTokenManager } from '../utils/security';

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
    SecureTokenManager.clearAuth();
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

  async function checkTokenBeforeRequest() {
    const token = SecureTokenManager.getToken();
    if (!token) return;
    
    // اگر توکن منقضی شده، کاربر را خارج کن
    if (isTokenExpired(token)) {
      handleNoCredentials();
      return;
    }
    
    // اگر توکن در حال انقضا است (کمتر از 30 دقیقه)، به کاربر هشدار بده
    if (isTokenExpiringSoon(token, 30)) {
      // می‌توانیم اینجا یک notification به کاربر نشان دهیم
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('token:expiring-soon'));
      }
    }
  }

  async function checkEmailExists(email) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/check-email`, {
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
      res = await fetch(`${API_BASE}/auth/send-code`, {
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
      res = await fetch(`${API_BASE}/auth/verify-code`, {
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

  async function sendMobileVerificationCode(email) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/send-mobile-code`, {
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

  async function verifyMobileCode(email, code) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/verify-mobile-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function changePassword(currentPassword, newPassword, confirmPassword) {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function register(email, password, faculty, dormitory) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, faculty, dormitory }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function login(email, password, rememberMe = false) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    
    // Handle login errors without redirecting
    const data = await safeJson(res);
    if (!res.ok) {
      // Translate common error messages to Persian
      let errorMessage = data?.detail || 'خطا در ورود';
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid credentials')) {
        errorMessage = 'ایمیل یا رمز عبور اشتباه است';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'کاربری با این ایمیل یافت نشد';
      } else if (errorMessage.includes('Account disabled')) {
        errorMessage = 'حساب کاربری غیرفعال است';
      }
      throw new Error(errorMessage);
    }
    return data;
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

  function isTokenExpiringSoon(token, minutesBeforeExpiry = 30) {
    try {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return false;
      
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
      

      
      return minutesUntilExpiry <= minutesBeforeExpiry;
    } catch (err) {
      return false;
    }
  }

  function isTokenExpired(token) {
    try {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return true;
      
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      return currentTime >= expiryTime;
    } catch (err) {
      return true;
    }
  }

  function clearOldTokens() {
    // پاک کردن توکن‌های منقضی شده
    const token = SecureTokenManager.getToken();
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.exp) {
        const expiryTime = decoded.exp * 1000;
        const currentTime = Date.now();
        
        // اگر توکن منقضی شده، پاکش کن
        if (currentTime >= expiryTime) {
          SecureTokenManager.clearAuth();
          return true;
        }
      }
    }
    return false;
  }

  function getUserRole() {
    if (typeof window === 'undefined') return null;
    return SecureTokenManager.getRole() || null;
  }

  function hasAdminAccess() {
    const role = getUserRole();
    return role === 'superadmin' || role === 'head' || role === 'center_member';
  }

  async function getPendingCampaigns() {
    await checkTokenBeforeRequest();
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/admin/campaigns`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/campaigns/${campaignId}/status`, {
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
    const token = SecureTokenManager.getToken();
    let headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
      res = await fetch(`${API_BASE}/campaigns/approved`, {
        method: 'GET',
        headers,
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/campaigns/${campaignId}/sign`, {
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
      res = await fetch(`${API_BASE}/campaigns/${campaignId}/signatures`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/signed-campaigns`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/campaigns/${campaignId}/check-signature`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/validate`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/user/${userId}`, {
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
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/${userId}/role`, {
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

  async function submitCampaign({ title, content, description, excerpt, tags, category, image_url, deadline, is_anonymous, anonymous_allowed, email }) {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/campaigns/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, description, excerpt, tags, category, image_url, deadline, is_anonymous, anonymous_allowed, email }),
      });
    } catch (err) {
      throw new Error('ارتباط با سرور برقرار نشد');
    }
    return await processResponse(res);
  }

  async function getUsers() {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/users`, {
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

  async function getUserVotedPolls() {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/voted-polls`, {
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

  async function getUserCreatedCampaigns() {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/created-campaigns`, {
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

  async function getUserCreatedBlogPosts() {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/created-blog-posts`, {
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

  async function getUserCreatedPolls() {
    const token = SecureTokenManager.getToken();
    if (!token) throw new Error('توکن احراز هویت یافت نشد');
    let res;
    try {
      res = await fetch(`${API_BASE}/user/created-polls`, {
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
    sendMobileVerificationCode,
    verifyMobileCode,
    changePassword,
    register,
    login,
    decodeJWT,
    isTokenExpired,
    isTokenExpiringSoon,
    clearOldTokens,
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
    getUserVotedPolls,
    getUserCreatedCampaigns,
    getUserCreatedBlogPosts,
    getUserCreatedPolls,
  };
}
