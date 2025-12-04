# 🔄 Cassette Swap Flow - Penjelasan Lengkap

## 📖 Overview: Apa itu Cassette Swap?

**Cassette Swap** adalah proses mengganti cassette yang **rusak/broken** di mesin dengan **spare cassette** dari spare pool.

### Skenario Real-World:

```
Mesin di bank mengalami error:
❌ Cassette RB-1 di Slot 1 rusak (jammed, tidak bisa accept bills)

Solusi:
1. Vendor Technician datang ke lokasi
2. Buka mesin, ambil cassette yang rusak
3. Ambil spare cassette dari spare pool bank
4. Pasang spare cassette ke slot 1
5. Mesin kembali operational ✅
6. Cassette yang rusak dikirim ke Hitachi Repair Center
```

---

## 🎯 Flow Swap - Step by Step

### **PRE-SWAP: Kondisi Awal**

```
MACHINE (BNI-JKT-M001)
├── Slot 1: RB-BNI-0001 (INSTALLED) → ❌ BROKEN!
├── Slot 2: RB-BNI-0002 (INSTALLED) ✅ OK
├── Slot 3: RB-BNI-0003 (INSTALLED) ✅ OK
├── Slot 4: RB-BNI-0004 (INSTALLED) ✅ OK
└── Slot 5: AB-BNI-0001 (INSTALLED) ✅ OK

SPARE POOL (BNI)
├── RB-BNI-0009 (SPARE_POOL) ✅ Available
├── RB-BNI-0010 (SPARE_POOL) ✅ Available
├── RB-BNI-0011 (SPARE_POOL) ✅ Available
├── RB-BNI-0012 (SPARE_POOL) ✅ Available
└── AB-BNI-0003 (SPARE_POOL) ✅ Available
```

**Problem:** Slot 1 cassette rusak, mesin tidak bisa accept bills.

---

### **STEP 1: Vendor Technician Login & Navigate**

**Aktor:** Vendor Technician (contoh: `tag_tech1`)

1. Login ke sistem
2. Navigate ke **Cassettes Page** (`/cassettes`)
3. Klik button **"Swap Cassette"** di top right
4. Masuk ke **Swap Page** (`/cassettes/swap`)

---

### **STEP 2: Select Bank**

**Tujuan:** Filter spare cassettes berdasarkan bank owner

```
Form: Select Bank *
┌─────────────────────────────┐
│ Select bank...              │ ▼
├─────────────────────────────┤
│ BNI (PT Bank Negara...)     │ ✅ Select this
│ BRI (PT Bank Rakyat...)     │
│ Mandiri (PT Bank Mandiri...)│
└─────────────────────────────┘
```

**Alasan:** Setiap bank punya spare pool sendiri. Tidak bisa pakai spare BNI untuk mesin BRI.

**Result:** System load spare cassettes untuk BNI:
- RB-BNI-0009 (SPARE_POOL)
- RB-BNI-0010 (SPARE_POOL)
- RB-BNI-0011 (SPARE_POOL)
- RB-BNI-0012 (SPARE_POOL)
- AB-BNI-0003 (SPARE_POOL)

---

### **STEP 3: Select Broken Cassette**

**Tujuan:** Pilih cassette yang akan diganti

```
Form: Broken Cassette *
┌─────────────────────────────────────────────┐
│ Select broken cassette...                   │ ▼
├─────────────────────────────────────────────┤
│ RB-BNI-0001                                 │ ✅ Select this
│   Recycle Box • INSTALLED • BNI-JKT-M001    │
├─────────────────────────────────────────────┤
│ RB-BNI-0002                                 │
│   Recycle Box • INSTALLED • BNI-JKT-M001    │
└─────────────────────────────────────────────┘
```

**Info yang ditampilkan:**
- Serial Number: `RB-BNI-0001`
- Type: `Recycle Box` (RB)
- Status: `INSTALLED` atau `BROKEN`
- Machine: `BNI-JKT-M001`
- Position: `Slot 1`

**Important:** Hanya cassettes dengan status **INSTALLED** atau **BROKEN** yang bisa dipilih.

