const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";

async function safeJson(res) {
  try {
    return await res.json();
  } catch (err) {
    throw new Error('پاسخ سرور معتبر نیست');
  }
}

function handleNoCredentials() {
  // Clear localStorage and redirect
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('role');

  // Notify other components
  window.dispatchEvent(new CustomEvent('auth:logout'));

  // Redirect to home
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

export async function checkEmailExists(email) {
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

export async function sendVerificationCode(email) {
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

export async function verifyCode(email, code) {
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

export async function register(email, password) {
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

export async function login(email, password) {
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

// تابع استخراج اطلاعات از JWT
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

// تابع بررسی نقش کاربر
export function getUserRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role') || null;
}

// تابع بررسی دسترسی ادمین
export function hasAdminAccess() {
  const role = getUserRole();
  return role === 'superadmin' || role === 'head' || role === 'center_member';
}

// دریافت لیست کارزارهای pending
export async function getPendingCampaigns() {
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

// تأیید یا رد کارزار
export async function updateCampaignStatus(campaignId, approved, status) {
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

// دریافت لیست کارزارهای تاییدشده
export async function getApprovedCampaigns() {
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

// امضا کردن کارزار
export async function signCampaign(campaignId, isAnonymous = false) {
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

// دریافت امضاهای یک کارزار
export async function getCampaignSignatures(campaignId) {
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

// دریافت کارزارهای امضاشده توسط کاربر
export async function getUserSignedCampaigns() {
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
  
  return await processResponse(res);
}

// بررسی امضای کاربر در یک کارزار
export async function checkUserSignature(campaignId) {
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
  
  return await processResponse(res);
}

// بررسی اعتبار توکن
export async function validateToken() {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false };
  
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
    return { valid: false };
  }
  
  try {
    const data = await processResponse(res);
    return { valid: true, user: data.user };
  } catch (err) {
    return { valid: false };
  }
}
