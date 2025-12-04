# 🔄 Flow Cassette yang Benar - Bahasa Indonesia

## 📖 Penjelasan Flow Baru

### ❌ Flow Lama (Tidak Dipakai):
```
Vendor langsung swap cassette → Selesai
```

### ✅ Flow Baru (Yang Benar):
```
Vendor buat ticket → Admin approve → Vendor kirim kaset → RC terima → RC repair → Kaset kembali spare pool
```

---

## 🎯 Langkah-Langkah Flow (Sederhana)

### **LANGKAH 1: Vendor Buat Ticket** 📝

**Yang Dilakukan Vendor:**
1. Vendor melihat cassette rusak di mesin
2. Vendor buka sistem, klik "Create Ticket"
3. Isi form:
   - Pilih mesin yang terkena
   - Judul: "Cassette di Slot 1 rusak"
   - Deskripsi: "Cassette jammed, tidak bisa accept bills"
   - Priority: HIGH atau CRITICAL
4. Submit ticket

**Status:** Ticket = `OPEN` (Menunggu approval)

---

### **LANGKAH 2: Admin/RC Staff Approve Ticket** ✅

**Yang Dilakukan Admin/RC:**
1. Admin atau RC Staff buka ticket dari vendor
2. Review ticket (cek apakah valid)
3. Jika OK, klik "Approve Ticket"
4. Ticket di-approve

**Status:** Ticket = `APPROVED` → `PENDING_VENDOR` (Menunggu vendor kirim kaset)

---

### **LANGKAH 3: Vendor Input Form Pengiriman** 📦

**Yang Dilakukan Vendor:**
1. Setelah ticket approved, vendor buka "Form Pengiriman Kaset"
2. Isi form:
   - Pilih ticket yang sudah approved
   - Pilih cassette yang dikirim (serial number)
   - Tanggal pengiriman
   - Jasa kurir (JNE, TIKI, dll)
   - Nomor resi (jika ada)
   - Estimasi tiba di RC
   - Catatan tambahan
3. Submit form

**Status:**
- Cassette = `INSTALLED/BROKEN` → `IN_TRANSIT_TO_RC` (Sedang dikirim)
- Ticket = `PENDING_VENDOR` → `PENDING_RC` (Menunggu tiba di RC)

---

### **LANGKAH 4: RC Staff Terima Kaset** 📬

**Yang Dilakukan RC Staff:**
1. Kaset fisik tiba di Repair Center
2. RC Staff buka sistem, klik "Receive Cassette"
3. Scan atau input serial number kaset
4. Verifikasi dengan form pengiriman dari vendor
5. Confirm: "Kaset diterima di RC"

**Status:**
- Cassette = `IN_TRANSIT_TO_RC` → `IN_REPAIR` (Sedang diperbaiki)
- Ticket = `PENDING_RC` → `IN_PROGRESS` (Sedang diproses)
- System create Repair Ticket otomatis

---

### **LANGKAH 5: RC Staff Repair & QC** 🔧

**Yang Dilakukan RC Staff:**
1. RC Staff perbaiki kaset
2. Input di sistem:
   - Action yang dilakukan (ganti sensor, dll)
   - Parts yang diganti
   - Perform QC (Quality Control)
3. Update repair ticket

**Status Repair:** `DIAGNOSING` → `COMPLETED`

---

### **LANGKAH 6: RC Staff Update ke Spare Pool** ✅

**Yang Dilakukan RC Staff:**
1. Setelah repair selesai dan QC passed
2. RC Staff update status kaset ke "Spare Pool"
3. Kaset siap digunakan lagi

**Status:**
- Cassette = `IN_REPAIR` → `SPARE_POOL` (Kembali ke spare pool)
- Repair = `COMPLETED`
- Ticket = `IN_PROGRESS` → `RESOLVED` (Selesai)

**Hasil:** Kaset sudah diperbaiki dan kembali ke spare pool bank owner! ✅

---

## 📊 Flow Diagram Sederhana

```
VENDOR                          ADMIN/RC                    RC STAFF
───────────────────────────────────────────────────────────────────────
1. Buat Ticket (OPEN)
   ↓
2. ────────────→ Approve Ticket (APPROVED)
                              ↓
3. Input Form Pengiriman      │
   (Cassette dikirim)         │
   Status: IN_TRANSIT_TO_RC   │
   ↓                          ↓
4. ────────────→ ────────────→ Terima Kaset
                              Status: IN_REPAIR
                              ↓
5. ────────────→ ────────────→ Repair & QC
                              ↓
6. ────────────→ ────────────→ Update ke Spare Pool
                              Status: SPARE_POOL
                              ✅ Selesai!
```

---

## 🔑 Poin Penting

### ✅ **Yang Benar:**
1. **Vendor buat ticket dulu** (tidak langsung swap)
2. **Admin/RC approve** sebelum vendor kirim kaset
3. **Form pengiriman** untuk tracking kaset
4. **RC terima & repair** process lengkap
5. **Kaset kembali spare pool** setelah repair

### ❌ **Yang Salah (Flow Lama):**
1. Vendor langsung swap tanpa approval
2. Tidak ada ticket tracking
3. Tidak ada form pengiriman
4. Tidak ada proses approval

---

## 💡 Contoh Skenario Real

### **Situasi:**
Mesin BNI-JKT-M001, Slot 1 cassette rusak (RB-BNI-0001)

### **Flow:**
1. **Vendor** (tag_tech1) lihat cassette rusak
2. **Vendor** buat ticket: "Cassette RB-BNI-0001 rusak, slot 1"
3. **Admin/RC** approve ticket
4. **Vendor** input form pengiriman:
   - Cassette: RB-BNI-0001
   - Kirim: 20 Jan 2025
   - Kurir: JNE
   - Resi: JNE123456789
   - Estimasi tiba: 22 Jan 2025
5. **RC Staff** terima kaset di RC (22 Jan 2025)
6. **RC Staff** repair kaset
7. **RC Staff** QC passed
8. **RC Staff** update ke spare pool
9. **Selesai!** Kaset RB-BNI-0001 kembali ke spare pool BNI

---

## 🚀 Yang Perlu Diimplementasikan

### 1. Approve Ticket Feature ⭐⭐⭐
- Admin/RC bisa approve ticket
- Update status: OPEN → APPROVED → PENDING_VENDOR

### 2. Form Pengiriman Kaset ⭐⭐⭐
- Vendor bisa input form pengiriman setelah ticket approved
- Input: Cassette ID, Tanggal, Kurir, Resi, dll
- Update cassette status ke IN_TRANSIT_TO_RC

### 3. Receive at RC Feature ⭐⭐⭐
- RC Staff bisa confirm terima kaset
- Scan serial number
- Verify dengan delivery form
- Update status ke IN_REPAIR

### 4. Schema Update ⭐⭐
- Tambah field approval di ProblemTicket
- Tambah table CassetteDelivery
- Update status enum

---

**Mau saya mulai implementasi flow baru ini?** 😊

