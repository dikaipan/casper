# 🧪 Test Login Endpoint

## Test Login Secara Manual

### 1. Test dengan Browser (Swagger UI)

1. Buka: `http://localhost:3000/api/docs`
2. Cari endpoint `POST /api/auth/login`
3. Klik "Try it out"
4. Masukkan:
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
    "id": "uuid",
    "username": "admin",
    "email": "admin@hitachi.co.jp",
    "fullName": "Hitachi Super Admin",
    "role": "SUPER_ADMIN",
    "userType": "HITACHI",
    "department": "MANAGEMENT"
  }
}
```

---

### 2. Test dengan curl

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

**Windows CMD:**
```cmd
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

---

### 3. Test dengan Postman

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/auth/login`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

---

## 🔍 Debug Login Issue

### Error 401: Unauthorized

**Kemungkinan:**
- Username atau password salah
- User tidak ada di database
- User status tidak ACTIVE

**Cek:**
```sql
-- Test di Prisma Studio atau pgAdmin
SELECT * FROM hitachi_users WHERE username = 'admin';
SELECT * FROM vendor_users WHERE username = 'tag_admin';
```

### Error 422: Validation Failed

**Kemungkinan:**
- Request body format salah
- Missing required fields

**Cek:**
- Pastikan Content-Type: `application/json`
- Pastikan body format benar

### Error 500: Internal Server Error

**Kemungkinan:**
- Database connection issue
- JWT secret tidak valid
- Error di service layer

**Cek:**
- Backend console untuk error details
- Database connection status
- JWT_SECRET di .env

---

## ✅ Checklist

- [ ] Backend running di `http://localhost:3000`
- [ ] API docs accessible di `http://localhost:3000/api/docs`
- [ ] Database connected (lihat log backend)
- [ ] User exists di database (cek dengan Prisma Studio)
- [ ] User status = ACTIVE
- [ ] Password benar (default: `admin123`)
- [ ] Test endpoint manual berhasil (curl/Swagger)
- [ ] Frontend menggunakan URL yang benar
- [ ] CORS configured dengan benar

---

## 🔧 Common Issues

### Issue 1: User Tidak Ada

**Solution:**
```bash
cd backend
npx prisma db seed
```

Ini akan membuat default users:
- `admin` / `admin123`
- `rc_manager` / `rcmanager123`
- `rc_staff_1` / `rcstaff123`
- `tag_admin` / `vendor123`

### Issue 2: Password Hash Tidak Match

**Problem:** Password di database sudah ter-hash, tidak bisa test dengan password plain.

**Solution:** Re-seed database untuk reset semua passwords ke default.

### Issue 3: CORS Error

**Error di browser console:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
- Cek `CORS_ORIGIN` di `backend/.env` = `http://localhost:3001`
- Restart backend setelah ubah .env

### Issue 4: Response Format Salah

**Frontend mengharapkan:**
```json
{
  "access_token": "...",
  "user": {...}
}
```

**Jika response berbeda, cek `auth.service.ts` method `login()`**

---

## 📝 Test Credentials Default

**Setelah seed database:**

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

**Test manual dulu untuk pastikan endpoint OK, baru debug frontend issue!**

