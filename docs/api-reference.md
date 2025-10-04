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
https://senfi.stu.sharif.ir/api
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
  "password": "SecurePassword123!",
  "faculty": "مهندسی کامپیوتر",
  "dormitory": "طرشت ۳"
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
    "faculty": "مهندسی کامپیوتر",
    "dormitory": "طرشت ۳"
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
    "faculty": "مهندسی کامپیوتر",
    "dormitory": "طرشت ۳"
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
    "faculty": "مهندسی کامپیوتر",
    "dormitory": "طرشت ۳"
  }
}
```

## 📝 کارزارها

### دریافت کارزارهای تأیید شده
```http
GET /api/campaigns/approved/
```

**پاسخ:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "بهبود سیستم گرمایشی خوابگاه‌ها",
      "content": "درخواست بهبود سیستم گرمایشی...",
      "category": "مسائل خوابگاهی",
      "author_email": "author@sharif.edu",
      "created_at": "2024-01-15T10:30:00Z",
      "deadline": "2024-02-15T23:59:59Z",
      "signature_count": 150,
      "status": "approved"
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
  "title": "بهبود سیستم گرمایشی خوابگاه‌ها",
  "content": "درخواست بهبود سیستم گرمایشی خوابگاه‌ها...",
  "category": "مسائل خوابگاهی",
  "deadline": "2024-02-15T23:59:59Z",
  "is_anonymous": false,
  "anonymous_allowed": true
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "message": "کارزار شما با موفقیت ثبت شد و در انتظار تایید ادمین است",
  "campaign": {
    "id": 1,
    "title": "بهبود سیستم گرمایشی خوابگاه‌ها",
    "status": "pending"
  }
}
```

### امضای کارزار
```http
POST /api/campaigns/{campaign_id}/sign/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "is_anonymous": false
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "message": "کارزار با موفقیت امضا شد",
  "signature_id": 1,
  "total_signatures": 151
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
      "signed_at": "2024-01-15T11:00:00Z",
      "is_anonymous": false
    }
  ],
  "total": 1,
  "campaign_anonymous_allowed": true
}
```

## 📊 نظرسنجی‌ها

### دریافت نظرسنجی‌های تأیید شده
```http
GET /api/polls/
```

**پاسخ:**
```json
{
  "success": true,
  "polls": [
    {
      "id": 1,
      "title": "نظرسنجی درباره زمان امتحانات",
      "question": "آیا موافق تغییر زمان امتحانات هستید؟",
      "category": "مسائل آموزشی",
      "options": [
        {"id": 1, "text": "بله"},
        {"id": 2, "text": "خیر"}
      ],
      "total_votes": 200,
      "status": "approved",
      "deadline": "2024-02-15T23:59:59Z"
    }
  ],
  "total": 1
}
```

### ایجاد نظرسنجی جدید
```http
POST /api/polls/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "نظرسنجی درباره زمان امتحانات",
  "question": "آیا موافق تغییر زمان امتحانات هستید؟",
  "category": "مسائل آموزشی",
  "options": [
    {"text": "بله"},
    {"text": "خیر"}
  ],
  "max_choices": 1,
  "is_anonymous": false,
  "deadline": "2024-02-15T23:59:59Z"
}
```

### رأی دادن در نظرسنجی
```http
POST /api/polls/{poll_id}/vote/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "option_ids": [1]
}
```

## 📰 بلاگ

### دریافت بلاگ‌های منتشر شده
```http
GET /api/blog/posts/
```

**پاسخ:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "title": "گزارش جلسه شورای صنفی",
      "slug": "report-council-meeting",
      "excerpt": "خلاصه‌ای از جلسه شورای صنفی...",
      "content": "متن کامل گزارش...",
      "category": "گزارش‌ها",
      "author_email": "admin@sharif.edu",
      "published_at": "2024-01-15T10:00:00Z",
      "reading_time": 5
    }
  ],
  "total": 1
}
```

### دریافت جزئیات بلاگ
```http
GET /api/blog/posts/{slug}/
```

## 👤 پروفایل کاربر

### دریافت اطلاعات کاربر
```http
GET /api/auth/user-info/
Authorization: Bearer <your_jwt_token>
```

### دریافت کارزارهای امضا شده
```http
GET /api/user/signed-campaigns/
Authorization: Bearer <your_jwt_token>
```

### دریافت نظرسنجی‌های رأی داده شده
```http
GET /api/user/voted-polls/
Authorization: Bearer <your_jwt_token>
```

### دریافت کارزارهای ایجاد شده
```http
GET /api/user/created-campaigns/
Authorization: Bearer <your_jwt_token>
```

### دریافت بلاگ‌های ایجاد شده
```http
GET /api/user/created-blog-posts/
Authorization: Bearer <your_jwt_token>
```

### دریافت نظرسنجی‌های ایجاد شده
```http
GET /api/user/created-polls/
Authorization: Bearer <your_jwt_token>
```

## 🔧 تغییر رمز عبور

```http
POST /api/auth/change-password/
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

## 📋 کدهای خطا

| کد | معنی |
|----|------|
| 200 | موفقیت |
| 400 | درخواست نامعتبر |
| 401 | عدم احراز هویت |
| 403 | عدم دسترسی |
| 404 | یافت نشد |
| 429 | تعداد درخواست بیش از حد مجاز |
| 500 | خطای داخلی سرور |

## 🔒 نکات امنیتی

- همیشه از HTTPS استفاده کنید
- توکن‌های JWT را در جای امنی نگهداری کنید
- توکن‌ها را به اشتراک نگذارید
- در صورت مشکوک شدن به نشت توکن، فوراً رمز عبور را تغییر دهید
- از رمزهای عبور قوی استفاده کنید

## 📞 پشتیبانی

برای سوالات فنی و مشکلات API، با تیم فنی شورای صنفی تماس بگیرید.

</div> 