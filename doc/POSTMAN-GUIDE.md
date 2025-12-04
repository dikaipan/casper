# 📮 POSTMAN GUIDE - HCM Backend API

## 🔗 **Base URL**
```
http://localhost:3001
```

**Pastikan backend sudah running di port 3001!**

---

## 🔐 **Step 1: Login & Get Token**

### **Request:**
```
POST http://localhost:3001/auth/login
```

### **Headers:**
```
Content-Type: application/json
```

### **Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "admin",
    "email": "admin@hitachi.com",
    "fullName": "Admin User",
    "role": "SUPER_ADMIN",
    "userType": "HITACHI",
    "vendorId": null,
    "department": null
  }
}
```

### **📝 Copy `access_token` untuk digunakan di request berikutnya!**

---

## 🔑 **Step 2: Setup Authorization**

### **Cara 1: Manual (Setiap Request)**
Di Postman, pilih tab **Authorization**:
- **Type:** Bearer Token
- **Token:** Paste `access_token` dari response login

### **Cara 2: Environment Variable (RECOMMENDED)**

1. **Create Environment:**
   - Klik ikon ⚙️ (Settings) di kanan atas
   - Klik **"Add"** untuk buat environment baru
   - Name: `HCM Local`

2. **Add Variables:**
   - `base_url` = `http://localhost:3001`
   - `access_token` = (kosongkan dulu, akan diisi setelah login)

3. **Setup Authorization:**
   - Di tab **Authorization**, pilih:
     - **Type:** Bearer Token
     - **Token:** `{{access_token}}`

4. **Auto-save Token:**
   - Setelah login, di tab **Tests**, tambahkan:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.environment.set("access_token", jsonData.access_token);
   }
   ```

---

## 📋 **API Endpoints**

### **🔐 Authentication**

#### **1. Login**
```
POST {{base_url}}/auth/login
Body: { "username": "admin", "password": "admin123" }
```

#### **2. Get Profile**
```
GET {{base_url}}/auth/profile
Headers: Authorization: Bearer {{access_token}}
```

---

### **🏦 Banks**

#### **1. Get All Banks**
```
GET {{base_url}}/banks
Headers: Authorization: Bearer {{access_token}}
```

#### **2. Get Bank by ID**
```
GET {{base_url}}/banks/:id
Headers: Authorization: Bearer {{access_token}}
```

#### **3. Create Bank**
```
POST {{base_url}}/banks
Headers: Authorization: Bearer {{access_token}}
Body (JSON):
{
  "bankCode": "BNI001",
  "bankName": "Bank Negara Indonesia",
  "primaryContactName": "John Doe",
  "primaryContactEmail": "john@bni.co.id",
  "primaryContactPhone": "081234567890"
}
```

---

### **🖥️ Machines**

#### **1. Get All Machines**
```
GET {{base_url}}/machines?page=1&limit=10&search=
Headers: Authorization: Bearer {{access_token}}
```

#### **2. Get Dashboard Stats** ⭐ NEW!
```
GET {{base_url}}/machines/dashboard/stats
Headers: Authorization: Bearer {{access_token}}
```

**Response:**
```json
{
  "totalMachines": 1600,
  "totalCassettes": 16000,
  "totalBanks": 5,
  "totalVendors": 3,
  "machineTrend": 2.5,
  "cassetteTrend": 1.8,
  "machineStatus": {
    "operational": 1400,
    "underRepair": 150,
    "inactive": 50
  },
  "cassetteStatus": {
    "ok": 15000,
    "bad": 500,
    "inTransit": 300,
    "inRepair": 200
  },
  "healthScore": 87.5,
  "topBanks": [...],
  "recentActivities": [...],
  "alerts": {
    "criticalTickets": 5,
    "longRepairs": 3,
    "badCassettes": 500
  }
}
```

#### **3. Get Machine by ID**
```
GET {{base_url}}/machines/:id
Headers: Authorization: Bearer {{access_token}}
```

#### **4. Create Machine**
```
POST {{base_url}}/machines
Headers: Authorization: Bearer {{access_token}}
Body (JSON):
{
  "serialNumberManufacturer": "SN-MESIN-001",
  "machineCode": "MC-001",
  "customerBankId": "bank-uuid",
  "vendorId": "vendor-uuid",
  "branchCode": "BR-001",
  "status": "OPERATIONAL"
}
```

#### **5. Update Machine**
```
PATCH {{base_url}}/machines/:id
Headers: Authorization: Bearer {{access_token}}
Body (JSON):
{
  "machineCode": "MC-001-UPDATED",
  "status": "UNDER_REPAIR"
}
```

---

### **📦 Cassettes**

#### **1. Get All Cassettes**
```
GET {{base_url}}/cassettes?page=1&limit=10&search=
Headers: Authorization: Bearer {{access_token}}
```

#### **2. Get Cassette Types**
```
GET {{base_url}}/cassettes/types
Headers: Authorization: Bearer {{access_token}}
```

#### **3. Get Cassette by ID**
```
GET {{base_url}}/cassettes/:id
Headers: Authorization: Bearer {{access_token}}
```

#### **4. Create Cassette**
```
POST {{base_url}}/cassettes
Headers: Authorization: Bearer {{access_token}}
Body (JSON):
{
  "serialNumber": "RB-BNI-0001",
  "cassetteTypeId": "cassette-type-uuid",
  "customerBankId": "bank-uuid",
  "status": "OK",
  "usageType": "MAIN",
  "machineId": "machine-uuid"
}
```

#### **5. Mark Cassette as Broken**
```
PATCH {{base_url}}/cassettes/:id/mark-broken
Headers: Authorization: Bearer {{access_token}}
Body (JSON):
{
  "reason": "Cassette jammed, needs repair"
}
```

---

### **🚚 Vendors**

#### **1. Get All Vendors**
```
GET {{base_url}}/vendors
Headers: Authorization: Bearer {{access_token}}
```

#### **2. Get Vendor by ID**
```
GET {{base_url}}/vendors/:id
Headers: Authorization: Bearer {{access_token}}
```

---

### **📥 Import**

#### **1. Import CSV**
```
POST {{base_url}}/import/csv
Headers: 
  Authorization: Bearer {{access_token}}
  Content-Type: multipart/form-data
