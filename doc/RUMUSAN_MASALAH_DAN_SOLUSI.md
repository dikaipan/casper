# 📋 Rumusan Masalah dan Solusi - HCM System

## 🎯 Rumusan Masalah

### 1. Masalah RC Staff (Hitachi) - Kaset Menumpuk di RC

**Masalah:**
- RC Staff sering lupa mengirim kaset kembali ke pengelola setelah repair selesai
- Banyak kaset menumpuk di RC karena tidak ada reminder/notifikasi
- Tidak ada dashboard/list yang jelas menampilkan kaset yang harus segera dikirim
- Sulit tracking kaset mana yang sudah lama di RC dan perlu prioritas pengiriman
- Dampak: Delay pengiriman, kaset tidak kembali ke pengelola tepat waktu

**Root Cause:**
- Volume repair tinggi, banyak kaset yang perlu di-handle
- Tidak ada sistem reminder/notifikasi otomatis
- Tidak ada dashboard khusus untuk tracking kaset yang perlu dikirim
- Tidak ada indikator visual untuk kaset yang sudah lama di RC

---

### 2. Masalah Pengelola - Lupa Konfirmasi Kaset yang Sudah Tiba

**Masalah:**
- Pengelola sering lupa mengkonfirmasi kaset yang sudah tiba dari RC
- Banyak kaset yang perlu dikonfirmasi, sulit tracking mana yang belum
- Tidak ada notifikasi/reminder untuk kaset yang sudah tiba dan perlu konfirmasi
- Tidak ada list/dashboard khusus untuk kaset yang perlu dikonfirmasi
- Dampak: Status kaset tidak update, tracking tidak akurat

**Root Cause:**
- Volume kaset tinggi, sulit manual tracking
- Tidak ada sistem reminder/notifikasi
- Tidak ada dashboard khusus untuk tracking kaset yang perlu dikonfirmasi
- Tidak ada indikator visual untuk kaset yang sudah lama menunggu konfirmasi

---

### 3. Dampak ke SLA dan Charge

**Masalah:**
- Tidak ada tracking SLA (Service Level Agreement) untuk waktu repair dan pengiriman
- Tidak ada tracking charge untuk kaset yang sudah tidak garansi
- Sulit menghitung biaya charge karena tidak ada data akurat waktu repair
- Tidak ada alert untuk kaset yang sudah melewati SLA
- Dampak: Biaya tidak akurat, SLA tidak terpenuhi, customer complaint

**Root Cause:**
- Tidak ada sistem tracking waktu repair dan pengiriman
- Tidak ada sistem perhitungan charge berdasarkan SLA
- Tidak ada alert/notification untuk kaset yang melewati SLA

---

## 💡 Solusi yang Diusulkan

### 1. Dashboard & List untuk RC Staff - Kaset yang Perlu Dikirim

#### A. Dashboard "Pending Return" untuk RC Staff

**Fitur:**
1. **List Kaset yang Perlu Dikirim**
   - Kaset dengan status `IN_REPAIR` setelah repair completed & QC passed
   - Sort by: Tanggal repair completed (lama → baru)
   - Filter: By bank, by repair date, by days in RC
   - Highlight: Kaset yang sudah > X hari di RC (configurable)

2. **Indikator Visual**
   - Badge warna untuk urgency:
     - 🟢 Hijau: < 3 hari di RC (normal)
     - 🟡 Kuning: 3-7 hari di RC (perlu perhatian)
     - 🟠 Orange: 7-14 hari di RC (urgent)
     - 🔴 Merah: > 14 hari di RC (very urgent)
   - Progress bar untuk SLA compliance

3. **Quick Actions**
   - Button "Create Return" langsung dari list
   - Bulk action: Create return untuk multiple kaset
   - Export to CSV untuk tracking

4. **Statistics**
   - Total kaset pending return
   - Average days in RC
   - Kaset yang melewati SLA threshold
   - Chart: Trend kaset pending return

**Location:** `/repairs/pending-return` atau `/dashboard/pending-return`

---

#### B. Notifikasi/Reminder untuk RC Staff

**Fitur:**
1. **In-App Notification**
   - Badge count di menu "Pending Return"
   - Toast notification saat login jika ada kaset > X hari
   - Notification center dengan list kaset yang perlu perhatian

