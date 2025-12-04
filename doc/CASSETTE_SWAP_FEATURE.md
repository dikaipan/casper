# 🔄 Cassette Swap Feature - Implementation Guide

## ✅ Fitur yang Sudah Diimplementasikan

### 1. Cassette Swap Page (`/cassettes/swap`)
**Full functional swap form dengan validasi lengkap**

#### Fitur Utama:
- ✅ **Bank Selection** - Pilih bank untuk melihat spare cassettes
- ✅ **Broken Cassette Selection** - Pilih cassette yang rusak (INSTALLED atau BROKEN status)
- ✅ **Spare Cassette Selection** - Pilih spare cassette (auto-filter by bank & type)
- ✅ **Type Validation** - Hanya spare cassette dengan type yang sama yang bisa dipilih
- ✅ **Reason Input** - Required field untuk alasan swap
- ✅ **Notes Input** - Optional notes untuk informasi tambahan
- ✅ **Error Handling** - Menampilkan error messages yang jelas
- ✅ **Success Notification** - Success message setelah swap berhasil
- ✅ **Auto Redirect** - Redirect ke cassettes page setelah success

#### Access Control:
- ✅ **Vendor Users Only** - Hanya vendor technicians yang bisa akses
- ✅ **Button di Cassettes Page** - Quick access untuk vendor users

---

## 📋 Flow Proses Swap

### Step 1: Select Bank
- User memilih bank dari dropdown
- System fetch spare cassettes untuk bank tersebut
- Spare cassettes list muncul

### Step 2: Select Broken Cassette
- User memilih cassette yang rusak (INSTALLED atau BROKEN)
- System menampilkan info: serial number, type, machine, position
- System filter spare cassettes hanya yang match type

### Step 3: Select Spare Cassette
- User memilih spare cassette dari filtered list
- Hanya cassettes dengan type yang sama dengan broken cassette yang bisa dipilih
- System validasi type match

### Step 4: Fill Reason & Notes
- User isi reason (required)
- User isi notes (optional)

### Step 5: Submit Swap
- System validasi semua fields
- System kirim request ke API `/api/cassettes/swap`
- Backend process swap:
  - Mark broken cassette sebagai IN_TRANSIT_TO_RC
  - Install spare cassette di machine
  - Log swap history untuk kedua cassettes
- Frontend tampilkan success message
- Auto redirect ke cassettes page

---

## 🔧 Technical Implementation

### Components Created:
1. **`/app/cassettes/swap/page.tsx`** - Main swap page
2. **`/components/ui/select.tsx`** - Select dropdown component
3. **`/components/ui/textarea.tsx`** - Textarea component
4. **`/components/ui/toast.tsx`** - Toast notification component

### API Integration:
```typescript
POST /api/cassettes/swap
{
  brokenCassetteId: string,
  spareCassetteId: string,
  reason: string,
  notes?: string
}
```

### Backend Validation:
- ✅ Cassette types must match
- ✅ Broken cassette must be INSTALLED or BROKEN
- ✅ Spare cassette must be SPARE_POOL
- ✅ User must have canSwapCassettes permission
- ✅ Transaction handling (all or nothing)

---

## 🎯 User Experience Features

### 1. Smart Filtering
- Spare cassettes auto-filter by bank
- Spare cassettes auto-filter by cassette type
- Hanya compatible cassettes yang bisa dipilih

### 2. Clear Information Display
- Selected cassette info ditampilkan
- Machine info ditampilkan
- Position info ditampilkan
- Type info ditampilkan

### 3. Validation & Error Messages
- Real-time validation
- Clear error messages
- Required fields indicator
- Help text untuk setiap field

### 4. Success Flow
- Success message dengan detail
- Auto redirect ke cassettes page
- Refresh data otomatis

---

## 📱 How to Use

### Untuk Vendor Technicians:

1. **Login sebagai vendor user:**
   - `tag_admin` / `vendor123`
   - `tag_tech1` / `vendor123`

2. **Navigate ke Cassettes Page:**
   - Klik menu "Cassettes" di navbar
   - Atau klik button "Cassettes" di dashboard

3. **Open Swap Form:**
   - Klik button "Swap Cassette" di top right
   - Atau navigate ke `/cassettes/swap`

4. **Fill Swap Form:**
   - Select Bank (untuk view spare cassettes)
   - Select Broken Cassette
   - Select Spare Cassette (auto-filtered)
   - Fill Reason
   - Fill Notes (optional)

5. **Submit:**
   - Klik "Swap Cassette"
   - Tunggu processing
   - Success! Redirect ke cassettes page

---

## 🔒 Access Control

### Who Can Access:
- ✅ **Vendor Users** (TECHNICIAN, ADMIN, SUPERVISOR)
- ❌ **Hitachi Users** - Tidak bisa swap (hanya RC staff yang handle repairs)

### Permission Check:
- Backend validate `canSwapCassettes` permission
- Frontend show button hanya untuk vendor users

---

## 🚀 Next Steps (Optional Enhancements)

### 1. Swap History Display ⭐⭐
- [ ] Show swap history di cassette detail page
- [ ] Timeline view untuk swap events
- [ ] Filter by date range

### 2. Notifications ⭐
- [ ] Toast notifications untuk success/error
- [ ] Real-time updates
- [ ] Email notifications (optional)

### 3. Bulk Swap ⭐
- [ ] Swap multiple cassettes at once
- [ ] Batch processing

### 4. QR Code Scanning ⭐
- [ ] Scan QR code untuk select cassette
- [ ] Faster selection process

---

## ✅ Status: COMPLETE & READY TO USE

**Cassette Swap feature sudah fully functional dan siap digunakan!**

Semua core functionality sudah diimplementasikan:
- ✅ Form dengan validasi
- ✅ Type matching validation
- ✅ API integration
- ✅ Error handling
- ✅ Success flow
- ✅ Access control
- ✅ User-friendly UI

**Coba sekarang dengan login sebagai vendor user!** 🎉

