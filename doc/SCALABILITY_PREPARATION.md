# 🚀 Persiapan Skalabilitas untuk Puluhan Ribu Kaset

## 📋 Ringkasan Eksekutif

Dokumen ini merangkum semua persiapan yang diperlukan untuk mengelola **puluhan ribu kaset** dalam aplikasi HCM (Hitachi Cassette Management). Aplikasi saat ini menggunakan PostgreSQL dengan Prisma ORM, dan perlu dioptimasi untuk performa yang baik pada skala besar.

---

## 🔴 **PRIORITAS TINGGI - Database Optimization**

### 1. **Database Indexing** ⚠️ **PENTING**

Saat ini tabel `cassettes` hanya memiliki:
- Primary key pada `id`
- Unique index pada `serial_number`
- Foreign key indexes (otomatis dari Prisma)

**Yang PERLU ditambahkan:**

```prisma
model Cassette {
  // ... existing fields ...
  
  // Tambahkan indexes untuk query yang sering digunakan
  @@index([customerBankId])           // Filter by bank
  @@index([machineId])                 // Filter by machine
  @@index([status])                     // Filter by status
  @@index([cassetteTypeId])            // Filter by type
  @@index([customerBankId, status])    // Composite: bank + status
  @@index([machineId, status])          // Composite: machine + status
  @@index([createdAt])                 // Sorting by date
  @@index([serialNumber])              // Already unique, but ensure it's optimized
  @@map("cassettes")
}
```

**Query yang akan dioptimasi:**
- `findAll()` dengan filter bank + status
- `getSparePool()` - filter by bank + status OK
- `findByMachine()` - filter by machineId
- Dashboard statistics - count by status

### 2. **Index untuk Tabel Terkait**

```prisma
// ProblemTicket - untuk query aktif tickets
model ProblemTicket {
  // ... existing fields ...
  @@index([cassetteId, status])        // Check active tickets
  @@index([machineId, status])         // Machine tickets
  @@index([reportedBy])                // User tickets
  @@index([createdAt])                 // Recent tickets
}

// RepairTicket
model RepairTicket {
  // ... existing fields ...
  @@index([cassetteId, status])        // Cassette repair history
  @@index([receivedAtRc])              // Date sorting
}

// TicketCassetteDetail
model TicketCassetteDetail {
  // ... existing fields ...
  @@index([cassetteId])                // Find tickets by cassette
}

// PMCassetteDetail
model PMCassetteDetail {
  // ... existing fields ...
  @@index([cassetteId, status])       // Active PM tasks
}
```

### 3. **Database Configuration**

**PostgreSQL Tuning untuk Large Dataset:**

```sql
-- Di postgresql.conf atau via ALTER SYSTEM
shared_buffers = 4GB                    -- 25% dari RAM
effective_cache_size = 12GB             -- 50-75% dari RAM
maintenance_work_mem = 1GB              -- Untuk VACUUM dan CREATE INDEX
work_mem = 64MB                         -- Per query operation
max_connections = 200                   -- Sesuaikan dengan beban
checkpoint_completion_target = 0.9      -- Smooth checkpoints
wal_buffers = 16MB                      -- Write-ahead log
default_statistics_target = 100         -- Better query planning
random_page_cost = 1.1                  -- Untuk SSD
effective_io_concurrency = 200          -- Untuk SSD
```

**Connection Pooling:**
- Gunakan PgBouncer atau Prisma connection pooling
- Limit connections per application instance

---

## 🟡 **PRIORITAS SEDANG - Application Optimization**

### 4. **Pagination yang Wajar** ⚠️ **MASALAH SAAT INI**

**Masalah:**
- Default limit: **50,000** cassettes per request
- Frontend memuat semua data sekaligus
- Bisa menyebabkan memory issues dan slow queries

**Solusi:**

