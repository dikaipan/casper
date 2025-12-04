# 🖥️ Cara Menggunakan Railway Shell

Panduan lengkap step-by-step untuk menggunakan Railway Shell untuk menjalankan commands di Railway.

---

## 🎯 Apa itu Railway Shell?

Railway Shell adalah terminal yang berjalan di environment Railway (backend service). Semua commands yang dijalankan di Railway Shell akan execute di Railway, bukan di laptop Anda.

---

## 📋 Step-by-Step: Menggunakan Railway Shell

### Step 1: Buka Railway Dashboard

1. Kunjungi: https://railway.app
2. Login dengan akun GitHub Anda
3. Pilih **project** yang berisi backend service

### Step 2: Buka Service Backend

1. Di project dashboard, cari service **"casper"** (atau nama service backend Anda)
2. **Klik service "casper"** tersebut
3. Anda akan masuk ke halaman service detail

### Step 3: Buka Tab Shell

1. Di halaman service detail, lihat menu di atas:
   - **Deployments** | **Variables** | **Settings** | **Shell** | **Metrics**
2. **Klik tab "Shell"**
3. Tunggu beberapa detik hingga shell ready
4. Anda akan melihat terminal interface

### Step 4: Shell Ready

Setelah shell ready, Anda akan melihat:
```
/app #
```

Ini berarti shell sudah siap dan Anda berada di working directory `/app` (yang adalah root directory backend service).

---

## 🎯 Visual Guide (Text-based)

```
┌─────────────────────────────────────────┐
│  Railway Dashboard                      │
├─────────────────────────────────────────┤
│  Project: Your Project                  │
│                                         │
│  Services:                              │
│  ┌───────────────────────────────────┐ │
│  │ [casper] (backend)                │ │ ← Klik ini
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ [MySQL] (database)                │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

Setelah klik service "casper":

┌─────────────────────────────────────────┐
│  Service: casper                       │
├─────────────────────────────────────────┤
│  [Deployments] [Variables] [Settings]  │
│  [Shell] ← Klik ini                    │
│  [Metrics]                              │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Railway Shell                     │ │
│  │                                   │ │
│  │ /app #                            │ │ ← Shell ready
│  │                                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 💻 Commands yang Bisa Dijalankan

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

**Expected output:**
```
✔ Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client
```

### 2. Run Migrations

```bash
npm run prisma:migrate:deploy
```

**Expected output:**
```
✔ Applied migration: 20251203022109_init_mysql
Database schema is up to date!
```

### 3. Check Migration Status

```bash
npx prisma migrate status
```

**Expected output:**
```
1 migration found in prisma/migrations
Database schema is up to date!
```

### 4. Run Seed Data

```bash
npm run prisma:seed
```

**Expected output:**
```
🌱 Starting database seed...
📦 Creating cassette types...
✅ Cassette types created
👤 Creating Hitachi users...
✅ Seed data created successfully!
```

### 5. Check Current Directory

```bash
pwd
```

**Expected output:**
```
/app
```

### 6. List Files

```bash
ls -la
```

**Expected output:**
```
drwxr-xr-x  ... node_modules
-rw-r--r--  ... package.json
-rw-r--r--  ... package-lock.json
drwxr-xr-x  ... prisma
drwxr-xr-x  ... src
...
```

### 7. Check Environment Variables

```bash
echo $DATABASE_URL
echo $NODE_ENV
```

---

## 📝 Contoh Lengkap: Run Migrations

### Step 1: Buka Railway Shell

1. Railway Dashboard → Service "casper"
2. Tab "Shell"
3. Tunggu shell ready

### Step 2: Generate Prisma Client

```bash
npm run prisma:generate
```

**Tunggu hingga selesai** (beberapa detik)

### Step 3: Run Migrations

```bash
npm run prisma:migrate:deploy
```

**Tunggu hingga selesai** (beberapa detik)

### Step 4: Verifikasi

```bash
npx prisma migrate status
```

**Harus menunjukkan:**
```
Database schema is up to date!
```

---

## 🎯 Tips & Best Practices

### 1. Tunggu Shell Ready

- Jangan langsung ketik command sebelum shell ready
- Tunggu hingga muncul prompt: `/app #`

### 2. Satu Command Sekali

- Jalankan satu command, tunggu selesai, baru command berikutnya
- Jangan ketik multiple commands sekaligus

### 3. Cek Output

- Selalu cek output untuk memastikan command berhasil
- Jika ada error, baca error message dengan teliti

### 4. Environment Variables

- Railway Shell sudah memiliki akses ke semua environment variables
- Tidak perlu set manual, sudah otomatis

### 5. Working Directory

- Railway Shell sudah berada di `/app` (root directory backend)
- Tidak perlu `cd` ke folder lain

---

## 🐛 Troubleshooting

### Shell Tidak Muncul

**Solusi:**
1. Refresh halaman Railway Dashboard
2. Pastikan service backend sudah deployed
3. Coba buka tab lain dulu, lalu kembali ke Shell

### Command Tidak Ditemukan

**Solusi:**
1. Pastikan command dijalankan di Railway Shell (bukan terminal lokal)
2. Pastikan working directory benar (`/app`)
3. Cek apakah script ada di `package.json`

### Error: "Cannot find module"

**Solusi:**
```bash
# Install dependencies
npm install
```

### Shell Hang atau Tidak Responsif

**Solusi:**
1. Refresh halaman
2. Buka Shell tab lagi
3. Jika masih hang, coba beberapa saat lagi

---

## ✅ Checklist Menggunakan Railway Shell

- [ ] Railway Dashboard dibuka
- [ ] Service "casper" dibuka
- [ ] Tab "Shell" diklik
- [ ] Shell ready (muncul `/app #`)
- [ ] Command dijalankan
- [ ] Output dicek
- [ ] Tidak ada error

---

## 🎯 Quick Reference

### Akses Railway Shell:
1. Railway Dashboard → Service "casper" → Tab "Shell"

### Commands Umum:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Migrations
npm run prisma:migrate:deploy

# Check Migration Status
npx prisma migrate status

# Run Seed
npm run prisma:seed

# Check Directory
pwd

# List Files
ls -la
```

---

## 📚 Perbedaan Railway Shell vs Terminal Lokal

| Item | Railway Shell | Terminal Lokal |
|------|---------------|----------------|
| **Location** | Di Railway (cloud) | Di laptop Anda |
| **Working Directory** | `/app` (backend service) | `D:\HCS Cassete management\hcm` |
| **Environment** | Production Railway | Local development |
| **Database** | Railway MySQL | XAMPP MySQL (local) |
| **Environment Variables** | Dari Railway Variables | Dari `.env` file |
| **Use Case** | Run migrations, seed di production | Development, testing lokal |

---

## 🎉 Summary

**Railway Shell adalah cara untuk menjalankan commands di environment Railway:**

1. **Buka:** Railway Dashboard → Service → Tab "Shell"
2. **Tunggu:** Shell ready (muncul `/app #`)
3. **Jalankan:** Commands yang diperlukan
4. **Cek:** Output untuk verify berhasil

**PENTING:** Railway Shell berbeda dengan terminal lokal. Commands di Railway Shell akan execute di Railway, bukan di laptop Anda.

---

**Sekarang Anda tahu cara menggunakan Railway Shell! 🚀**

