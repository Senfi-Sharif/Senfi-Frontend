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
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در بررسی ایمیل');
  }
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
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در ارسال کد');
  }
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
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در بررسی کد');
  }
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
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در ثبت‌نام');
  }
  return data;
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
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در ورود');
  }
  return data;
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
  return localStorage.getItem('auth_role') || null;
}

// تابع بررسی دسترسی ادمین
export function hasAdminAccess() {
  const role = getUserRole();
  return role === 'superadmin' || role === 'head' || role === 'center_member';
}

// دریافت لیست کارزارهای pending
export async function getPendingCampaigns() {
  const token = localStorage.getItem('auth_token');
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
  
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در دریافت لیست کارزارها');
  }
  
  // استفاده از فیلد campaigns از پاسخ
  return data.campaigns || [];
}

// تأیید یا رد کارزار
export async function updateCampaignStatus(campaignId, approved, status) {
  const token = localStorage.getItem('auth_token');
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

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در بروزرسانی وضعیت کارزار');
  }

  return data;
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
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('توکن احراز هویت یافت نشد');
  
  let res;
  try {
    res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/sign`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        is_anonymous: isAnonymous ? "anonymous" : "public" 
      }),
    });
  } catch (err) {
    throw new Error('ارتباط با سرور برقرار نشد');
  }
  
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || 'خطا در امضا کردن کارزار');
  }
  
  return data;
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
  const token = localStorage.getItem('auth_token');
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
    throw new Error(data?.detail || 'خطا در دریافت کارزارهای امضاشده');
  }
  
  return data;
}

// بررسی امضای کاربر در یک کارزار
export async function checkUserSignature(campaignId) {
  const token = localStorage.getItem('auth_token');
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

// بررسی اعتبار توکن
export async function validateToken() {
  const token = localStorage.getItem('auth_token');
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
  
  const data = await safeJson(res);
  return { valid: res.ok, user: data.user };
} 