# 🎫 Flow Open Ticket - Lengkap & Sederhana

## 📋 Ringkasan Flow

**Flow Open Ticket (Dari Vendor):**
```
1. Vendor scan/input SN kaset → 2. Input detail masalah → 3. Input kurir + resi (opsional) → 4. Submit → Ticket langsung IN_DELIVERY (jika ada resi) atau OPEN (jika belum ada resi)
```

---

## 🎯 Step-by-Step Flow Open Ticket

### **STEP 1: Vendor Buka Halaman Create Ticket** 📝

**Akses:** 
- URL: `/tickets/create` atau `/request/new` (alias)
- Akses: **VENDOR users only**

**Yang Dilakukan:**
- Vendor login ke sistem
- Klik "Create Ticket" atau akses langsung `/tickets/create`

---

### **STEP 2: Input/Scan Serial Number Kaset** 🔍

**Field:** Serial Number Kaset *
- **Cara Input:**
  1. Manual: Ketik SN kaset (e.g., `RB-BNI-0001`)
  2. Scan: Klik tombol "📷 Scan" untuk scan barcode
  
**Validasi:**
- SN harus ada di database
- Sistem otomatis menampilkan info kaset:
  - ✅ SN: RB-BNI-0001
  - ✅ Tipe: RB (VS)
  - ✅ Bank: PT Bank Negara Indonesia (Persero) Tbk
  - ✅ Status: OK / BAD / IN_TRANSIT_TO_RC / dll
- **Warna Box:** 
  - 🟢 Hijau jika status OK
  - 🔴 Merah jika status BAD
  - 🟡 Kuning jika status lainnya

**Error Handling:**
- Jika SN tidak ditemukan → Error merah: "Cassette with serial number XXX not found"
- Jika kaset sudah ada ticket aktif → Error: "Cassette already has an active ticket: XXX"

---

### **STEP 3: Input Detail Masalah** 📝

**Fields:**
1. **Title*** (required)
   - Contoh: "Cassette di Slot 1 rusak"
   - Contoh: "Kaset tidak bisa accept bills"
   
2. **Description*** (required)
   - Deskripsi detail masalah
   - Bisa include error codes, symptoms, dll

3. **Priority*** (required, default: MEDIUM)
   - LOW, MEDIUM, HIGH, CRITICAL

4. **Affected Components** (optional)
   - List komponen yang terkena dampak (comma separated)
   - Contoh: "Cassette RB-1, Sensor Unit"

5. **WSID** (optional)
   - Current WSID mesin (bisa berubah)

6. **Error Code** (optional)
   - Error code dari mesin
   - Contoh: E101, E202

---

### **STEP 4: Input Informasi Delivery** 📦

**Kondisi:** Opsional - hanya muncul jika user pilih metode pengiriman

**Fields:**
1. **Metode Pengiriman**
   - **SELF_DELIVERY**: Antar Mandiri (tidak perlu kurir info)
   - **COURIER**: Melalui Kurir (wajib isi kurir + resi)

2. **Jika COURIER dipilih:**
   - **Jasa Kurir*** (required)
     - JNE, TIKI, Pos Indonesia, JNT, SiCepat, dll
     - Atau "Lainnya" → input manual
   - **Nomor Resi / AWB*** (required)
     - Contoh: JNE123456789

3. **Alamat Pengirim** (muncul jika metode pengiriman dipilih)
   - **Jika vendor punya alamat kantor:**
     - Checkbox: "Gunakan alamat kantor"
     - Jika dicentang → otomatis pakai alamat kantor
     - Jika tidak → form input alamat custom muncul
   - **Jika vendor tidak punya alamat kantor:**
     - Langsung muncul form input alamat custom
   - **Form Alamat Custom (jika tidak pakai alamat kantor):**
     - Alamat Lengkap* (Textarea)
     - Kota* (Input)
     - Provinsi* (Input)
     - Kode Pos (optional)
     - Nama Kontak* (Input)
     - No. Telepon Kontak* (Input)

---

### **STEP 5: Submit Ticket** ✅

**Validasi:**
1. SN kaset harus valid dan ada di database
2. Title & Description wajib diisi
3. Jika metode pengiriman = COURIER:
   - Kurir + Resi wajib diisi
   - Alamat pengirim wajib lengkap (jika tidak pakai alamat kantor)

**Setelah Submit:**

**Scenario A: Ticket dengan Delivery Info Lengkap (Kurir + Resi)**
```
✅ Ticket dibuat dengan status: IN_DELIVERY
✅ Delivery record otomatis dibuat
✅ Cassette status → IN_TRANSIT_TO_RC
✅ Ticket siap diterima di RC
```

**Success Message:**
```
"Ticket TEST-123456789 created successfully! Kaset sedang dalam perjalanan ke Repair Center (IN_DELIVERY)."
```

**Scenario B: Ticket tanpa Delivery Info**
```
✅ Ticket dibuat dengan status: OPEN
✅ Cassette status → BAD
✅ Ticket menunggu vendor input delivery info
```

**Success Message:**
```
"Ticket TEST-123456789 created successfully! Status kaset diupdate ke BAD."
```

**Scenario C: Ticket dengan SELF_DELIVERY**
```
✅ Ticket dibuat dengan status: OPEN (atau sesuai logic)
✅ Cassette status → BAD
✅ Alamat pengirim tersimpan (jika diisi)
```

---

## 🔄 Status Flow Setelah Ticket Dibuat

