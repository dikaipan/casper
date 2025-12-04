# 📋 Flow Service Order (SO) - Simplified Auto-Delivery

## 🔄 **Flow Lengkap (Vendor langsung input delivery saat buat SO):**

```
┌─────────────────────────────────────────────────────────────┐
│  1. IN_DELIVERY (Vendor buat SO + input delivery info)     │
│     Action: Vendor → Create SO dengan delivery info         │
│     Menu: /tickets/create                                    │
│     Form: Title, Description, Cassette, Machine + Delivery Info│
│     Status: Langsung IN_DELIVERY (tidak lewat OPEN/APPROVED)│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. RECEIVED (Barang diterima di RC)                        │
│     Action: Hitachi RC → Terima barang di RC                │
│     Menu: /tickets/[id] → Button "Terima Barang"           │
│     Cassette Status: IN_TRANSIT_TO_RC                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. IN_PROGRESS (Mulai proses repair)                       │
│     Action: Hitachi → Mulai repair                          │
│     Menu: /tickets/[id] → Button "Mulai Repair"            │
│     Auto create repair ticket & update status               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. RESOLVED (Repair selesai, QC passed)                    │
│     Action: Auto update dari repair ticket                  │
│     ✅ SUDAH ADA                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. RETURN_SHIPPED (Hitachi kirim balik ke vendor)         │
│     Action: Hitachi → Kirim kembali + tracking              │
│     Menu: /tickets/[id] → Button "Kirim Kembali"           │
│     Form: Courier, Tracking Number, Estimated Arrival       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. CLOSED (Vendor terima balik dan konfirmasi)            │
│     Action: Vendor → Terima kembali + konfirmasi            │
│     Menu: /tickets/[id] → Button "Terima Barang Kembali"   │
│     ✅ SUDAH ADA                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Status Enum yang Digunakan:**

```typescript
enum ProblemTicketStatus {
  IN_DELIVERY    // Vendor kirim kaset ke RC
  RECEIVED       // RC sudah terima barang
  IN_PROGRESS    // Repair sedang dilakukan
  RESOLVED       // Repair selesai
  RETURN_SHIPPED // Kaset dikirim balik ke vendor
  CLOSED         // Vendor sudah terima kembali
  
