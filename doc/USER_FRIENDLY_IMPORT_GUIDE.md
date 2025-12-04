# 📥 Panduan Import Data untuk User Non-Tech
## HITACHI Cassette Management System

---

## 🎯 **TUJUAN**

Panduan ini dibuat khusus untuk **user non-technical** agar bisa melakukan import data kaset, mesin, dan bank dengan mudah tanpa perlu pengetahuan teknis.

---

## 📋 **METODE IMPORT YANG TERSEDIA**

### **1. Import via Excel (PALING MUDAH) ⭐⭐⭐**
✅ **Recommended untuk user non-tech**
- Format familiar (Excel)
- Bisa copy-paste dari spreadsheet lain
- Visual editing
- Auto-validasi saat upload

### **2. Import via CSV**
✅ **Alternatif jika tidak punya Excel**
- Format sederhana
- Bisa buat di Notepad/Google Sheets
- Template tersedia

### **3. Import via JSON** (Tidak Recommended untuk Non-Tech)
❌ **Hanya untuk developer/technical users**

---

## 🚀 **CARA IMPORT VIA EXCEL (STEP-BY-STEP)**

### **STEP 1: Download Template Excel**

1. Login ke aplikasi sebagai Admin
2. Buka halaman **"Import"** (dari menu sidebar)
3. Klik tab **"Banks & Cassettes"**
4. Klik tombol **"📥 Download Excel Template"** (akan dibuat)
5. File Excel akan terdownload dengan nama `import_template.xlsx`

### **STEP 2: Buka Template Excel**

1. Buka file Excel yang sudah didownload
2. Anda akan melihat **2 sheet**:
   - **Sheet "Banks"** - Untuk data bank
   - **Sheet "Cassettes"** - Untuk data kaset

### **STEP 3: Isi Data Bank (Jika Perlu)**

**Buka Sheet "Banks":**

| BankCode | BankName | BranchCode | City | Province | Address | ContactPerson | ContactPhone | ContactEmail | Notes |
|----------|----------|------------|------|----------|---------|---------------|--------------|--------------|-------|
| BNI001 | PT Bank Negara Indonesia | BNI-JKT-001 | Jakarta | DKI Jakarta | Jl. Sudirman | John Doe | 021-12345678 | contact@bni.co.id | Head Office |

**Kolom Wajib (Harus Diisi):**
- ✅ **BankCode** - Kode bank (contoh: BNI001, BCA001)
- ✅ **BankName** - Nama bank lengkap

**Kolom Optional (Boleh Kosong):**
- BranchCode, City, Province, Address
- ContactPerson, ContactPhone, ContactEmail
- Notes

**Tips:**
- Jika bank sudah ada di sistem, tidak perlu diisi lagi
- BankCode harus UNIK (tidak boleh duplikat)

### **STEP 4: Isi Data Kaset**

**Buka Sheet "Cassettes":**

| SerialNumber | CassetteTypeCode | CustomerBankCode | Status | Notes |
|--------------|------------------|------------------|--------|-------|
| 76UWRB2SB899406 | RB | BNI001 | OK | Kaset Utama |
| 76UWAB2SW754109 | AB | BNI001 | OK | Kaset Cadangan |

**Kolom Wajib (Harus Diisi):**
- ✅ **SerialNumber** - Nomor serial kaset (contoh: 76UWRB2SB899406)
- ✅ **CustomerBankCode** - Kode bank pemilik (harus match dengan BankCode di sheet Banks)

**Kolom Optional:**
- **CassetteTypeCode** - Tipe kaset (RB, AB, URJB). Jika kosong, akan auto-detect dari SerialNumber
- **Status** - Status kaset (OK, BAD, IN_REPAIR, dll). Default: OK
- **Notes** - Catatan tambahan

**Tips:**
- SerialNumber harus UNIK (tidak boleh duplikat)
- CustomerBankCode harus sudah ada di sheet Banks atau sudah terdaftar di sistem
- Jika tidak tahu CassetteTypeCode, biarkan kosong (akan auto-detect)

### **STEP 5: Simpan File Excel**

1. Pastikan semua data sudah diisi dengan benar
2. Klik **File → Save** (Ctrl+S)
3. Pastikan format file adalah **.xlsx** (Excel 2007+)

### **STEP 6: Upload File Excel**

