# 🔧 Fix: 401 Invalid Credentials Error

## Error yang Terjadi

```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Penyebab:** Username atau password salah, atau user tidak ada di database.

---

## ✅ Solusi 1: Seed Database (Paling Umum)

### Langkah 1: Pastikan Database Sudah Di-Seed

```bash
cd "D:\HCS Cassete management\hcm\backend"
npx prisma db seed
```

**Atau:**

```bash
ts-node prisma/seed.ts
```

**Expected output:**
```
🌱 Starting database seed...
✅ Cassette types created
✅ Hitachi users created
✅ Bank customers created
✅ Vendors created
✅ Vendor users created
✅ Machines created
✅ Cassettes created
🎉 Database seed completed successfully!
```

---

### Langkah 2: Cek User di Database

**Buka Prisma Studio:**

```bash
cd backend
npx prisma studio
```

Akan membuka browser di `http://localhost:5555`

**Cek:**
1. Table `hitachi_users` → Cek apakah ada user `admin`
2. Table `vendor_users` → Cek apakah ada user `tag_admin`

---

## ✅ Solusi 2: Test Login dengan Swagger UI

1. **Buka:** `http://localhost:3000/api/docs`
2. **Cari endpoint:** `POST /api/auth/login`
3. **Klik "Try it out"**
4. **Input credentials:**

**Hitachi Users:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Atau Vendor Users:**
```json
{
  "username": "tag_admin",
  "password": "vendor123"
}
```

5. **Klik "Execute"**

**Jika dapat 401:**
- User tidak ada → Jalankan seed
- Password salah → Gunakan password default

**Jika dapat 200:**
- Backend OK! Masalahnya di frontend URL atau CORS

---

## ✅ Solusi 3: Cek Password di Database

**Problem:** Password di database sudah ter-hash, tidak bisa dicek langsung.

**Solution:** Re-seed database untuk reset semua passwords ke default.

**Setelah seed, gunakan password default:**

```
Hitachi Users:
- admin / admin123
- rc_manager / rcmanager123
- rc_staff_1 / rcstaff123

Vendor Users:
- tag_admin / vendor123
- tag_tech1 / vendor123
- adv_admin / vendor123
```

---

## ✅ Solusi 4: Buat User Baru Manual (Optional)

Jika seed tidak bekerja, buat user secara manual:

**Buka Prisma Studio atau pgAdmin:**

```sql
-- Cek apakah user sudah ada
SELECT * FROM hitachi_users WHERE username = 'admin';

-- Jika tidak ada, insert baru
-- Tapi password perlu di-hash dengan bcrypt dulu
```

**Atau gunakan Prisma Studio:**
1. Buka `npx prisma studio`
2. Table `hitachi_users`
3. Add record baru
4. Masukkan data:
   - username: `admin`
   - email: `admin@hitachi.co.jp`
   - fullName: `Hitachi Super Admin`
   - role: `SUPER_ADMIN`
   - department: `MANAGEMENT`
   - status: `ACTIVE`
   - **Password:** BUTUH DI-HASH (lebih baik pakai seed!)

---

## 🔍 Debugging Steps

### Step 1: Cek Database Connection

```bash
cd backend
npx prisma studio
```

Jika bisa buka, database OK ✅

### Step 2: Cek User Exists

**Buka Prisma Studio → Table `hitachi_users`**

Cari user dengan username: `admin`

**Jika tidak ada:**
```bash
npx prisma db seed
```

### Step 3: Test Endpoint Manual

**Swagger UI atau curl:**

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

**Expected (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Jika dapat 401:**
- User tidak ada atau password salah
- Jalankan seed lagi

### Step 4: Cek Backend Console

Saat login gagal, cek console backend untuk error details.

---

## 📋 Default Credentials Setelah Seed

```
✅ Hitachi Users:
- Super Admin: admin / admin123
- RC Manager: rc_manager / rcmanager123
- RC Staff: rc_staff_1 / rcstaff123

✅ Vendor Users:
- TAG Admin: tag_admin / vendor123
- TAG Technician: tag_tech1 / vendor123
- ADV Admin: adv_admin / vendor123
```

---

## ⚠️ Important Notes

1. **Password di database sudah ter-hash** → Tidak bisa dibaca langsung
2. **Jika password salah, perlu re-seed** → Reset semua passwords
3. **User status harus ACTIVE** → Cek di database jika tidak bisa login
4. **Username case-sensitive** → Gunakan lowercase: `admin`, bukan `Admin`

---

## 🚀 Quick Fix Command

```bash
cd "D:\HCS Cassete management\hcm\backend"

# Reset dan seed ulang
npx prisma migrate reset  # HATI-HATI: akan hapus semua data!
npx prisma db seed

# Atau hanya seed (jika migration sudah ada)
npx prisma db seed
```

**Setelah seed, coba login lagi dengan:**
- Username: `admin`
- Password: `admin123`

---

## ✅ Verifikasi

Setelah seed, test:

1. **Prisma Studio:** User `admin` exists ✅
2. **Swagger UI:** Login berhasil ✅
3. **Frontend:** Login berhasil ✅

---

**Most Common Issue: Database belum di-seed! Jalankan `npx prisma db seed` dulu!** 🎯

