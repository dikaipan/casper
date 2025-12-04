# 🔄 Revised Cassette Flow - Ticket-Based System

## 📋 Flow yang Benar (Sesuai Requirement)

### ❌ Flow Lama (Swap Langsung):
```
Vendor → Swap langsung → Selesai
```

### ✅ Flow Baru (Ticket-Based):
```
1. Vendor → Create Ticket (Cassette rusak)
2. Admin/RC Staff → Approve Ticket
3. Vendor → Input Form Pengiriman ke RC
4. RC Staff → Terima Kaset di RC
5. RC Staff → Repair & QC
6. RC Staff → Update Status ke SPARE_POOL
```

---

## 🎯 Complete Flow - Step by Step

### **STEP 1: Vendor Create Ticket** 📝

**Aktor:** Vendor Technician

**Action:**
- Vendor melihat cassette rusak di mesin
- Vendor buat **Problem Ticket** di sistem
- Ticket berisi:
  - Machine yang terkena dampak
  - Cassette yang rusak (optional, bisa diidentifikasi dari ticket)
  - Problem description
  - Priority (LOW/MEDIUM/HIGH/CRITICAL)

**Status Ticket:** `OPEN`

**System:**
- Generate ticket number
- Assign ke machine
- Log reporter (vendor user)

---

### **STEP 2: Admin/RC Staff Approve Ticket** ✅

**Aktor:** Admin atau RC Staff (Hitachi)

**Action:**
- Review ticket dari vendor
- Approve ticket jika valid
- Update ticket status ke `APPROVED` atau `IN_PROGRESS`

**Status Ticket:** `APPROVED` → `PENDING_VENDOR`

**System:**
- Notify vendor bahwa ticket sudah approved
- Ticket sekarang bisa dilanjutkan ke proses pengiriman

---

### **STEP 3: Vendor Input Form Pengiriman** 📦

**Aktor:** Vendor Technician

**Action:**
- Setelah ticket approved, vendor buka form **"Form Pengiriman Kaset"**
- Input informasi pengiriman:
  - Cassette ID/Serial Number yang dikirim
  - Tanggal pengiriman
  - Kurir/Jasa pengiriman
  - Nomor resi (jika ada)
  - Estimasi tiba di RC
  - Notes tambahan

**Status Cassette:** `INSTALLED/BROKEN` → `IN_TRANSIT_TO_RC`

**System:**
- Update cassette status ke `IN_TRANSIT_TO_RC`
- Link cassette ke ticket
- Create delivery record
- Update ticket status ke `PENDING_RC`

---

### **STEP 4: RC Staff Terima Kaset** 📬

**Aktor:** RC Staff (Hitachi)

**Action:**
- RC staff terima fisik kaset di Repair Center
- Scan serial number
- Verifikasi dengan delivery form dari vendor
- Update status: Kaset diterima di RC

**Status Cassette:** `IN_TRANSIT_TO_RC` → `IN_REPAIR`
**Status Ticket:** `PENDING_RC` → `IN_PROGRESS`

**System:**
- Update cassette status ke `IN_REPAIR`
- Create Repair Ticket
- Link ke original problem ticket

---

### **STEP 5: RC Staff Repair & QC** 🔧

**Aktor:** RC Staff (Hitachi)

**Action:**
- RC staff repair kaset
- Log repair actions & parts replaced
- Perform QC (Quality Control)
- Update repair ticket

**Status Repair:** `DIAGNOSING` → `WAITING_PARTS` → `COMPLETED`

---

### **STEP 6: RC Staff Update Status ke Spare Pool** ✅

**Aktor:** RC Staff (Hitachi)

**Action:**
- Setelah repair complete dan QC passed
- RC staff update status kaset ke `SPARE_POOL`
- Kaset siap digunakan lagi sebagai spare

**Status Cassette:** `IN_REPAIR` → `SPARE_POOL`
**Status Repair:** `COMPLETED`
**Status Ticket:** `IN_PROGRESS` → `RESOLVED`

**System:**
- Update cassette status
- Update repair ticket
- Update problem ticket
- Kaset kembali ke spare pool bank owner

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Vendor Create Ticket                                │
├─────────────────────────────────────────────────────────────┤
│ Vendor Technician melihat cassette rusak                    │
│ → Create Problem Ticket                                      │
│ → Status: OPEN                                               │
│ → Link ke Machine                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Admin/RC Staff Approve                              │
├─────────────────────────────────────────────────────────────┤
│ Admin/RC Staff review ticket                                │
│ → Approve ticket                                             │
│ → Status: OPEN → APPROVED → PENDING_VENDOR                  │
│ → Notify vendor                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Vendor Input Form Pengiriman                        │
├─────────────────────────────────────────────────────────────┤
│ Vendor buka Form Pengiriman Kaset                           │
│ → Input: Cassette ID, Tanggal, Kurir, Resi, dll            │
│ → Submit Form Pengiriman                                     │
│ → Cassette Status: INSTALLED/BROKEN → IN_TRANSIT_TO_RC      │
│ → Ticket Status: PENDING_VENDOR → PENDING_RC                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: RC Staff Terima Kaset                               │
├─────────────────────────────────────────────────────────────┤
│ RC Staff terima fisik kaset di RC                           │
│ → Scan serial number                                         │
│ → Verifikasi dengan delivery form                           │
│ → Confirm receipt                                            │
│ → Cassette Status: IN_TRANSIT_TO_RC → IN_REPAIR             │
│ → Create Repair Ticket                                       │
│ → Ticket Status: PENDING_RC → IN_PROGRESS                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: RC Staff Repair & QC                                │
├─────────────────────────────────────────────────────────────┤
│ RC Staff repair kaset                                       │
│ → Log repair actions                                         │
│ → Log parts replaced                                         │
│ → Perform QC                                                 │
│ → Repair Status: DIAGNOSING → COMPLETED                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: RC Staff Update ke Spare Pool                       │
├─────────────────────────────────────────────────────────────┤
│ RC Staff update status                                       │
│ → Cassette Status: IN_REPAIR → SPARE_POOL                   │
│ → Repair Status: COMPLETED                                   │
│ → Ticket Status: IN_PROGRESS → RESOLVED                     │
│ → Kaset kembali ke spare pool bank owner                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Changes dari Flow Lama