1. Kembali ke halaman **Import** di aplikasi
2. Di tab **"Banks & Cassettes"**
3. Klik **"Choose File"** atau drag & drop file Excel Anda
4. Pilih file Excel yang sudah diisi
5. Tunggu proses upload (akan muncul progress bar)
6. Sistem akan otomatis:
   - ✅ Validasi format file
   - ✅ Cek data yang diisi
   - ✅ Import data ke sistem

### **STEP 7: Lihat Hasil Import**

Setelah upload selesai, Anda akan melihat:

**✅ Jika Berhasil:**
- Total banks/cassettes yang di-import
- Jumlah successful
- Pesan "All data imported successfully!"

**⚠️ Jika Ada Error:**
- Total banks/cassettes yang di-import
- Jumlah successful dan failed
- **Daftar error** dengan detail:
  - Baris yang error
  - Alasan error
  - Cara memperbaiki

**Contoh Error:**
```
❌ Error pada baris 5:
SerialNumber: 76UWRB2SB899406
Error: Bank BNI999 not found
Solusi: Pastikan BankCode BNI999 sudah ada di sheet Banks atau sudah terdaftar di sistem
```

---

## 📊 **CARA IMPORT VIA CSV (ALTERNATIF)**

### **STEP 1: Download Template CSV**

1. Login sebagai Admin
2. Buka halaman **"Import"**
3. Klik tab **"Machine & Cassettes"**
4. Klik **"📥 Download CSV Template"**
5. File CSV akan terdownload

### **STEP 2: Buka Template CSV**

Buka file CSV dengan:
- **Excel** (paling mudah)
- **Google Sheets** (gratis, online)
- **Notepad** (Windows) atau **TextEdit** (Mac)

**Format CSV:**
```csv
SN Mesin,SN Kaset,SN Kaset Cadangan
74UEA43N03-069520,76UWAB2SW754319,76UWAB2SW751779
74UEA43N03-069520,76UWRB2SB894550,76UWRB2SB885798
```

**Penjelasan:**
- **SN Mesin** - Nomor serial mesin ATM
- **SN Kaset** - Nomor serial kaset utama
- **SN Kaset Cadangan** - Nomor serial kaset cadangan
- 1 mesin = 10 kaset (5 utama + 5 cadangan)
- SN Mesin bisa kosong di baris berikutnya (akan menggunakan SN Mesin dari baris sebelumnya)

### **STEP 3: Isi Data CSV**

**Contoh Data:**
```csv
SN Mesin,SN Kaset,SN Kaset Cadangan
74UEA43N03-069520,76UWAB2SW754319,76UWAB2SW751779
,76UWRB2SB894550,76UWRB2SB885798
,76UWRB2SB894551,76UWRB2SB885799
,76UWRB2SB894516,76UWRB2SB885817
,76UWRB2SB894546,76UWRB2SB885807
74UEA43N03-069533,76UWAB2SW754073,76UWAB2SW751808
,76UWRB2SB893983,76UWRB2SB885763
```

**Tips:**
- Jika SN Mesin sama untuk beberapa baris, cukup isi di baris pertama
- Baris berikutnya bisa kosong (akan otomatis menggunakan SN Mesin sebelumnya)
- Pastikan setiap mesin punya 10 kaset (5 utama + 5 cadangan)

### **STEP 4: Pilih Bank dan Vendor**

1. Di halaman Import, tab **"Machine & Cassettes"**
2. Pilih **Bank Code** dari dropdown (contoh: BNI001)
3. Pilih **Vendor Code** dari dropdown (contoh: VND-TAG-001)
4. Pastikan bank dan vendor sudah terdaftar di sistem

### **STEP 5: Upload File CSV**

1. Klik **"Choose File"**
2. Pilih file CSV yang sudah diisi
3. Klik **"Import Machine & Cassettes"**
4. Tunggu proses import

### **STEP 6: Lihat Hasil**

Sama seperti import Excel, Anda akan melihat:
- Total machines/cassettes yang di-import
- Jumlah successful dan failed
- Detail error jika ada

---

## ⚠️ **KESALAHAN UMUM & SOLUSI**

### **Error 1: "Excel file must contain 'Banks' and/or 'Cassettes' sheets"**

**Penyebab:**
- Nama sheet tidak tepat
- Sheet tidak ada

**Solusi:**
1. Pastikan ada sheet bernama **"Banks"** (huruf besar B)
2. Pastikan ada sheet bernama **"Cassettes"** (huruf besar C)
3. Tidak boleh ada spasi extra di nama sheet

### **Error 2: "Bank BNI001 not found"**

