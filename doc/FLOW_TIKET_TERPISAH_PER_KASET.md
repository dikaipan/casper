# 📋 Flow Tiket Terpisah untuk Setiap Kaset

## 🎯 Konsep Dasar

Sistem ini menggunakan **2 level tiket**:
1. **Service Order (SO)** - 1 tiket untuk beberapa kaset (maksimal 5 kaset)
2. **Repair Ticket** - 1 tiket terpisah untuk **setiap kaset**

---

## 🔄 Flow Lengkap

### **Tahap 1: Pengelola Membuat Service Order (SO)**

**Pengelola** membuat 1 Service Order yang berisi:
- 1-5 kaset dengan masalah
- Setiap kaset memiliki detail sendiri (title, description, priority, error code, dll)
- Metode pengiriman (COURIER atau SELF_DELIVERY)

**Contoh:**
```
SO-2311251
├── Kaset 1: SN-001 (Masalah: Jammed)
├── Kaset 2: SN-002 (Masalah: Sensor Error)
└── Kaset 3: SN-003 (Masalah: Belt Broken)
```

**Status SO:** `OPEN` → `IN_DELIVERY`

---

### **Tahap 2: Pengiriman ke RC**

- SO dikirim ke Repair Center (RC)
- Semua kaset dalam 1 pengiriman
- Status SO: `IN_DELIVERY`

**Data yang tercatat:**
- Kurir
- Nomor resi
- Tanggal kirim
- Alamat pengirim

---

### **Tahap 3: RC Menerima SO**

**RC Staff** menerima SO di sistem:
- Konfirmasi semua kaset sudah diterima
- Status SO: `RECEIVED`
- Status kaset: `IN_TRANSIT_TO_RC` → `BAD`

**Catatan:** Semua kaset masih dalam 1 SO

---

### **Tahap 4: Mulai Repair - ⚠️ TIKET TERPISAH DIBUAT**

Ketika **RC Staff** klik **"Mulai Repair"**, sistem akan:

1. **Membuat Repair Ticket TERPISAH untuk setiap kaset**
   ```
   SO-2311251 (Status: IN_PROGRESS)
   ├── Repair Ticket #1 → Kaset SN-001
   ├── Repair Ticket #2 → Kaset SN-002
   └── Repair Ticket #3 → Kaset SN-003
   ```

2. **Setiap Repair Ticket memiliki:**
   - ID unik sendiri
   - Status sendiri (RECEIVED → DIAGNOSING → ON_PROGRESS → COMPLETED)
   - Dapat di-assign ke teknisi berbeda
   - Progress repair sendiri
   - QC sendiri

3. **Status kaset:** `BAD` → `IN_REPAIR`

4. **Status SO:** `RECEIVED` → `IN_PROGRESS`

---

### **Tahap 5: Proses Repair (Paralel)**

**Setiap Repair Ticket dikerjakan secara independen:**

#### Repair Ticket #1 (SN-001)
- Teknisi A mengambil tiket
- Status: `RECEIVED` → `DIAGNOSING` → `ON_PROGRESS`
- Perbaikan selesai
- QC: ✅ PASS
- Status: `COMPLETED`

#### Repair Ticket #2 (SN-002)
- Teknisi B mengambil tiket
- Status: `RECEIVED` → `DIAGNOSING` → `ON_PROGRESS`
- Masih dalam proses...

#### Repair Ticket #3 (SN-003)
- Teknisi C mengambil tiket
- Status: `RECEIVED` → `DIAGNOSING`
- Masih dalam proses...

**Catatan Penting:**
- ✅ Setiap repair ticket bisa dikerjakan oleh teknisi berbeda
- ✅ Setiap repair ticket punya timeline sendiri
- ✅ Progress tidak harus sama antar kaset
- ✅ Bisa ada yang selesai duluan, ada yang masih proses

---

### **Tahap 6: Validasi Sebelum Return**

**Sistem memvalidasi sebelum mengizinkan return:**

✅ **Semua Repair Ticket harus `COMPLETED`**
- Jika ada 1 repair ticket yang belum `COMPLETED` → **TIDAK BISA RETURN**
- Error message akan menampilkan daftar kaset yang belum selesai

**Contoh Error:**
```
❌ Tidak bisa mengirim kembali! 
Masih ada 1 kaset yang belum selesai diperbaiki: SN-002

Kaset yang belum selesai:
- SN-002 - ON_PROGRESS
```

---

### **Tahap 7: Return ke Pengelola**

Setelah **SEMUA** repair ticket `COMPLETED`:

1. **RC Staff** bisa klik **"Kirim ke Pengelola"**
2. Input data pengiriman:
   - Kurir
   - Nomor resi
   - Tanggal kirim
   - Estimasi tiba
3. Status SO: `IN_PROGRESS` → `RESOLVED` → `RETURN_SHIPPED`
4. Status kaset: `IN_REPAIR` → `SPARE_POOL` (jika QC PASS)

---

### **Tahap 8: Pengelola Menerima**