**Result:** System filter spare cassettes hanya yang **type RB** (karena broken cassette type RB):
- ✅ RB-BNI-0009 (SPARE_POOL) ← Match type RB
- ✅ RB-BNI-0010 (SPARE_POOL) ← Match type RB
- ✅ RB-BNI-0011 (SPARE_POOL) ← Match type RB
- ✅ RB-BNI-0012 (SPARE_POOL) ← Match type RB
- ❌ AB-BNI-0003 (SPARE_POOL) ← Type AB, tidak match (tidak muncul)

---

### **STEP 4: Select Spare Cassette**

**Tujuan:** Pilih spare cassette yang akan dipasang

```
Form: Spare Cassette *
┌─────────────────────────────────────────────┐
│ Select spare cassette...                    │ ▼
├─────────────────────────────────────────────┤
│ RB-BNI-0009                                 │
│   Recycle Box • Spare Pool                  │
├─────────────────────────────────────────────┤
│ RB-BNI-0010                                 │ ✅ Select this
│   Recycle Box • Spare Pool                  │
├─────────────────────────────────────────────┤
│ RB-BNI-0011                                 │
│   Recycle Box • Spare Pool                  │
└─────────────────────────────────────────────┘
```

**Important:** 
- Hanya cassettes dengan **type yang sama** dengan broken cassette yang bisa dipilih
- Hanya cassettes dengan status **SPARE_POOL** yang bisa dipilih
- Semua sudah di-filter oleh system

**Result:** User pilih `RB-BNI-0010`

---

### **STEP 5: Fill Reason & Notes**

**Tujuan:** Dokumentasi alasan swap

```
Form: Reason for Swap *
┌─────────────────────────────────────────────┐
│ Cassette jammed and not accepting bills     │
│ Sensor error detected. Unit needs repair.   │
└─────────────────────────────────────────────┘

Form: Additional Notes (Optional)
┌─────────────────────────────────────────────┐
│ Machine operational after swap.             │
│ No error codes. Tested with 10 bills.       │
└─────────────────────────────────────────────┘
```

**Reason (Required):** Harus diisi, untuk tracking dan audit trail

**Notes (Optional):** Info tambahan jika perlu

---

### **STEP 6: Submit Swap**

**Aktor:** User klik button **"Swap Cassette"**

**System Process:**

```
1. Validate Form:
   ✅ Bank selected
   ✅ Broken cassette selected
   ✅ Spare cassette selected
   ✅ Reason filled
   ✅ Types match (RB = RB)

2. Send API Request:
   POST /api/cassettes/swap
   {
     brokenCassetteId: "RB-BNI-0001",
     spareCassetteId: "RB-BNI-0010",
     reason: "Cassette jammed...",
     notes: "Machine operational..."
   }

3. Backend Process (Transaction):
   a. Mark Broken Cassette:
      - Status: INSTALLED → IN_TRANSIT_TO_RC
      - currentMachineId: BNI-JKT-M001 → null
      - positionInMachine: 1 → null
      - totalSwapCount: +1
   
   b. Install Spare Cassette:
      - Status: SPARE_POOL → INSTALLED
      - currentMachineId: null → BNI-JKT-M001
      - positionInMachine: null → 1
      - totalSwapCount: +1
   
   c. Log Swap History:
      - CassetteSwap record untuk broken cassette
      - CassetteSwap record untuk spare cassette
   
   d. Commit Transaction (all or nothing)

4. Return Success Response
```

---

### **POST-SWAP: Kondisi Setelah Swap**

```
MACHINE (BNI-JKT-M001)
├── Slot 1: RB-BNI-0010 (INSTALLED) ✅ NEW! (dari spare pool)
├── Slot 2: RB-BNI-0002 (INSTALLED) ✅ OK
├── Slot 3: RB-BNI-0003 (INSTALLED) ✅ OK
├── Slot 4: RB-BNI-0004 (INSTALLED) ✅ OK
└── Slot 5: AB-BNI-0001 (INSTALLED) ✅ OK

SPARE POOL (BNI)
├── RB-BNI-0001 (IN_TRANSIT_TO_RC) ← BROKEN (sedang dikirim ke RC)
├── RB-BNI-0009 (SPARE_POOL) ✅ Available
├── RB-BNI-0011 (SPARE_POOL) ✅ Available
├── RB-BNI-0012 (SPARE_POOL) ✅ Available
└── AB-BNI-0003 (SPARE_POOL) ✅ Available

REPAIR CENTER (Hitachi)
└── Akan terima: RB-BNI-0001 (nanti dikirim oleh vendor)
```

