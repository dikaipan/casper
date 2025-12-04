# 🔧 Perbaikan yang Diperlukan

## 🎯 Prioritas Tinggi

### 1. **Server-Side Filtering & Sorting** ⚠️ **PENTING**

**Masalah:**
- Filter by status masih **client-side** (filter setelah data dimuat)
- Sorting masih **client-side** (sort setelah data dimuat)
- Ini tidak efisien untuk data besar

**Lokasi:**
- `frontend/src/app/cassettes/page.tsx` - Line 338-392

**Yang perlu diperbaiki:**

#### A. Backend: Tambahkan filter status ke endpoint
```typescript
// backend/src/cassettes/cassettes.controller.ts
@ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
@ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
@ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order: asc or desc (default: desc)' })
```

#### B. Backend: Implementasi di service
```typescript
// backend/src/cassettes/cassettes.service.ts
async findAll(
  // ... existing params
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
) {
  // Add status filter
  if (status && status !== 'all') {
    finalWhereClause.status = status;
  }
  
  // Add sorting
  const orderBy: any = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder || 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }
  
  // Use orderBy in query
}
```

#### C. Frontend: Kirim filter ke backend
```typescript
// frontend/src/app/cassettes/page.tsx
const params: any = {
  page: currentPage,
  limit: itemsPerPage,
  keyword: searchTerm.trim() || undefined,
  status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
  sortBy: sortField,
  sortOrder: sortDirection,
};
```

**Dampak:**
- ✅ Query lebih efisien (filter di database)
- ✅ Mengurangi data yang ditransfer
- ✅ Lebih cepat untuk data besar

---

### 2. **Hapus Client-Side Filtering** ⚠️

**Masalah:**
- Masih ada `filteredCassettes` yang filter di frontend
- Ini tidak perlu jika sudah server-side

**Lokasi:**
- `frontend/src/app/cassettes/page.tsx` - Line 338-392

**Perbaikan:**
```typescript
// Hapus client-side filtering
// const filteredCassettes = visibleCassettes.filter(...)

// Langsung gunakan data dari server
const paginatedCassettes = cassettes;
```

---

### 3. **Debounce Search Input** ⚠️

**Masalah:**
- Search term langsung trigger API call setiap ketikan
- Bisa menyebabkan banyak request yang tidak perlu

**Lokasi:**
- `frontend/src/app/cassettes/page.tsx`

**Perbaikan:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1
  },
  500 // 500ms delay
);
```

---

## 🟡 Prioritas Sedang

### 4. **Remove Debug Console Logs** 

**Masalah:**
- Banyak `console.log` di production code
- Bisa memperlambat aplikasi

**Lokasi:**
- `backend/src/cassettes/cassettes.service.ts` - Banyak console.log
- `frontend/src/app/cassettes/page.tsx` - Console.log di fetchCassettes

**Perbaikan:**
- Gunakan proper logging (Winston, Pino, dll)
- Atau setidaknya hapus untuk production
- Atau gunakan environment variable untuk enable/disable

---

### 5. **Error Handling yang Lebih Baik**

**Masalah:**
- Error handling masih basic
- Tidak ada user-friendly error messages

**Perbaikan:**
- Tambahkan toast notifications untuk errors
- Tampilkan error message yang jelas ke user
- Handle network errors dengan lebih baik

---

### 6. **Loading States**

**Masalah:**
- Loading state mungkin tidak optimal
- Tidak ada skeleton loading

**Perbaikan:**
- Tambahkan skeleton loading untuk better UX
- Show loading indicator saat fetch data

---

## 🟢 Prioritas Rendah (Nice to Have)

### 7. **Virtual Scrolling**

**Masalah:**
- Jika user ingin lihat banyak data, render bisa lambat

**Solusi:**
- Implementasi virtual scrolling dengan `@tanstack/react-virtual`
- Hanya render rows yang terlihat

---

### 8. **Caching**

**Masalah:**
- Data tidak di-cache
- Setiap navigation fetch ulang

**Solusi:**
- Implementasi React Query atau SWR
- Cache data dengan TTL
- Prefetch next page

---

### 9. **Export Functionality**

**Masalah:**
- Export masih menggunakan `filteredCassettes` (client-side)
- Untuk data besar, ini tidak efisien

**Solusi:**
- Buat endpoint khusus untuk export
- Server-side export dengan streaming
- Support CSV dan Excel

---

## 📋 Checklist Perbaikan

### Immediate (Minggu ini):
- [ ] **Server-side filtering** (status filter)
- [ ] **Server-side sorting**
- [ ] **Debounce search input**
- [ ] **Hapus client-side filtering**

### Short Term (Bulan 1):
- [ ] Remove debug console.logs
- [ ] Improve error handling
- [ ] Better loading states
- [ ] Export functionality (server-side)

### Long Term (Bulan 2-3):
- [ ] Virtual scrolling
- [ ] Caching dengan React Query
- [ ] Advanced filtering options

---

## 🚀 Quick Wins

### 1. Debounce Search (5 menit)
```typescript
npm install use-debounce
// Add debounce to search input
```

### 2. Remove Console Logs (10 menit)
```typescript
// Replace console.log with proper logger
// Or remove for production
```

### 3. Server-Side Status Filter (30 menit)
```typescript
// Add status parameter to backend
// Update frontend to send status filter
```

---

## 📝 Notes

**Yang sudah baik:**
- ✅ Pagination sudah server-side
- ✅ Indexes sudah dibuat
- ✅ Performance sudah excellent

**Yang perlu diperbaiki:**
- ⚠️ Filtering masih client-side
- ⚠️ Sorting masih client-side
- ⚠️ Search tidak ada debounce
- ⚠️ Banyak console.log

---

**Last Updated:** 2025-01-25  
**Priority:** High - Server-side filtering & sorting

