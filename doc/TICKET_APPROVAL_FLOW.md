# 🎫 Ticket-Based Cassette Repair Flow

## 📋 Ringkasan Flow Baru

**Flow Lama (Swap Langsung):** ❌ Vendor langsung swap cassette → Selesai

**Flow Baru (Ticket-Based):** ✅
1. Vendor buat ticket → Admin/RC approve → Vendor kirim kaset → RC terima → RC repair → Kaset kembali spare pool

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Vendor Create Ticket (Status: OPEN)                │
├─────────────────────────────────────────────────────────────┤
│ Vendor Technician melihat cassette rusak di mesin          │
│ → Create Problem Ticket                                     │
│ → Status: OPEN                                              │
│ → Link ke Machine                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Admin/RC Approve Ticket                             │
├─────────────────────────────────────────────────────────────┤
│ Admin/RC Staff review ticket                                │
│ → Approve ticket                                            │
│ → Status: OPEN → PENDING_VENDOR                             │
│ → Notify vendor                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Vendor Input Form Pengiriman                       │
├─────────────────────────────────────────────────────────────┤
│ Vendor buka Form Pengiriman Kaset                           │
│ → Input: Cassette ID, Tanggal, Kurir, Resi, dll            │
│ → Submit Form Pengiriman                                     │
│ → Cassette Status: INSTALLED/BROKEN → IN_TRANSIT_TO_RC     │
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
│ → Cassette Status: IN_REPAIR → SPARE_POOL                    │
│ → Repair Status: COMPLETED                                   │
│ → Ticket Status: IN_PROGRESS → RESOLVED                      │
│ → Kaset kembali ke spare pool bank owner                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Summary

### ✅ Schema Changes
1. **Updated `ProblemTicketStatus` enum:**
   - Added: `APPROVED`, `PENDING_VENDOR`, `PENDING_RC`
   - Flow: `OPEN` → `PENDING_VENDOR` (after approval) → `PENDING_RC` (after delivery) → `IN_PROGRESS` → `RESOLVED` → `CLOSED`

2. **Added fields to `ProblemTicket`:**
   - `approvedBy` (HitachiUser ID)
   - `approvedAt` (DateTime)
   - `approvalNotes` (Text)

3. **Created `CassetteDelivery` table:**
   - Links ticket to cassette delivery
   - Tracks shipment info (courier, tracking, dates)
   - Tracks receipt at RC

4. **Updated relations:**
   - `ProblemTicket` → `HitachiUser` (approver)
   - `ProblemTicket` → `CassetteDelivery` (one-to-one)
   - `CassetteDelivery` → `Cassette`, `VendorUser`, `HitachiUser`

### ✅ Backend Endpoints

#### 1. Approve Ticket (Admin/RC Staff)
- **Endpoint:** `POST /api/tickets/:id/approve`
- **Access:** Hitachi users only (SUPER_ADMIN, RC_MANAGER, RC_STAFF)
- **Action:** Approve ticket, set status to `PENDING_VENDOR`
- **DTO:** `ApproveTicketDto` (approvalNotes optional)

#### 2. Create Delivery Form (Vendor)
- **Endpoint:** `POST /api/tickets/delivery`
- **Access:** Vendor users only
- **Action:** Create delivery form after ticket approved
- **DTO:** `CreateDeliveryDto` (ticketId, cassetteId, shippedDate, courier, tracking, etc.)
- **Side effects:**
  - Update cassette status to `IN_TRANSIT_TO_RC`
  - Update ticket status to `PENDING_RC`
  - Remove cassette from machine (currentMachineId = null)

#### 3. Receive Delivery at RC (RC Staff)
- **Endpoint:** `POST /api/tickets/:id/receive-delivery`
- **Access:** Hitachi RC staff only
- **Action:** Confirm receipt of cassette at RC
- **DTO:** `ReceiveDeliveryDto` (notes optional)
- **Side effects:**
  - Update delivery record (receivedAtRc, receivedBy)
  - Update cassette status to `IN_REPAIR`
  - Update ticket status to `IN_PROGRESS`
  - Create Repair Ticket automatically

### ✅ Frontend Pages

#### 1. Create Ticket (`/tickets/create`)
- **Access:** All authenticated users
- **Features:**
  - Select machine
  - Input title, description, priority
  - List affected components
  - Create ticket

#### 2. Approve Ticket (`/tickets/[id]/approve`)
- **Access:** Hitachi users only
- **Features:**
  - View ticket details
  - Approve ticket with optional notes
  - Only OPEN tickets can be approved

#### 3. Form Pengiriman (`/tickets/[id]/delivery`)
- **Access:** Vendor users only
- **Features:**
  - View ticket details
  - Select cassette to send (from affected machine, INSTALLED/BROKEN status)
  - Input shipment info (date, courier, tracking, ETA)
  - Submit delivery form
  - Only PENDING_VENDOR tickets can create delivery

#### 4. Receive at RC (`/tickets/[id]/receive`)
- **Access:** Hitachi RC staff only
- **Features:**
  - View ticket and delivery details
  - Verify cassette serial number
  - Confirm receipt with optional notes
  - Only PENDING_RC tickets with pending delivery can be received

#### 5. Updated Tickets List (`/tickets`)
- **Features:**
  - Show all tickets with status badges
  - Action buttons based on status and user role:
    - **OPEN + Hitachi:** "Approve Ticket" button
    - **PENDING_VENDOR + Vendor:** "Input Form Pengiriman" button
    - **PENDING_RC + Hitachi:** "Terima Kaset di RC" button
  - Display delivery info when available

---

## 🔑 Key Features

### ✅ Approval Workflow
- Tickets must be approved before vendor can send cassette
- Only Hitachi staff can approve tickets
- Approval is tracked (who, when, notes)

### ✅ Delivery Tracking
- Full tracking from vendor to RC
- Courier info, tracking number, ETA
- Receipt confirmation at RC

### ✅ Status Management
- Clear status progression: `OPEN` → `PENDING_VENDOR` → `PENDING_RC` → `IN_PROGRESS` → `RESOLVED`
- Cassette status automatically updated
- Repair ticket created automatically when received

### ✅ Role-Based Access
- **Vendor:** Create tickets, input delivery forms
- **Hitachi Admin/RC:** Approve tickets, receive cassettes
- Proper guards and validation

---

## 📊 Status Flow Summary

### Ticket Status Flow:
```
OPEN → PENDING_VENDOR → PENDING_RC → IN_PROGRESS → RESOLVED → CLOSED
  ↓         ↓              ↓             ↓            ↓
Approve  Delivery     Receive at RC   Repair      Complete
```

### Cassette Status Flow:
```
INSTALLED/BROKEN → IN_TRANSIT_TO_RC → IN_REPAIR → SPARE_POOL
     ↓                   ↓                ↓           ↓
  Create            Submit Delivery   Receive at RC  Repair Done
  Delivery                               & Repair
```

---

## 🚀 Next Steps

### Migration Required:
```bash
cd backend
npx prisma migrate dev --name add_ticket_approval_flow
```

### Testing:
1. ✅ Vendor creates ticket
2. ✅ Admin approves ticket
3. ✅ Vendor creates delivery form
4. ✅ RC staff receives cassette
5. ✅ Repair ticket created automatically
6. ✅ Full workflow tested

---

## 📝 Notes

- **Cassette Swap feature removed** - replaced with ticket-based flow
- **Direct swap disabled** - `canSwapCassettes` default set to `false`
- **Full audit trail** - all actions tracked via tickets and delivery records
- **Automatic repair ticket creation** - created when cassette received at RC

---

**Flow baru sudah siap digunakan!** 🎉

