# 📂 Data Import Folder

Folder ini digunakan untuk menyimpan file JSON untuk bulk import data.

## 🚀 Quick Start

1. **Copy file example:**
   ```bash
   cp import-data.example.json import-data.json
   ```

2. **Edit `import-data.json`** dengan data bank dan cassettes Anda

3. **Jalankan import:**
   ```bash
   npm run bulk:import
   ```

## 📋 Format File

File JSON harus memiliki struktur seperti ini:

```json
{
  "banks": [...],
  "cassettes": [...]
}
```

Lihat `import-data.example.json` untuk contoh lengkap.

## 📖 Dokumentasi Lengkap

Lihat `../BULK_IMPORT_GUIDE.md` untuk dokumentasi lengkap.