  // Status yang tidak terpakai (untuk backward compatibility):
  OPEN           // Not used anymore
  APPROVED       // Not used anymore
}
```

---

## ✅ **Yang Perlu Diupdate:**

### 1. **Backend `create` (Ticket + Delivery Sekaligus)**
**File:** `backend/src/tickets/tickets.service.ts`
**DTO:** `backend/src/tickets/dto/create-ticket.dto.ts`

**Update:**
- Tambah delivery fields ke `CreateTicketDto`:
  - `courierService: string`
  - `trackingNumber: string`
  - `shippedDate: Date`
  - `estimatedArrival?: Date`
  - `deliveryNotes?: string`
- Saat create ticket, langsung create delivery juga
- Set status langsung ke `IN_DELIVERY` (bukan `OPEN`)

**Logic:**
```typescript
async create(createDto: CreateTicketDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Create ticket dengan status IN_DELIVERY
    const ticket = await tx.problemTicket.create({
      data: {
        // ... ticket fields
        status: 'IN_DELIVERY',
      },
    });
    
    // 2. Create delivery sekaligus
    await tx.cassetteDelivery.create({
      data: {
        ticketId: ticket.id,
        cassetteId: createDto.cassetteId,
        sentBy: userId,
        courierService: createDto.courierService,
        trackingNumber: createDto.trackingNumber,
        shippedDate: new Date(createDto.shippedDate),
        estimatedArrival: createDto.estimatedArrival,
        notes: createDto.deliveryNotes,
      },
    });
    
    // 3. Update cassette status
    await tx.$executeRaw`
      UPDATE cassettes 
      SET status = 'IN_TRANSIT_TO_RC'::"CassetteStatus", updated_at = NOW()
      WHERE id = ${createDto.cassetteId}::uuid
    `;
    
    return ticket;
  });
}
```

---

### 2. **Backend `receiveDelivery` (IN_DELIVERY → RECEIVED)**
**File:** `backend/src/tickets/tickets.service.ts`

**Update:**
- Status berubah dari `IN_DELIVERY` → `RECEIVED`
- **JANGAN** auto-create repair ticket
- Cassette tetap status `IN_TRANSIT_TO_RC`

**Logic:**
```typescript
async receiveDelivery(ticketId: string, receiveDto: ReceiveDeliveryDto) {
  return this.prisma.$transaction(async (tx) => {
    // Update delivery record
    await tx.cassetteDelivery.update({
      where: { ticketId },
      data: {
        receivedAtRc: new Date(),
        receivedBy: userId,
        notes: receiveDto.notes,
      },
    });
    
    // Update ticket status to RECEIVED (belum mulai repair)
    await tx.problemTicket.update({
      where: { id: ticketId },
      data: { status: 'RECEIVED' },
    });
    
    // Cassette status tetap IN_TRANSIT_TO_RC (belum masuk repair)
    // Repair ticket akan dibuat manual saat klik "Mulai Repair"
  });
}
```

---

### 3. **Backend `createReturn` (RESOLVED → RETURN_SHIPPED)**
**File:** `backend/src/tickets/tickets.service.ts`

**Update:**
- Status berubah dari `RESOLVED` → `RETURN_SHIPPED`

**Logic:**
```typescript
async createReturn(createDto: CreateReturnDto) {
  return this.prisma.$transaction(async (tx) => {
    // Create return record
    const returnRecord = await tx.cassetteReturn.create({
      data: {
        ticketId: createDto.ticketId,
        cassetteId: cassette.id,
        sentBy: userId,
        shippedDate: new Date(createDto.shippedDate),
        courierService: createDto.courierService,
        trackingNumber: createDto.trackingNumber,
        estimatedArrival: createDto.estimatedArrival,
        notes: createDto.notes,
      },
    });
    
    // Update cassette status to IN_TRANSIT_TO_VENDOR
    await tx.$executeRaw`
      UPDATE cassettes 
      SET status = 'IN_TRANSIT_TO_VENDOR'::"CassetteStatus"
      WHERE id = ${cassette.id}::uuid
    `;
    
    // Update ticket status to RETURN_SHIPPED
    await tx.problemTicket.update({
      where: { id: createDto.ticketId },
      data: { status: 'RETURN_SHIPPED' },
    });
    
    return returnRecord;
  });
}
```

---

### 4. **Backend `receiveReturn` (RETURN_SHIPPED → CLOSED)**
**File:** `backend/src/tickets/tickets.service.ts`

**Update:**
- Hanya bisa dari status `RETURN_SHIPPED` → `CLOSED`
- Validasi status sebelum proses

**Logic:**
```typescript
async receiveReturn(ticketId: string, receiveDto: ReceiveReturnDto) {
  const returnRecord = await this.prisma.cassetteReturn.findUnique({
    where: { ticketId },
    include: { ticket: true },
  });
  
  // Validasi: hanya bisa receive jika status = RETURN_SHIPPED
  if (returnRecord.ticket.status !== 'RETURN_SHIPPED') {
    throw new BadRequestException(
      `Cannot receive return for ticket with status ${returnRecord.ticket.status}. ` +
      `Ticket must be in RETURN_SHIPPED status first.`
    );
  }
  
  return this.prisma.$transaction(async (tx) => {
    // Update return record
    await tx.cassetteReturn.update({
      where: { id: returnRecord.id },
      data: {
        receivedAtVendor: new Date(),
        receivedBy: userId,
        notes: receiveDto.notes,
      },
    });
    
    // Update cassette status to OK
    await tx.$executeRaw`
      UPDATE cassettes 
      SET status = 'OK'::"CassetteStatus"
      WHERE id = ${returnRecord.cassetteId}::uuid
    `;
    
    // Update ticket status to CLOSED
    await tx.problemTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  });
}
```

---

### 5. **Frontend Create Ticket Form**
**File:** `frontend/src/app/tickets/page.tsx` (dialog/modal) atau create page

**Update Form Fields:**
```tsx
// Existing fields
- Title
- Description
- Priority
- Cassette Selection
- Machine Selection

