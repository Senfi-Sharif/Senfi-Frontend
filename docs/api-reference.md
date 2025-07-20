---
sidebar_position: 3
title: مرجع API
description: مستندات کامل API پلتفرم شورای صنفی برای توسعه‌دهندگان
---

<div className="docs-background-container" dir="rtl">

# مرجع API شورای صنفی

این مستندات برای توسعه‌دهندگانی است که می‌خواهند با API پلتفرم شورای صنفی کار کنند.

## 🔗 اطلاعات پایه

### Base URL
```
https://api.senfi-sharif.ir
```

### احراز هویت
API از JWT (JSON Web Tokens) برای احراز هویت استفاده می‌کند.

```http
Authorization: Bearer <your_jwt_token>
```

### فرمت پاسخ
تمام پاسخ‌ها در فرمت JSON هستند و شامل فیلد `success` هستند:

```json
{
  "success": true,
  "data": {...}
}
```

## 🔐 احراز هویت

### ثبت‌نام کاربر
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@sharif.edu",
  "password": "SecurePassword123!"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@sharif.edu",
    "role": "user",
    "unit": null
  },
  "message": "ثبت نام با موفقیت انجام شد و وارد سیستم شدید"
}
```

### ورود کاربر
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@sharif.edu",
  "password": "SecurePassword123!"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@sharif.edu",
    "role": "user",
    "unit": null
  }
}
```

### بررسی اعتبار توکن
```http
GET /api/auth/validate/
Authorization: Bearer <your_jwt_token>
```

**پاسخ موفق:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@sharif.edu",
    "role": "user",
    "unit": null
  }
}
```

### تمدید توکن
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

## 📋 کارزارها

### دریافت کارزارهای تأیید شده
```http
GET /api/campaigns/approved/
Authorization: Bearer <your_jwt_token>
```

**پاسخ:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "عنوان کارزار",
      "description": "توضیحات کارزار",
      "email": "creator@sharif.edu",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "approved",
      "is_anonymous": "public",
      "end_datetime": "2024-02-15T23:59:59Z",
      "label": "مسائل دانشگاهی"
    }
  ],
  "total": 1
}
```

### ایجاد کارزار جدید
```http
POST /api/campaigns/submit/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "عنوان کارزار",
  "description": "توضیحات کامل کارزار",
  "is_anonymous": "public",
  "end_datetime": "2024-02-15T23:59:59Z",
  "label": "مسائل دانشگاهی"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "campaignId": 1,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "end_datetime": "2024-02-15T23:59:59Z"
}
```

### دریافت کارزارهای در انتظار (ادمین)
```http
GET /api/campaigns/pending/
Authorization: Bearer <your_jwt_token>
```

### تأیید/رد کارزار (ادمین)
```http
POST /api/campaigns/approve/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "campaign_id": 1,
  "approved": true
}
```

## ✍️ امضاها

### امضای کارزار
```http
POST /api/campaigns/{campaign_id}/sign/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "is_anonymous": "public"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "message": "کارزار با موفقیت امضا شد",
  "signature_id": 1,
  "total_signatures": 5
}
```

### دریافت امضاهای کارزار
```http
GET /api/campaigns/{campaign_id}/signatures/
```

**پاسخ:**
```json
{
  "success": true,
  "signatures": [
    {
      "id": 1,
      "user_email": "user@sharif.edu",
      "signed_at": "2024-01-15T10:30:00Z",
      "is_anonymous": "public"
    }
  ],
  "total": 1,
  "campaign_is_anonymous": "public"
}
```

### بررسی امضای کاربر
```http
GET /api/campaigns/{campaign_id}/check-signature/
Authorization: Bearer <your_jwt_token>
```

**پاسخ:**
```json
{
  "has_signed": true,
  "signature": {
    "id": 1,
    "signed_at": "2024-01-15T10:30:00Z",
    "is_anonymous": "public"
  }
}
```

