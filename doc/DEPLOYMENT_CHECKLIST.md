# 📋 Deployment Checklist - Skalabilitas

## 🎯 Pre-Deployment

### 1. Database Preparation

- [ ] **Backup database** sebelum migration
  ```bash
  pg_dump -U postgres -d hcm_production > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Verify indexes migration**
  ```bash
  cd backend
  npx prisma migrate status
  ```

- [ ] **Test indexes di staging**
  ```bash
  npm run test:performance
  ```

### 2. Code Deployment

- [ ] **Backend changes deployed**
  - [ ] Pagination limit updated (50 default)
  - [ ] Indexes migration ready
  - [ ] Performance test script included

- [ ] **Frontend changes deployed**
  - [ ] Pagination implemented
  - [ ] No "load all" logic
  - [ ] Tested in staging

### 3. Configuration

- [ ] **Environment variables**
  - [ ] `DATABASE_URL` configured
  - [ ] Connection pool settings (if applicable)

- [ ] **PostgreSQL settings** (recommended)
  ```sql
  -- Check current settings
  SHOW shared_buffers;
  SHOW effective_cache_size;
  SHOW work_mem;
  ```

---

## 🚀 Deployment Steps

### Step 1: Database Migration

```bash
# Production deployment
cd backend
npx prisma migrate deploy

# Verify migration
npx prisma migrate status
```

**Expected:** All migrations applied successfully

### Step 2: Verify Indexes

```sql
-- Connect to production database
\c hcm_production

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('cassettes', 'repair_tickets', 'problem_tickets')
ORDER BY tablename, indexname;

-- Should see 17+ indexes
```

### Step 3: Update Statistics

```sql
-- Update statistics for better query planning
ANALYZE cassettes;
ANALYZE repair_tickets;
ANALYZE problem_tickets;
```

### Step 4: Test Performance

```bash
# Run performance test (if script available in production)
npm run test:performance

# Or test manually
curl https://api.example.com/cassettes?page=1&limit=50
```

**Expected:** Response time < 500ms

### Step 5: Monitor

- [ ] **Check application logs** for errors
- [ ] **Monitor query performance** (if APM available)
- [ ] **Check database CPU/memory** usage
- [ ] **Verify frontend pagination** working

---

## 🔍 Post-Deployment Verification

### 1. Functional Testing

- [ ] List cassettes page loads correctly
- [ ] Pagination controls work
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] No errors in console

### 2. Performance Testing

- [ ] Page load time < 1s
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] Smooth pagination navigation

### 3. Database Verification

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM cassettes 
WHERE status = 'OK' 
LIMIT 50;

-- Should show "Index Scan" not "Seq Scan"
```

---

## 🚨 Rollback Plan

### If Issues Occur:

1. **Rollback migration** (if needed)
   ```bash
   # Restore from backup
   psql -U postgres -d hcm_production < backup_YYYYMMDD.sql
   ```

2. **Revert code** to previous version

3. **Monitor** for stability

---

## 📊 Monitoring Checklist

### First 24 Hours:

- [ ] Check error logs every 2 hours
- [ ] Monitor query performance
- [ ] Check database CPU/memory
- [ ] Verify user reports (if any)

### First Week:

- [ ] Daily performance review
- [ ] Check slow query logs
- [ ] Monitor user feedback
- [ ] Review database statistics

---

## ✅ Success Criteria

- [ ] All migrations applied successfully
- [ ] Indexes created and verified
- [ ] Performance targets met (< 500ms)
- [ ] No errors in production
- [ ] User experience improved
- [ ] Memory usage stable

---

## 📞 Support Contacts

**Database Issues:**
- Check PostgreSQL logs
- Review migration history
- Verify indexes exist

**Performance Issues:**
- Run performance test script
- Check query execution plans
- Review application logs

**Code Issues:**
- Check deployment logs
- Verify environment variables
- Review recent commits

---

**Last Updated:** 2025-01-25  
**Version:** 1.0  
**Status:** Ready for Production

