# 🛒 কাচাবাজার Admin Panel

পূর্ণাঙ্গ e-commerce admin panel — Orders, Products, Customers, Delivery, Reports, Marketing সব এক জায়গায়।

![Version](https://img.shields.io/badge/version-6.2-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Database-3ECF8E)

---

## ✨ Features

- 🔐 **Supabase Auth** — Secure login, session management
- 👥 **Role-Based Access** — Admin, Manager, Editor, Staff
- 📦 **Products** — CRUD, bulk actions, CSV export, image upload
- 🛒 **Orders** — Full lifecycle (pending → delivered), manual order, packing slip
- 👤 **Customers** — Segments (VIP/New/Inactive), blocked list
- 🎁 **Marketing** — Coupons, offers, loyalty points, referrals
- 🚚 **Delivery** — Partners, zones, COD limits
- 📊 **Reports** — Daily sales, top products, category/district breakdown
- 🖨️ **Print** — Invoice (A4), Packing slip (4×6"), Labels, QR codes
- 📱 **PWA** — Installable, offline-first
- 🌙 **Bilingual** — বাংলা + English
- 📱 **Mobile-Ready** — Bottom nav, drawer, responsive

---

## 🚀 Quick Start

### 1. Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- Supabase account — [supabase.com](https://supabase.com)
- Local server (Python/Node) — CORS avoid করতে

### 2. Supabase Setup

#### ২.১ Project তৈরি

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Name: `kachabazar`
3. Region: `Southeast Asia (Singapore)`
4. Database password সংরক্ষণ করুন

#### ২.২ Database Schema

**SQL Editor** → **New query** → `docs/schema.sql` (এই README-এর নিচে) paste করুন → **Run**

#### ২.৩ RLS Policies

**New query** → `docs/rls-policies.sql` → **Run**

#### ২.৪ Admin User

**Authentication** → **Users** → **Add user**

| Field | Value |
|-------|-------|
| Email | `admin@kachabazar.com` |
| Password | শক্তিশালী password |
| Auto Confirm | ✅ Check |

তারপর SQL Editor-এ:

```sql
UPDATE profiles
SET role = 'admin', name = 'Admin'
WHERE email = 'admin@kachabazar.com';