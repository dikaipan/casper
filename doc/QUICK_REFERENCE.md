# 🚀 Quick Reference - Optimasi Skalabilitas

## ⚡ Quick Commands

### Test Performance
```bash
cd backend
npm run test:performance
```

### Check Database Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'cassettes' 
ORDER BY indexname;
```

### Check Migration Status
```bash
cd backend
npx prisma migrate status
```

### Verify Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM cassettes 
WHERE status = 'OK' 
LIMIT 50;
```

---

## 📊 Performance Targets

| Operation | Target | Current (16k records) |
|-----------|--------|----------------------|
| Count | < 1000ms | ✅ 73ms |
| Paginated List | < 500ms | ✅ 10ms |
| Filter by Status | < 500ms | ✅ 4ms |
| Search | < 200ms | ✅ 10ms |

---

## 🔧 Configuration

### Backend Pagination
- **Default limit:** 50 records
- **Max limit:** 1,000 records
- **Location:** `backend/src/cassettes/cassettes.controller.ts`

### Frontend Pagination
- **Default:** 50 records per page
- **Location:** `frontend/src/app/cassettes/page.tsx`

---

## 📝 Important Files

### Database
- Schema: `backend/prisma/schema.prisma`
- Migration: `backend/prisma/migrations/20250125151833_add_performance_indexes/`

### Backend
- Controller: `backend/src/cassettes/cassettes.controller.ts`
- Service: `backend/src/cassettes/cassettes.service.ts`

### Frontend
- Cassettes Page: `frontend/src/app/cassettes/page.tsx`
- Resources Page: `frontend/src/app/resources/page.tsx`

---

## 🐛 Troubleshooting

### Query Lambat?
1. Check indexes: `SELECT * FROM pg_indexes WHERE tablename = 'cassettes';`
2. Update statistics: `ANALYZE cassettes;`
3. Check query plan: `EXPLAIN ANALYZE <query>;`

### Frontend Load Semua Data?
1. Check Network tab - verify `limit=50` in request
2. Check pagination state in component
3. Verify `fetchCassettes` uses `currentPage` and `itemsPerPage`

### Memory Issues?
1. Check browser DevTools Memory tab
2. Verify pagination working (not loading all pages)
3. Check backend memory usage

---

## ✅ Pre-Production Checklist

- [ ] Indexes created and verified
- [ ] Performance test passed
- [ ] Pagination working (backend & frontend)
- [ ] No memory leaks
- [ ] Response times within targets
- [ ] Tested with production-like data volume

---

## 📞 Support

**Documentation:**
- Full Guide: `SCALABILITY_PREPARATION.md`
- Bahasa: `PERSIAPAN_SKALABILITAS_INDONESIA.md`
- Testing: `PERFORMANCE_VERIFICATION.md`

**Scripts:**
- Test: `npm run test:performance`
- Migrate: `npx prisma migrate deploy`

---

**Last Updated:** 2025-01-25

