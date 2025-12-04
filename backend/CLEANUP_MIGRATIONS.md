# Database Setup Berhasil!

## Status Database

✅ **Database baru sudah dibuat dan di-reset**
✅ **Schema baru sudah diterapkan** (termasuk `cassetteId` di `ProblemTicket`)
✅ **Database sudah di-seed** dengan data awal

## Cara Mengembangkan Database Selama Development

Prisma mendukung pengembangan database secara **incremental** menggunakan migrations:

### 1. **Development dengan Migrations** (Recommended)

```bash
# Setiap kali mengubah schema.prisma:
npx prisma migrate dev --name deskripsi_perubahan

# Contoh:
npx prisma migrate dev --name add_new_field_to_tickets
```

**Keuntungan:**
- ✅ History perubahan tersimpan
- ✅ Mudah rollback jika ada masalah
- ✅ Dapat deploy ke production dengan aman
- ✅ Tim dapat sync schema dengan mudah

### 2. **Quick Development dengan db push** (Untuk prototyping cepat)

```bash
# Jika ingin cepat test perubahan tanpa membuat migration:
npx prisma db push

# Setelah yakin, buat migration:
npx prisma migrate dev --name finalize_changes
```

**Catatan:**
- ⚠️ Perubahan langsung ke database tanpa migration file
- ⚠️ Hanya untuk development, jangan digunakan di production

### 3. **Regenerate Prisma Client**

```bash
# Setelah mengubah schema atau migration:
npx prisma generate
```

### 4. **Seed Database**

```bash
# Setelah reset atau untuk tambah data awal:
npm run prisma:seed
```

## Workflow Development Database

1. **Ubah `prisma/schema.prisma`** sesuai kebutuhan
2. **Buat migration**: `npx prisma migrate dev --name nama_perubahan`
3. **Review migration file** di `prisma/migrations/`
4. **Test perubahan** di aplikasi
5. **Commit migration files** ke git

## Migration Commands

```bash
# Lihat status migration
npx prisma migrate status

# Apply migration (untuk production)
npx prisma migrate deploy

# Reset database (hapus semua data)
npx prisma migrate reset

# Mark migration sebagai applied (untuk baseline)
npx prisma migrate resolve --applied nama_migration

# Rollback migration yang gagal
npx prisma migrate resolve --rolled-back nama_migration
```

## Troubleshooting

### Jika ada drift (schema tidak sync):
```bash
# Reset database dan reapply semua migration
npx prisma migrate reset
```

### Jika migration history tidak sync:
```bash
# Baseline migration (mark sebagai applied tanpa execute)
npx prisma migrate resolve --applied nama_migration
```