### **Flow dengan Delivery Info (Kurir + Resi):**
```
CREATE TICKET
    ↓
IN_DELIVERY (otomatis)
    ↓
[RC Staff: Terima Kaset] 
    ↓
IN_PROGRESS (otomatis, Repair Ticket dibuat)
    ↓
[RC Staff: Repair & QC]
    ↓
RESOLVED (jika QC pass)
    ↓
[RC Staff: Kirim Kembali ke Vendor]
    ↓
[Vendor: Terima Kaset Kembali]
    ↓
CLOSED (otomatis)
```

### **Flow tanpa Delivery Info:**
```
CREATE TICKET
    ↓
OPEN (menunggu delivery info)
    ↓
[Vendor: Input Delivery Info - jika mau]
    ↓
IN_DELIVERY
    ↓
(selanjutnya sama seperti flow di atas)
```

---

## 🎨 UI/UX Flow

### **1. Halaman Create Ticket (`/tickets/create`)**

**Layout:**
- Header: "Create Problem Ticket"
- Form dalam Card
- Sections:
  1. **Cassette Serial Number** (dengan Scan button)
  2. **Ticket Information** (Title, Description, Priority, Components)
  3. **Additional Info** (WSID, Error Code - optional)
  4. **Delivery Information** (muncul jika metode pengiriman dipilih)
     - Metode Pengiriman
     - Courier Info (jika COURIER)
     - Alamat Pengirim
  5. **Action Buttons** (Cancel, Create Ticket)

**Visual Feedback:**
- ✅ Kaset ditemukan → Box hijau/merah/kuning sesuai status
- ❌ Kaset tidak ditemukan → Box merah dengan error
- ⏳ Loading saat fetch info kaset
- ✅ Success message setelah submit
- ❌ Error message jika validasi gagal

---

### **2. Halaman Tickets List (`/tickets`)**

**Display untuk Ticket OPEN (tanpa delivery):**
```
Status: OPEN
Message: "⏳ Menunggu delivery dari vendor..."
Info: "Ticket akan otomatis menjadi IN_DELIVERY setelah vendor mengirim kaset dengan info delivery (kurir + tracking number)."
```

**Display untuk Ticket IN_DELIVERY (dengan delivery):**
```
Status: IN_DELIVERY
Message: "📦 Kaset sedang dalam perjalanan ke Repair Center"
Info: 
  - Kurir: JNE
  - Resi: JNE123456789
  - Dikirim: 19 Jan 2025, 20:00
Button: "✅ Terima Kaset di RC" (untuk RC Staff)
```

**Status Progress Timeline:**
```
✓ OPEN (19 Jan 2025, 19:00) → ✓ IN_DELIVERY (19 Jan 2025, 20:00) → ○ IN_PROGRESS → ○ RESOLVED → ○ CLOSED
```

---

## ✅ Key Features

1. **Auto-Delivery Creation:**
   - Jika kurir + resi diisi → Delivery otomatis dibuat
   - Ticket langsung jadi IN_DELIVERY
   - Cassette langsung jadi IN_TRANSIT_TO_RC

2. **Smart Address Handling:**
   - Auto-detect vendor office address
   - Optional: Pakai alamat kantor atau input custom
   - Pre-fill contact info dari user profile

3. **Real-time Cassette Info:**
   - Auto-fetch info kaset saat input SN
   - Visual feedback dengan warna sesuai status
   - Validasi duplicate active ticket

4. **Barcode Scanning:**
   - One-click scan untuk input SN
   - Support camera access
   - Auto-close setelah scan berhasil

5. **Clear Status Flow:**
   - Timeline visual untuk tracking progress
   - Status badge dengan warna sesuai state
   - Action buttons sesuai status dan role

---

## 🔐 Access Control

- **Create Ticket:** VENDOR users only
- **View Tickets:** All authenticated users (filtered by role)
- **Receive at RC:** HITACHI users (RC_STAFF, RC_MANAGER, SUPER_ADMIN)
- **Manage Repairs:** HITACHI users only
- **Close Ticket:** HITACHI users only

---

## 📊 Database Changes

**Saat Create Ticket:**
- Create `ProblemTicket` record
- Update `Cassette.status` → BAD (atau IN_TRANSIT_TO_RC jika ada delivery)
- Create `CassetteDelivery` record (jika kurir + resi ada)
- Update `ProblemTicket.status` → IN_DELIVERY (jika delivery dibuat)

**Transaction:**
- Semua update dilakukan dalam transaction untuk consistency
- Raw SQL untuk update status (bypass Prisma caching)
- Self-healing: Auto-fix data inconsistency

---

## 🚀 Next Steps After Ticket Created

1. **Jika IN_DELIVERY:**
   - RC Staff dapat langsung "Terima Kaset di RC"
   - Repair Ticket otomatis dibuat saat diterima
   - Status → IN_PROGRESS

2. **Jika OPEN:**
   - Vendor bisa input delivery info nanti (via delivery form)
   - Atau langsung kirim tanpa update sistem
   - RC Staff bisa terima manual

---

## 📝 Notes

- SN kaset adalah primary identifier (bukan WSID)
- WSID opsional karena sering berubah
- Delivery info bisa diisi saat create ticket ATAU nanti
- Auto-delivery hanya jika kurir + resi lengkap
- Alamat pengirim wajib jika tidak pakai alamat kantor
- Duplicate ticket dicegah (1 cassette = 1 active ticket max)