**Result:** Mesin kembali operational dengan cassette baru! ✅

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PRE-SWAP STATE                                              │
├─────────────────────────────────────────────────────────────┤
│ Machine Slot 1: RB-BNI-0001 (INSTALLED) ❌ BROKEN          │
│ Spare Pool: RB-BNI-0010 (SPARE_POOL) ✅ Available          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Vendor Tech Login & Navigate                       │
│ - Login as tag_tech1                                        │
│ - Go to /cassettes                                          │
│ - Click "Swap Cassette"                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Select Bank                                         │
│ - Select "BNI"                                              │
│ - System load spare cassettes for BNI                      │
│ - Available: RB-0009, RB-0010, RB-0011, RB-0012, AB-0003   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Select Broken Cassette                             │
│ - Select "RB-BNI-0001" (Slot 1, Type: RB)                  │
│ - System filter spare: Only RB type shown                  │
│ - Filtered: RB-0009, RB-0010, RB-0011, RB-0012             │
│   (AB-0003 hidden - wrong type)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Select Spare Cassette                              │
│ - Select "RB-BNI-0010" (Type: RB) ✅ Match!                │
│ - Validation: Type matches ✅                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Fill Form                                           │
│ - Reason: "Cassette jammed..." (required)                   │
│ - Notes: "Machine operational..." (optional)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Submit Swap                                         │
│ - Click "Swap Cassette"                                     │
│ - API POST /cassettes/swap                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND PROCESS (Transaction)                               │
├─────────────────────────────────────────────────────────────┤
│ 1. Update Broken Cassette (RB-BNI-0001):                   │
│    - Status: INSTALLED → IN_TRANSIT_TO_RC                   │
│    - Machine: BNI-JKT-M001 → null                           │
│    - Position: 1 → null                                     │
│                                                             │
│ 2. Update Spare Cassette (RB-BNI-0010):                    │
│    - Status: SPARE_POOL → INSTALLED                         │
│    - Machine: null → BNI-JKT-M001                           │
│    - Position: null → 1                                     │
│                                                             │
│ 3. Log Swap History (both cassettes)                       │
│                                                             │
│ 4. Commit Transaction ✅                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ POST-SWAP STATE                                             │
├─────────────────────────────────────────────────────────────┤
│ Machine Slot 1: RB-BNI-0010 (INSTALLED) ✅ NEW!            │
│ Spare Pool: RB-BNI-0001 (IN_TRANSIT_TO_RC) ← Going to RC   │
│                                                             │
│ ✅ Machine Operational Again!                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Points yang Perlu Dipahami

### 1. **Type Matching adalah CRITICAL!**

**❌ TIDAK BISA:**
```
Broken: RB (Recycle Box) → Spare: AB (Acceptor Box)
```
**Kenapa?** RB dan AB punya fungsi berbeda, tidak bisa ditukar!

**✅ HARUS:**
```
Broken: RB (Recycle Box) → Spare: RB (Recycle Box)
```

### 2. **Status Requirements**

**Broken Cassette harus:**
- ✅ `INSTALLED` - Masih di mesin, perlu diganti
- ✅ `BROKEN` - Sudah di-mark broken, perlu diganti
- ❌ `SPARE_POOL` - Tidak bisa, sudah di spare pool
- ❌ `IN_TRANSIT` - Tidak bisa, sedang dikirim
- ❌ `IN_REPAIR` - Tidak bisa, sedang diperbaiki

**Spare Cassette harus:**
- ✅ `SPARE_POOL` - Harus dari spare pool
- ❌ `INSTALLED` - Tidak bisa, sudah di mesin lain
- ❌ `BROKEN` - Tidak bisa, rusak juga

