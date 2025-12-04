# 🔐 Login Guide - HCM System

## ✅ Migration Complete!

Semua perubahan dari "Vendor" ke "Pengelola" sudah selesai:
- ✅ Frontend: 18 files updated
- ✅ Backend: 33 files updated  
- ✅ Database: Tables & enums renamed
- ✅ Build: Successful
- ✅ Seed: Database populated

---

## 🚀 How to Start

### 1. Backend (if not running)
```bash
cd backend
npm run start:dev
```
Wait until you see: `Application is running on: http://localhost:3001`

### 2. Frontend (if not running)
```bash
cd frontend
npm run dev
```
Access at: `http://localhost:3000`

---

## 👤 Login Credentials

### HITACHI Users (Super Admin)
```
Username: admin
Password: admin123
Role: Super Admin
```

```
Username: rc_manager
Password: rcmanager123
Role: RC Manager
```

```
Username: rc_staff_1
Password: rcstaff123
Role: RC Staff
```

### PENGELOLA Users (Vendor/Service Provider)
```
Username: tag_admin
Password: vendor123
Company: PT TAG Indonesia
```

```
Username: tag_tech1
Password: vendor123
Company: PT TAG Indonesia
Role: Technician
```

```
Username: adv_admin
Password: vendor123
Company: PT ADV Services
```

---

## 🔍 Troubleshooting

### "Cannot connect to server" / "Network Error"
1. **Check backend is running**
   - Look for backend PowerShell window
   - Should show: `Application is running on: http://localhost:3001`

2. **Check port**
   - Backend: http://localhost:3001/api
   - Frontend: http://localhost:3000

3. **Restart backend if needed**
   ```bash
   cd backend
   npm run start:dev
   ```

### "Invalid credentials"
1. **Make sure you typed correctly:**
   - Username: `admin` (lowercase, no spaces)
   - Password: `admin123` (no spaces)

2. **Check database was seeded:**
   ```bash
   cd backend
   npx ts-node prisma/seed.ts
   ```

3. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cookies and cache
   - Try again

### "User not found" / "Unauthorized"
1. **Open browser console (F12)**
   - Check Network tab for API calls
   - Look for red errors

2. **Check API endpoint:**
   - Should POST to: `http://localhost:3001/api/auth/login`

3. **Verify database:**
   ```bash
   cd backend
   npx ts-node scripts/check-seed-data.ts
   ```

---

## 📋 Migration Changes Summary

### Database Tables Renamed:
- `vendors` → `pengelola`
- `vendor_users` → `pengelola_users`  
- `bank_vendor_assignments` → `bank_pengelola_assignments`

### Enums Updated:
- `UserType.VENDOR` → `UserType.PENGELOLA`
- `VendorUserRole` → `PengelolaUserRole`
- `IN_TRANSIT_TO_VENDOR` → `IN_TRANSIT_TO_PENGELOLA`
- `VENDOR_LOCATION` → `PENGELOLA_LOCATION`

### API Endpoints Changed:
- `/api/vendors` → `/api/pengelola`
- `/api/vendors/:id` → `/api/pengelola/:id`
- `/api/vendors/:id/users` → `/api/pengelola/:id/users`

---

## 🎯 Test Login

1. **Start both servers** (backend + frontend)
2. **Open browser:** http://localhost:3000
3. **Login with:** `admin` / `admin123`
4. **You should see:** Dashboard with sidebar menu
5. **Test navigation:** Try accessing different pages
6. **Check "Pengelola" menu:** Should work (was "Vendors")

---

## ⚡ Quick Commands

### Check if services are running:
```bash
# Check backend
curl http://localhost:3001/api

# Check frontend  
curl http://localhost:3000
```

### Re-seed database (if needed):
```bash
cd backend
npx prisma migrate reset --force
npx ts-node prisma/seed.ts
```

### Rebuild everything (if corrupted):
```bash
# Backend
cd backend
rm -rf node_modules .next dist
npm install
npm run build

# Frontend
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

---

## ✅ Expected Behavior After Login

### As HITACHI User (admin):
- Can access all menus
- Can see "Administration" group:
  - Users
  - Banks
  - **Pengelola** ✨ (new name!)
  - Assignments
  - Data Management
  - Bulk Import
- Can manage all data

### As PENGELOLA User (tag_admin):
- Limited menu access
- Can only see assigned banks
- Can request PM
- Can create tickets
- Cannot access Administration menu

---

## 📞 Need Help?

If login still doesn't work:

1. **Take screenshot of:**
   - Browser console (F12 → Console tab)
   - Network tab (F12 → Network tab, filter: Fetch/XHR)
   - Error message on screen

2. **Check backend logs:**
   - Look at the backend PowerShell window
   - Copy any red error messages

3. **Verify environment:**
   - Node version: `node -v` (should be 18+)
   - Port 3000 free: Frontend
   - Port 3001 free: Backend

---

**Last Updated:** Sunday, November 23, 2025
**Migration Status:** ✅ COMPLETE
**Build Status:** ✅ SUCCESS
**Database:** ✅ SEEDED