**Backend (`cassettes.service.ts`):**
```typescript
// Ubah default limit dari 50000 menjadi 50-100
async findAll(
  userType: string,
  pengelolaId?: string,
  page: number = 1,
  limit: number = 50,  // ✅ Ubah dari 50000
  keyword?: string,
  // ...
) {
  // Enforce max limit
  const maxLimit = 1000; // Hard limit
  const actualLimit = Math.min(limit, maxLimit);
  
  // ... rest of code
}
```

**Frontend:**
- Implementasi proper pagination (bukan load all)
- Virtual scrolling untuk tabel besar
- Lazy loading untuk data yang tidak terlihat

### 5. **Query Optimization**

**Masalah di `findAll()`:**
- Include terlalu banyak relations (`_count` untuk 3 tabel)
- Bisa lambat untuk 10,000+ records

**Solusi:**
```typescript
// Option 1: Make includes optional
async findAll(
  // ... params
  includeCounts: boolean = false,  // Default false
) {
  const include: any = {
    cassetteType: true,
    customerBank: {
      select: { bankCode: true, bankName: true },
    },
  };
  
  if (includeCounts) {
    include._count = {
      select: {
        problemTickets: true,
        repairTickets: true,
        ticketCassetteDetails: true,
      },
    };
  }
  
  // ... rest
}

// Option 2: Separate endpoint untuk counts
GET /cassettes/:id/statistics
```

### 6. **Caching Strategy**

**Implementasi Redis untuk:**
- Cassette types (rarely changes)
- Bank list (rarely changes)
- User permissions (cache for 5-15 minutes)
- Dashboard statistics (cache for 1-5 minutes)

**Contoh dengan NestJS Cache:**
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 300, // 5 minutes
    }),
  ],
})
```

**Cache untuk:**
- `getCassetteTypes()` - TTL: 1 hour
- `getStatisticsByBank()` - TTL: 5 minutes
- User permissions - TTL: 15 minutes

### 7. **Bulk Operations Optimization**

**Saat ini:**
- Import satu-per-satu atau batch kecil

**Optimasi:**
```typescript
// Gunakan Prisma transaction dengan batch size
async bulkCreateCassettes(cassettes: CreateCassetteDto[], batchSize = 1000) {
  const results = [];
  
  for (let i = 0; i < cassettes.length; i += batchSize) {
    const batch = cassettes.slice(i, i + batchSize);
    
    await this.prisma.$transaction(
      batch.map(c => 
        this.prisma.cassette.create({ data: c })
      ),
      { timeout: 30000 } // 30 seconds
    );
    
    results.push(batch.length);
  }
  
  return results;
}
```

**Atau gunakan COPY untuk bulk insert:**
```typescript
// Raw SQL untuk performa maksimal
await this.prisma.$executeRaw`
  COPY cassettes (id, serial_number, cassette_type_id, customer_bank_id, status, created_at, updated_at)
  FROM STDIN WITH (FORMAT csv, HEADER true)
`;
```

---

## 🟢 **PRIORITAS RENDAH - Monitoring & Maintenance**

### 8. **Database Maintenance**

**Regular Tasks:**
```sql
-- VACUUM untuk cleanup
VACUUM ANALYZE cassettes;

-- Update statistics
ANALYZE cassettes;

-- Reindex jika perlu (setelah banyak updates)
REINDEX TABLE cassettes;
```

**Schedule dengan cron atau pg_cron:**
```sql
-- Setiap hari jam 2 pagi
SELECT cron.schedule('vacuum-cassettes', '0 2 * * *', 'VACUUM ANALYZE cassettes;');
```

### 9. **Query Performance Monitoring**

**Enable PostgreSQL logging:**
```sql
-- Log slow queries (> 1 second)
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
SELECT pg_reload_conf();
```

**Monitor dengan:**
- `pg_stat_statements` extension
- Application-level logging (NestJS interceptors)
- APM tools (New Relic, Datadog, dll)

### 10. **Archiving Strategy**

**Untuk data lama:**
- Archive cassettes dengan status `SCRAPPED` > 2 tahun
- Archive closed tickets > 1 tahun
- Archive completed repairs > 2 tahun

**Partitioning (jika perlu):**
```sql
-- Partition by year untuk historical data
CREATE TABLE cassettes_2024 PARTITION OF cassettes
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## 📊 **Frontend Optimization**

