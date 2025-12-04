# Deployment Guide - Hitachi CRM Management System

## 📋 Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- pnpm (recommended) or npm
- Docker & Docker Compose (optional but recommended)

## 🚀 Quick Start with Docker (Recommended)

### 1. Setup Environment Variables

Create `.env` file in backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://hcm_user:hcm_password@postgres:5432/hcm_development?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="24h"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3001"
```

Create `.env.local` file in frontend directory:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Start All Services with Docker

From the root directory:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend on port 3001

### 3. Run Database Migrations and Seed

```bash
cd backend
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
```

### 4. Access the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## 🛠️ Manual Installation (Without Docker)

### 1. Install Dependencies

#### Backend
```bash
cd backend
pnpm install
# or
npm install
```

#### Frontend
```bash
cd frontend
pnpm install
# or
npm install
```

### 2. Setup PostgreSQL Database

Create a PostgreSQL database:
```sql
CREATE DATABASE hcm_development;
CREATE USER hcm_user WITH ENCRYPTED PASSWORD 'hcm_password';
GRANT ALL PRIVILEGES ON DATABASE hcm_development TO hcm_user;
```

### 3. Configure Environment Variables

Follow the same steps as in Docker setup above, but use `localhost` for database host:

```env
DATABASE_URL="postgresql://hcm_user:hcm_password@localhost:5432/hcm_development?schema=public"
```

### 4. Run Database Migrations

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma db seed
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
pnpm run start:dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
pnpm run dev
```

## 🔐 Default User Credentials

After seeding the database, you can login with:

**Hitachi Users:**
- Super Admin: `admin` / `admin123`
- RC Manager: `rc_manager` / `rcmanager123`
- RC Staff: `rc_staff_1` / `rcstaff123`

**Vendor Users:**
- TAG Admin: `tag_admin` / `vendor123`
- TAG Technician: `tag_tech1` / `vendor123`
- ADV Admin: `adv_admin` / `vendor123`

## 📦 Production Build

### Backend
```bash
cd backend
pnpm run build
pnpm run start:prod
```

### Frontend
```bash
cd frontend
pnpm run build
pnpm run start
```

## 🔧 Database Management

### Access Prisma Studio (Database GUI)
```bash
cd backend
pnpm prisma studio
```

This will open Prisma Studio at http://localhost:5555

### Create New Migration
```bash
cd backend
pnpm prisma migrate dev --name your_migration_name
```

### Reset Database (Development Only)
```bash
cd backend
pnpm prisma migrate reset
```

## 📊 API Testing

Access Swagger API documentation at:
http://localhost:3000/api/docs

All endpoints require authentication except `/api/auth/login`.

To test endpoints:
1. Login via `/api/auth/login` to get access token
2. Click "Authorize" button in Swagger UI
3. Enter: `Bearer YOUR_ACCESS_TOKEN`
4. Test any endpoint

## 🐳 Docker Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Rebuild images
docker-compose build

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npx prisma studio

# Remove all containers and volumes
docker-compose down -v
```

## 🔐 Security Checklist for Production

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (use `openssl rand -base64 32`)
- [ ] Enable SSL/TLS for database connections
- [ ] Configure CORS properly for production domain
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Setup proper logging and monitoring
- [ ] Regular database backups
- [ ] Keep dependencies updated

## 🌐 Production Deployment Options

### Option 1: Docker Compose (Simple)
Use the provided `docker-compose.prod.yml` for production deployment.

### Option 2: Kubernetes
Deploy using Kubernetes for better scalability and orchestration.

### Option 3: Cloud Platforms
- **Backend**: Deploy to AWS ECS, Google Cloud Run, or Azure Container Apps
- **Frontend**: Deploy to Vercel, Netlify, or AWS Amplify
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)

## 📞 Support

For issues and questions, please refer to the main README.md or contact the development team.

## 📝 Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL=             # PostgreSQL connection string
JWT_SECRET=               # Secret key for JWT signing
JWT_EXPIRATION=           # Token expiration time (e.g., "24h")
NODE_ENV=                 # development | production
PORT=                     # API server port (default: 3000)
CORS_ORIGIN=              # Allowed CORS origin
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=      # Backend API URL
```

## 🔄 Update & Maintenance

### Update Dependencies
```bash
# Backend
cd backend
pnpm update

# Frontend
cd frontend
pnpm update
```

### Database Backup
```bash
# Using pg_dump
pg_dump -h localhost -U hcm_user -d hcm_development > backup.sql

# Restore
psql -h localhost -U hcm_user -d hcm_development < backup.sql
```

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0