**Pengelola** konfirmasi penerimaan:
- Status SO: `RETURN_SHIPPED` → `CLOSED`
- Semua kaset kembali ke pengelola
- SO ditutup

---

## 📊 Diagram Flow

```
┌─────────────────────────────────────────────────────────┐
│  PENGELOLA: Buat SO dengan 3 Kaset                      │
│  SO-001: [Kaset-A, Kaset-B, Kaset-C]                    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Status: IN_DELIVERY                                    │
│  Kirim ke RC (1 paket)                                  │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RC: Terima SO                                          │
│  Status: RECEIVED                                       │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RC: Klik "Mulai Repair"                                │
│  ⚠️ SISTEM MEMBUAT 3 REPAIR TICKET TERPISAH            │
│                                                          │
│  Repair-001 → Kaset-A                                   │
│  Repair-002 → Kaset-B                                   │
│  Repair-003 → Kaset-C                                   │
│                                                          │
│  Status SO: IN_PROGRESS                                 │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  PROSES REPAIR (PARALEL)                                │
│                                                          │
│  Repair-001: RECEIVED → DIAGNOSING → ON_PROGRESS       │
│              → COMPLETED ✅                             │
│                                                          │
│  Repair-002: RECEIVED → DIAGNOSING → ON_PROGRESS       │
│              → COMPLETED ✅                             │
│                                                          │
│  Repair-003: RECEIVED → DIAGNOSING → ON_PROGRESS       │
│              → COMPLETED ✅                             │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  VALIDASI: Semua Repair COMPLETED?                      │
│  ✅ Ya → Bisa Return                                    │
│  ❌ Tidak → Error, tidak bisa return                    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RC: Kirim ke Pengelola                                 │
│  Status: RETURN_SHIPPED                                 │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  PENGELOLA: Terima Kembali                              │
│  Status: CLOSED                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Poin Penting

### ✅ Keuntungan Sistem Ini:

1. **Fleksibilitas**
   - Setiap kaset bisa dikerjakan oleh teknisi berbeda
   - Progress tidak harus seragam
   - Bisa ada yang selesai duluan

2. **Tracking Detail**
   - Setiap kaset punya history repair sendiri
   - Bisa track per kaset dengan detail
   - QC per kaset lebih akurat

3. **Resource Management**
   - Bisa assign teknisi sesuai keahlian
   - Bisa prioritas kaset tertentu
   - Load balancing lebih baik

### ⚠️ Hal yang Perlu Diperhatikan:

1. **Validasi Return**
   - Sistem **WAJIB** memastikan semua repair ticket `COMPLETED`
   - Tidak bisa return jika ada yang belum selesai

2. **Status SO**
   - SO status `IN_PROGRESS` selama ada repair ticket yang belum `COMPLETED`
   - SO baru `RESOLVED` setelah semua repair `COMPLETED`

3. **Data Consistency**
   - Setiap repair ticket terhubung ke SO
   - Setiap repair ticket terhubung ke 1 kaset
   - Tidak bisa ada repair ticket tanpa kaset

---

## 📝 Contoh Skenario

### Skenario 1: Normal Flow
```
SO-001 dengan 3 kaset
├── Repair-001 (SN-A) → Selesai dalam 2 hari ✅
├── Repair-002 (SN-B) → Selesai dalam 3 hari ✅
└── Repair-003 (SN-C) → Selesai dalam 1 hari ✅

Total: 3 hari (karena SN-C paling lama)
Setelah semua selesai → Bisa return
```

### Skenario 2: Ada yang Delay
```
SO-001 dengan 3 kaset
├── Repair-001 (SN-A) → Selesai dalam 1 hari ✅
├── Repair-002 (SN-B) → Masih ON_PROGRESS ⏳
└── Repair-003 (SN-C) → Selesai dalam 2 hari ✅

Status: Tidak bisa return karena SN-B belum selesai
Error: "Masih ada 1 kaset yang belum selesai: SN-B"
```

### Skenario 3: Multi Teknisi
```
SO-001 dengan 5 kaset
├── Repair-001 (SN-A) → Teknisi A → Selesai ✅
├── Repair-002 (SN-B) → Teknisi B → Selesai ✅
├── Repair-003 (SN-C) → Teknisi A → Selesai ✅
├── Repair-004 (SN-D) → Teknisi C → Selesai ✅
└── Repair-005 (SN-E) → Teknisi B → Selesai ✅

Semua dikerjakan paralel oleh 3 teknisi
Efisiensi maksimal!
```

---

## 🎯 Kesimpulan

**Sistem ini dirancang untuk:**
- ✅ Efisiensi: Multiple teknisi bisa kerja paralel
- ✅ Tracking: Detail per kaset lebih akurat
- ✅ Fleksibilitas: Progress tidak harus seragam
- ✅ Quality: QC per kaset lebih ketat
- ✅ Safety: Validasi mencegah return premature

**Flow:**
1. 1 SO → Multiple Kaset
2. Mulai Repair → Multiple Repair Ticket (1 per kaset)
3. Repair Paralel → Setiap kaset independen
4. Validasi → Semua harus COMPLETED
5. Return → Semua kaset dikirim kembali

