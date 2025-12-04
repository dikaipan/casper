# 📦 Import Data Mesin dan Kaset ke Railway

Panduan untuk mengimport data mesin dan kaset real ke database Railway.

---

## 🔍 Penjelasan

**Migrations** hanya membuat struktur tabel (schema), tidak mengisi data.

**Seed script** hanya membuat data sample:
- 2 machines (BNI-JKT-M001, BNI-JKT-M002)
- Beberapa cassettes sample

**Data real mesin dan kaset** perlu di-import secara terpisah menggunakan script import.

---

## ✅ Opsi 1: Import dari JSON (Recommended)

### Step 1: Siapkan File JSON

Buat file JSON dengan format:

```json
{
  "machines": [
    {
      "machineSerialNumber": "74UEA43N03-069520",
      "mainCassettes": [
        "76UWAB2SW754319",
        "76UWRB2SB894550",
        "76UWRB2SB894551",
        "76UWRB2SB894516",
        "76UWRB2SB894546"
      ],
      "backupCassettes": [
        "76UWAB2SW751779",
        "76UWRB2SB885798",
        "76UWRB2SB885799",
        "76UWRB2SB885817",
        "76UWRB2SB885807"
      ]
    }
  ]
}
```

### Step 2: Upload File ke Railway

**Opsi A: Via Git (Recommended)**
1. Simpan file JSON di `backend/data/machine-cassettes.json`
2. Commit dan push ke GitHub
3. Railway akan otomatis pull file tersebut

**Opsi B: Via Railway CLI**
```bash
# Upload file ke Railway
railway run --service casper cat > data/machine-cassettes.json
# Paste JSON content, lalu Ctrl+D
```

### Step 3: Run Import Script

**Menggunakan Railway CLI:**

```bash
# Pastikan sudah login dan link
railway login
railway link

# Run import
railway run --service casper npm run import:machine-cassettes
```

**Atau dengan specify bank dan vendor:**
```bash
railway run --service casper npm run import:machine-cassettes data/machine-cassettes.json BNI VND-TAG-001
```

---

## ✅ Opsi 2: Import dari Excel/CSV

### Step 1: Siapkan File Excel/CSV

File harus berisi kolom:
- SN Mesin
- SN Kaset
- Type Kaset (RB, AB, URJB)
- dll

### Step 2: Upload File ke Railway

Simpan file di `backend/data/` dan commit ke git.

### Step 3: Run Import Script

```bash
railway run --service casper npm run import:excel-direct BNI VND-TAG-001
```

---

## ✅ Opsi 3: Import dari MySQL Dump

### Step 1: Siapkan SQL File

Jika punya MySQL dump file dengan data mesin dan kaset.

### Step 2: Upload ke Railway

Simpan file di `backend/data/` dan commit ke git.

### Step 3: Run Import Script

```bash
railway run --service casper npm run import:mysql BNI VND-TAG-001
```

---

## 📋 Step-by-Step: Import dari JSON

### 1. Siapkan File JSON

Buat file `backend/data/machine-cassettes.json` dengan data mesin dan kaset Anda.

### 2. Commit ke Git

```bash
cd "D:\HCS Cassete management\hcm"
git add backend/data/machine-cassettes.json
git commit -m "Add machine-cassettes data for import"
git push origin main
```

### 3. Tunggu Railway Redeploy

Railway akan otomatis pull file setelah push.

### 4. Run Import di Railway

```bash
# Install Railway CLI (jika belum)
npm install -g @railway/cli

# Login & Link
railway login
railway link

# Run import
railway run --service casper npm run import:machine-cassettes
```

**Expected output:**
```
🚀 Starting machine-cassette import...
📁 Reading data from: data/machine-cassettes.json
🏦 Bank Code: BNI
🏢 pengelola Code: VND-TAG-001
🔄 Importing machines...
✅ Imported 5 machines
🔄 Importing cassettes...
✅ Imported 50 cassettes
✅ Import completed!
```

---

## 🎯 Quick Reference

### Import Commands:

```bash
# Import dari JSON
railway run --service casper npm run import:machine-cassettes

# Import dari Excel
railway run --service casper npm run import:excel-direct BNI VND-TAG-001

# Import dari MySQL
railway run --service casper npm run import:mysql BNI VND-TAG-001

# Bulk import
railway run --service casper npm run bulk:import
```

### Bank & Vendor Codes:

Dari seed script:
- **Bank Code:** `BNI`
- **Vendor Codes:** `VND-TAG-001` atau `VND-ADV-001`

---

## 🐛 Troubleshooting

### Error: "Bank not found"

**Solusi:**
1. Pastikan seed sudah di-run (membuat bank BNI)
2. Atau buat bank terlebih dahulu
3. Pastikan bank code benar: `BNI` (bukan `BNI001`)

### Error: "Vendor not found"

**Solusi:**
1. Pastikan seed sudah di-run (membuat vendor)
2. Atau buat vendor terlebih dahulu
3. Pastikan vendor code benar: `VND-TAG-001` atau `VND-ADV-001`

### Error: "File not found"

**Solusi:**
1. Pastikan file sudah di-commit dan push ke git
2. Pastikan Railway sudah redeploy setelah push
3. Pastikan path file benar

### Data Tidak Muncul Setelah Import

**Solusi:**
1. Cek logs untuk error
2. Pastikan import berhasil (tidak ada error)
3. Cek database langsung (jika bisa akses)

---

## ✅ Checklist

- [ ] File data sudah disiapkan (JSON/Excel/CSV)
- [ ] File sudah di-commit dan push ke git
- [ ] Railway sudah redeploy (pull file terbaru)
- [ ] Seed sudah di-run (bank dan vendor sudah ada)
- [ ] Import script di-run
- [ ] Data sudah terisi di database

---

## 📝 Catatan Penting

1. **Seed hanya membuat data sample** - bukan data real
2. **Data real perlu di-import** menggunakan script import
3. **Bank dan vendor harus sudah ada** sebelum import mesin/kaset
4. **File data harus di-commit** ke git agar Railway bisa akses

---

**Setelah import di-run, data mesin dan kaset real akan terisi di database Railway! 🚀**