**Penyebab:**
- BankCode tidak ada di sheet Banks
- BankCode belum terdaftar di sistem

**Solusi:**
1. Pastikan bank sudah diisi di sheet "Banks" terlebih dahulu
2. Atau pastikan bank sudah terdaftar di sistem sebelum import cassettes

### **Error 3: "SerialNumber already exists"**

**Penyebab:**
- Nomor serial kaset sudah ada di sistem
- Duplikat di file Excel

**Solusi:**
1. Cek apakah kaset sudah pernah di-import
2. Hapus duplikat di file Excel
3. Jika ingin update data, sistem akan otomatis update (tidak error)

### **Error 4: "Cassette type RB not found"**

**Penyebab:**
- CassetteTypeCode tidak valid
- Database belum di-seed

**Solusi:**
1. Pastikan CassetteTypeCode adalah: **RB**, **AB**, atau **URJB**
2. Jika kosong, sistem akan auto-detect dari SerialNumber
3. Hubungi admin jika masih error

### **Error 5: "Invalid date format"**

**Penyebab:**
- Format tanggal tidak sesuai

**Solusi:**
- Gunakan format: **YYYY-MM-DD** (contoh: 2024-01-15)
- Atau biarkan kosong jika tidak perlu

---

## 💡 **TIPS & TRICKS**

### **1. Copy-Paste dari Excel Lain**

Jika data sudah ada di Excel/Google Sheets lain:

1. **Select data** di Excel source (Ctrl+A atau klik-drag)
2. **Copy** (Ctrl+C)
3. **Paste** ke template Excel di sheet yang sesuai
4. Pastikan header row sudah benar
5. Hapus baris kosong jika ada

### **2. Generate Serial Numbers dengan Formula Excel**

**Untuk generate RB-BNI-0001 sampai RB-BNI-0100:**

1. Di cell A2, ketik: `="RB-BNI-" & TEXT(ROW(A1), "0000")`
2. Copy formula ke bawah (drag atau Ctrl+C, Ctrl+V)
3. Formula akan otomatis generate:
   - RB-BNI-0001
   - RB-BNI-0002
   - ...
   - RB-BNI-0100

### **3. Validasi Data Sebelum Upload**

**Cek di Excel:**
- ✅ Tidak ada duplikat SerialNumber
- ✅ BankCode sudah ada di sheet Banks
- ✅ Format tanggal benar (YYYY-MM-DD)
- ✅ Tidak ada cell kosong di kolom wajib

### **4. Import Bertahap**

Jika data sangat banyak (ribuan baris):

1. **Import banks dulu** (sheet Banks saja)
2. **Cek hasil** - pastikan semua bank berhasil
3. **Import cassettes** (sheet Cassettes saja)
4. Lebih mudah troubleshoot jika ada error

### **5. Backup Data Sebelum Import**

1. **Export data existing** dari aplikasi (jika ada fitur export)
2. **Simpan backup** di folder terpisah
3. Jika ada masalah, bisa restore dari backup

---

## 📞 **BUTUH BANTUAN?**

### **Jika Masih Bingung:**

1. **Lihat Video Tutorial** (akan dibuat)
2. **Hubungi Admin** - Kirim screenshot error
3. **Cek Dokumentasi** - Ada contoh file di folder `backend/data/`

### **Informasi yang Perlu Disediakan Saat Minta Bantuan:**

- ✅ Screenshot error message
- ✅ File Excel/CSV yang digunakan (jika tidak sensitif)
- ✅ Langkah-langkah yang sudah dilakukan
- ✅ Jumlah data yang akan di-import

---

## ✅ **CHECKLIST SEBELUM IMPORT**

- [ ] File Excel/CSV sudah diisi dengan benar
- [ ] Header row sudah sesuai template
- [ ] Kolom wajib sudah diisi (tidak kosong)
- [ ] Tidak ada duplikat SerialNumber/BankCode
- [ ] BankCode di Cassettes sudah ada di Banks
- [ ] Format tanggal benar (YYYY-MM-DD) jika ada
- [ ] File sudah disimpan (.xlsx untuk Excel, .csv untuk CSV)
- [ ] Sudah login sebagai Admin
- [ ] Sudah pilih Bank dan Vendor (untuk CSV Machine-Cassettes)

---

## 🎉 **SELAMAT!**

Jika semua langkah diikuti dengan benar, import data akan berhasil dan data akan langsung tersedia di sistem!

**Pertanyaan?** Hubungi tim IT support atau admin sistem.

