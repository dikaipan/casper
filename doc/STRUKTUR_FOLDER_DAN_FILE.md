# 📁 Dokumentasi Struktur Folder dan File - HCM (Hitachi Cassette Management)

## 📋 Daftar Isi
1. [Struktur Root](#struktur-root)
2. [Backend (NestJS)](#backend-nestjs)
3. [Frontend (Next.js)](#frontend-nextjs)
4. [File Konfigurasi](#file-konfigurasi)
5. [Dokumentasi](#dokumentasi)
6. [Scripts & Tools](#scripts--tools)

---

## 🗂️ Struktur Root

```
hcm/
├── backend/                    # Backend API Server (NestJS)
├── frontend/                   # Frontend Web Application (Next.js)
├── node_modules/               # Dependencies root (jika ada)
├── package.json                # Root package.json untuk workspace
├── package-lock.json           # Lock file untuk dependencies
├── docker-compose.yml          # Docker Compose configuration
├── README.md                   # Dokumentasi utama proyek
├── ROADMAP.md                  # Roadmap pengembangan aplikasi
└── [Banyak file dokumentasi .md lainnya]
```

---

## 🔧 Backend (NestJS)

### Struktur Utama Backend

```
backend/
├── src/                        # Source code utama
│   ├── main.ts                 # Entry point aplikasi NestJS
│   ├── app.module.ts           # Root module aplikasi
│   ├── app.controller.ts       # Root controller
│   ├── app.service.ts          # Root service
│   │
│   ├── auth/                   # Modul Authentication & Authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── create-hitachi-user.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── update-hitachi-user.dto.ts
│   │   ├── guards/             # Authentication guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── strategies/         # Passport strategies
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   │
│   ├── banks/                  # Modul Bank Management
│   │   ├── banks.module.ts
│   │   ├── banks.controller.ts
│   │   ├── banks.service.ts
│   │   └── dto/
│   │       ├── create-bank.dto.ts
│   │       ├── update-bank.dto.ts
│   │       ├── create-bank-pengelola-assignment.dto.ts
│   │       └── index.ts
│   │
│   ├── bank-customers/         # Modul Bank Customers
│   │   ├── bank-customers.module.ts
│   │   ├── bank-customers.controller.ts
│   │   ├── bank-customers.service.ts
│   │   └── dto/
│   │       ├── create-bank-customer.dto.ts
│   │       ├── update-bank-customer.dto.ts
│   │       └── index.ts
│   │
│   ├── cassettes/              # Modul Cassette Management
│   │   ├── cassettes.module.ts
│   │   ├── cassettes.controller.ts
│   │   ├── cassettes.service.ts
│   │   └── dto/
│   │       ├── create-cassette.dto.ts
│   │       ├── mark-broken.dto.ts
│   │       └── index.ts
│   │
│   ├── machines/               # Modul Machine Management
│   │   ├── machines.module.ts
│   │   ├── machines.controller.ts
│   │   ├── machines.service.ts
│   │   └── dto/
│   │       ├── create-machine.dto.ts
│   │       ├── update-machine.dto.ts
│   │       ├── update-wsid.dto.ts
│   │       └── index.ts
│   │
│   ├── pengelola/              # Modul Pengelola (Vendor Management)
│   │   ├── pengelola.module.ts
│   │   ├── pengelola.controller.ts
│   │   ├── pengelola.service.ts
│   │   └── dto/
│   │       ├── create-pengelola.dto.ts
│   │       ├── update-pengelola.dto.ts
│   │       ├── create-pengelola-user.dto.ts
│   │       ├── update-pengelola-user.dto.ts
│   │       └── index.ts
│   │
│   ├── repairs/                # Modul Repair Center
│   │   ├── repairs.module.ts
│   │   ├── repairs.controller.ts
│   │   ├── repairs.service.ts
│   │   └── dto/
│   │       ├── create-repair-ticket.dto.ts
│   │       ├── update-repair-ticket.dto.ts
│   │       ├── complete-repair.dto.ts
│   │       └── index.ts
│   │
│   ├── tickets/                # Modul Problem Tickets
│   │   ├── tickets.module.ts
│   │   ├── tickets.controller.ts
│   │   ├── tickets.service.ts
│   │   └── dto/
│   │       ├── create-ticket.dto.ts
│   │       ├── create-multi-ticket.dto.ts
│   │       ├── update-ticket.dto.ts
│   │       ├── close-ticket.dto.ts
│   │       ├── create-delivery.dto.ts
│   │       ├── receive-delivery.dto.ts
│   │       ├── create-return.dto.ts
│   │       ├── receive-return.dto.ts
│   │       ├── cassette-detail.dto.ts
│   │       └── index.ts
│   │
│   ├── preventive-maintenance/ # Modul Preventive Maintenance
│   │   ├── preventive-maintenance.module.ts
│   │   ├── preventive-maintenance.controller.ts
│   │   ├── preventive-maintenance.service.ts
│   │   ├── pm-scheduler.service.ts
│   │   └── dto/
│   │       ├── create-pm.dto.ts
│   │       └── update-pm.dto.ts
│   │
│   ├── data-management/        # Modul Data Management
│   │   ├── data-management.module.ts
│   │   ├── data-management.controller.ts
│   │   ├── data-management.service.ts
│   │   └── dto/
│   │       ├── query.dto.ts
│   │       ├── update-record.dto.ts
│   │       ├── maintenance.dto.ts
│   │       └── index.ts
│   │
│   ├── import/                 # Modul Import Data
│   │   ├── import.module.ts
│   │   ├── import.controller.ts
│   │   ├── import.service.ts
│   │   └── dto/
│   │       └── bulk-import.dto.ts
│   │
│   ├── analytics/              # Modul Analytics
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   │
│   ├── users/                  # Modul User Management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   ├── prisma/                 # Prisma ORM Integration
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── common/                 # Shared utilities & common modules
│       ├── decorators/         # Custom decorators
│       │   ├── current-user.decorator.ts
│       │   ├── roles.decorator.ts
│       │   └── skip-csrf.decorator.ts
│       ├── guards/             # Custom guards
│       │   ├── roles.guard.ts
│       │   └── csrf.guard.ts
│       ├── filters/            # Exception filters
│       │   └── http-exception.filter.ts
│       ├── services/           # Shared services
│       │   └── security-logger.service.ts
│       └── validators/         # Custom validators
│           └── password.validator.ts
│
├── prisma/                     # Prisma ORM Configuration
│   ├── schema.prisma           # Database schema definition
│   ├── seed.ts                 # Database seeding script
│   └── migrations/             # Database migration files
│       ├── migration_lock.toml
│       └── [migration files .sql]
│
├── scripts/                    # Utility scripts
│   ├── bulk-import.ts          # Bulk import data script
│   ├── import-machine-cassettes.ts
│   ├── import-sql-inserts.ts
│   ├── import-mysql-cassettes.ts
│   ├── import-mysql-direct.ts
│   ├── import-csv-direct.ts
│   ├── import-excel-direct.ts
│   ├── test-csv-parsing.ts
│   ├── test-excel-parsing.ts
│   ├── compare-excel-db.ts
│   ├── fix-excel-data.ts
│   ├── add-missing-cassettes.ts
│   ├── verify-cassette-machine-link.ts
│   ├── final-verification.ts
│   ├── import-from-sql.ps1
│   ├── import-from-sql.sh
│   ├── delete-machines-cassettes.ts
│   ├── check-cassette-count.ts
│   ├── check-machine-cassette-links.ts
│   ├── check-seed-data.ts
│   ├── apply-rename-migration.ts
│   ├── test-query-performance.ts
│   ├── cleanup-machines-and-cassettes.ts
│   ├── check-cassette-statuses.ts
│   ├── export-mytable-to-json.ts
│   ├── verify-db-change.ts
│   ├── verify-db-simple.ts
│   ├── fix-cassette-status-enum.sql
│   └── rename-typename-to-machinetype.sql
│
├── data/                       # Data files untuk import/testing
│   ├── BNI_CASSETTE_COMPLETE.csv
│   ├── BNI_CASSETTE_COMPLETE.xlsx
│   ├── BNI_CASSETTE_FIXED.csv
│   ├── BNI_CASSETTE_FIXED.xlsx
│   ├── cassette_repair_db.sql
│   ├── import-data.example.json
│   ├── machine-cassettes.json
│   ├── Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx
│   ├── json/                   # JSON data files
│   ├── README.md
│   └── README_MACHINE_CASSETTES.md
│
├── migrations/                 # SQL migration files
│   └── fix_cassette_status.sql
│
├── backups/                    # Database backup files
│   └── backup_hcm_development_2025-11-19_1763571295084.json
│
├── uploads/                    # Uploaded files directory
│
├── dist/                       # Compiled JavaScript output (production build)
│   ├── prisma/
│   ├── scripts/
│   └── src/
│
├── node_modules/               # Backend dependencies
│
├── Dockerfile                  # Docker image untuk backend
├── nest-cli.json               # NestJS CLI configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Backend dependencies & scripts
├── package-lock.json           # Lock file untuk dependencies
├── env.template                # Template file untuk environment variables
│
└── [Dokumentasi Backend]
    ├── BULK_IMPORT_GUIDE.md
    ├── CLEANUP_MIGRATIONS.md
    ├── EXCEL_IMPORT_GUIDE.md
    ├── FIX_401_LOGIN_ERROR.md
    ├── SCHEMA_GUIDE.md
```

---

## 🎨 Frontend (Next.js)

### Struktur Utama Frontend

```
frontend/
├── src/                        # Source code utama
│   ├── app/                    # Next.js App Router (Pages & Routes)
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page (redirect ke dashboard)
│   │   ├── globals.css         # Global CSS styles
│   │   │
│   │   ├── login/              # Login page
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard page
│   │   │   └── page.tsx
│   │   │
│   │   ├── machines/           # Machines management
│   │   │   └── page.tsx
│   │   │
│   │   ├── cassettes/          # Cassettes management
│   │   │   ├── page.tsx
│   │   │   └── replacement/
│   │   │       └── create/
│   │   │           └── page.tsx
│   │   │
│   │   ├── tickets/            # Problem tickets
│   │   │   ├── page.tsx
│   │   │   ├── page_old.tsx
│   │   │   ├── page_old_verbose.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/           # Dynamic route untuk ticket detail
│   │   │       ├── page.tsx
│   │   │       ├── delivery/
│   │   │       │   └── page.tsx
│   │   │       ├── receive/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── page_old.tsx
│   │   │       │   └── page_compact.tsx
│   │   │       ├── receive-return/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── page_old.tsx
│   │   │       │   └── page_compact.tsx
│   │   │       └── return/
│   │   │           ├── page.tsx
│   │   │           ├── page_old.tsx
│   │   │           └── page_compact.tsx
│   │   │
│   │   ├── repairs/            # Repair center
│   │   │   ├── page.tsx
│   │   │   ├── page_old.tsx
│   │   │   ├── page_old_verbose.tsx
│   │   │   └── [id]/           # Dynamic route untuk repair detail
│   │   │       ├── page.tsx
│   │   │       ├── page_old.tsx
│   │   │       └── page_compact.tsx
│   │   │
│   │   ├── preventive-maintenance/  # Preventive maintenance
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/           # Dynamic route untuk PM detail
│   │   │       └── page.tsx
│   │   │
│   │   ├── service-orders/     # Service orders
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── replacement/
│   │   │       └── create/
│   │   │           └── page.tsx
│   │   │
│   │   ├── banks/              # Banks management
│   │   │   └── page.tsx
│   │   │
│   │   ├── pengelola/          # Pengelola (Vendor) management
│   │   │   └── page.tsx
│   │   │
│   │   ├── users/              # Users management
│   │   │   └── page.tsx
│   │   │
│   │   ├── bank-customers/     # Bank customers
│   │   │
│   │   ├── vendors/            # Vendors
│   │   │
│   │   ├── import/             # Data import page
│   │   │   └── page.tsx
│   │   │
│   │   ├── data-management/    # Data management page
│   │   │   └── page.tsx
│   │   │
│   │   ├── assignments/        # Assignments page
│   │   │   └── page.tsx
│   │   │
│   │   ├── history/            # History page
│   │   │   └── page.tsx
│   │   │
│   │   ├── notifications/      # Notifications page
│   │   │   └── page.tsx
│   │   │
│   │   ├── resources/          # Resources page
│   │   │   └── page.tsx
│   │   │
│   │   └── request/            # Request page
│   │       └── new/
│   │           └── page.tsx
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Sidebar_old.tsx
│   │   │   ├── Sidebar_grouped.tsx
│   │   │   ├── MobileNavbar.tsx
│   │   │   ├── MobileNavbar_old.tsx
│   │   │   ├── MobileNavbar_grouped.tsx
│   │   │   └── PageLayout.tsx
│   │   │
│   │   ├── machines/           # Machine-specific components
│   │   │   ├── AddMachineDialog.tsx
│   │   │   └── EditMachineDialog.tsx
│   │   │
│   │   ├── notifications/      # Notification components
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationService.tsx
│   │   │
│   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── cassette-table-skeleton.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── error-with-retry.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── modern-table.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   └── BarcodeScanner.tsx  # Barcode scanner component
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API client configuration
│   │   ├── navigation.ts       # Navigation utilities
│   │   └── utils.ts            # General utilities
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-toast.ts        # Toast notification hook
│   │
│   └── store/                  # State management (Zustand)
│       ├── authStore.ts        # Authentication state
│       └── notificationStore.ts # Notification state
│
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── hitachi-logo.svg
│   └── grid.svg
│
├── node_modules/               # Frontend dependencies
│
├── Dockerfile                  # Docker image untuk frontend
├── next.config.js              # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript definitions
├── package.json                # Frontend dependencies & scripts
├── package-lock.json           # Lock file untuk dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── env.local.template          # Template file untuk environment variables
```

---

## ⚙️ File Konfigurasi

### Root Level

| File | Deskripsi |
|------|-----------|
| `package.json` | Root workspace configuration dengan scripts untuk menjalankan backend & frontend bersama |
| `package-lock.json` | Lock file untuk dependencies root |
| `docker-compose.yml` | Docker Compose configuration untuk development/production |
| `README.md` | Dokumentasi utama proyek |
| `ROADMAP.md` | Roadmap pengembangan aplikasi |

### Backend Configuration

| File | Deskripsi |
|------|-----------|
| `backend/package.json` | Backend dependencies, scripts (NestJS, Prisma, dll) |
| `backend/tsconfig.json` | TypeScript compiler configuration untuk backend |
| `backend/nest-cli.json` | NestJS CLI configuration |
| `backend/env.template` | Template untuk environment variables backend |
| `backend/Dockerfile` | Docker image definition untuk backend |
| `backend/prisma/schema.prisma` | Prisma ORM schema definition (database structure) |

### Frontend Configuration

| File | Deskripsi |
|------|-----------|
| `frontend/package.json` | Frontend dependencies, scripts (Next.js, React, dll) |
| `frontend/tsconfig.json` | TypeScript compiler configuration untuk frontend |
| `frontend/next.config.js` | Next.js configuration |
| `frontend/tailwind.config.ts` | Tailwind CSS configuration |
| `frontend/postcss.config.js` | PostCSS configuration untuk Tailwind |
| `frontend/env.local.template` | Template untuk environment variables frontend |
| `frontend/Dockerfile` | Docker image definition untuk frontend |

---

## 📚 Dokumentasi

### Dokumentasi Utama

| File | Deskripsi |
|------|-----------|
| `README.md` | Dokumentasi utama proyek dengan overview, setup, dan features |
| `ROADMAP.md` | Roadmap pengembangan dengan prioritas fitur |
| `API_DOCUMENTATION.md` | Dokumentasi API endpoints |
| `STRUKTUR_FOLDER_DAN_FILE.md` | **File ini** - Dokumentasi struktur folder dan file |

### Dokumentasi Setup & Deployment

| File | Deskripsi |
|------|-----------|
| `SETUP_MANUAL.md` | Panduan setup manual aplikasi |
| `SETUP_DATABASE_WINDOWS.md` | Panduan setup database di Windows |
| `DEPLOYMENT.md` | Panduan deployment aplikasi |
| `DEPLOYMENT_CHECKLIST.md` | Checklist untuk deployment |
| `STARTUP-GUIDE.md` | Panduan memulai aplikasi |
| `START_BACKEND.md` | Panduan menjalankan backend |

### Dokumentasi Features & Flows

| File | Deskripsi |
|------|-----------|
| `FLOW_PREVENTIVE_MAINTENANCE.md` | Flow preventive maintenance |
| `FLOW_SERVICE_ORDER.md` | Flow service order |
| `FLOW_TIKET_TERPISAH_PER_KASET.md` | Flow tiket terpisah per kaset |
| `OPEN_TICKET_FLOW.md` | Flow membuka ticket |
| `TICKET_APPROVAL_FLOW.md` | Flow approval ticket (tidak digunakan lagi) |
| `REPLACEMENT_CASSETTE_FLOW.md` | Flow replacement cassette |
| `REVISED_CASSETTE_FLOW.md` | Flow cassette yang direvisi |
| `REVISED_FLOW_INDONESIA.md` | Flow yang direvisi (Bahasa Indonesia) |

**Catatan:** Dokumentasi tentang cassette swap (`CASSETTE_SWAP_*.md`) sudah tidak relevan karena fitur swap kaset dan spare pool sudah tidak digunakan dalam flow aplikasi.

### Dokumentasi Import & Data Management

| File | Deskripsi |
|------|-----------|
| `BULK_IMPORT_CSV_EXAMPLES.csv` | Contoh file CSV untuk bulk import |
| `backend/BULK_IMPORT_GUIDE.md` | Panduan bulk import data |
| `backend/EXCEL_IMPORT_GUIDE.md` | Panduan import dari Excel |
| `USER_FRIENDLY_IMPORT_GUIDE.md` | Panduan import yang user-friendly |
| `IMPORT_UI_IMPROVEMENTS.md` | Dokumentasi perbaikan UI import |

### Dokumentasi Security & Authentication

| File | Deskripsi |
|------|-----------|
| `SECURITY.md` | Dokumentasi security |
| `SECURITY_IMPLEMENTATION_SUMMARY.md` | Ringkasan implementasi security |
| `FRONTEND_SECURITY.md` | Security untuk frontend |
| `LOGIN_GUIDE.md` | Panduan login |
| `ROLE_AND_ACCESS_GUIDE.md` | Panduan role dan access control |
| `DEBUG_LOGIN_ISSUE.md` | Debugging issue login |
| `TEST_LOGIN_ENDPOINT.md` | Testing endpoint login |

### Dokumentasi Troubleshooting

| File | Deskripsi |
|------|-----------|
| `FIX_500_ERROR.md` | Perbaikan error 500 |
| `FIX_401_LOGIN_ERROR.md` | Perbaikan error 401 login |
| `FIX_PORT_3000_IN_USE.md` | Perbaikan port 3000 yang sedang digunakan |
| `FIX_SHADOW_DATABASE_ERROR.md` | Perbaikan error shadow database |
| `TROUBLESHOOTING_404_ERROR.md` | Troubleshooting error 404 |
| `QUICK_FIX_404.md` | Quick fix untuk error 404 |

### Dokumentasi Optimization & Performance

| File | Deskripsi |
|------|-----------|
| `OPTIMASI_SELESAI.md` | Dokumentasi optimasi yang sudah selesai |
| `CHANGELOG_OPTIMASI.md` | Changelog optimasi |
| `PERFORMANCE_VERIFICATION.md` | Verifikasi performance |
| `SCALABILITY_PREPARATION.md` | Persiapan skalabilitas |
| `PERSIAPAN_SKALABILITAS_INDONESIA.md` | Persiapan skalabilitas (Bahasa Indonesia) |
| `RINGKASAN_OPTIMASI_FINAL.md` | Ringkasan optimasi final |
| `README_OPTIMASI.md` | README optimasi |

### Dokumentasi UI/UX

| File | Deskripsi |
|------|-----------|
| `COLOR_PALETTE.md` | Dokumentasi color palette |
| `COLOR_RECOMMENDATIONS.md` | Rekomendasi warna |
| `FORM_LAYOUT_FLOW_ANALYSIS.md` | Analisis layout form |
| `FORM_UX_IMPROVEMENTS.md` | Perbaikan UX form |
| `UX_IMPROVEMENTS_RECOMMENDATIONS.md` | Rekomendasi perbaikan UX |

### Dokumentasi Lainnya

| File | Deskripsi |
|------|-----------|
| `POSTMAN-GUIDE.md` | Panduan menggunakan Postman |
| `POSTMAN-QUICK-START.md` | Quick start Postman |
| `QUICK_REFERENCE.md` | Quick reference guide |
| `IDEAS_AND_IMPROVEMENTS.md` | Ide dan improvement yang direncanakan |
| `PERBAIKAN_FLOW_APLIKASI.md` | Perbaikan flow aplikasi |
| `PERBAIKAN_YANG_DIPERLUKAN.md` | Perbaikan yang diperlukan |
| `CREATE_TICKET_REASSESSMENT.md` | Reassessment create ticket |
| `PM_FORM_TRANSFORMATION_SUMMARY.md` | Ringkasan transformasi form PM |

### Backend Documentation

| File | Deskripsi |
|------|-----------|
| `backend/SCHEMA_GUIDE.md` | Panduan database schema |
| `backend/CLEANUP_MIGRATIONS.md` | Panduan cleanup migrations |
| `backend/data/README.md` | README untuk folder data |
| `backend/data/README_MACHINE_CASSETTES.md` | README untuk machine cassettes data |

---

## 🛠️ Scripts & Tools

### PowerShell Scripts (Root)

| File | Deskripsi |
|------|-----------|
| `start-all.ps1` | Script untuk menjalankan backend dan frontend bersama |
| `start-backend.ps1` | Script untuk menjalankan backend |
| `start-frontend.ps1` | Script untuk menjalankan frontend |
| `stop-all.ps1` | Script untuk menghentikan semua service |
| `fix-frontend.ps1` | Script untuk memperbaiki frontend |

### Backend Scripts

Semua script TypeScript di `backend/scripts/` dapat dijalankan dengan:

```bash
cd backend
pnpm run [script-name]
```

**Scripts yang tersedia:**
- `bulk:import` - Import data dalam jumlah besar
- `import:machine-cassettes` - Import machine cassettes
- `import:sql` - Import dari SQL inserts
- `import:mysql` - Import dari MySQL
- `import:csv-direct` - Import langsung dari CSV
- `import:excel-direct` - Import langsung dari Excel
- `test:csv-parsing` - Test parsing CSV
- `test:excel-parsing` - Test parsing Excel
- `compare:excel-db` - Bandingkan data Excel dengan database
- `fix:excel-data` - Perbaiki data Excel
- `verify:final` - Verifikasi final data
- `test:performance` - Test performance query
- Dan banyak lagi...

### Postman Files

| File | Deskripsi |
|------|-----------|
| `HCM-API.postman_collection.json` | Postman collection untuk API testing |
| `HCM-Local.postman_environment.json` | Postman environment untuk local development |

---

## 📊 Ringkasan Struktur

### Backend Modules (NestJS)

1. **auth** - Authentication & Authorization
2. **banks** - Bank Management
3. **bank-customers** - Bank Customers
4. **cassettes** - Cassette Management
5. **machines** - Machine Management
6. **pengelola** - Vendor/Pengelola Management
7. **repairs** - Repair Center
8. **tickets** - Problem Tickets
9. **preventive-maintenance** - Preventive Maintenance
10. **data-management** - Data Management
11. **import** - Data Import
12. **analytics** - Analytics
13. **users** - User Management
14. **prisma** - Database ORM
15. **common** - Shared utilities

### Frontend Pages (Next.js App Router)

1. **login** - Login page
2. **dashboard** - Dashboard utama
3. **machines** - Machine management
4. **cassettes** - Cassette management
5. **tickets** - Problem tickets
6. **repairs** - Repair center
7. **preventive-maintenance** - Preventive maintenance
8. **service-orders** - Service orders
9. **banks** - Bank management
10. **pengelola** - Vendor management
11. **users** - User management
12. **import** - Data import
13. **data-management** - Data management
14. **assignments** - Assignments
15. **history** - History
16. **notifications** - Notifications
17. **resources** - Resources
18. **request** - Request

### Frontend Components

1. **layout** - Layout components (Navbar, Sidebar, MobileNavbar)
2. **machines** - Machine-specific components
3. **notifications** - Notification components
4. **ui** - Reusable UI components (shadcn/ui)
5. **BarcodeScanner** - Barcode scanner component

---

## 🔄 Flow Cassette yang Benar

### Overview Flow

Aplikasi ini menggunakan flow **ticket-based** untuk manajemen cassette yang rusak. Flow yang benar adalah:

```
Pengelola (Vendor) → Kirim Kaset Rusak → Repair Center → Perbaiki → Kaset Kembali OK
```

### Detail Flow

1. **Pengelola Mengirim Kaset Rusak** 📦
   - Pengelola (vendor) mengidentifikasi kaset yang rusak di mesin
   - Pengelola membuat **Problem Ticket** di sistem
   - Setelah ticket dibuat, pengelola langsung mengisi **Form Pengiriman Kaset**
   - Kaset dikirim ke Repair Center (RC)
   - Status kaset: `INSTALLED/BROKEN` → `IN_TRANSIT_TO_RC`

2. **Repair Center Menerima Kaset** 📬
   - RC Staff menerima kaset fisik di Repair Center
   - RC Staff mengkonfirmasi penerimaan di sistem
   - Status kaset: `IN_TRANSIT_TO_RC` → `IN_REPAIR`
   - System otomatis membuat **Repair Ticket**

3. **Repair Center Memperbaiki Kaset** 🔧
   - RC Staff melakukan perbaikan kaset
   - RC Staff mencatat action yang dilakukan dan parts yang diganti
   - RC Staff melakukan Quality Control (QC)
   - Status repair: `DIAGNOSING` → `COMPLETED`

4. **Kaset Kembali dalam Keadaan OK** ✅
   - Setelah repair selesai dan QC passed
   - Kaset dikembalikan ke pengelola dalam keadaan OK (jika bisa diperbaiki)
   - Status kaset: `IN_REPAIR` → `OK` (atau status yang sesuai)
   - Problem ticket ditutup dengan status `RESOLVED`

### Modul yang Terlibat

- **tickets** - Problem ticket untuk tracking kaset rusak
- **repairs** - Repair ticket untuk proses perbaikan di RC
- **cassettes** - Manajemen status dan tracking kaset

### Catatan Penting

- ❌ **Tidak ada fitur swap kaset** - Kaset tidak ditukar langsung dengan spare
- ❌ **Tidak ada spare pool** - Konsep spare pool tidak digunakan
- ✅ **Flow berbasis ticket** - Semua proses melalui ticket system
- ✅ **Tracking lengkap** - Setiap langkah dicatat dalam sistem

---

## 🔍 Catatan Penting

1. **File `_old.tsx` dan `_old_verbose.tsx`**: File-file dengan suffix ini adalah versi lama yang disimpan untuk referensi, tidak digunakan dalam production.

2. **Folder `dist/`**: Folder ini berisi compiled JavaScript dari TypeScript. Jangan edit file di sini, edit file source di `src/`.

3. **Folder `node_modules/`**: Berisi dependencies yang diinstall. Jangan commit ke git.

4. **File `.template`**: File template untuk environment variables. Copy dan rename ke `.env` atau `.env.local` dan isi dengan nilai yang sesuai.

5. **Database Migrations**: File migration di `backend/prisma/migrations/` tidak boleh dihapus atau dimodifikasi setelah di-deploy ke production.

6. **Backup Files**: File backup di `backend/backups/` adalah backup database yang dibuat secara manual atau otomatis.

---

## 📝 Kesimpulan

Aplikasi HCM (Hitachi Cassette Management) adalah aplikasi full-stack dengan:

- **Backend**: NestJS dengan TypeScript, menggunakan Prisma ORM untuk database PostgreSQL
- **Frontend**: Next.js 14 dengan App Router, menggunakan React, TypeScript, dan Tailwind CSS
- **Architecture**: Modular dengan separation of concerns yang jelas
- **Structure**: Terorganisir dengan baik, mengikuti best practices untuk NestJS dan Next.js

Struktur folder dan file ini dirancang untuk:
- Memudahkan maintenance dan development
- Memisahkan concerns dengan jelas
- Memungkinkan skalabilitas
- Memudahkan kolaborasi tim

---

**Terakhir diperbarui**: 2025-01-19
**Versi Dokumentasi**: 1.1.0

### Changelog

**v1.1.0 (2025-01-19)**
- Menghapus referensi ke fitur swap kaset dan spare pool
- Menambahkan penjelasan flow cassette yang benar (ticket-based)
- Memperbarui dokumentasi sesuai flow aktual aplikasi

