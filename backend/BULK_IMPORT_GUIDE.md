# 📦 Panduan Bulk Import Bank & Cassettes

Panduan ini menjelaskan cara import data bank dan cassettes secara bulk (massal) tanpa harus input satu per satu.

## 🎯 Cara Menggunakan

### Step 1: Buat File JSON

Buat file JSON dengan format seperti contoh di `backend/data/import-data.example.json`

**Contoh struktur:**

```json
{
  "banks": [
    {
      "bankCode": "BNI001",
      "bankName": "PT Bank Negara Indonesia",
      "branchCode": "BNI-JKT-001",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "address": "Jl. Sudirman No. 1",
      "contactPerson": "John Doe",
      "contactPhone": "021-12345678",
      "contactEmail": "contact@bni.co.id",
      "notes": "Head Office"
    }
  ],
  "cassettes": [
    {
      "serialNumber": "RB-BNI-0001",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "SPARE_POOL",
      "purchaseDate": "2024-01-15",
      "warrantyExpiryDate": "2026-01-15",
      "notes": "Spare cassette"
    }
  ]
}
```

### Step 2: Simpan File JSON

Simpan file JSON di folder `backend/data/` dengan nama `import-data.json`

**Contoh:**
```
backend/
  └── data/
      ├── import-data.json          ← File Anda
      └── import-data.example.json  ← Contoh template
```

### Step 3: Jalankan Script Import

```bash
cd backend
npm run bulk:import
```

**Atau dengan path file khusus:**
```bash
npm run bulk:import data/my-import.json
```

## 📋 Field yang Diperlukan

### Banks (Bank)

| Field | Required | Type | Contoh |
|-------|----------|------|--------|
| `bankCode` | ✅ Ya | String | "BNI001" |
| `bankName` | ✅ Ya | String | "PT Bank Negara Indonesia" |
| `branchCode` | ❌ Tidak | String | "BNI-JKT-001" |
| `city` | ❌ Tidak | String | "Jakarta" |
| `province` | ❌ Tidak | String | "DKI Jakarta" |
| `address` | ❌ Tidak | String | "Jl. Sudirman No. 1" |
| `contactPerson` | ❌ Tidak | String | "John Doe" |
| `contactPhone` | ❌ Tidak | String | "021-12345678" |
| `contactEmail` | ❌ Tidak | String | "contact@bni.co.id" |
| `notes` | ❌ Tidak | String | "Head Office" |

### Cassettes

| Field | Required | Type | Contoh |
|-------|----------|------|--------|
| `serialNumber` | ✅ Ya | String | "RB-BNI-0001" |
| `cassetteTypeCode` | ✅ Ya | String | "RB", "AB", "URJB" |
| `customerBankCode` | ✅ Ya | String | "BNI001" (harus match bankCode) |
| `status` | ❌ Tidak | Enum | "SPARE_POOL", "INSTALLED", "BROKEN", etc. |
| `purchaseDate` | ❌ Tidak | Date (YYYY-MM-DD) | "2024-01-15" |
| `warrantyExpiryDate` | ❌ Tidak | Date (YYYY-MM-DD) | "2026-01-15" |
| `currentMachineCode` | ❌ Tidak | String | "BNI-JKT-M001" (jika installed) |
| `positionInMachine` | ❌ Tidak | Number | 1-6 (slot number) |
| `notes` | ❌ Tidak | String | "Spare cassette 1" |

### Cassette Type Codes

- `RB` - Recycle Box (Bidirectional)
- `AB` - Acceptor Box (Accept Only)
- `URJB` - Unrecognized Reject Box

### Cassette Status

- `SPARE_POOL` - Di spare pool (default)
- `INSTALLED` - Terpasang di machine
- `BROKEN` - Rusak
- `IN_TRANSIT_TO_RC` - Sedang dikirim ke RC
- `IN_REPAIR` - Sedang diperbaiki
- `SCRAPPED` - Sudah dihapus/scrapped

## 💡 Contoh Lengkap

### Contoh 1: Import Multiple Banks

```json
{
  "banks": [
    {
      "bankCode": "BNI001",
      "bankName": "PT Bank Negara Indonesia",
      "branchCode": "BNI-JKT-001",
      "city": "Jakarta",
      "province": "DKI Jakarta"
    },
    {
      "bankCode": "BCA001",
      "bankName": "PT Bank Central Asia",
      "branchCode": "BCA-JKT-001",
      "city": "Jakarta",
      "province": "DKI Jakarta"
    },
    {
      "bankCode": "MANDIRI001",
      "bankName": "PT Bank Mandiri",
      "branchCode": "MDI-JKT-001",
      "city": "Jakarta",
      "province": "DKI Jakarta"
    }
  ]
}
```

