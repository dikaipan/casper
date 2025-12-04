# Hitachi CRM Management System

## 🎯 Project Overview

Enterprise-grade **Cash Recycling Machine (CRM) Management System** for Hitachi - A comprehensive platform for tracking cassette maintenance, managing operational issues, and coordinating multi-tenant service operations across bank customers and vendor partners.

## 🏗️ Architecture

### Technology Stack

- **Backend**: NestJS (Node.js) with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **API**: RESTful with OpenAPI/Swagger documentation

### Project Structure

```
hcm/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication & authorization
│   │   ├── banks/          # Bank customer management
│   │   ├── vendors/        # Vendor management
│   │   ├── machines/       # Machine asset management
│   │   ├── cassettes/      # Cassette lifecycle management
│   │   ├── repairs/        # Repair center module
│   │   ├── tickets/        # Problem ticket system
│   │   └── common/         # Shared utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # UI components
│   │   ├── lib/           # Utilities & API client
│   │   └── types/         # TypeScript types
│   └── package.json
├── docker-compose.yml      # Local development setup
└── README.md
```

## ⚡ Performance & Scalability

**Optimized for Large Datasets:**
- ✅ **17 Database Indexes** - Query performance 10-100x faster
- ✅ **Server-Side Pagination** - Default 50 records per page
- ✅ **Server-Side Filtering & Sorting** - Efficient database queries
- ✅ **Debounced Search** - Reduces API calls by 80-90%
- ✅ **Skeleton Loading** - Better perceived performance
- ✅ **Tested with 16,007+ cassettes** - All queries < 100ms

**See:** `SCALABILITY_PREPARATION.md` for detailed optimization guide.

---

## 🔑 Key Features

### Multi-Tenant Hierarchy
- **Hitachi (System Root)** → Super Admin & RC Staff
- **Bank Customers** (e.g., BNI) → Own machines
- **Vendors** (e.g., PT TAG, PT ADV) → Manage machines for banks
- **Vendor Users** → Field technicians with branch-level access

### Cassette Management (Core Focus)
- Track 5 cassettes per machine (4 RB + 1 AB)
- Spare cassette pool management
- Swap operation workflow (Vendor → RC → Spare Pool)
- Complete audit trail with serial number tracking
- Status lifecycle: INSTALLED → BROKEN → IN_TRANSIT → IN_REPAIR → SPARE_POOL

### Access Control
- **Vendor Users**: Can only see assigned machines/branches
- **RC Staff**: Manage cassettes in IN_TRANSIT/IN_REPAIR status
- **Super Admin**: Full system access
- Fine-grained permissions per role

### Machine Identification
- **IMMUTABLE Internal UUID** as primary identifier
- WSID as editable reference field (NOT unique)
- Complete change history tracking
- Supports bank-initiated ID changes without data loss

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- pnpm (recommended) or npm
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
cd hcm

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Setup database
cd ../backend
cp .env.example .env
# Edit .env with your database credentials
pnpm prisma migrate dev
pnpm prisma db seed

# Start development servers
pnpm run dev      # Backend on http://localhost:3000
cd ../frontend
pnpm run dev      # Frontend on http://localhost:3001
```

### Using Docker (Recommended)

```bash
docker-compose up -d
```

## 📊 Database Schema Highlights

### Core Tables
- `customers_banks` - Bank customers with contract details
- `vendors` - Third-party service companies
- `bank_vendor_assignments` - Many-to-many relationships
- `vendor_users` - Field technicians with branch assignments
- `hitachi_users` - Internal staff (Super Admin, RC Staff)
- `machines` - Asset tracking with immutable UUID
- `machine_identifier_history` - Change audit trail
- `cassette_types` - Master data (RB, AB, URJB)
- `cassettes` - Individual cassette tracking
- `repair_tickets` - RC repair workflow
- `problem_tickets` - Operational issue tracking

### Key Relationships
- One bank → Many vendors (via assignments)
- One vendor → Many banks (multi-tenant)
- One machine → Exactly 5 tracked cassettes (4 RB + 1 AB)
- One cassette → Many repair tickets (history)

## 🔐 User Roles

| Role | Organization | Permissions |
|------|-------------|-------------|
| `SUPER_ADMIN` | Hitachi | Full system access |
| `RC_MANAGER` | Hitachi | Manage repair operations |
| `RC_STAFF` | Hitachi | Execute cassette repairs |
| `VENDOR_ADMIN` | Vendor Company | Manage vendor users & machines |
| `VENDOR_SUPERVISOR` | Vendor Company | Monitor operations |
| `VENDOR_TECHNICIAN` | Vendor Company | Perform cassette swaps (branch-level) |

## 📱 API Endpoints (Preview)

```
POST   /auth/login
GET    /auth/me

GET    /banks
POST   /banks
GET    /banks/:id

GET    /vendors
POST   /vendors
GET    /vendors/:id/machines

GET    /machines
POST   /machines
GET    /machines/:id
PATCH  /machines/:id/wsid

POST   /cassettes/swap
GET    /cassettes/:id/history

GET    /repairs
POST   /repairs
PATCH  /repairs/:id/complete

GET    /tickets
POST   /tickets
```

## 🧪 Testing

```bash
# Backend unit tests
cd backend
pnpm test

# E2E tests
pnpm test:e2e

# Frontend tests
cd frontend
pnpm test
```

## 📦 Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 License

Proprietary - Hitachi Corporation

## 👥 Contributors

Developed for Hitachi by [Your Team]

---

**Status**: 🚧 In Active Development
**Version**: 0.1.0-alpha