2. **Email Notification (Optional)**
   - Daily digest: List kaset yang perlu dikirim hari ini
   - Weekly summary: Kaset yang sudah > 7 hari di RC
   - Alert untuk kaset yang melewati SLA

3. **Dashboard Widget**
   - Widget di dashboard utama menampilkan:
     - Count kaset pending return
     - Kaset urgent (melewati threshold)
     - Link ke detail list

---

### 2. Dashboard & List untuk Pengelola - Kaset yang Perlu Dikonfirmasi

#### A. Dashboard "Pending Confirmation" untuk Pengelola

**Fitur:**
1. **List Kaset yang Perlu Dikonfirmasi**
   - Kaset dengan status `IN_TRANSIT_TO_PENGELOLA` yang sudah tiba (estimated arrival date sudah lewat)
   - Sort by: Tanggal estimated arrival (lama → baru)
   - Filter: By bank, by estimated arrival date, by days waiting
   - Highlight: Kaset yang sudah lama menunggu konfirmasi

2. **Indikator Visual**
   - Badge warna untuk urgency:
     - 🟢 Hijau: Baru tiba (< 1 hari)
     - 🟡 Kuning: 1-3 hari menunggu konfirmasi
     - 🟠 Orange: 3-7 hari menunggu konfirmasi
     - 🔴 Merah: > 7 hari menunggu konfirmasi
   - Status tracking: Estimated arrival date vs actual

3. **Quick Actions**
   - Button "Receive Return" langsung dari list
   - Bulk action: Receive multiple kaset sekaligus
   - Export to CSV untuk tracking

4. **Statistics**
   - Total kaset pending confirmation
   - Average days waiting for confirmation
   - Kaset yang sudah lama menunggu
   - Chart: Trend kaset pending confirmation

**Location:** `/tickets/pending-confirmation` atau `/dashboard/pending-confirmation`

---

#### B. Notifikasi/Reminder untuk Pengelola

**Fitur:**
1. **In-App Notification**
   - Badge count di menu "Pending Confirmation"
   - Toast notification saat login jika ada kaset yang perlu dikonfirmasi
   - Notification center dengan list kaset yang perlu perhatian

2. **Email Notification (Optional)**
   - Daily digest: List kaset yang perlu dikonfirmasi hari ini
   - Weekly summary: Kaset yang sudah lama menunggu konfirmasi
   - Alert untuk kaset yang sudah melewati threshold

3. **Dashboard Widget**
   - Widget di dashboard utama menampilkan:
     - Count kaset pending confirmation
     - Kaset urgent (sudah lama menunggu)
     - Link ke detail list

---

### 3. SLA Tracking & Charge Calculation

#### A. SLA Configuration

**Fitur:**
1. **SLA Rules Configuration**
   - Repair time SLA (default: 7 hari)
   - Return delivery SLA (default: 3 hari setelah repair completed)
   - Confirmation SLA (default: 1 hari setelah estimated arrival)
   - Configurable per bank atau per contract

2. **SLA Tracking**
   - Track waktu dari:
     - Ticket created → Repair completed
     - Repair completed → Return shipped
     - Return shipped → Confirmed received
   - Calculate SLA compliance percentage
   - Flag kaset yang melewati SLA

3. **SLA Dashboard**
   - Overall SLA compliance rate
   - SLA compliance by bank
   - SLA compliance by time period
   - Chart: Trend SLA compliance

---

#### B. Charge Calculation

**Fitur:**
1. **Charge Rules**
   - Charge untuk kaset yang sudah tidak garansi
   - Charge untuk repair yang melewati SLA
   - Charge untuk delay pengiriman
   - Configurable charge rate per type

2. **Charge Calculation**
   - Auto-calculate charge berdasarkan:
     - Warranty status
     - SLA compliance
     - Repair time
     - Parts replaced
   - Generate charge report per ticket/cassette

3. **Charge Dashboard**
   - Total charge per period
   - Charge by bank
   - Charge by type (repair, delay, etc.)
   - Export charge report

---

## 📊 Implementasi Priority

### Phase 1: High Priority (Immediate)
1. ✅ Dashboard "Pending Return" untuk RC Staff
2. ✅ Dashboard "Pending Confirmation" untuk Pengelola
3. ✅ In-app notification badge
4. ✅ Basic SLA tracking

