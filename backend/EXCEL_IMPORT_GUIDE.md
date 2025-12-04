# 📊 Panduan Import Excel

Panduan lengkap untuk import data Bank dan Cassettes menggunakan Excel file.

## 📋 Format Excel yang Diperlukan

Excel file harus memiliki **2 sheets** dengan nama:
- **`Banks`** - Untuk data bank
- **`Cassettes`** - Untuk data cassettes

### Sheet 1: Banks

**Kolom Header (Row 1):**
| BankCode | BankName | BranchCode | City | Province | Address | ContactPerson | ContactPhone | ContactEmail | Notes |
|----------|----------|------------|------|----------|---------|---------------|--------------|--------------|-------|
| BNI001   | PT Bank Negara Indonesia | BNI-JKT-001 | Jakarta | DKI Jakarta | Jl. Sudirman | John Doe | 021-12345678 | contact@bni.co.id | Head Office |

**Kolom Wajib:**
- ✅ `BankCode` (atau `Bank_Code`)
- ✅ `BankName` (atau `Bank_Name`)

**Kolom Optional:**
- `BranchCode`, `City`, `Province`, `Address`
- `ContactPerson`, `ContactPhone`, `ContactEmail`
- `Notes`

### Sheet 2: Cassettes

**Kolom Header (Row 1):**
| SerialNumber | CassetteTypeCode | CustomerBankCode | Status | PurchaseDate | WarrantyExpiryDate | CurrentMachineCode | PositionInMachine | Notes |
|--------------|------------------|------------------|--------|--------------|--------------------|--------------------|--------------------|-------|
| RB-BNI-0001  | RB               | BNI001           | SPARE_POOL | 2024-01-15 | 2026-01-15 | | | Spare cassette |

**Kolom Wajib:**
- ✅ `SerialNumber` (atau `Serial_Number`)
- ✅ `CassetteTypeCode` (atau `Cassette_Type_Code` atau `TypeCode`)
- ✅ `CustomerBankCode` (atau `Customer_Bank_Code` atau `BankCode`)

**Kolom Optional:**
- `Status` - Values: SPARE_POOL, INSTALLED, BROKEN, IN_TRANSIT_TO_RC, IN_REPAIR, SCRAPPED
- `PurchaseDate` - Format: YYYY-MM-DD (contoh: 2024-01-15)
- `WarrantyExpiryDate` - Format: YYYY-MM-DD
- `CurrentMachineCode` - Machine code jika cassette sudah installed
- `PositionInMachine` - Slot number (1-6)
- `Notes`

## 💡 Tips Excel

### 1. Generate Serial Numbers dengan Formula

**Untuk generate RB-BNI-0001 sampai RB-BNI-0100:**
```
="RB-BNI-" & TEXT(ROW(A1:A100), "0000")
```

Copy formula ini di Excel, akan menghasilkan:
- RB-BNI-0001
- RB-BNI-0002
- ...
- RB-BNI-0100

### 2. Copy-Paste dari Spreadsheet Lain

Anda bisa copy-paste data dari Excel/Google Sheets lain:
1. Select data di Excel source
2. Copy (Ctrl+C)
3. Paste ke sheet "Banks" atau "Cassettes"
4. Pastikan header row sudah benar

### 3. Template Excel

Anda bisa download template Excel dari:
- Buka halaman Import di aplikasi
- Klik "Download Excel Template" (akan dibuat)
- Isi data sesuai kebutuhan

## 🚀 Cara Menggunakan

### Step 1: Siapkan Excel File
1. Buat file Excel baru (.xlsx)
2. Rename sheet pertama menjadi **"Banks"**
3. Tambah sheet baru, rename menjadi **"Cassettes"**
4. Isi header row sesuai format di atas
5. Isi data di bawah header

### Step 2: Upload di Aplikasi
1. Login sebagai Admin
2. Buka halaman **Import** (dari Dashboard atau Navbar)
3. Klik **"Choose File"** atau drag & drop file Excel
4. Pilih file Excel Anda
5. File akan otomatis ter-upload dan di-import

### Step 3: Lihat Hasil
- Total banks/cassettes yang di-import
- Jumlah successful dan failed
- Detail error jika ada yang gagal