### دریافت کارزارهای امضا شده کاربر
```http
GET /api/user/signed-campaigns/
Authorization: Bearer <your_jwt_token>
```

## 👥 مدیریت کاربران (ادمین)

### دریافت لیست کاربران
```http
GET /api/users/
Authorization: Bearer <your_jwt_token>
```

**پاسخ:**
```json
[
  {
    "id": 1,
    "email": "user@sharif.edu",
    "role": "user",
    "unit": null
  }
]
```

### دریافت اطلاعات کاربر
```http
GET /api/users/{user_id}/
Authorization: Bearer <your_jwt_token>
```

### تغییر نقش کاربر (سوپرادمین)
```http
PUT /api/users/{user_id}/role/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "new_role": "center_member"
}
```

## 📊 نظارت عملکرد (ادمین)

### خلاصه عملکرد
```http
GET /api/performance/summary/
Authorization: Bearer <your_jwt_token>
```

### عملکرد endpoint ها
```http
GET /api/performance/endpoints/
Authorization: Bearer <your_jwt_token>
```

### درخواست‌های کند
```http
GET /api/performance/slow-requests/?limit=10
Authorization: Bearer <your_jwt_token>
```

### متریک‌های سیستم
```http
GET /api/performance/system-metrics/?hours=24
Authorization: Bearer <your_jwt_token>
```

## 🔧 کدهای خطا

### کدهای HTTP
- `200` - موفقیت
- `201` - ایجاد شده
- `400` - درخواست نامعتبر
- `401` - احراز هویت ناموفق
- `403` - دسترسی ممنوع
- `404` - یافت نشد
- `429` - تعداد درخواست زیاد
- `500` - خطای سرور

### پیام‌های خطا
```json
{
  "success": false,
  "detail": "پیام خطا"
}
```

## 📝 مثال‌های استفاده

### مثال کامل با JavaScript
```javascript
// ثبت‌نام کاربر
const registerUser = async (email, password) => {
  const response = await fetch('https://api.senfi-sharif.ir/api/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  return data;
};

// دریافت کارزارها
const getCampaigns = async (token) => {
  const response = await fetch('https://api.senfi-sharif.ir/api/campaigns/approved/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};

// امضای کارزار
const signCampaign = async (campaignId, token, isAnonymous = 'public') => {
  const response = await fetch(`https://api.senfi-sharif.ir/api/campaigns/${campaignId}/sign/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ is_anonymous: isAnonymous })
  });
  
  const data = await response.json();
  return data;
};
```

### مثال با Python
```python
import requests

# تنظیمات پایه
BASE_URL = "https://api.senfi-sharif.ir"
headers = {"Content-Type": "application/json"}

# ثبت‌نام
def register_user(email, password):
    response = requests.post(
        f"{BASE_URL}/api/auth/register/",
        json={"email": email, "password": password},
        headers=headers
    )
    return response.json()

# ورود
def login_user(email, password):
    response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={"email": email, "password": password},
        headers=headers
    )
    return response.json()

# دریافت کارزارها
def get_campaigns(token):
    headers["Authorization"] = f"Bearer {token}"
    response = requests.get(f"{BASE_URL}/api/campaigns/approved/", headers=headers)
    return response.json()
```

## 🔒 امنیت

### بهترین شیوه‌ها
- همیشه از HTTPS استفاده کنید
- توکن‌ها را در جای امن ذخیره کنید
- توکن‌ها را به موقع تمدید کنید
- خطاها را به درستی مدیریت کنید
- از rate limiting پیروی کنید

### محدودیت‌ها
- حداکثر 5 درخواست ورود در دقیقه
- حداکثر 3 درخواست کد تأیید در دقیقه
- توکن‌های دسترسی 1 ساعت اعتبار دارند
- توکن‌های تمدید 7 روز اعتبار دارند

---

**آخرین به‌روزرسانی**: تیر ۱۴۰۴

</div> 