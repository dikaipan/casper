# 📝 Cara Mengisi Environment Variables di Railway

Panduan step-by-step yang sangat detail untuk mengisi environment variables di Railway.

---

## 🎯 Step-by-Step: Mengisi Variables di Railway

### Step 1: Buka Railway Dashboard

1. Kunjungi: https://railway.app
2. Login dengan akun GitHub Anda
3. Klik **project** yang berisi backend service Anda

### Step 2: Buka Service Backend

1. Di project dashboard, cari service **backend** (atau nama service backend Anda)
2. **Klik service backend** tersebut
3. Anda akan masuk ke halaman service detail

### Step 3: Buka Tab Variables

1. Di halaman service backend, lihat menu di atas
2. Klik tab **"Variables"** (atau **"Environment Variables"**)
3. Anda akan melihat daftar environment variables (kosong jika belum ada)

### Step 4: Tambahkan Variable Pertama (DATABASE_URL)

#### 4.1: Dapatkan DATABASE_URL dari MySQL Database

1. Kembali ke **project dashboard** (klik nama project di breadcrumb)
2. Cari service **MySQL Database** (atau database service Anda)
3. **Klik database service** tersebut
4. Klik tab **"Connect"** atau **"Variables"**
5. Cari **"MySQL Connection URL"** atau **"DATABASE_URL"**
6. **Copy URL tersebut**
   - Format: `mysql://root:password@host:3306/database`
   - Contoh: `mysql://root:abc123xyz@containers-us-west-123.railway.app:3306/railway`

#### 4.2: Tambahkan DATABASE_URL ke Backend Service

1. Kembali ke **service backend** → tab **"Variables"**
2. Klik tombol **"New Variable"** atau **"+"** atau **"Add Variable"**
3. Akan muncul form:
   - **Name**: Ketik `DATABASE_URL` (huruf besar semua)
   - **Value**: Paste URL yang sudah di-copy tadi
4. Klik **"Save"** atau **"Add"**

**Contoh:**
```
Name: DATABASE_URL
Value: mysql://root:abc123xyz@containers-us-west-123.railway.app:3306/railway
```

---

### Step 5: Generate JWT Secrets

#### 5.1: Generate JWT_SECRET

**Opsi A: Menggunakan Terminal (Recommended)**

1. Buka terminal/command prompt di laptop Anda
2. Jalankan command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Copy output** yang muncul (64 karakter)
   - Contoh: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

**Opsi B: Menggunakan Online Generator**

1. Kunjungi: https://www.random.org/strings/
2. Settings:
   - **Length**: 64
   - **Characters**: Allow all characters
   - **Generate**: 1 string
3. Klik **"Generate Strings"**
4. **Copy string** yang dihasilkan

#### 5.2: Generate JWT_REFRESH_SECRET

1. **Generate string kedua** (gunakan cara yang sama seperti JWT_SECRET)
2. **Copy string kedua** ini (harus berbeda dari JWT_SECRET)

**Contoh:**
```
JWT_SECRET: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0
```

---

### Step 6: Tambahkan JWT Variables

#### 6.1: Tambahkan JWT_SECRET

1. Di tab **"Variables"** service backend
2. Klik **"New Variable"**
3. Isi form:
   - **Name**: `JWT_SECRET`
   - **Value**: Paste JWT_SECRET yang sudah di-generate
4. Klik **"Save"**

#### 6.2: Tambahkan JWT_REFRESH_SECRET

1. Klik **"New Variable"** lagi
2. Isi form:
   - **Name**: `JWT_REFRESH_SECRET`
   - **Value**: Paste JWT_REFRESH_SECRET yang sudah di-generate
3. Klik **"Save"**

#### 6.3: Tambahkan JWT_EXPIRATION

1. Klik **"New Variable"**
2. Isi form:
   - **Name**: `JWT_EXPIRATION`
   - **Value**: `15m` (15 menit)
3. Klik **"Save"**

#### 6.4: Tambahkan JWT_REFRESH_EXPIRATION

1. Klik **"New Variable"**
2. Isi form:
   - **Name**: `JWT_REFRESH_EXPIRATION`
   - **Value**: `7d` (7 hari)
3. Klik **"Save"**

---

### Step 7: Tambahkan Server Variables

#### 7.1: Tambahkan NODE_ENV

1. Klik **"New Variable"**
2. Isi form:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
3. Klik **"Save"**

#### 7.2: Tambahkan PORT

1. Klik **"New Variable"**
2. Isi form:
   - **Name**: `PORT`
   - **Value**: `3000`
3. Klik **"Save"**

---

### Step 8: Tambahkan CORS_ORIGIN (Opsional - Update Setelah Frontend Deploy)

1. Klik **"New Variable"**
2. Isi form:
   - **Name**: `CORS_ORIGIN`
   - **Value**: `https://your-app.vercel.app` (ganti dengan URL frontend Vercel Anda)
3. Klik **"Save"**

**Note:** Jika frontend belum di-deploy, bisa diisi dulu dengan placeholder atau di-update nanti.

---

## 📋 Checklist Variables yang Harus Diisi

Setelah selesai, Anda harus punya **8 variables** berikut:

- [ ] `DATABASE_URL` = `mysql://root:...@...:3306/...`
- [ ] `JWT_SECRET` = `64-character-random-string`
- [ ] `JWT_REFRESH_SECRET` = `64-character-random-string` (berbeda dari JWT_SECRET)
- [ ] `JWT_EXPIRATION` = `15m`
- [ ] `JWT_REFRESH_EXPIRATION` = `7d`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `CORS_ORIGIN` = `https://your-app.vercel.app` (update setelah frontend deploy)

