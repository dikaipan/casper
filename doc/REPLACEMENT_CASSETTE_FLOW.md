# 🔄 Flow Replacement Kaset - Kaset Tidak Layak Pakai (UPDATED)

## 📋 Overview

Ketika kaset tidak layak pakai (unserviceable) dan pengelola sudah mendapatkan kaset baru, berikut adalah flow yang sudah diimplementasikan:

**Aktor:** 
- **Pengelola:** Membuat request replacement
- **Hitachi Admin:** Mendaftarkan kaset baru sebagai replacement

**Tracking:** ✅ Implemented - Kaset baru terhubung dengan kaset lama dan ticket replacement

---

## 🎯 Complete Flow - Step by Step

### **STEP 1: Pengelola Membuat Request Replacement** 📝

**Aktor:** Pengelola User

**Action:**
- Pengelola membuat **Request Replacement** melalui form `/service-orders/replacement/create`
- Form berisi:
  - Kaset yang tidak layak pakai (dipilih dari mesin)
  - Alasan pergantian (`replacementReason`)
  - Informasi pengiriman kaset lama ke RC

**Status Kaset Lama:** `OK/BAD` → `IN_TRANSIT_TO_RC`

**System:**
- Membuat Problem Ticket dengan `requestReplacement = true`
- Menyimpan `replacementReason` di `TicketCassetteDetail`
- Update kaset status ke `IN_TRANSIT_TO_RC`

---

### **STEP 2: RC Menerima Kaset Lama** 📦

**Aktor:** RC Staff (Hitachi)

**Action:**
- RC menerima kaset lama di Repair Center
- Membuat Repair Ticket untuk kaset tersebut

**Status Kaset Lama:** `IN_TRANSIT_TO_RC` → `IN_REPAIR`

**System:**
- Update kaset status ke `IN_REPAIR`
- Create Repair Ticket

---

### **STEP 3: RC Menyelesaikan Repair & QC** 🔧

**Aktor:** RC Staff (Hitachi)

**Action:**
- RC melakukan repair (atau verifikasi bahwa kaset tidak bisa diperbaiki)
- Melakukan QC

**Status Kaset Lama:** `IN_REPAIR` → `SCRAPPED`

**System:**
- Jika `requestReplacement = true` di ticket detail:
  - **Otomatis** tandai kaset sebagai `SCRAPPED` (tidak perlu QC passed)
  - Update notes: "Replacement requested - marked as SCRAPPED"
- Jika `requestReplacement = false`:
  - Jika QC passed → `OK`
  - Jika QC failed → `SCRAPPED`

**Catatan:** Saat ini sistem hanya menandai SCRAPPED jika QC failed. Perlu update logic untuk otomatis SCRAPPED jika `requestReplacement = true`.

---

### **STEP 4: Pengelola Menerima Kaset Baru** ✨

**Aktor:** Pengelola User

**Action:**
- Pengelola mendapatkan kaset baru dari supplier/vendor
- Kaset baru siap untuk didaftarkan ke sistem

**Status:** Kaset baru belum terdaftar di sistem

---

### **STEP 5: Pengelola Mendaftarkan Kaset Baru** 📝

**Aktor:** Pengelola User (atau Hitachi Admin)

**Action:**
- Pengelola/Hitachi mendaftarkan kaset baru melalui:
  - Form "Tambah Kaset Baru" (jika ada)
  - Atau melalui Data Management → Import
  - Atau melalui API `/cassettes` (POST)

**Data yang Diperlukan:**
- Serial Number kaset baru
- Cassette Type (sama dengan kaset lama)
- Customer Bank (sama dengan kaset lama)
- Machine ID (mesin yang sama dengan kaset lama)
- Usage Type (MAIN/BACKUP - sama dengan kaset lama)
- Status: `OK` (kaset baru langsung OK)
- Notes: "Replacement for [Serial Number Kaset Lama] - Ticket #[Ticket Number]"

**System:**
- Create kaset baru dengan status `OK`
- Assign ke mesin yang sama dengan kaset lama
- Link ke ticket replacement (opsional - perlu field baru)

---

### **STEP 6: Verifikasi & Tracking** ✅

**Aktor:** System / Admin

**Action:**
- System mencatat bahwa kaset baru adalah replacement untuk kaset lama
- Admin dapat melihat history replacement

**Tracking:**
- Kaset lama: Status `SCRAPPED`, linked to ticket dengan `requestReplacement = true`
- Kaset baru: Status `OK`, Notes berisi informasi replacement
- Ticket: Status `RESOLVED` setelah semua proses selesai

---

