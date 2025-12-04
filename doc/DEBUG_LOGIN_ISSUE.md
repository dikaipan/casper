# 🐛 Debug: Login Tidak Bisa

## ✅ Checklist Debugging

### 1. Pastikan Database Sudah Di-Seed

**Cek apakah user default sudah ada:**

```bash
cd backend
npx prisma studio
```

Atau test dengan SQL:

```sql
-- Cek hitachi users
SELECT id, username, email, status FROM hitachi_users;

-- Cek vendor users  
SELECT id, username, email, status FROM vendor_users;
```

**Jika user belum ada, jalankan seed:**

```bash
cd backend
npx prisma db seed
```

**Expected output:**
```
✅ Hitachi users created
✅ Vendor users created
🎉 Database seed completed successfully!
```

---

### 2. Test Endpoint Login Secara Manual

**Test dengan Swagger UI:**

1. Buka: `http://localhost:3000/api/docs`
2. Cari `POST /api/auth/login`
3. Klik "Try it out"
4. Input:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
5. Klik "Execute"

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@hitachi.co.jp",
    "fullName": "Hitachi Super Admin",
    "role": "SUPER_ADMIN",
    "userType": "HITACHI",
    "department": "MANAGEMENT"
  }
}
```

**Jika dapat 401:**
- User tidak ada → Jalankan `npx prisma db seed`
- Password salah → Gunakan default password
- User status tidak ACTIVE → Cek database

**Jika dapat 422:**
- Request format salah → Pastikan Content-Type: application/json

**Jika dapat 500:**
- Error di backend → Cek console backend untuk error details

---

### 3. Cek Browser Console

**Buka browser DevTools (F12):**
- Tab **Console** → Lihat error messages
- Tab **Network** → Lihat request/response details

**Test login di frontend:**
1. Buka: `http://localhost:3001/login`
2. Masukkan username: `admin`, password: `admin123`
3. Klik "Sign In"
4. Lihat console dan network tab

**Error yang mungkin muncul:**

#### Error: Network Error / Failed to fetch
**Problem:** Backend tidak accessible dari frontend

**Solution:**
- Pastikan backend running di `http://localhost:3000`
- Cek CORS_ORIGIN di `backend/.env` = `http://localhost:3001`
- Cek `NEXT_PUBLIC_API_URL` di `frontend/.env.local` = `http://localhost:3000`

#### Error: 401 Unauthorized
**Problem:** Username atau password salah

**Solution:**
- Pastikan user exists (cek dengan Prisma Studio)
- Gunakan password default: `admin123`
- Atau re-seed database: `npx prisma db seed`

#### Error: 404 Not Found
**Problem:** Endpoint tidak ditemukan

**Solution:**
- Pastikan backend running
- Cek URL di frontend: harus `http://localhost:3000/api/auth/login`
- Cek `baseURL` di `frontend/src/lib/api.ts`

#### Error: CORS policy blocked
**Problem:** CORS tidak configured dengan benar

**Solution:**
- Edit `backend/.env`: `CORS_ORIGIN="http://localhost:3001"`
- Restart backend
- Pastikan `app.enableCors()` di `backend/src/main.ts` menggunakan environment variable

---

### 4. Cek Response Format

**Frontend mengharapkan:**
```typescript
{
  access_token: string,
  user: {
    id: string,
    username: string,
    email: string,
    fullName: string,
    role: string,
    userType: 'HITACHI' | 'VENDOR',
    vendorId?: string,
    department?: string
  }
}
```

**Cek `backend/src/auth/auth.service.ts` method `login()`:**
```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: user.id,
    username: user.username,
    // ... other fields
  }
};
```

**Pastikan format sesuai!**

---

### 5. Cek Error Handling di Frontend

**File `frontend/src/app/login/page.tsx`:**

Error handling sudah di-update untuk menampilkan:
- `err.response?.data?.message` (API error message)
- `err.message` (Network/other errors)
- Default fallback message

**Check console untuk error details:**
```javascript
console.error('Login error details:', err);
```

---

### 6. Test dengan curl (Manual)

**Windows PowerShell:**
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**Expected:**
```json
{
  "access_token": "...",
  "user": {...}
}
```

**Jika ini gagal, masalahnya di backend!**

---

## 🔧 Quick Fixes

### Fix 1: Re-seed Database

```bash
cd backend
npx prisma db seed
```

Ini akan reset semua users dengan password default.

### Fix 2: Cek CORS Configuration

**Edit `backend/.env`:**
```env
CORS_ORIGIN="http://localhost:3001"
```

**Restart backend:**
```bash
# Ctrl+C untuk stop
npm run start:dev
```

### Fix 3: Clear Browser Cache

1. Buka DevTools (F12)
2. Klik kanan pada refresh button
3. Pilih "Empty Cache and Hard Reload"

### Fix 4: Check Environment Variables

**Backend `.env`:**
```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="24h"
DATABASE_URL="postgresql://..."
CORS_ORIGIN="http://localhost:3001"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Pastikan tidak ada typo!**

---

## 📋 Step-by-Step Debug

1. ✅ **Backend running?** → `http://localhost:3000/api` harus OK
2. ✅ **Database seeded?** → Cek dengan Prisma Studio
3. ✅ **Test endpoint manual?** → Swagger UI atau curl
4. ✅ **Cek browser console?** → Lihat error details
5. ✅ **Cek network tab?** → Lihat request/response
6. ✅ **CORS configured?** → Cek backend .env dan restart
7. ✅ **Environment variables correct?** → Cek frontend .env.local

---

## 🎯 Most Common Issue

**User belum di-seed ke database!**

**Solution:**
```bash
cd backend
npx prisma db seed
```

**Setelah seed, test lagi login!**

---

**Masih tidak bisa? Bagikan:**
1. Error message di browser console
2. Network request/response di DevTools
3. Backend console error (jika ada)