Body (form-data):
  file: [Select CSV file]
```

#### **2. Import Excel**
```
POST {{base_url}}/import/excel
Headers: 
  Authorization: Bearer {{access_token}}
  Content-Type: multipart/form-data
Body (form-data):
  file: [Select Excel file]
```

---

## 🎯 **Quick Test Collection**

### **Test 1: Login & Save Token**
1. **Request:** `POST /auth/login`
2. **Body:** 
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. **Tests Tab:**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has access_token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('access_token');
       pm.environment.set("access_token", jsonData.access_token);
   });
   ```

### **Test 2: Get Dashboard Stats**
1. **Request:** `GET /machines/dashboard/stats`
2. **Authorization:** Bearer Token `{{access_token}}`
3. **Tests Tab:**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has stats", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('totalMachines');
       pm.expect(jsonData).to.have.property('healthScore');
   });
   ```

---

## 🔧 **Troubleshooting**

### **Error: 401 Unauthorized**
**Solution:**
- Pastikan token masih valid (tidak expired)
- Login ulang untuk mendapatkan token baru
- Check Authorization header: `Bearer {{access_token}}`

### **Error: 403 Forbidden**
**Solution:**
- User tidak punya permission untuk endpoint tersebut
- Check user role: `SUPER_ADMIN` untuk Hitachi, `VENDOR` untuk vendor users

### **Error: Connection Refused**
**Solution:**
- Pastikan backend running di port 3001
- Check dengan: `netstat -ano | findstr ":3001"`
- Start backend: `cd backend && npm run start:dev`

### **Error: 404 Not Found**
**Solution:**
- Check URL endpoint (case-sensitive)
- Pastikan base URL benar: `http://localhost:3001`
- Check apakah endpoint ada di Swagger: `http://localhost:3001/api`

---

## 📚 **Swagger Documentation**

Backend juga punya **Swagger UI** untuk dokumentasi lengkap:

```
http://localhost:3001/api
```

Di sini Anda bisa:
- ✅ Lihat semua endpoints
- ✅ Test langsung dari browser
- ✅ Lihat request/response examples
- ✅ Download OpenAPI spec

---

## 💡 **Tips**

1. **Gunakan Environment Variables** untuk mudah switch antara local/production
2. **Save Token Automatically** dengan Tests script setelah login
3. **Create Collection** untuk organize requests
4. **Use Pre-request Scripts** untuk auto-generate data
5. **Export Collection** untuk backup dan sharing

---

## 🎉 **You're Ready!**

Sekarang Anda bisa test semua API endpoints dengan Postman! 🚀

