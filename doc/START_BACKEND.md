# 🚀 Start Backend Server

## Error: ERR_CONNECTION_REFUSED

Error ini berarti **backend server tidak berjalan** atau tidak bisa diakses.

## Solusi

### Step 1: Cek Backend Server Status

```bash
# Cek apakah ada proses Node.js running
Get-Process -Name node
```

### Step 2: Start Backend Server

```bash
cd backend
npm run start:dev
```

**Expected output:**
```
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

### Step 3: Pastikan Port 3000 Tidak Terpakai

Jika port 3000 sudah digunakan:

**Option A: Kill process yang menggunakan port 3000**
```powershell
# Cari process ID
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill process (ganti PID dengan process ID yang ditemukan)
taskkill /PID <PID> /F
```

**Option B: Ubah port backend**
Edit `backend/.env`:
```
PORT=3002
```

Dan edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Step 4: Cek Environment Variables

Pastikan file `.env` ada di `backend/`:
```bash
cd backend
# Cek apakah .env ada
Test-Path .env
```

Jika tidak ada, copy dari template:
```bash
Copy-Item env.template .env
```

### Step 5: Test Backend

Setelah backend running, test di browser:
- API Docs: http://localhost:3000/api/docs
- Health check: http://localhost:3000/api (should return 404, but means server is running)

## Troubleshooting

### Backend tidak start karena error Prisma:
```bash
cd backend
npx prisma generate
npm run start:dev
```

### Backend crash saat start:
- Cek console output untuk error detail
- Pastikan database running (PostgreSQL)
- Pastikan `.env` file ada dan benar

### Port sudah digunakan:
- Kill process yang menggunakan port 3000
- Atau ubah port di `.env`

---

**Quick Start:**
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend (setelah backend running)
cd frontend
npm run dev
```

