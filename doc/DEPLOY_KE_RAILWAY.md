# 🚂 Panduan Lengkap Deploy ke Railway

Panduan step-by-step untuk deploy backend NestJS ke Railway dengan Dockerfile.

---

## 📋 Prerequisites

- ✅ Akun GitHub (untuk connect repository)
- ✅ Akun Railway (sign up di https://railway.app)
- ✅ Repository sudah di-push ke GitHub
- ✅ Dockerfile sudah siap (sudah ada di `backend/Dockerfile`)

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign up Railway

1. Kunjungi: https://railway.app
2. Klik **"Start a New Project"** atau **"Login"**
3. Pilih **"Login with GitHub"**
4. Authorize Railway untuk akses GitHub repositories

### Step 2: Create New Project

1. Di Railway Dashboard, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository Anda (`dikaipan/casper`)
4. Railway akan otomatis detect project

### Step 3: Setup Backend Service

1. **PENTING**: Set **Root Directory** ke `backend`
   - Klik service yang baru dibuat
   - Go to **Settings** → **Root Directory**
   - Klik **"Edit"**
   - Ketik: `backend`
   - Klik **"Save"**

2. **Enable Docker Build**:
   - Go to **Settings** → **Build**
   - Pilih **"Dockerfile"** sebagai build method
   - Pastikan Dockerfile path: `Dockerfile` (atau `backend/Dockerfile`)
   - Save

### Step 4: Setup MySQL Database

1. Di Railway Dashboard (project yang sama), klik **"New"**
2. Pilih **"Database"** → **"MySQL"**
3. Railway akan otomatis membuat database
4. Tunggu hingga database siap (~1-2 menit)
5. Klik database yang baru dibuat
6. Di tab **"Connect"**, copy **"MySQL Connection URL"**
   - Format: `mysql://root:password@host:3306/database`
   - Contoh: `mysql://root:abc123@containers-us-west-123.railway.app:3306/railway`
   - **Simpan URL ini!**

### Step 5: Setup Environment Variables

1. Di Railway Dashboard, buka service **backend**
2. Go to **"Variables"** tab
3. Klik **"New Variable"** untuk setiap variable berikut:

```env
# Database (dari Step 4)
DATABASE_URL=mysql://root:abc123@containers-us-west-123.railway.app:3306/railway

# JWT Secrets (GENERATE RANDOM STRINGS!)
JWT_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-random-32-char-string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Server
NODE_ENV=production
PORT=3000

# CORS (akan diupdate setelah deploy frontend)
CORS_ORIGIN=https://your-app.vercel.app
```

**Generate JWT Secrets:**
```bash
# Di terminal lokal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Jalankan 2 kali untuk JWT_SECRET dan JWT_REFRESH_SECRET
```

### Step 6: Setup Prisma untuk MySQL

1. **Pastikan menggunakan schema MySQL:**
   ```bash
   cd backend
   # Copy schema MySQL jika belum
   cp prisma/schema.mysql.prisma prisma/schema.prisma
   # Atau edit schema.prisma untuk menggunakan provider MySQL
   ```

2. **Update schema.prisma:**
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Commit dan push perubahan:**
   ```bash
   git add backend/prisma/schema.prisma
   git commit -m "Use MySQL schema for Railway deployment"
   git push origin main
   ```

### Step 7: Deploy Backend

1. Railway akan otomatis trigger build setelah:
   - Root Directory di-set
   - Environment variables di-set
   - Code di-push ke GitHub

2. **Monitor Build:**
   - Klik service backend
   - Go to **"Deployments"** tab
   - Klik deployment terbaru untuk melihat logs
   - Tunggu build selesai (~3-5 menit)

3. **Jika Build Berhasil:**
   - Status akan menjadi **"Active"**
   - Railway akan memberikan URL seperti: `https://your-backend.railway.app`
   - **Copy URL ini!**

### Step 8: Run Database Migrations

Setelah backend deploy berhasil, run Prisma migrations:

#### Opsi A: Menggunakan Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ke project
railway link

# Generate Prisma Client
railway run npm run prisma:generate

# Run migrations
railway run npm run prisma:migrate deploy

# Seed database (opsional)
railway run npm run prisma:seed
```

#### Opsi B: Menggunakan Railway Shell

1. Di Railway Dashboard, buka service backend
2. Klik **"Shell"** tab
3. Run commands:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate deploy
   npm run prisma:seed  # opsional
   ```

### Step 9: Update CORS Origin

1. Setelah frontend di-deploy (di Vercel), dapatkan URL frontend
2. Di Railway Dashboard, buka service backend
3. Go to **"Variables"** tab
4. Update `CORS_ORIGIN` dengan URL frontend Vercel:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. Railway akan otomatis redeploy

### Step 10: Update Frontend

1. Buka **Vercel Dashboard** → Project Anda
2. Go to **Settings** → **Environment Variables**
3. Update atau tambahkan:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
   **PENTING**: Jangan tambahkan `/api` di akhir URL!

4. **Redeploy Frontend:**
   - Deployments → "..." → Redeploy
   - Uncheck "Use existing Build Cache"

---

## 🔍 Verifikasi Deployment

### 1. Test Backend Health Endpoint

```bash
curl https://your-backend.railway.app/api/health
# Should return: {"status":"ok","timestamp":"...","uptime":...,"service":"..."}
```

### 2. Test Backend API

```bash
# Test version endpoint
curl https://your-backend.railway.app/api/version
# Should return: {"version":"1.0.0","environment":"production",...}
```

### 3. Test Frontend Connection

1. Buka frontend di browser: `https://your-app.vercel.app`
2. Coba login atau akses API
3. Cek browser console untuk error
4. Cek Network tab untuk melihat request ke backend

---

## 🐛 Troubleshooting

### Error: "Error creating build plan with Railpack"

**Solusi:**
1. Pastikan **Root Directory** di-set ke `backend`
2. Pastikan **Dockerfile** enabled di Settings → Build
3. Pastikan `Dockerfile` ada di folder `backend/`
4. Redeploy dengan uncheck build cache

**Lihat**: [FIX_RAILWAY_BUILD_ERROR.md](./FIX_RAILWAY_BUILD_ERROR.md)

### Error: "Cannot find package.json"

**Solusi:**
1. Pastikan Root Directory benar (`backend`)
2. Pastikan `package.json` ada di folder `backend/`
3. Check di Railway Dashboard → Settings → Root Directory

### Error: "Prisma not found" atau "Prisma Client not generated"

**Solusi:**
1. Pastikan `prisma:generate` di-run sebelum build
2. Update build command (jika tidak menggunakan Dockerfile):
   ```
   npm install && npm run prisma:generate && npm run build
   ```
3. Atau run manual setelah deploy:
   ```bash
   railway run npm run prisma:generate
   ```

### Error: "Database connection failed"

**Solusi:**
1. Pastikan `DATABASE_URL` benar (copy dari Railway database)
2. Pastikan database sudah running
3. Pastikan schema.prisma menggunakan provider MySQL
4. Test connection string di lokal dulu

### Error: "Port already in use"

**Solusi:**
1. Pastikan `PORT` environment variable di-set ke `3000`
2. Railway akan otomatis assign port, tapi app harus listen ke `process.env.PORT`
3. Pastikan di `main.ts` menggunakan: `process.env.PORT || 3000`

### Build Success tapi App Tidak Start

**Solusi:**
1. Cek logs di Railway Dashboard → Deployments → View Logs
2. Pastikan `start:prod` command benar: `node dist/src/main`
3. Pastikan build menghasilkan `dist/` folder
4. Pastikan semua environment variables sudah di-set

### CORS Error di Frontend

**Solusi:**
1. Pastikan `CORS_ORIGIN` di-set dengan benar
2. Format: `https://your-app.vercel.app` (tanpa trailing slash)
3. Redeploy backend setelah update CORS_ORIGIN
4. Cek browser console untuk error detail

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] Railway account dibuat
- [ ] GitHub repository connected
- [ ] Root Directory di-set ke `backend`
- [ ] Dockerfile enabled
- [ ] MySQL database dibuat
- [ ] DATABASE_URL di-copy