### Contoh 2: Import Multiple Cassettes

```json
{
  "cassettes": [
    {
      "serialNumber": "RB-BNI-0001",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "SPARE_POOL"
    },
    {
      "serialNumber": "RB-BNI-0002",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "SPARE_POOL"
    },
    {
      "serialNumber": "RB-BNI-0003",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "INSTALLED",
      "currentMachineCode": "BNI-JKT-M001",
      "positionInMachine": 1
    },
    {
      "serialNumber": "AB-BNI-0001",
      "cassetteTypeCode": "AB",
      "customerBankCode": "BNI001",
      "status": "SPARE_POOL"
    }
  ]
}
```

### Contoh 3: Import Banks + Cassettes Bersamaan

```json
{
  "banks": [
    {
      "bankCode": "BNI001",
      "bankName": "PT Bank Negara Indonesia"
    }
  ],
  "cassettes": [
    {
      "serialNumber": "RB-BNI-0001",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "SPARE_POOL"
    }
  ]
}
```

## ⚠️ Catatan Penting

1. **Bank Code harus UNIQUE** - Jika bank dengan bankCode yang sama sudah ada, akan di-update, bukan dibuat baru
2. **Serial Number harus UNIQUE** - Jika cassette dengan serialNumber yang sama sudah ada, akan di-update
3. **Bank harus ada dulu** - Jika import cassettes, pastikan bank dengan `customerBankCode` sudah di-import terlebih dahulu
4. **Machine harus ada** - Jika cassettes dengan `currentMachineCode`, pastikan machine dengan code tersebut sudah ada
5. **Cassette Type harus ada** - Pastikan cassette type (RB, AB, URJB) sudah di-seed terlebih dahulu

## 🚀 Workflow yang Disarankan

1. **Seed database pertama kali:**
   ```bash
   npm run prisma:seed
   ```
   Ini akan membuat cassette types (RB, AB, URJB) dan users default.

2. **Import banks:**
   ```bash
   # Buat file dengan hanya banks
   npm run bulk:import data/banks-only.json
   ```

3. **Import machines** (jika ada, bisa via seed atau manual)

4. **Import cassettes:**
   ```bash
   # Buat file dengan banks + cassettes
   npm run bulk:import data/cassettes.json
   ```

## 🔍 Output & Logging

Script akan menampilkan log seperti ini:

```
🚀 Starting bulk import...
📁 Reading data from: backend/data/import-data.json

🏦 Importing 3 banks...
  ✅ BNI001 - PT Bank Negara Indonesia
  ✅ BCA001 - PT Bank Central Asia
  ✅ MANDIRI001 - PT Bank Mandiri

📊 Banks imported: 3/3

📦 Importing 10 cassettes...
  ✅ RB-BNI-0001 - Recycle Box - PT Bank Negara Indonesia
  ✅ RB-BNI-0002 - Recycle Box - PT Bank Negara Indonesia
  ...

📊 Cassettes imported: 10/10

✅ Bulk import completed!
```

Jika ada error, akan ditampilkan:
```
  ❌ RB-INVALID-001 - Error: Bank INVALID001 not found
```

## 💻 Tips & Tricks

### Generate Serial Numbers dengan Excel/Google Sheets

Anda bisa generate serial numbers dengan formula:

**Untuk RB-BNI-0001 sampai RB-BNI-0100:**
```
="RB-BNI-" & TEXT(ROW(A1:A100), "0000")
```

**Kemudian copy ke JSON:**
```json
{
  "cassettes": [
    {"serialNumber": "RB-BNI-0001", "cassetteTypeCode": "RB", "customerBankCode": "BNI001"},
    {"serialNumber": "RB-BNI-0002", "cassetteTypeCode": "RB", "customerBankCode": "BNI001"},
    ...
  ]
}
```

### Generate dengan Script Python/Node.js

Bisa juga buat script untuk generate JSON dari template:

```javascript
const cassettes = [];
for (let i = 1; i <= 100; i++) {
  cassettes.push({
    serialNumber: `RB-BNI-${String(i).padStart(4, '0')}`,
    cassetteTypeCode: 'RB',
    customerBankCode: 'BNI001',
    status: 'SPARE_POOL'
  });
}
console.log(JSON.stringify({ cassettes }, null, 2));
```

## 📞 Support

Jika ada masalah atau pertanyaan, cek:
1. Console log untuk error message
2. Pastikan format JSON valid (bisa validate di https://jsonlint.com)
3. Pastikan semua referensi (bankCode, machineCode) sudah ada