## 🔧 Implementasi yang Diperlukan

### **1. Update Logic Complete Repair** ⚠️

**File:** `backend/src/repairs/repairs.service.ts`

**Perubahan:**
- Saat `completeRepair`, cek apakah ticket detail memiliki `requestReplacement = true`
- Jika `requestReplacement = true`, **otomatis** tandai kaset sebagai `SCRAPPED` (tidak perlu menunggu QC failed)
- Update notes dengan informasi replacement

```typescript
// Pseudo-code
if (ticketDetail.requestReplacement === true) {
  // Auto-mark as SCRAPPED
  await tx.$executeRaw`
    UPDATE cassettes 
    SET status = 'SCRAPPED'::"CassetteStatus", 
        notes = 'Replacement requested: ${ticketDetail.replacementReason}',
        updated_at = NOW()
    WHERE id = ${ticket.cassetteId}::uuid
  `;
}
```

---

### **2. Form Daftar Kaset Baru (Replacement)** ✨

**File:** `frontend/src/app/cassettes/create/page.tsx` (atau buat baru)

**Fitur:**
- Form untuk mendaftarkan kaset baru
- Opsi: "Ini adalah replacement untuk kaset yang tidak layak pakai"
- Jika dipilih, tampilkan:
  - Dropdown untuk memilih ticket replacement yang sudah selesai
  - Auto-fill: Machine ID, Cassette Type, Customer Bank, Usage Type dari kaset lama
  - Input: Serial Number kaset baru

---

### **3. Tracking Replacement (Opsional)** 📊

**File:** `backend/prisma/schema.prisma`

**Perubahan:**
- Tambahkan field `replacedCassetteId` di model `Cassette` (opsional)
- Atau buat model `CassetteReplacement` untuk tracking

```prisma
model Cassette {
  // ... existing fields
  replacedCassetteId String? @map("replaced_cassette_id") @db.Uuid
  replacedCassette   Cassette? @relation("CassetteReplacement", fields: [replacedCassetteId], references: [id])
  replacementFor     Cassette[] @relation("CassetteReplacement")
}
```

---

## 📝 Rekomendasi Flow Sederhana (Tanpa Implementasi Baru)

Jika tidak ingin membuat fitur baru, berikut flow yang bisa dilakukan dengan fitur existing:

### **Flow Manual:**

1. **Request Replacement** ✅ (Sudah ada)
   - Pengelola membuat request replacement
   - Kaset lama dikirim ke RC

2. **RC Complete Repair** ✅ (Perlu update logic)
   - RC complete repair dengan QC failed (atau auto-SCRAPPED jika `requestReplacement = true`)
   - Kaset lama ditandai `SCRAPPED`

3. **Daftar Kaset Baru** ✅ (Sudah ada - via Data Management atau API)
   - Pengelola/Hitachi mendaftarkan kaset baru melalui:
     - Data Management → Import
     - Atau langsung create via API dengan data yang sama (Machine, Type, Bank, Usage Type)
   - Notes: "Replacement for [SN Lama]"

4. **Assign ke Mesin** ✅ (Otomatis saat create)
   - Kaset baru langsung di-assign ke mesin yang sama
   - Status: `OK`

---

## ❓ Pertanyaan untuk Klarifikasi

1. **Siapa yang mendaftarkan kaset baru?**
   - Pengelola sendiri?
   - Hitachi Admin?
   - Keduanya bisa?

2. **Apakah perlu approval untuk replacement?**
   - Apakah kaset baru perlu di-approve oleh Hitachi sebelum digunakan?
   - Atau langsung bisa digunakan setelah didaftarkan?

3. **Apakah perlu tracking replacement?**
   - Apakah perlu link antara kaset lama dan kaset baru di database?
   - Atau cukup melalui notes/history?

4. **Kapan kaset baru bisa digunakan?**
   - Langsung setelah didaftarkan?
   - Atau perlu proses verifikasi dulu?

---

## 🎯 Kesimpulan

**Flow yang Direkomendasikan:**

1. ✅ **Request Replacement** (Sudah ada)
2. ⚠️ **Update Logic Complete Repair** (Perlu update - auto-SCRAPPED jika `requestReplacement = true`)
3. ✅ **Daftar Kaset Baru** (Sudah ada - via Data Management/API)
4. ✅ **Assign ke Mesin** (Otomatis saat create)

**Yang Perlu Diimplementasikan:**
- Update logic `completeRepair` untuk auto-SCRAPPED jika `requestReplacement = true`
- (Opsional) Form khusus untuk daftar kaset replacement dengan auto-fill
- (Opsional) Tracking replacement di database

