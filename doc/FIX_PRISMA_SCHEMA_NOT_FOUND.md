# 🔧 Fix Error: Prisma Schema Not Found

## Masalah

Error saat build di Railway:
```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
schema.prisma: file not found
prisma/schema.prisma: file not found
```

## Penyebab

Prisma schema tidak ditemukan karena:
1. **Prisma folder tidak ter-copy** ke Docker image
2. **Root Directory** tidak di-set dengan benar di Railway
3. **Build context** tidak include prisma folder

## Solusi

### 1. Pastikan Root Directory Benar

**PENTING**: Di Railway Dashboard:

1. Service Backend → **Settings** → **Root Directory**
2. Pastikan: `backend` (bukan kosong atau `/`)
3. **Save**

### 2. Dockerfile yang Benar

Dockerfile sudah diperbaiki untuk:
- Copy prisma folder secara eksplisit
- Verifikasi prisma schema ada sebelum generate

```dockerfile
# Install dependencies
RUN npm ci

# Copy prisma folder explicitly
COPY prisma ./prisma/

# Copy rest of source code
COPY . .

# Verify prisma schema exists
RUN test -f prisma/schema.prisma || (echo "ERROR: prisma/schema.prisma not found!" && ls -la prisma/ && exit 1)

# Generate Prisma Client
RUN npx prisma generate
```

### 3. Verifikasi Prisma Ter-commit

```bash
# Check prisma files in git
git ls-files backend/prisma/

# Should show:
# backend/prisma/schema.prisma
# backend/prisma/seed.ts
# backend/prisma/schema.mysql.prisma
```

Jika tidak ada, commit prisma folder:
```bash
cd backend
git add prisma/
git commit -m "Ensure prisma folder committed"
git push origin main
```

## Langkah-langkah Fix

### Step 1: Verifikasi Root Directory

1. Railway Dashboard → Service Backend
2. Settings → Root Directory
3. Pastikan: `backend`
4. Save

### Step 2: Verifikasi Prisma Ter-commit

```bash
git ls-files backend/prisma/schema.prisma
# Should show: backend/prisma/schema.prisma
```

### Step 3: Redeploy

1. Railway Dashboard → Deployments
2. Klik "..." → Redeploy
3. **Uncheck "Use existing Build Cache"**
4. Deploy

### Step 4: Check Build Logs

Jika masih error, check build logs:
- Railway Dashboard → Deployments → Latest
- View Logs
- Cari error detail

## Troubleshooting

### Error: "prisma/schema.prisma not found"

**Solusi 1: Check Root Directory**
- Pastikan Root Directory = `backend`
- Redeploy dengan uncheck cache

**Solusi 2: Force Add Prisma**
```bash
cd backend
git add -f prisma/
git commit -m "Force add prisma folder"
git push origin main
```

**Solusi 3: Check Build Context**
- Railway build context harus include prisma folder
- Pastikan Root Directory benar

**Solusi 4: Test Build Lokal**
```bash
cd backend
docker build --target production -t test .
# Check if prisma folder is copied
docker run --rm test ls -la prisma/
# Should show schema.prisma
```

### Error: "Could not find Prisma Schema"

**Solusi:**
1. Pastikan `schema.prisma` ada di `backend/prisma/`
2. Pastikan Root Directory = `backend`
3. Pastikan prisma folder ter-commit
4. Redeploy dengan uncheck cache

## Checklist

- [ ] Root Directory = `backend` di Railway
- [ ] Prisma folder ter-commit ke git
- [ ] `schema.prisma` ada di `backend/prisma/`
- [ ] Dockerfile copy prisma sebelum generate
- [ ] Redeploy dengan uncheck build cache

## Dockerfile Final

```dockerfile
# Production stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma folder explicitly
COPY prisma ./prisma/

# Copy rest of source code
COPY . .

# Verify prisma schema exists
RUN test -f prisma/schema.prisma || (echo "ERROR: prisma/schema.prisma not found!" && ls -la prisma/ && exit 1)

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "start:prod"]
```

## Important Notes

1. **Root Directory HARUS `backend`** - Ini yang paling penting!
2. **Prisma folder harus ter-commit** - Sudah ter-commit ✅
3. **COPY prisma sebelum COPY . .** - Untuk memastikan prisma ter-copy
4. **Verifikasi sebelum generate** - Untuk catch error lebih awal

---

**PALING PENTING: Pastikan Root Directory = `backend` di Railway Settings! 🚀**