### Phase 2: Medium Priority (Next Sprint)
1. ⏳ Email notification system
2. ⏳ SLA configuration UI
3. ⏳ Charge calculation engine
4. ⏳ Advanced filtering & sorting

### Phase 3: Low Priority (Future)
1. ⏳ Bulk actions
2. ⏳ Advanced analytics & reporting
3. ⏳ Mobile notification
4. ⏳ Integration dengan billing system

---

## 🎯 Success Metrics

1. **Reduction in Pending Returns**
   - Target: < 5% kaset pending return > 7 hari
   - Current: TBD (baseline measurement needed)

2. **Reduction in Pending Confirmations**
   - Target: < 3% kaset pending confirmation > 3 hari
   - Current: TBD (baseline measurement needed)

3. **SLA Compliance**
   - Target: > 95% SLA compliance
   - Current: TBD (baseline measurement needed)

4. **User Satisfaction**
   - Survey RC Staff: Ease of tracking pending returns
   - Survey Pengelola: Ease of tracking pending confirmations

---

## 📝 Technical Requirements

### Backend
1. **New Endpoints:**
   - `GET /repairs/pending-return` - List kaset yang perlu dikirim
   - `GET /tickets/pending-confirmation` - List kaset yang perlu dikonfirmasi
   - `GET /sla/tracking` - SLA tracking data
   - `GET /charges/calculate` - Charge calculation

2. **Database:**
   - Add SLA configuration table
   - Add charge rules table
   - Add SLA tracking logs
   - Add charge calculation logs

### Frontend
1. **New Pages:**
   - `/repairs/pending-return` - Dashboard pending return
   - `/tickets/pending-confirmation` - Dashboard pending confirmation
   - `/sla/dashboard` - SLA dashboard
   - `/charges/dashboard` - Charge dashboard

2. **Components:**
   - PendingReturnList component
   - PendingConfirmationList component
   - SLATrackingWidget component
   - ChargeCalculationWidget component
   - NotificationBadge component

---

## 🔄 Next Steps

1. **Review & Approval**
   - Review rumusan masalah dengan stakeholders
   - Approve solusi yang diusulkan
   - Prioritize features untuk development

2. **Design & Planning**
   - Design UI/UX untuk dashboard
   - Plan database schema changes
   - Plan API endpoints

3. **Development**
   - Implement Phase 1 features
   - Testing & QA
   - Deployment

4. **Monitoring & Improvement**
   - Monitor usage & metrics
   - Collect user feedback
   - Iterate & improve

---

## 📚 Related Documents

- [FLOW_APLIKASI_DAN_FLOWCHART.md](./FLOW_APLIKASI_DAN_FLOWCHART.md) - Flow aplikasi lengkap
- [STRUKTUR_FOLDER_DAN_FILE.md](./STRUKTUR_FOLDER_DAN_FILE.md) - Struktur aplikasi
- [ROADMAP.md](./ROADMAP.md) - Roadmap development

---

---

## ✅ Implementasi yang Sudah Dilakukan

### Dashboard Access - Role-Based Content

**Status:** ✅ **SUDAH DITERAPKAN**

**Perubahan:**
1. ✅ Dashboard sekarang dapat diakses oleh semua authenticated user (tidak hanya SUPER_ADMIN)
2. ✅ Konten dashboard sudah role-based:
   - **SUPER_ADMIN/HITACHI**: Full dashboard dengan semua statistik (machines, cassettes, banks, pengelola, analytics)
   - **PENGELOLA**: Dashboard terbatas dengan statistik yang relevan (cassettes, tickets)
3. ✅ Bagian admin-only sudah disembunyikan:
   - Tab "Analitik" hanya untuk HITACHI
   - Statistik Banks & Pengelola hanya untuk HITACHI
   - Top Banks hanya untuk HITACHI
   - Bulk Import button hanya untuk SUPER_ADMIN
   - Advanced Analytics hanya untuk HITACHI

**File yang diubah:**
- `frontend/src/app/dashboard/page.tsx` - Removed SUPER_ADMIN restriction, added role-based content filtering

**Next Steps:**
- Implementasi dashboard "Pending Return" untuk RC Staff
- Implementasi dashboard "Pending Confirmation" untuk Pengelola
- Implementasi notification badge system

---

**Last Updated:** 2024-01-XX  
**Status:** Draft - Pending Review

