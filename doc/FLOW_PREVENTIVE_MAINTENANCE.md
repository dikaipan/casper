# Flow Preventive Maintenance (PM) - Kaset

## Overview
Preventive Maintenance adalah aktivitas maintenance rutin atau on-demand yang dilakukan oleh engineer/tim service lapangan Hitachi untuk menjaga performa **kaset (cassette)**. PM bisa dilakukan untuk single cassette atau multiple cassettes dalam satu session.

## Tipe PM

### 1. **ROUTINE** - PM Rutin
- PM terjadwal berdasarkan interval (misal: setiap 3 bulan)
- Otomatis dijadwalkan oleh sistem
- Bisa di-set recurring schedule

### 2. **ON_DEMAND** - PM Atas Permintaan
- Diminta oleh Bank atau Vendor
- Bisa urgent atau planned
- Request bisa dari:
  - Vendor User (via web)
  - Bank (via vendor atau langsung)
  - Hitachi internal

### 3. **EMERGENCY** - PM Darurat
- PM yang perlu dilakukan segera
- Prioritas tinggi

## Lokasi PM

### 1. **VENDOR_LOCATION** - Di Lokasi Vendor (Default)
- PM dilakukan di workshop/facility vendor
- Engineer datang ke lokasi vendor
- **Ini adalah lokasi paling umum** untuk PM kaset

### 2. **BANK_LOCATION** - Di Lokasi Bank
- PM dilakukan di cabang bank
- Engineer datang ke lokasi customer
- Biasanya untuk PM on-demand dari bank

### 3. **REPAIR_CENTER** - Di Repair Center
- PM dilakukan di RC Hitachi
- Kaset dibawa ke RC
- Biasanya untuk PM yang memerlukan peralatan khusus

## Status Flow

```
SCHEDULED → IN_PROGRESS → COMPLETED
    ↓
CANCELLED (bisa di status manapun)
    ↓
RESCHEDULED (dari SCHEDULED)
```

### Status Details:

1. **SCHEDULED**
   - PM sudah dijadwalkan
   - Belum dimulai
   - Engineer belum assigned atau sudah assigned
   - Bisa di-cancel atau reschedule

2. **IN_PROGRESS**
   - Engineer sudah mulai PM
   - actualStartDate diisi
   - Checklist sedang dikerjakan

3. **COMPLETED**
   - PM selesai
   - actualEndDate diisi
   - Findings, actions taken, recommendations sudah diisi
   - nextPmDate bisa di-set

4. **CANCELLED**
   - PM dibatalkan
   - cancelledReason wajib
   - Bisa di-cancel dari status SCHEDULED atau IN_PROGRESS

5. **RESCHEDULED**
   - PM dijadwalkan ulang
   - scheduledDate baru di-set
   - Status kembali ke SCHEDULED

## User Roles & Actions

### **Hitachi Engineer/RC Staff**
- ✅ Lihat semua PM (assigned atau semua)
- ✅ Update status PM (SCHEDULED → IN_PROGRESS → COMPLETED)
- ✅ Isi checklist, findings, actions taken
- ✅ Set next PM date
- ✅ Cancel PM (dengan reason)

### **Hitachi Admin/Manager**
- ✅ Create PM (ROUTINE, ON_DEMAND, EMERGENCY)
- ✅ Assign engineer
- ✅ Lihat semua PM
- ✅ Cancel/reschedule PM
- ✅ Generate reports

### **Vendor User**
- ✅ Request PM (ON_DEMAND) untuk kaset mereka
- ✅ Lihat PM untuk kaset dari bank yang di-assign
- ✅ Lihat history PM
- ❌ Tidak bisa assign engineer
- ❌ Tidak bisa complete PM

### **Bank (via Vendor)**
- ✅ Request PM melalui vendor
- ✅ Lihat PM untuk mesin di bank mereka

## PM Number Format

Format: `PM-YYMMDD[urutan]`

Contoh:
- `PM-2411251` (PM pertama di 24 Nov 2025)
- `PM-2411252` (PM kedua di 24 Nov 2025)

## Checklist Items

Checklist bisa di-level PM (umum) atau per-cassette (spesifik):

**PM Level Checklist:**
```json
[
  {
    "item": "Prepare tools and equipment",
    "status": "completed"
  },
  {
    "item": "Verify location access",
    "status": "completed"
  }
]
```

**Per-Cassette Checklist (di PMCassetteDetail):**
```json
[
  {
    "item": "Check cassette alignment",
    "status": "completed",
    "notes": "OK"
  },
  {
    "item": "Clean transport path",
    "status": "completed",
    "notes": "Minor dust found, cleaned"
  },
  {
    "item": "Lubricate moving parts",
    "status": "pending",
    "notes": ""
  },
  {
    "item": "Test read/write",
    "status": "completed",
    "notes": "All tests passed"
  }
]
```

## Parts Replaced

Parts disimpan sebagai JSON array:
```json
[
  {
    "partName": "Belt",
    "partNumber": "BELT-001",
    "quantity": 1,
    "reason": "Worn out"
  }
]
```

## Next PM Calculation

Setelah PM COMPLETED:
- nextPmDate = scheduledDate + nextPmInterval (days)
- nextPmInterval default: 90 hari (3 bulan)
- Bisa di-custom per kaset atau per PM
- Setiap kaset bisa punya next PM date berbeda (jika status berbeda)
  - Kaset OK → next PM in 90 days
  - Kaset NEEDS_REPAIR → next PM after repair completed
  - Kaset REPLACED → new cassette, reset PM cycle

## Integration dengan Service Orders

- PM bisa detect issues → Create Service Order otomatis
- PM history bisa di-link ke Service Orders yang terkait
- Kaset dengan banyak PM biasanya lebih reliable (kurang Service Orders)

## Multi-Cassette PM

- Satu PM bisa untuk multiple cassettes
- Setiap cassette punya checklist, findings, actions sendiri
- Per-cassette status: OK, NEEDS_REPAIR, REPLACED, etc.
- Engineer bisa PM beberapa kaset sekaligus di lokasi yang sama

## Reports & Analytics

1. **PM Completion Rate**
   - % PM yang completed on time
   - % PM yang cancelled/rescheduled

2. **PM Frequency per Cassette**
   - Berapa kali PM per kaset per tahun
   - Average interval per kaset
   - Kaset mana yang paling sering di-PM

3. **Engineer Performance**
   - PM completed per engineer
   - Average duration per PM
   - Average cassettes per PM session

4. **Cost Analysis**
   - Parts replaced per PM
   - Total cost per cassette per year
   - Cost comparison: PM vs Repair (Service Orders)

## Notifications

- Notify engineer saat PM assigned
- Notify requester saat PM scheduled
- Notify saat PM completed
- Reminder untuk upcoming PM (7 days before)