## 📝 Contoh Excel

### Sheet "Banks" - Contoh 3 Banks:

| BankCode | BankName | BranchCode | City | Province | Address |
|----------|----------|------------|------|----------|---------|
| BNI001 | PT Bank Negara Indonesia | BNI-JKT-001 | Jakarta | DKI Jakarta | Jl. Sudirman |
| BNI002 | PT Bank Negara Indonesia | BNI-JKT-002 | Jakarta | DKI Jakarta | Jl. Thamrin |
| BCA001 | PT Bank Central Asia | BCA-JKT-001 | Jakarta | DKI Jakarta | Jl. MH Thamrin |

### Sheet "Cassettes" - Contoh 5 Cassettes:

| SerialNumber | CassetteTypeCode | CustomerBankCode | Status | PurchaseDate |
|--------------|------------------|------------------|--------|--------------|
| RB-BNI-0001 | RB | BNI001 | SPARE_POOL | 2024-01-15 |
| RB-BNI-0002 | RB | BNI001 | SPARE_POOL | 2024-01-15 |
| RB-BNI-0003 | RB | BNI001 | INSTALLED | 2024-01-10 |
| AB-BNI-0001 | AB | BNI001 | SPARE_POOL | 2024-01-15 |
| RB-BCA-0001 | RB | BCA001 | SPARE_POOL | 2024-02-01 |

## ⚠️ Catatan Penting

1. **Sheet names HARUS exact:** "Banks" dan "Cassettes" (case-sensitive)
2. **Header row HARUS di row 1**
3. **Column names flexible:** Bisa pakai `BankCode` atau `Bank_Code` atau `bank_code`
4. **Date format:** Gunakan YYYY-MM-DD (contoh: 2024-01-15)
5. **CassetteTypeCode:** Harus valid (RB, AB, URJB)
6. **CustomerBankCode:** Harus match dengan BankCode yang sudah di-import

## 🔍 Troubleshooting

### Error: "Excel file must contain 'Banks' and/or 'Cassettes' sheets"
- **Solusi:** Pastikan sheet names exact: "Banks" dan "Cassettes" (tanpa spasi extra)

### Error: "Banks sheet must have 'BankCode' and 'BankName' columns"
- **Solusi:** Pastikan ada kolom "BankCode" dan "BankName" di row 1

### Error: "Bank BNI001 not found" (saat import cassettes)
- **Solusi:** Import banks dulu sebelum import cassettes, atau pastikan CustomerBankCode match dengan BankCode

### Error: "Cassette type RB not found"
- **Solusi:** Jalankan seed database dulu: `npm run prisma:seed` untuk membuat cassette types

## 📞 Format Alternatif

Jika header kolom tidak match, coba format alternatif ini:

### Banks:
- `BankCode` / `Bank_Code` / `bank_code`
- `BankName` / `Bank_Name` / `bank_name`
- `BranchCode` / `Branch_Code`
- `ContactPerson` / `Contact_Person`
- `ContactPhone` / `Contact_Phone`
- `ContactEmail` / `Contact_Email`

### Cassettes:
- `SerialNumber` / `Serial_Number` / `serial_number`
- `CassetteTypeCode` / `Cassette_Type_Code` / `TypeCode` / `Type_Code`
- `CustomerBankCode` / `Customer_Bank_Code` / `BankCode`
- `PurchaseDate` / `Purchase_Date`
- `WarrantyExpiryDate` / `Warranty_Expiry_Date`
- `CurrentMachineCode` / `Current_Machine_Code` / `MachineCode`
- `PositionInMachine` / `Position_In_Machine`

---

## 🎯 Keuntungan Excel vs JSON

| Feature | Excel | JSON |
|---------|-------|------|
| **User Friendly** | ✅ Sangat familiar | ❌ Butuh programming knowledge |
| **Visual Editing** | ✅ Mudah edit di Excel | ❌ Harus edit text |
| **Bulk Data** | ✅ Copy-paste dari spreadsheet | ❌ Harus format manual |
| **Formula** | ✅ Bisa pakai Excel formula | ❌ Tidak support |
| **Template** | ✅ Bisa reuse template | ⚠️ Harus copy-paste JSON |

---

Selamat menggunakan Excel Import! 🎉

