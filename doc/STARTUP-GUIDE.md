# 🚀 HCM Startup Guide

## 📋 **Scripts Available**

Saya sudah membuatkan **PowerShell scripts** untuk mengatasi masalah port conflict dan proses yang tidak terminate dengan baik.

### **1. `start-all.ps1` (RECOMMENDED)**
**Cara termudah untuk menjalankan semua services!**

```powershell
.\start-all.ps1
```

**Fitur:**
- ✅ Otomatis kill semua proses Node.js yang conflict
- ✅ Clear port 3000 dan 3001
- ✅ Start backend (port 3001)
- ✅ Tunggu backend ready
- ✅ Start frontend (port 3000)
- ✅ Tunggu frontend ready
- ✅ Monitor kedua services
- ✅ Cleanup otomatis saat Ctrl+C

---

### **2. `start-backend.ps1`**
**Untuk menjalankan backend saja:**

```powershell
.\start-backend.ps1
```

**Fitur:**
- Kill proses di port 3001
- Set environment PORT=3001
- Start backend

---

### **3. `start-frontend.ps1`**
**Untuk menjalankan frontend saja:**

```powershell
.\start-frontend.ps1
```

**Fitur:**
- Kill proses di port 3000
- Start frontend

---

### **4. `stop-all.ps1`**
**Untuk stop semua services:**

```powershell
.\stop-all.ps1
```

**Fitur:**
- Kill semua Node.js processes
- Verify ports are free
- Force cleanup jika ada yang stuck

---

## 🎯 **Quick Start (Paling Mudah)**

### **Step 1: Start All Services**
```powershell
.\start-all.ps1
```

Tunggu sampai muncul:
```
========================================
  ✅ ALL SERVICES ARE RUNNING!        
========================================

📍 Backend:  http://localhost:3001
📍 Frontend: http://localhost:3000

Press Ctrl+C to stop all services...
```

### **Step 2: Open Browser**
Buka browser dan navigasi ke:
```
http://localhost:3000/login
```

### **Step 3: Stop Services**
Tekan **Ctrl+C** di PowerShell window, atau jalankan:
```powershell
.\stop-all.ps1
```

---

## 🔧 **Troubleshooting**

### **Problem: "Port 3000/3001 already in use"**
**Solution:**
```powershell
.\stop-all.ps1
.\start-all.ps1
```

### **Problem: "Node process tidak terminate"**
**Solution:**
```powershell
# Force kill semua Node processes
Get-Process node | Stop-Process -Force

# Kemudian start lagi
.\start-all.ps1
```

### **Problem: "Backend/Frontend tidak start"**
**Solution:**
1. Check logs di PowerShell window
2. Pastikan dependencies sudah terinstall:
   ```powershell
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```
3. Try start lagi dengan `.\start-all.ps1`

---

## 📊 **Cara Test Dashboard Baru**

1. Start services dengan `.\start-all.ps1`
2. Login dengan user Hitachi
3. Navigasi ke **Dashboard**
4. Verifikasi fitur baru:
   - ✅ Real trend data (bukan mock)
   - ✅ Critical alerts section
   - ✅ Recent activities
   - ✅ Top banks by machine count
   - ✅ Real health score

---

## 📝 **Tips**

1. **Selalu gunakan `start-all.ps1`** untuk start services
2. **Jangan close PowerShell window** saat services running
3. **Tekan Ctrl+C** untuk stop services dengan clean
4. **Gunakan `stop-all.ps1`** jika Ctrl+C tidak bekerja
5. **Check port** sebelum start:
   ```powershell
   netstat -ano | findstr ":3000"
   netstat -ano | findstr ":3001"
   ```

---

## 🎉 **You're All Set!**

Sekarang Anda bisa menjalankan aplikasi dengan mudah tanpa masalah port conflict! 🚀

