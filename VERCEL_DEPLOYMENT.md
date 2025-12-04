# 🚀 Panduan Deploy ke Vercel

Panduan lengkap untuk deploy frontend Next.js ke Vercel.

---

## 📋 Prerequisites

1. **Akun Vercel** - Daftar di [vercel.com](https://vercel.com)
2. **Repository di GitHub** - Project sudah di-push ke GitHub
3. **Backend API** - Backend harus sudah di-deploy terlebih dahulu (Railway, Render, dll)

---

## 🔧 Setup di Vercel Dashboard

### Step 1: Import Project

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository `dikaipan/casper` dari GitHub
4. Klik **"Import"**

### Step 2: Configure Project Settings

**⚠️ PENTING: Konfigurasi ini harus di-set dengan benar!**

#### Root Directory
- **Root Directory**: `frontend`
  - Klik **"Edit"** di Root Directory
  - Pilih **"frontend"** folder
  - Ini memberitahu Vercel untuk build dari folder `frontend`, bukan root

#### Build Settings
- **Framework Preset**: `Next.js` (auto-detect)
- **Build Command**: `npm run build` (atau biarkan default)
- **Output Directory**: `.next` (auto-detect)
- **Install Command**: `npm install` (atau biarkan default)

#### Environment Variables
Tambahkan environment variables berikut:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Contoh:**
- Jika backend di Railway: `https://your-app.railway.app`
- Jika backend di Render: `https://your-app.onrender.com`

### Step 3: Deploy

1. Klik **"Deploy"**
2. Tunggu proses build selesai
3. Setelah selesai, Anda akan mendapat URL seperti: `https://your-app.vercel.app`

---

## 🔄 Update Environment Variables

Jika perlu update environment variables setelah deploy:

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Edit atau tambah variable
4. Klik **"Redeploy"** untuk apply perubahan

---

## 🐛 Troubleshooting

### Error: "nest: command not found"

**Penyebab**: Vercel mencoba build dari root directory yang berisi backend.

**Solusi**:
1. Pastikan **Root Directory** di-set ke `frontend`
2. Atau hapus `vercel.json` dari root (jika ada)
3. Redeploy project

### Error: "node_modules missing"

**Penyebab**: Dependencies tidak terinstall.

**Solusi**:
1. Pastikan **Root Directory** benar (`frontend`)
2. Pastikan `package.json` ada di folder `frontend`
3. Vercel akan auto-install dependencies jika Root Directory benar

### Error: "Command 'npm run build' exited with 1"

**Penyebab**: Build command gagal.

**Solusi**:
1. Cek log build di Vercel Dashboard
2. Pastikan semua dependencies terinstall
3. Pastikan tidak ada error di code
4. Test build lokal dulu: `cd frontend && npm run build`

### Frontend tidak bisa connect ke Backend

**Penyebab**: Environment variable `NEXT_PUBLIC_API_URL` tidak di-set atau salah.

**Solusi**:
1. Pastikan `NEXT_PUBLIC_API_URL` di-set di Vercel Environment Variables
2. Pastikan URL backend benar dan accessible
3. Redeploy setelah update environment variable

---

## 📝 Catatan Penting

### ⚠️ Backend Tidak Bisa Deploy di Vercel

Vercel adalah platform untuk **frontend** (Next.js, React, dll). **Backend NestJS tidak bisa di-deploy di Vercel**.

**Solusi untuk Backend**:
- Deploy backend ke platform lain seperti:
  - **Railway** (Recommended) - Lihat [FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)
  - **Render**
  - **Fly.io**
  - **Heroku** (Paid)

### 🔗 CORS Configuration

Pastikan backend mengizinkan request dari domain Vercel:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://your-app.vercel.app',
  ],
  credentials: true,
});
```

### 📦 Build Optimization

Vercel akan otomatis:
- Optimize images
- Code splitting
- Static generation untuk pages yang bisa
- Edge functions (jika digunakan)

---

## 🎯 Quick Checklist

- [ ] Repository sudah di-push ke GitHub
- [ ] Backend sudah di-deploy dan accessible
- [ ] Root Directory di-set ke `frontend`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` di-set
- [ ] Build berhasil tanpa error
- [ ] Frontend bisa connect ke backend API

---

## 📞 Support

Jika masih ada masalah:
1. Cek [Vercel Documentation](https://vercel.com/docs)
2. Cek build logs di Vercel Dashboard
3. Test build lokal: `cd frontend && npm run build`

---

**Happy Deploying! 🚀**

