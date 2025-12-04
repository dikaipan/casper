# 🔧 Fix Error: "/prisma": not found di Railway Docker Build

Panduan untuk mengatasi error `"/prisma": not found` saat build Docker di Railway.

---

## 🔍 Penyebab Error

Error `"/prisma": not found` terjadi karena:

1. **Prisma folder tidak ter-copy** saat Docker build
2. **Urutan COPY salah** - prisma di-copy setelah npm ci
3. **Prisma folder tidak ter-commit** ke git
4. **Root directory** tidak di-set dengan benar di Railway

---

## ✅ Solusi yang Sudah Diterapkan

### 1. Perbaiki Urutan COPY di Dockerfile

Dockerfile sudah diperbaiki untuk copy prisma folder **sebelum** npm ci:

```dockerfile
# Copy package files
COPY package*.json ./

# Copy prisma folder FIRST (needed before npm ci for Prisma)
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .
```

### 2. Pastikan Prisma Folder Ter-commit

Verifikasi prisma folder ada di git:

```bash
git ls-files backend/prisma/
# Should show prisma files
```

Jika tidak ada, commit prisma folder:

```bash
cd backend
git add prisma/
git commit -m "Add prisma folder to git"
git push origin main
```

---

## 🔧 Langkah-langkah Fix

### Step 1: Verifikasi Prisma Folder di Git

```bash
# Check if prisma folder is in git
git ls-files backend/prisma/

# If empty, add prisma folder
cd backend
git add prisma/
git commit -m "Ensure prisma folder is committed"
git push origin main
```

### Step 2: Pastikan Root Directory Benar

Di Railway Dashboard:
1. Service Backend → Settings → Root Directory
2. Pastikan: `backend`
3. Save

### Step 3: Pastikan Dockerfile Benar

Dockerfile sudah diperbaiki. Pastikan urutan:
1. COPY package*.json
2. COPY prisma ./prisma/ ← **SEBELUM npm ci**
3. RUN npm ci
4. COPY . .

### Step 4: Redeploy

1. Railway Dashboard → Deployments
2. Klik "..." → Redeploy
3. **Uncheck "Use existing Build Cache"**
4. Deploy

---

## 🐛 Troubleshooting

### Error: "prisma folder still not found"

**Solusi 1: Check .gitignore**
```bash
# Pastikan prisma tidak di-ignore
git check-ignore -v backend/prisma/
# Should return nothing
```

**Solusi 2: Force Add Prisma**
```bash
cd backend
git add -f prisma/
git commit -m "Force add prisma folder"
git push origin main
```

**Solusi 3: Check Railway Build Context**
- Pastikan Root Directory = `backend`
- Pastikan Dockerfile path = `Dockerfile` (bukan `backend/Dockerfile`)

### Error: "Prisma Client not generated"

**Solusi:**
1. Pastikan prisma folder ter-copy sebelum `npm ci`
2. Pastikan `schema.prisma` ada di `backend/prisma/`
3. Pastikan `DATABASE_URL` di-set (meskipun untuk generate tidak perlu connection)

### Error: "Build still fails"

**Solusi:**
1. Test build lokal dulu:
   ```bash
   cd backend
   docker build --target production -t test .
   ```
2. Jika build lokal berhasil, masalahnya di Railway
3. Cek Railway logs untuk detail error
4. Pastikan semua file ter-commit ke git

---

## ✅ Checklist

- [ ] Prisma folder ter-commit ke git
- [ ] Root Directory = `backend` di Railway
- [ ] Dockerfile urutan benar (prisma sebelum npm ci)
- [ ] .dockerignore tidak ignore prisma
- [ ] Redeploy dengan uncheck build cache

---

## 📝 Dockerfile yang Benar

```dockerfile
# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# 1. Copy package files
COPY package*.json ./

# 2. Copy prisma folder FIRST (before npm ci)
COPY prisma ./prisma/

# 3. Install dependencies
RUN npm ci

# 4. Copy source code
COPY . .

# 5. Generate Prisma Client
RUN npx prisma generate

# 6. Build application
RUN npm run build

# 7. Remove devDependencies
RUN npm prune --production

# 8. Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "start:prod"]
```

**Urutan penting:**
1. package*.json
2. **prisma/** ← HARUS sebelum npm ci
3. npm ci
4. Source code
5. prisma generate
6. build

---

## 🎯 Quick Fix

1. **Pastikan prisma ter-commit:**
   ```bash
   git add backend/prisma/
   git commit -m "Ensure prisma folder committed"
   git push origin main
   ```

2. **Redeploy di Railway:**
   - Uncheck build cache
   - Redeploy

3. **Done!**

---

**Dockerfile sudah diperbaiki dan di-push. Redeploy di Railway dengan uncheck build cache! 🚀**