---

## 🎨 Visual Guide (Text-based)

### Tampilan Variables Tab:

```
┌─────────────────────────────────────────┐
│  Service: backend                       │
├─────────────────────────────────────────┤
│  [Deployments] [Variables] [Settings]   │
├─────────────────────────────────────────┤
│                                         │
│  Environment Variables                  │
│  ┌───────────────────────────────────┐ │
│  │ Name              Value           │ │
│  ├───────────────────────────────────┤ │
│  │ DATABASE_URL      mysql://...     │ │
│  │ JWT_SECRET        a1b2c3d4...     │ │
│  │ JWT_REFRESH_SECRET z9y8x7w6...    │ │
│  │ JWT_EXPIRATION    15m             │ │
│  │ JWT_REFRESH_EXPIRATION 7d         │ │
│  │ NODE_ENV          production      │ │
│  │ PORT              3000            │ │
│  │ CORS_ORIGIN       https://...     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [+ New Variable]                      │
└─────────────────────────────────────────┘
```

---

## 🔍 Cara Edit/Delete Variable

### Edit Variable:

1. Di tab **"Variables"**
2. Cari variable yang ingin di-edit
3. Klik **icon edit** (pensil) atau **klik variable tersebut**
4. Edit value
5. Klik **"Save"**

### Delete Variable:

1. Di tab **"Variables"**
2. Cari variable yang ingin di-hapus
3. Klik **icon delete** (trash) atau **"..."** → **"Delete"**
4. Konfirmasi delete

---

## ✅ Verifikasi Variables Sudah Terisi

### Cara 1: Check di Railway Dashboard

1. Service Backend → Variables
2. Pastikan semua 8 variables ada
3. Pastikan values tidak kosong

### Cara 2: Check Logs

1. Service Backend → Deployments → Latest → View Logs
2. Cari error seperti:
   - ❌ "JWT_SECRET is not configured" → JWT_SECRET belum di-set
   - ❌ "DATABASE_URL is not configured" → DATABASE_URL belum di-set
3. Jika tidak ada error tersebut, variables sudah benar

### Cara 3: Test Health Endpoint

```bash
curl https://your-backend.railway.app/api/health
```

Jika return `{"status":"ok",...}`, berarti variables sudah benar.

---

## 🚨 Troubleshooting

### Variable Tidak Muncul Setelah Di-set

**Solusi:**
1. Refresh halaman Railway Dashboard
2. Check apakah variable benar-benar di-save
3. Pastikan tidak ada typo di name variable

### Railway Tidak Redeploy Setelah Set Variable

**Solusi:**
1. Railway biasanya auto-redeploy, tapi bisa manual:
2. Service Backend → Deployments
3. Klik "..." → Redeploy
4. Uncheck "Use existing Build Cache"

### Error: "JWT_SECRET is not configured"

**Solusi:**
1. Pastikan variable name = `JWT_SECRET` (huruf besar semua)
2. Pastikan value tidak kosong
3. Pastikan sudah di-save
4. Redeploy service

### Error: "DATABASE_URL is not configured"

**Solusi:**
1. Pastikan MySQL database sudah dibuat
2. Copy DATABASE_URL dari database service
3. Pastikan format benar: `mysql://root:password@host:3306/database`
4. Pastikan sudah di-save
5. Redeploy service

---

## 📝 Contoh Lengkap Variables

Berikut contoh lengkap semua variables yang harus diisi:

```env
# Database
DATABASE_URL=mysql://root:abc123xyz@containers-us-west-123.railway.app:3306/railway

# JWT Secrets (GENERATE RANDOM!)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Server
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://your-app.vercel.app
```

**PENTING:**
- Ganti `DATABASE_URL` dengan URL dari database service Anda
- Ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET` dengan random strings yang Anda generate
- Ganti `CORS_ORIGIN` dengan URL frontend Vercel Anda

---

## 🎯 Quick Reference

### Command untuk Generate JWT Secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (jalankan lagi)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Format Variables:

- **Name**: Huruf besar, underscore untuk separator
- **Value**: Tidak ada quotes, langsung value saja
- **Case Sensitive**: Ya, name harus exact match

### Contoh Benar vs Salah:

**Benar:**
```
Name: JWT_SECRET
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Salah:**
```
Name: jwt_secret          ❌ (huruf kecil)
Name: JWT-SECRET          ❌ (pakai dash, bukan underscore)
Value: "a1b2c3..."       ❌ (ada quotes)
Value: a1b2c3...          ✅ (benar)
```

---

## 🎉 Setelah Semua Variables Diisi

1. **Railway akan otomatis redeploy** (tunggu ~1-2 menit)
2. **Check logs** untuk memastikan tidak ada error
3. **Test health endpoint:**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```
4. **Jika berhasil**, akan return:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-04T...",
     "uptime": 123.45,
     "service": "Hitachi CRM Management API"
   }
   ```

---

## 📚 Next Steps

Setelah variables diisi:

1. ✅ Variables sudah di-set
2. ⏭️ Run database migrations (lihat panduan lain)
3. ⏭️ Update frontend API URL
4. ⏭️ Update CORS_ORIGIN setelah frontend deploy

---

**Selamat! Variables sudah diisi. Aplikasi akan berjalan dengan baik! 🚀**