### Environment Variables
- [ ] `DATABASE_URL` di-set
- [ ] `JWT_SECRET` di-set (random string)
- [ ] `JWT_REFRESH_SECRET` di-set (random string)
- [ ] `JWT_EXPIRATION=15m`
- [ ] `JWT_REFRESH_EXPIRATION=7d`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `CORS_ORIGIN` (akan diupdate setelah frontend deploy)

### Database
- [ ] Schema.prisma menggunakan provider MySQL
- [ ] Prisma migrations di-run
- [ ] Database seeded (opsional)

### Deployment
- [ ] Backend build berhasil
- [ ] Backend accessible (health check OK)
- [ ] Frontend di-update dengan backend URL
- [ ] Frontend di-redeploy
- [ ] CORS_ORIGIN di-update
- [ ] Backend di-redeploy setelah CORS update

### Testing
- [ ] Health endpoint working
- [ ] Frontend bisa connect ke backend
- [ ] Login berhasil
- [ ] Tidak ada CORS error
- [ ] API requests berhasil

---

## 🎯 Quick Reference

### Railway Dashboard URLs:
- **Dashboard**: https://railway.app/dashboard
- **Project**: https://railway.app/project/[project-id]
- **Service**: https://railway.app/service/[service-id]

### Important Commands:

```bash
# Railway CLI
railway login
railway link
railway run <command>
railway logs

# Prisma
railway run npm run prisma:generate
railway run npm run prisma:migrate deploy
railway run npm run prisma:seed
```

### Environment Variables Template:

```env
DATABASE_URL=mysql://root:password@host:3306/database
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 💡 Tips & Best Practices

1. **Always Set Root Directory**: Pastikan Root Directory di-set ke `backend` sebelum deploy pertama kali
2. **Use Dockerfile**: Dockerfile lebih reliable daripada Nixpacks untuk NestJS
3. **Generate JWT Secrets**: Jangan gunakan default secrets, generate random strings
4. **Test Locally First**: Test build lokal dulu sebelum deploy: `docker build --target production -t test .`
5. **Monitor Logs**: Selalu cek logs jika ada error
6. **Backup Database**: Setup regular backup untuk database
7. **Update CORS After Frontend Deploy**: Update CORS_ORIGIN setelah frontend di-deploy

---

## 🔄 Update & Redeploy

### Update Code:

1. **Push changes ke GitHub:**
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. **Railway akan otomatis redeploy** (jika auto-deploy enabled)

3. **Atau manual redeploy:**
   - Railway Dashboard → Service → Deployments
   - Klik "..." → Redeploy
   - Uncheck "Use existing Build Cache"

### Update Environment Variables:

1. Railway Dashboard → Service → Variables
2. Edit variable
3. Railway akan otomatis redeploy

### Rollback Deployment:

1. Railway Dashboard → Service → Deployments
2. Klik deployment sebelumnya
3. Klik "..." → Redeploy

---

## 📊 Monitoring

### View Logs:

1. Railway Dashboard → Service → Deployments
2. Klik deployment terbaru
3. Klik "View Logs"

### View Metrics:

1. Railway Dashboard → Service
2. Go to "Metrics" tab
3. View CPU, Memory, Network usage

### Health Check:

```bash
# Test health endpoint
curl https://your-backend.railway.app/api/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "uptime": 123.45,
#   "service": "Hitachi CRM Management API"
# }
```

---

## 🚨 Common Issues & Solutions

### Issue: Build Fails dengan "Railpack Error"

**Solution**: Gunakan Dockerfile (sudah di-setup)

### Issue: Database Connection Timeout

**Solution**: 
- Pastikan DATABASE_URL benar
- Pastikan database service running
- Check network settings

### Issue: App Crashes After Start

**Solution**:
- Cek logs untuk error
- Pastikan semua environment variables di-set
- Pastikan Prisma Client generated
- Pastikan migrations run

### Issue: Frontend Cannot Connect

**Solution**:
- Pastikan NEXT_PUBLIC_API_URL benar
- Pastikan CORS_ORIGIN di-set
- Pastikan backend accessible
- Cek browser console untuk error

---

## 📚 Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Docker**: https://docs.railway.app/deploy/dockerfiles
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🎯 Quick Start Checklist

1. [ ] Sign up Railway
2. [ ] Create project from GitHub
3. [ ] Set Root Directory: `backend`
4. [ ] Enable Dockerfile build
5. [ ] Create MySQL database
6. [ ] Set environment variables
7. [ ] Deploy backend
8. [ ] Run Prisma migrations
9. [ ] Update frontend API URL
10. [ ] Update CORS_ORIGIN
11. [ ] Test deployment
12. [ ] Done! 🎉

---

**Selamat deploy! 🚀**

Jika ada masalah, cek logs di Railway Dashboard dan pastikan semua checklist sudah dilakukan.

