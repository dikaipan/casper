# 🔧 Fix 500 Error pada /api/tickets

## Masalah
Error 500 Internal Server Error saat mengakses `/api/tickets`

## Kemungkinan Penyebab

1. **Prisma Client belum ter-generate** setelah schema update
2. **Migration belum diaplikasikan** dengan benar
3. **Field baru** (`approver`, `cassetteDelivery`) belum ada di database

## Solusi

### Step 1: Stop Backend Server
```bash
# Stop backend server jika masih running (Ctrl+C)
```

### Step 2: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

**Jika error EPERM:**
- Close semua terminal/IDE yang akses file Prisma
- Restart terminal
- Run lagi: `npx prisma generate`

### Step 3: Cek Migration Status
```bash
npx prisma migrate status
```

**Jika ada migration yang belum applied:**
```bash
npx prisma migrate deploy
# atau untuk development:
npx prisma migrate dev
```

### Step 4: Restart Backend
```bash
npm run start:dev
```

### Step 5: Test Endpoint
Buka browser console atau Postman:
```
GET http://localhost:3000/api/tickets
Headers: Authorization: Bearer <your-token>
```

## Debugging

### Cek Backend Logs
Lihat console output backend untuk error detail:
```
Error in findAll tickets: <error message>
```

### Cek Database Schema
```sql
-- Cek apakah field approved_by ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'problem_tickets' 
AND column_name IN ('approved_by', 'approved_at', 'approval_notes');

-- Cek apakah table cassette_deliveries ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'cassette_deliveries';
```

### Alternative: Simplify Query
Jika masih error, coba simplify query di `tickets.service.ts`:

```typescript
// Temporary: Remove approver and cassetteDelivery includes
return await this.prisma.problemTicket.findMany({
  where: whereClause,
  include: {
    machine: {
      include: {
        customerBank: true,
        vendor: true,
      },
    },
    reporter: true,
    // approver: { ... }, // Comment out temporarily
    // cassetteDelivery: { ... }, // Comment out temporarily
  },
  orderBy: { reportedAt: 'desc' },
});
```

## Status Saat Ini

✅ Migration sudah di-mark sebagai applied
✅ Error handling sudah ditambahkan
✅ Query sudah di-update dengan includes yang benar

**Next:** Restart backend dan cek console untuk error detail.

