# 🔧 Fix Error: Prisma Shadow Database Permission Denied

## Error yang Terjadi

```
Error: P3014
Prisma Migrate could not create the shadow database. 
Please make sure the database user has permission to create databases.
```

**Penyebab:** User PostgreSQL tidak memiliki permission `CREATEDB` untuk membuat shadow database.

---

## ✅ Solusi 1: Berikan Permission CREATEDB ke User (RECOMMENDED)

### Menggunakan pgAdmin:

1. **Buka pgAdmin**
2. **Klik kanan pada user `hcm_user`** → "Properties"
3. **Tab "Definition"**:
   - ✅ Centang **"Can create databases?"**
4. **Klik "Save"**

### Menggunakan SQL Shell (psql):

```sql
-- Connect sebagai postgres (superuser)
psql -U postgres

-- Berikan permission CREATEDB
ALTER USER hcm_user CREATEDB;

-- Verifikasi
\du hcm_user
```

Anda akan melihat `Create DB` di kolom Attributes.

### Menggunakan Query Tool di pgAdmin:

1. Buka **Query Tool** pada database `postgres`
2. Jalankan:

```sql
ALTER USER hcm_user CREATEDB;
```

---

## ✅ Solusi 2: Gunakan User Postgres Default (Paling Mudah)

Jika Anda menggunakan user `postgres` default (yang sudah punya semua permission):

1. **Edit file `backend/.env`**:

```env
# Ganti dengan password postgres Anda
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/hcm_development?schema=public"
```

2. **Jalankan migration lagi**:

```bash
npx prisma migrate dev
```

User `postgres` sudah punya permission `CREATEDB` secara default, jadi tidak akan error.

---

## ✅ Solusi 3: Disable Shadow Database (Workaround)

Jika Anda tidak bisa memberikan permission (misalnya shared hosting), Anda bisa disable shadow database:

**Edit file `backend/prisma/schema.prisma`**, tambahkan di bagian `datasource db`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("DATABASE_URL")  // Tambahkan ini
}
```

**Atau** jalankan dengan flag `--skip-seed` dan gunakan `prisma db push`:

```bash
# Gunakan db push (tidak butuh shadow database)
npx prisma db push

# Lalu seed data
npx prisma db seed
```

**Note:** `db push` tidak membuat migration files, jadi kurang ideal untuk development dengan tim.

---

## ✅ Solusi 4: Set Shadow Database Manual

Anda bisa set shadow database secara manual di `.env`:

**Edit file `backend/.env`**, tambahkan:

```env
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/postgres?schema=public"
```

Lalu edit `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")  // Tambahkan ini
}
```

Ini akan menggunakan database `postgres` sebagai shadow database (yang sudah ada dan bisa diakses oleh postgres user).

---

## 🎯 Rekomendasi Solusi

**Untuk Development Lokal:**

✅ **Gunakan Solusi 1** (berikan CREATEDB permission) - ini yang paling clean dan standard

ATAU

✅ **Gunakan Solusi 2** (pakai user postgres) - paling mudah, tidak perlu ubah permission

---

## 📝 Setelah Fix, Jalankan Lagi

Setelah salah satu solusi di atas diterapkan, jalankan:

```bash
cd backend
npx prisma migrate dev
```

Seharusnya sekarang berhasil! ✅

---

## 🧪 Verifikasi Permission

Untuk cek apakah user punya permission `CREATEDB`:

```sql
-- Connect sebagai postgres
psql -U postgres

-- Cek user attributes
\du hcm_user
```

Jika melihat `Create DB` di kolom Attributes, berarti sudah OK! ✅

---

## 🔄 Langkah Lengkap Setelah Fix

1. **Fix permission** (pilih salah satu solusi di atas)
2. **Jalankan migration**:
   ```bash
   npx prisma migrate dev
   ```
3. **Seed database**:
   ```bash
   npx prisma db seed
   ```
4. **Generate Prisma Client** (jika belum):
   ```bash
   npx prisma generate
   ```
5. **Start backend**:
   ```bash
   npm run start:dev
   ```

---

**Pilih solusi yang paling mudah untuk Anda!** 🚀

