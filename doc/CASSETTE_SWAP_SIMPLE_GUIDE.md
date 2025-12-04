# 🎯 Cassette Swap - Simple Guide (Bahasa Indonesia)

## 🔄 Apa Itu Cassette Swap?

**Cassette Swap** = Tukar cassette rusak dengan cassette spare.

### Analogi Sederhana:
```
Seperti ganti ban mobil:
❌ Ban depan kiri bocor
✅ Ambil ban spare dari bagasi
✅ Pasang ban spare
✅ Mobil bisa jalan lagi
✅ Ban yang bocor dikirim ke bengkel
```

---

## 📋 Langkah-Langkah Swap (Super Simple)

### 1️⃣ **Pilih Bank** 🏦
```
Klik dropdown → Pilih "BNI"
```
**Kenapa?** Supaya system tahu spare cassettes mana yang bisa dipakai (BNI pakai spare BNI, tidak bisa pakai spare BRI).

---

### 2️⃣ **Pilih Cassette yang Rusak** ❌
```
Klik dropdown → Pilih "RB-BNI-0001"
```
**Info yang muncul:**
- Nomor: RB-BNI-0001
- Type: Recycle Box (RB)
- Status: INSTALLED (terpasang di mesin)
- Mesin: BNI-JKT-M001
- Slot: 1

**System otomatis:** Filter spare cassettes hanya yang type RB (karena yang rusak type RB).

---

### 3️⃣ **Pilih Cassette Spare** ✅
```
Klik dropdown → Pilih "RB-BNI-0010"
```
**Info yang muncul:**
- Nomor: RB-BNI-0010
- Type: Recycle Box (RB) ✅ Match!
- Status: Spare Pool (siap dipakai)

**Penting:** Hanya yang type-nya sama yang muncul (RB dengan RB, AB dengan AB).

---

### 4️⃣ **Isi Alasan** 📝
```
Masukkan: "Cassette jammed dan tidak bisa accept bills"
```
**Harus diisi!** Untuk dokumentasi dan audit trail.

---

### 5️⃣ **Isi Catatan (Opsional)** 📄
```
Masukkan: "Mesin sudah berjalan normal setelah swap"
```
**Bisa dikosongkan** jika tidak ada catatan tambahan.

---

### 6️⃣ **Klik "Swap Cassette"** 🚀
```
Tunggu beberapa detik...
✅ Success! Cassette sudah ditukar!
```

---

## 🎯 Apa yang Terjadi Setelah Swap?

### **Sebelum Swap:**
```
Mesin BNI-JKT-M001:
Slot 1: RB-BNI-0001 ❌ RUSAK
Slot 2: RB-BNI-0002 ✅ OK

Spare Pool BNI:
RB-BNI-0010 ✅ Siap pakai
```

### **Sesudah Swap:**
```
Mesin BNI-JKT-M001:
Slot 1: RB-BNI-0010 ✅ BARU! (dari spare pool)
Slot 2: RB-BNI-0002 ✅ OK

Spare Pool BNI:
RB-BNI-0001 → Dikirim ke Repair Center
```

**Hasil:**
- ✅ Mesin kembali berjalan normal
- ✅ Slot 1 sudah pakai cassette baru
- ✅ Cassette rusak dikirim ke Hitachi untuk diperbaiki

---

## ⚠️ Aturan Penting

### ❌ **TIDAK BISA:**
1. **RB dengan AB** → Type berbeda, tidak kompatibel
2. **Spare dari bank berbeda** → BNI tidak bisa pakai spare BRI
3. **Cassette yang sudah di spare pool** → Harus pilih yang statusnya INSTALLED atau BROKEN

### ✅ **HARUS:**
1. **Type harus sama** → RB dengan RB, AB dengan AB
2. **Bank harus sama** → BNI dengan spare BNI
3. **Broken: INSTALLED atau BROKEN** → Yang masih terpasang di mesin
4. **Spare: SPARE_POOL** → Yang siap dipakai

---

## 🎓 Contoh Real-World

### **Situasi:**
Vendor technician datang ke bank, mesin error karena cassette di slot 3 rusak.

### **Langkah:**
1. **Buka sistem** → Login sebagai vendor tech
2. **Pilih Bank** → "BNI" (karena mesin milik BNI)
3. **Pilih Broken** → "RB-BNI-0003" (slot 3, type RB)
4. **Pilih Spare** → "RB-BNI-0011" (type RB, dari spare pool BNI)
5. **Isi Alasan** → "Cassette tidak bisa accept bills, sensor error"
6. **Submit** → System proses swap
7. **Selesai!** → Mesin kembali operational

### **Hasil:**
- Technician tahu harus pasang RB-BNI-0011 ke slot 3
- Cassette RB-BNI-0003 yang rusak dikirim ke Hitachi RC
- System sudah track semuanya ✅

---

## 💡 Tips

1. **Selalu pilih bank dulu** → Supaya spare cassettes yang muncul benar
2. **Perhatikan type** → Pastikan RB dengan RB, AB dengan AB
3. **Isi alasan jelas** → Untuk tracking dan audit
4. **Cek setelah swap** → Pastikan mesin kembali normal

---

## 🆘 Masalah Umum

### **Problem:** Spare cassettes tidak muncul
**Solution:** 
- Pastikan sudah pilih bank
- Pastikan broken cassette sudah dipilih (untuk filter type)

### **Problem:** Type tidak match
**Solution:**
- Pastikan broken dan spare type-nya sama
- RB hanya bisa dengan RB
- AB hanya bisa dengan AB

### **Problem:** Error saat submit
**Solution:**
- Pastikan semua field sudah diisi
- Pastikan alasan sudah diisi (required)
- Cek koneksi internet

---

**Masih bingung?** Coba praktik langsung dengan login sebagai vendor user! 😊

