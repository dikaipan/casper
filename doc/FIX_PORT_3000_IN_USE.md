# 🔧 Fix: Port 3000 Already in Use

## Error yang Terjadi

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Penyebab:** Ada instance backend lain yang masih running di port 3000.

---

## ✅ Solusi Cepat (Windows)

### Langkah 1: Cari Process yang Menggunakan Port 3000

```powershell
netstat -ano | findstr :3000
```

Anda akan melihat output seperti:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       16816
```

**PID** (Process ID) adalah angka terakhir → **16816**

---

### Langkah 2: Kill Process

```powershell
taskkill /PID 16816 /F
```

**Atau ganti `16816` dengan PID yang Anda dapat dari Langkah 1.**

---

### Langkah 3: Restart Backend

```powershell
cd "D:\HCS Cassete management\hcm\backend"
npm run start:dev
```

---

## 🚀 Quick Command (One-liner)

Jika ingin lebih cepat, jalankan command berikut:

```powershell
# Kill semua Node.js processes (HATI-HATI: akan kill semua Node apps)
taskkill /F /IM node.exe

# Atau lebih spesifik - hanya port 3000
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %a
```

---

## 📋 Alternative: Gunakan Port Lain

Jika Anda tidak ingin kill process yang ada, gunakan port lain:

### Ubah Port di Backend

**Edit `backend/.env`:**

```env
PORT=3001  # Atau port lain, misalnya 3002
```

**Update Frontend juga:**

**Edit `frontend/.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Sesuaikan dengan port backend baru
```

**Restart kedua aplikasi!**

---

## 🔍 Verifikasi Port Sudah Bebas

```powershell
netstat -ano | findstr :3000
```

**Jika tidak ada output, berarti port 3000 sudah bebas!** ✅

---

## 💡 Tips: Cek Semua Node Processes

```powershell
# Lihat semua Node.js processes yang running
tasklist | findstr node.exe
```

**Atau:**

```powershell
# Lihat semua processes di port tertentu
netstat -ano | findstr :3000
```

---

## 🚨 Warning

**JANGAN kill semua Node.js processes jika Anda memiliki aplikasi Node.js lain yang sedang running!**

Gunakan perintah yang spesifik untuk PID tertentu, atau cek dulu process apa yang akan di-kill:

```powershell
# Lihat detail process sebelum kill
tasklist /FI "PID eq 16816"
```

---

## ✅ Checklist

- [ ] Cari PID process di port 3000
- [ ] Kill process tersebut
- [ ] Verifikasi port sudah bebas
- [ ] Restart backend
- [ ] Backend berhasil start tanpa error

---

**Setelah port bebas, backend akan berhasil start!** 🎉