// NEW: Delivery Info Section
- Courier Service (text input)
- Tracking Number (text input)
- Shipped Date (date picker, default: today)
- Estimated Arrival (date picker, optional)
- Delivery Notes (textarea, optional)
```

**Submit Logic:**
```typescript
const handleSubmit = async (data) => {
  await api.post('/tickets', {
    // Ticket info
    title: data.title,
    description: data.description,
    priority: data.priority,
    cassetteId: data.cassetteId,
    machineId: data.machineId,
    
    // NEW: Delivery info
    courierService: data.courierService,
    trackingNumber: data.trackingNumber,
    shippedDate: data.shippedDate,
    estimatedArrival: data.estimatedArrival,
    deliveryNotes: data.deliveryNotes,
  });
};
```

---

### 6. **Frontend Status Labels**
**Files:**
- `frontend/src/app/tickets/page.tsx`
- `frontend/src/app/tickets/[id]/page.tsx`
- `frontend/src/app/notifications/page.tsx`
- `frontend/src/store/notificationStore.ts`

**Update Status Map:**
```typescript
const statusConfig = {
  IN_DELIVERY: {
    label: 'Dikirim ke RC',
    color: 'cyan',
    icon: <Truck className="w-4 h-4" />,
  },
  RECEIVED: {
    label: 'Diterima di RC',
    color: 'blue',
    icon: <Inbox className="w-4 h-4" />,
  },
  IN_PROGRESS: {
    label: 'Sedang Diperbaiki',
    color: 'yellow',
    icon: <Wrench className="w-4 h-4" />,
  },
  RESOLVED: {
    label: 'Selesai Diperbaiki',
    color: 'green',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  RETURN_SHIPPED: {
    label: 'Dikirim ke Vendor',
    color: 'purple',
    icon: <TruckIcon className="w-4 h-4" />,
  },
  CLOSED: {
    label: 'Selesai',
    color: 'gray',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};
```

---

### 7. **Frontend SO Detail Page - Action Buttons**
**File:** `frontend/src/app/tickets/[id]/page.tsx`

**Update Action Buttons Logic:**
```tsx
// Hitachi RC Staff
{isHitachi && status === 'IN_DELIVERY' && (
  <Button onClick={handleReceiveDelivery}>
    <Inbox className="w-4 h-4 mr-2" />
    Terima Barang
  </Button>
)}

{isHitachi && status === 'RECEIVED' && (
  <Button onClick={handleStartRepair}>
    <Wrench className="w-4 h-4 mr-2" />
    Mulai Repair
  </Button>
)}

{isHitachi && status === 'RESOLVED' && (
  <Button onClick={handleCreateReturn}>
    <TruckIcon className="w-4 h-4 mr-2" />
    Kirim Kembali
  </Button>
)}

// Vendor
{isVendor && status === 'RETURN_SHIPPED' && (
  <Button onClick={handleReceiveReturn}>
    <CheckCircle className="w-4 h-4 mr-2" />
    Terima Barang Kembali
  </Button>
)}
```

---

## 🎯 **Prioritas Implementasi:**

### **Phase 1: Backend (Database & Logic)**
- [x] Update schema (tambah RECEIVED, RETURN_SHIPPED)
- [ ] Update `CreateTicketDto` (tambah delivery fields)
- [ ] Update `create()` method (buat ticket + delivery sekaligus)
- [ ] Update `receiveDelivery()` (IN_DELIVERY → RECEIVED)
- [ ] Update `createReturn()` (RESOLVED → RETURN_SHIPPED)
- [ ] Update `receiveReturn()` (RETURN_SHIPPED → CLOSED)

### **Phase 2: Frontend (UI/UX)**
- [ ] Update create ticket form (tambah delivery fields)
- [ ] Update status labels (IN_DELIVERY, RECEIVED, RETURN_SHIPPED)
- [ ] Update SO detail page (conditional action buttons)
- [ ] Tambah button "Mulai Repair" (RECEIVED → IN_PROGRESS)
- [ ] Update notification messages

### **Phase 3: Testing & Polish**
- [ ] Test full flow end-to-end
- [ ] Update notification sound/alerts
- [ ] Validasi form inputs
- [ ] Error handling & user feedback

---

## 📊 **Status Colors & Icons:**

| Status | Color | Icon | Label Indonesia |
|--------|-------|------|----------------|
| IN_DELIVERY | 🔵 Cyan | Truck | Dikirim ke RC |
| RECEIVED | 🟦 Blue | Inbox | Diterima di RC |
| IN_PROGRESS | 🟡 Yellow | Wrench | Sedang Diperbaiki |
| RESOLVED | 🟢 Green | CheckCircle | Selesai Diperbaiki |
| RETURN_SHIPPED | 🟪 Purple | TruckIcon | Dikirim ke Vendor |
| CLOSED | ⚫ Gray | CheckCircle2 | Selesai |

---

## 📝 **Database Sync Command:**

```bash
cd backend
npx prisma db push
```

---

**Flow ini sudah disederhanakan: Vendor langsung input delivery saat buat SO! 🚀**