### 3. **Bank Owner Matching**

**Setiap bank punya spare pool sendiri:**
- ✅ BNI machine → BNI spare pool
- ❌ BNI machine → BRI spare pool (tidak bisa!)

### 4. **Position Assignment**

**Ketika swap:**
- Spare cassette mengambil **position yang sama** dengan broken cassette
- Jika broken di Slot 1, spare akan dipasang di Slot 1 juga
- System otomatis assign position

### 5. **Swap History Tracking**

**System log swap history untuk:**
- Broken cassette (record: REMOVE operation)
- Spare cassette (record: INSTALL operation)
- Full audit trail untuk tracking

---

## 💡 Contoh Skenario Lengkap

### Skenario: Cassette di Slot 3 Rusak

**Before Swap:**
```
Machine: BNI-JKT-M001
Slot 3: RB-BNI-0003 (INSTALLED) ❌ BROKEN - Sensor error
```

**User Action:**
1. Select Bank: BNI
2. Select Broken: RB-BNI-0003 (Slot 3, Type RB)
3. Select Spare: RB-BNI-0011 (Type RB, dari spare pool)
4. Reason: "Sensor error, not detecting bills"
5. Submit

**After Swap:**
```
Machine: BNI-JKT-M001
Slot 3: RB-BNI-0011 (INSTALLED) ✅ NEW - Working!

Spare Pool:
RB-BNI-0003 (IN_TRANSIT_TO_RC) ← Akan dikirim ke RC
```

**Result:**
- ✅ Machine operational
- ✅ Slot 3 working dengan cassette baru
- ✅ Broken cassette marked untuk repair
- ✅ Swap history recorded

---

## 🔍 Visual Flow (Simple Version)

```
[Vendor Tech] ──→ [Select Bank] ──→ [Select Broken] ──→ [Select Spare]
                                                              │
                                                              ▼
[Fill Reason] ←── [Auto-filter by Type] ←─── [System shows only matching types]
     │
     ▼
[Submit] ──→ [Backend Swap] ──→ [Update Status] ──→ [Success!]
     │              │                    │
     │              ▼                    │
     │         [Transaction]             │
     │              │                    │
     │              ▼                    │
     │         [Broken → IN_TRANSIT]     │
     │              │                    │
     │              ▼                    │
     │         [Spare → INSTALLED]       │
     │              │                    │
     │              ▼                    │
     │         [Log History]             │
     │              │                    │
     └──────────────┴────────────────────┘
                    │
                    ▼
              [Success Page]
                    │
                    ▼
            [Redirect to /cassettes]
```

---

## ❓ FAQ

### Q: Kenapa harus select bank dulu?
**A:** Karena setiap bank punya spare pool sendiri. System perlu tahu bank mana untuk load spare cassettes yang benar.

### Q: Kenapa spare cassette harus match type?
**A:** RB dan AB punya fungsi berbeda. RB untuk accept + dispense, AB hanya accept. Tidak bisa ditukar.

### Q: Apa yang terjadi ke broken cassette?
**A:** Status berubah jadi `IN_TRANSIT_TO_RC`, dikeluarkan dari mesin, dan akan dikirim ke Hitachi Repair Center untuk diperbaiki.

### Q: Apa yang terjadi ke spare cassette?
**A:** Status berubah jadi `INSTALLED`, dipasang ke mesin di position yang sama dengan broken cassette, dan mesin kembali operational.

### Q: Kapan swap history ditrack?
**A:** Setiap kali swap, system create 2 records:
1. Record untuk broken cassette (REMOVE operation)
2. Record untuk spare cassette (INSTALL operation)

### Q: Apakah swap bisa di-undo?
**A:** Tidak bisa di-undo. Tapi bisa swap lagi untuk mengembalikan jika ada kesalahan.

---

## 📚 Dokumentasi Lengkap

File ini menjelaskan:
- ✅ Complete flow dengan visual
- ✅ Step-by-step process
- ✅ Key points yang penting
- ✅ Contoh skenario real-world
- ✅ FAQ untuk common questions

**Masih ada pertanyaan tentang flow swap?** 😊

