# 🚀 POSTMAN QUICK START

## ⚡ **Cara Cepat Setup Postman (3 Langkah)**

### **Step 1: Import Collection & Environment**

1. **Buka Postman**
2. **Klik "Import"** (kiri atas)
3. **Import 2 file:**
   - `HCM-API.postman_collection.json` (Collection)
   - `HCM-Local.postman_environment.json` (Environment)
4. **Select Environment:** Pilih "HCM Local" di dropdown kanan atas

---

### **Step 2: Start Backend**

```powershell
cd backend
$env:PORT="3001"
npm run start:dev
```

**Tunggu sampai muncul:**
```
Application is running on: http://localhost:3001
```

---

### **Step 3: Login & Test**

1. **Buka Collection:** "HCM Cassette Management API"
2. **Buka folder:** "Authentication"
3. **Klik request:** "Login"
4. **Klik "Send"**
5. **Token akan otomatis tersimpan!** ✅

---

## 🎯 **Test Dashboard Stats (NEW!)**

1. **Buka folder:** "Machines"
2. **Klik request:** "Get Dashboard Stats"
3. **Klik "Send"**
4. **Lihat response:** Stats lengkap dengan real data!

---

## 📋 **Available Endpoints**

### **✅ Authentication**
- `POST /auth/login` - Login & get token
- `GET /auth/profile` - Get current user

### **✅ Machines**
- `GET /machines/dashboard/stats` ⭐ **NEW!**
- `GET /machines` - List all machines
- `GET /machines/:id` - Get machine by ID
- `POST /machines` - Create machine
- `PATCH /machines/:id` - Update machine

### **✅ Cassettes**
- `GET /cassettes` - List all cassettes
- `GET /cassettes/types` - Get cassette types
- `GET /cassettes/:id` - Get cassette by ID
- `POST /cassettes` - Create cassette
- `PATCH /cassettes/:id/mark-broken` - Mark as broken

### **✅ Banks**
- `GET /banks` - List all banks
- `GET /banks/:id` - Get bank by ID

### **✅ Vendors**
- `GET /vendors` - List all vendors

### **✅ Import**
- `POST /import/csv` - Import CSV file
- `POST /import/excel` - Import Excel file

---

## 🔑 **Authorization**

**Semua request (kecuali login) memerlukan Bearer Token:**

```
Authorization: Bearer {{access_token}}
```

**Token otomatis tersimpan setelah login!** ✅

---

## 🐛 **Troubleshooting**

### **Error: Connection Refused**
- Pastikan backend running: `http://localhost:3001`
- Check: `netstat -ano | findstr ":3001"`

### **Error: 401 Unauthorized**
- Login ulang untuk mendapatkan token baru
- Check environment variable: `access_token`

### **Error: 404 Not Found**
- Check base_url: `http://localhost:3001`
- Pastikan endpoint benar (case-sensitive)

---

## 📚 **Swagger UI**

**Dokumentasi lengkap di:**
```
http://localhost:3001/api
```

---

## ✅ **You're Ready!**

Sekarang Anda bisa test semua API dengan Postman! 🎉