### ❌ Flow Lama (Swap Langsung):
- Vendor langsung swap tanpa approval
- Tidak ada tracking via ticket
- Tidak ada form pengiriman
- Langsung swap fisik di mesin

### ✅ Flow Baru (Ticket-Based):
- ✅ **Vendor create ticket dulu** (perlu approval)
- ✅ **Admin/RC approve** sebelum lanjut
- ✅ **Form pengiriman** untuk tracking
- ✅ **RC receive & repair** process lengkap
- ✅ **Full audit trail** via ticket

---

## 📋 Schema Changes Needed

### 1. Ticket Status Enum (Update)
```prisma
enum ProblemTicketStatus {
  OPEN
  APPROVED          // NEW - After admin approval
  PENDING_VENDOR    // NEW - Waiting for vendor to send cassette
  PENDING_RC        // NEW - Cassette in transit to RC
  IN_PROGRESS       // RC staff processing
  RESOLVED
  CLOSED
}
```

### 2. New Table: CassetteDelivery
```prisma
model CassetteDelivery {
  id                  String      @id @default(uuid()) @db.Uuid
  ticketId            String      @map("ticket_id") @db.Uuid
  cassetteId          String      @map("cassette_id") @db.Uuid
  sentBy              String      @map("sent_by") @db.Uuid // VendorUser ID
  shippedDate         DateTime    @map("shipped_date")
  courierService      String?     @map("courier_service") @db.VarChar(255)
  trackingNumber      String?     @map("tracking_number") @db.VarChar(100)
  estimatedArrival    DateTime?   @map("estimated_arrival")
  notes               String?     @db.Text
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  // Relations
  ticket              ProblemTicket @relation(fields: [ticketId], references: [id])
  cassette            Cassette      @relation(fields: [cassetteId], references: [id])
  sender              VendorUser    @relation(fields: [sentBy], references: [id])

  @@map("cassette_deliveries")
}
```

### 3. Update ProblemTicket Schema
```prisma
model ProblemTicket {
  // ... existing fields ...
  
  // NEW fields
  approvedBy          String?     @map("approved_by") @db.Uuid // HitachiUser ID
  approvedAt          DateTime?   @map("approved_at")
  approvalNotes       String?     @map("approval_notes") @db.Text
  
  // NEW relation
  cassetteDelivery    CassetteDelivery?
  approvedByUser      HitachiUser? @relation("TicketApprover", fields: [approvedBy], references: [id])
}
```

---

## 🎯 Implementation Priority

### Phase 1: Core Ticket & Approval Flow ⭐⭐⭐
1. ✅ Create Ticket (Vendor) - Sudah ada, perlu enhance
2. ⚠️ Approve Ticket (Admin/RC) - Perlu ditambahkan
3. ⚠️ Form Pengiriman (Vendor) - Baru, perlu dibuat
4. ⚠️ Receive at RC (RC Staff) - Baru, perlu dibuat

### Phase 2: Integration
5. Link cassette delivery ke ticket
6. Update cassette status flow
7. Notification system

### Phase 3: Enhancement
8. Tracking delivery status
9. ETA notifications
10. Delivery history

---

## 💡 Simplified Flow Summary

```
1. Vendor: Create Ticket (Cassette rusak)
   ↓
2. Admin/RC: Approve Ticket
   ↓
3. Vendor: Input Form Pengiriman (Cassette ID, Tanggal, Kurir)
   ↓
4. RC Staff: Terima Kaset (Scan & Verify)
   ↓
5. RC Staff: Repair & QC
   ↓
6. RC Staff: Update ke Spare Pool
```

**Key Point:** Vendor TIDAK langsung swap, tapi lewat ticket approval process dulu!

---

## 🚀 Next Steps

**Mau saya implementasikan:**
1. ✅ Approve Ticket functionality?
2. ✅ Form Pengiriman Kaset page?
3. ✅ Receive at RC functionality?
4. ✅ Update schema untuk support flow baru?

**Atau mau diskusi dulu flow-nya lebih detail?** 😊