### 11. **Virtual Scrolling**

**Gunakan library:**
```bash
npm install @tanstack/react-virtual
# atau
npm install react-window
```

**Implementasi:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function CassetteTable({ cassettes }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: cassettes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 10, // Render extra rows
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map(virtualRow => (
        <div key={virtualRow.key} style={{ height: virtualRow.size }}>
          {/* Render cassette row */}
        </div>
      ))}
    </div>
  );
}
```

### 12. **Debounced Search**

**Sudah ada, pastikan konsisten:**
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    fetchCassettes({ keyword: value });
  },
  500 // 500ms delay
);
```

### 13. **Lazy Loading & Code Splitting**

**Next.js sudah support, pastikan digunakan:**
```tsx
// Dynamic import untuk heavy components
const CassetteTable = dynamic(() => import('./CassetteTable'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-side only jika perlu
});
```

---

## 🔧 **Infrastructure**

### 14. **Database Scaling**

**Vertical Scaling:**
- Upgrade RAM (minimal 16GB untuk 50k+ records)
- SSD storage (bukan HDD)
- CPU cores untuk parallel queries

**Horizontal Scaling (jika perlu):**
- Read replicas untuk reporting queries
- Connection pooling (PgBouncer)
- Consider database sharding jika > 100k records

### 15. **Application Scaling**

**Load Balancing:**
- Multiple NestJS instances
- Nginx atau load balancer di depan
- Session storage di Redis (jika pakai sessions)

**Containerization:**
- Docker untuk consistency
- Kubernetes untuk auto-scaling (jika perlu)

---

## 📝 **Action Items - Checklist**

### Immediate (Minggu 1)
- [ ] Tambahkan database indexes (prioritas tinggi)
- [ ] Ubah default pagination limit dari 50000 ke 50-100
- [ ] Implementasi proper pagination di frontend
- [ ] Test query performance dengan 10k+ records

### Short Term (Bulan 1)
- [ ] Setup Redis caching
- [ ] Optimasi query dengan selective includes
- [ ] Implementasi virtual scrolling di frontend
- [ ] Setup database monitoring

### Medium Term (Bulan 2-3)
- [ ] Database maintenance automation
- [ ] Archive strategy untuk data lama
- [ ] Load testing dengan 50k+ records
- [ ] Performance benchmarking

### Long Term (Bulan 4+)
- [ ] Consider read replicas jika perlu
- [ ] Advanced caching strategies
- [ ] Database partitioning (jika > 100k)
- [ ] Full APM monitoring setup

---

## 🧪 **Testing Strategy**

### Load Testing

**Tools:**
- Apache JMeter
- k6
- Artillery

**Scenarios:**
1. **10,000 cassettes:**
   - List all (paginated)
   - Search by serial number
   - Filter by status
   - Dashboard statistics

2. **50,000 cassettes:**
   - Same as above
   - Concurrent users (10, 50, 100)
   - Stress test (1000+ concurrent)

3. **100,000+ cassettes:**
   - Full system test
   - Database query optimization verification

**Target Metrics:**
- List query: < 500ms
- Search query: < 200ms
- Dashboard load: < 1s
- 95th percentile response time: < 1s

---

## 📚 **References**

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [React Virtual Scrolling](https://tanstack.com/virtual/latest)

---

## ⚠️ **Catatan Penting**

1. **Jangan load semua data sekaligus** - Ini adalah masalah terbesar saat ini
2. **Indexes adalah kunci** - Tanpa indexes, query akan lambat
3. **Monitor query performance** - Identifikasi slow queries
4. **Test dengan data real** - Jangan hanya test dengan data kecil
5. **Plan untuk growth** - Siapkan untuk 100k+ records sejak awal

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Status:** 🚧 In Progress

