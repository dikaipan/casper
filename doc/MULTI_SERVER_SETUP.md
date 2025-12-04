# 🖥️ Panduan Setup Multi-Server untuk Testing

Panduan ini menjelaskan cara menjalankan aplikasi HCM di 3 server berbeda untuk keperluan testing/percobaan.

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Opsi Setup](#opsi-setup)
3. [Setup Manual (Tanpa Docker)](#setup-manual-tanpa-docker)
4. [Setup dengan Docker Compose](#setup-dengan-docker-compose)
5. [Konfigurasi Database](#konfigurasi-database)
6. [Script untuk Menjalankan](#script-untuk-menjalankan)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pendahuluan

Ada 2 pendekatan untuk menjalankan aplikasi di 3 server:

### Opsi 1: Shared Database (Recommended untuk Testing)
- 3 instance backend + frontend
- 1 database PostgreSQL (shared)
- Cocok untuk testing load balancing atau environment berbeda

### Opsi 2: Separate Database
- 3 instance backend + frontend
- 3 database PostgreSQL terpisah
- Cocok untuk testing dengan data berbeda

---

## ⚙️ Opsi Setup

### Server 1 (Development)
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:3001`
- **Database**: Shared atau `hcm_dev`

### Server 2 (Staging)
- **Backend**: `http://localhost:3002`
- **Frontend**: `http://localhost:3003`
- **Database**: Shared atau `hcm_staging`

### Server 3 (Testing)
- **Backend**: `http://localhost:3004`
- **Frontend**: `http://localhost:3005`
- **Database**: Shared atau `hcm_testing`

---

## 🛠️ Setup Manual (Tanpa Docker)

### Langkah 1: Buat File Environment untuk Setiap Server

**💡 Tip:** File template sudah tersedia di `backend/env.server*.template` dan `frontend/env.local.server*.template`. Copy file template tersebut dan rename sesuai kebutuhan.

#### Backend - Server 1 (`.env.server1`)
```env
# Database
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-in-production"
JWT_REFRESH_EXPIRATION="7d"

# Server
NODE_ENV="development"
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:3001"
```

#### Backend - Server 2 (`.env.server2`)
```env
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-in-production"
JWT_REFRESH_EXPIRATION="7d"
NODE_ENV="development"
PORT=3002
CORS_ORIGIN="http://localhost:3003"
```

#### Backend - Server 3 (`.env.server3`)
```env
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-in-production"
JWT_REFRESH_EXPIRATION="7d"
NODE_ENV="development"
PORT=3004
CORS_ORIGIN="http://localhost:3005"
```

#### Frontend - Server 1 (`.env.local.server1`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Frontend - Server 2 (`.env.local.server2`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

#### Frontend - Server 3 (`.env.local.server3`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3004
```

### Langkah 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Langkah 3: Setup Database

```bash
# Setup database (hanya perlu sekali jika menggunakan shared database)
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Langkah 4: Jalankan Server

#### Opsi A: Menggunakan Script PowerShell (Windows)

Buat file `start-multi-server.ps1` di root project:

```powershell
# start-multi-server.ps1
Write-Host "🚀 Starting HCM Multi-Server Setup..." -ForegroundColor Green

# Server 1
Write-Host "`n📦 Starting Server 1 (Port 3000/3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Copy-Item .env.server1 .env -Force; npm run start:dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Copy-Item .env.local.server1 .env.local -Force; npm run dev"

# Server 2
Write-Host "`n📦 Starting Server 2 (Port 3002/3003)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Copy-Item .env.server2 .env -Force; `$env:PORT=3002; npm run start:dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Copy-Item .env.local.server2 .env.local -Force; `$env:PORT=3003; npm run dev"

# Server 3
Write-Host "`n📦 Starting Server 3 (Port 3004/3005)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Copy-Item .env.server3 .env -Force; `$env:PORT=3004; npm run start:dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Copy-Item .env.local.server3 .env.local -Force; `$env:PORT=3005; npm run dev"

Write-Host "`n✅ All servers started!" -ForegroundColor Green
Write-Host "`n🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  Server 1: http://localhost:3001" -ForegroundColor White
Write-Host "  Server 2: http://localhost:3003" -ForegroundColor White
Write-Host "  Server 3: http://localhost:3005" -ForegroundColor White
```

#### Opsi B: Menggunakan Terminal Terpisah

**Terminal 1 - Backend Server 1:**
```bash
cd backend
cp .env.server1 .env
npm run start:dev
```

**Terminal 2 - Frontend Server 1:**
```bash
cd frontend
cp .env.local.server1 .env.local
npm run dev
```

**Terminal 3 - Backend Server 2:**
```bash
cd backend
cp .env.server2 .env
PORT=3002 npm run start:dev
```

**Terminal 4 - Frontend Server 2:**
```bash
cd frontend
cp .env.local.server2 .env.local
PORT=3003 npm run dev
```

**Terminal 5 - Backend Server 3:**
```bash
cd backend
cp .env.server3 .env
PORT=3004 npm run start:dev
```

**Terminal 6 - Frontend Server 3:**
```bash
cd frontend
cp .env.local.server3 .env.local
PORT=3005 npm run dev
```

---

## 🐳 Setup dengan Docker Compose

### Langkah 1: Buat File `docker-compose.multi-server.yml`

```yaml
version: '3.8'

services:
  # Shared PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: hcm-postgres-multi
    environment:
      POSTGRES_DB: hcm_development
      POSTGRES_USER: hcm_user
      POSTGRES_PASSWORD: hcm_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hcm-network

  # Backend Server 1
  backend1:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hcm-backend-1
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://hcm_user:hcm_password@postgres:5432/hcm_development
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3000
      CORS_ORIGIN: http://localhost:3001
    ports:
      - '3000:3000'
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - hcm-network
    command: npm run start:dev

  # Frontend Server 1
  frontend1:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hcm-frontend-1
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3000
    ports:
      - '3001:3000'
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend1
    networks:
      - hcm-network
    command: npm run dev

  # Backend Server 2
  backend2:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hcm-backend-2
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://hcm_user:hcm_password@postgres:5432/hcm_development
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3002
      CORS_ORIGIN: http://localhost:3003
    ports:
      - '3002:3002'
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - hcm-network
    command: npm run start:dev

  # Frontend Server 2
  frontend2:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hcm-frontend-2
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3002
    ports:
      - '3003:3000'
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend2
    networks:
      - hcm-network
    command: npm run dev

  # Backend Server 3
  backend3:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hcm-backend-3
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://hcm_user:hcm_password@postgres:5432/hcm_development
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3004
      CORS_ORIGIN: http://localhost:3005
    ports:
      - '3004:3004'
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - hcm-network
    command: npm run start:dev

  # Frontend Server 3
  frontend3:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hcm-frontend-3
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3004
    ports:
      - '3005:3000'
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend3
    networks:
      - hcm-network
    command: npm run dev

volumes:
  postgres_data:

networks:
  hcm-network:
    driver: bridge
```

### Langkah 2: Jalankan dengan Docker Compose

```bash
# Start all servers
docker-compose -f docker-compose.multi-server.yml up -d

# View logs
docker-compose -f docker-compose.multi-server.yml logs -f

# Stop all servers
docker-compose -f docker-compose.multi-server.yml down
```

---

## 🗄️ Konfigurasi Database

### Opsi 1: Shared Database (Recommended)

Semua server menggunakan database yang sama. Cocok untuk testing load balancing.

```env
# Semua server menggunakan DATABASE_URL yang sama
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"
```

### Opsi 2: Separate Databases

Setiap server menggunakan database terpisah. Cocok untuk testing dengan data berbeda.

**Setup Database Terpisah:**

```bash
# Buat database untuk server 2
psql -U postgres -c "CREATE DATABASE hcm_staging;"
psql -U postgres -c "CREATE USER hcm_staging_user WITH PASSWORD 'hcm_staging_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hcm_staging TO hcm_staging_user;"

# Buat database untuk server 3
psql -U postgres -c "CREATE DATABASE hcm_testing;"
psql -U postgres -c "CREATE USER hcm_testing_user WITH PASSWORD 'hcm_testing_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hcm_testing TO hcm_testing_user;"

# Run migrations untuk setiap database
cd backend

# Server 1 (development)
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public" npx prisma db seed

# Server 2 (staging)
DATABASE_URL="postgresql://hcm_staging_user:hcm_staging_password@localhost:5432/hcm_staging?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://hcm_staging_user:hcm_staging_password@localhost:5432/hcm_staging?schema=public" npx prisma db seed

# Server 3 (testing)
DATABASE_URL="postgresql://hcm_testing_user:hcm_testing_password@localhost:5432/hcm_testing?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://hcm_testing_user:hcm_testing_password@localhost:5432/hcm_testing?schema=public" npx prisma db seed
```

**Update Environment Files:**

Server 2 `.env.server2`:
```env
DATABASE_URL="postgresql://hcm_staging_user:hcm_staging_password@localhost:5432/hcm_staging?schema=public"
```

Server 3 `.env.server3`:
```env
DATABASE_URL="postgresql://hcm_testing_user:hcm_testing_password@localhost:5432/hcm_testing?schema=public"
```

---

## 📝 Script untuk Menjalankan

### Windows PowerShell Script

Buat file `start-multi-server.ps1`:

```powershell
# start-multi-server.ps1
param(
    [switch]$Docker
)

if ($Docker) {
    Write-Host "🐳 Starting with Docker Compose..." -ForegroundColor Cyan
    docker-compose -f docker-compose.multi-server.yml up -d
    Write-Host "✅ All servers started with Docker!" -ForegroundColor Green
    Write-Host "`n🌐 Access URLs:" -ForegroundColor Yellow
    Write-Host "  Server 1: http://localhost:3001" -ForegroundColor White
    Write-Host "  Server 2: http://localhost:3003" -ForegroundColor White
    Write-Host "  Server 3: http://localhost:3005" -ForegroundColor White
    exit
}

Write-Host "🚀 Starting HCM Multi-Server Setup (Manual)..." -ForegroundColor Green

# Check if .env files exist
$backendEnvFiles = @(".env.server1", ".env.server2", ".env.server3")
$frontendEnvFiles = @(".env.local.server1", ".env.local.server2", ".env.local.server3")

foreach ($file in $backendEnvFiles) {
    if (-not (Test-Path "backend\$file")) {
        Write-Host "⚠️  Warning: backend\$file not found. Please create it first." -ForegroundColor Yellow
    }
}

foreach ($file in $frontendEnvFiles) {
    if (-not (Test-Path "frontend\$file")) {
        Write-Host "⚠️  Warning: frontend\$file not found. Please create it first." -ForegroundColor Yellow
    }
}

# Server 1
Write-Host "`n📦 Starting Server 1 (Port 3000/3001)..." -ForegroundColor Cyan
if (Test-Path "backend\.env.server1") {
    Copy-Item "backend\.env.server1" "backend\.env" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server1") {
    Copy-Item "frontend\.env.local.server1" "frontend\.env.local" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# Server 2
Write-Host "`n📦 Starting Server 2 (Port 3002/3003)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
if (Test-Path "backend\.env.server2") {
    Copy-Item "backend\.env.server2" "backend\.env" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:PORT=3002; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server2") {
    Copy-Item "frontend\.env.local.server2" "frontend\.env.local" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:PORT=3003; npm run dev"

# Server 3
Write-Host "`n📦 Starting Server 3 (Port 3004/3005)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
if (Test-Path "backend\.env.server3") {
    Copy-Item "backend\.env.server3" "backend\.env" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:PORT=3004; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server3") {
    Copy-Item "frontend\.env.local.server3" "frontend\.env.local" -Force
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:PORT=3005; npm run dev"

Write-Host "`n✅ All servers started!" -ForegroundColor Green
Write-Host "`n🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  Server 1: http://localhost:3001" -ForegroundColor White
Write-Host "  Server 2: http://localhost:3003" -ForegroundColor White
Write-Host "  Server 3: http://localhost:3005" -ForegroundColor White
Write-Host "`n💡 Tip: Close individual PowerShell windows to stop each server." -ForegroundColor Gray
```

### Linux/Mac Bash Script

Buat file `start-multi-server.sh`:

```bash
#!/bin/bash

# start-multi-server.sh

echo "🚀 Starting HCM Multi-Server Setup..."

# Server 1
echo ""
echo "📦 Starting Server 1 (Port 3000/3001)..."
cd backend && cp .env.server1 .env && npm run start:dev &
sleep 3
cd ../frontend && cp .env.local.server1 .env.local && npm run dev &

# Server 2
echo ""
echo "📦 Starting Server 2 (Port 3002/3003)..."
sleep 5
cd ../backend && cp .env.server2 .env && PORT=3002 npm run start:dev &
sleep 3
cd ../frontend && cp .env.local.server2 .env.local && PORT=3003 npm run dev &

# Server 3
echo ""
echo "📦 Starting Server 3 (Port 3004/3005)..."
sleep 5
cd ../backend && cp .env.server3 .env && PORT=3004 npm run start:dev &
sleep 3
cd ../frontend && cp .env.local.server3 .env.local && PORT=3005 npm run dev &

echo ""
echo "✅ All servers started!"
echo ""
echo "🌐 Access URLs:"
echo "  Server 1: http://localhost:3001"
echo "  Server 2: http://localhost:3003"
echo "  Server 3: http://localhost:3005"
```

---

## 🔧 Troubleshooting

### Port Already in Use

Jika port sudah digunakan, ubah port di file environment:

```bash
# Cek port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Atau gunakan port lain
PORT=3010 npm run start:dev
```

### CORS Error

Pastikan `CORS_ORIGIN` di backend sesuai dengan URL frontend:

```env
# Backend Server 1
CORS_ORIGIN="http://localhost:3001"

# Backend Server 2
CORS_ORIGIN="http://localhost:3003"

# Backend Server 3
CORS_ORIGIN="http://localhost:3005"
```

### Database Connection Error

Pastikan:
1. PostgreSQL sudah running
2. `DATABASE_URL` benar
3. Database sudah dibuat dan migration sudah dijalankan

```bash
# Test connection
psql -U hcm_user -d hcm_development -h localhost -p 5432
```

### Frontend Tidak Connect ke Backend

Pastikan `NEXT_PUBLIC_API_URL` di frontend sesuai dengan port backend:

```env
# Frontend Server 1
NEXT_PUBLIC_API_URL=http://localhost:3000

# Frontend Server 2
NEXT_PUBLIC_API_URL=http://localhost:3002

# Frontend Server 3
NEXT_PUBLIC_API_URL=http://localhost:3004
```

---

## 📊 Monitoring

### Cek Status Server

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003
netstat -ano | findstr :3004
netstat -ano | findstr :3005

# Linux/Mac
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004
lsof -i :3005
```

### Cek Logs (Docker)

```bash
# Semua logs
docker-compose -f docker-compose.multi-server.yml logs

# Logs spesifik
docker-compose -f docker-compose.multi-server.yml logs backend1
docker-compose -f docker-compose.multi-server.yml logs frontend1
```

---

## ✅ Checklist Setup

- [ ] File environment untuk 3 server backend dibuat
- [ ] File environment untuk 3 server frontend dibuat
- [ ] Database setup (shared atau separate)
- [ ] Dependencies terinstall
- [ ] Migration database sudah dijalankan
- [ ] Port tidak conflict
- [ ] CORS configuration benar
- [ ] Script untuk menjalankan sudah dibuat

---

## 🎯 Quick Start

### Manual Setup (Windows)

```powershell
# 1. Copy file template environment
Copy-Item backend\env.server1.template backend\.env.server1
Copy-Item backend\env.server2.template backend\.env.server2
Copy-Item backend\env.server3.template backend\.env.server3
Copy-Item frontend\env.local.server1.template frontend\.env.local.server1
Copy-Item frontend\env.local.server2.template frontend\.env.local.server2
Copy-Item frontend\env.local.server3.template frontend\.env.local.server3

# 2. Edit file .env sesuai kebutuhan (database URL, JWT secret, dll)

# 3. Jalankan script
.\start-multi-server.ps1
```

### Docker Setup

```bash
# 1. Buat docker-compose.multi-server.yml (lihat contoh di atas)
# 2. Jalankan
docker-compose -f docker-compose.multi-server.yml up -d

# Atau dengan script
.\start-multi-server.ps1 -Docker
```

---

**Selamat Testing! 🚀**

