# API Documentation - Hitachi CRM Management System

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints (except login) require JWT authentication via Bearer token.

### Headers
```http
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

## Authentication Endpoints

### POST /auth/login
Login to get access token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@hitachi.co.jp",
    "fullName": "Hitachi Super Admin",
    "role": "SUPER_ADMIN",
    "userType": "HITACHI"
  }
}
```

### GET /auth/profile
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "username": "admin",
  "email": "admin@hitachi.co.jp",
  "fullName": "Hitachi Super Admin",
  "role": "SUPER_ADMIN",
  "userType": "HITACHI",
  "department": "MANAGEMENT"
}
```

## Bank Management Endpoints

### GET /banks
Get all banks.

**Access**: All authenticated users

**Response:**
```json
[
  {
    "id": "uuid",
    "bankCode": "BNI",
    "bankName": "PT Bank Negara Indonesia (Persero) Tbk",
    "bankAbbreviation": "BNI",
    "contractNumber": "CNT-BNI-2024-001",
    "status": "ACTIVE",
    "vendorAssignments": [...],
    "_count": {
      "machines": 2,
      "cassettes": 13
    }
  }
]
```

### GET /banks/:id
Get bank by ID with full details.

### GET /banks/:id/statistics
Get bank statistics (machines, cassettes, etc).

### POST /banks
Create new bank (Super Admin only).

### PATCH /banks/:id
Update bank (Super Admin only).

### DELETE /banks/:id
Delete bank (Super Admin only).

## Vendor Management Endpoints

### GET /vendors
Get all vendors.

### GET /vendors/:id
Get vendor by ID.

### GET /vendors/:id/users
Get all users of a vendor.

### GET /vendors/:id/machines
Get all machines assigned to a vendor.

**Note**: Vendor technicians only see machines in their assigned branches.

### POST /vendors
Create new vendor (Super Admin only).

### POST /vendors/:id/users
Create new vendor user (Admins only).

**Request Body:**
```json
{
  "username": "tech1",
  "email": "tech1@vendor.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "TECHNICIAN",
  "assignedBranches": ["BNI-JKT-SUDIRMAN", "BNI-JKT-THAMRIN"]
}
```

## Machine Management Endpoints

### GET /machines
Get all machines (filtered by user permissions).

**Vendor Technicians**: Only see machines in assigned branches.
**Vendor Admins**: See all vendor machines.
**Hitachi Users**: See all machines.

### GET /machines/:id
Get machine by ID with full details.

### GET /machines/:id/statistics
Get machine statistics.

### GET /machines/:id/identifier-history
Get machine identifier change history (WSID changes).

### POST /machines
Create new machine (Super Admin only).

### PATCH /machines/:id
Update machine (Super Admin only).

### PATCH /machines/:id/wsid
Update machine WSID (tracked in history).

**Request Body:**
```json
{
  "newWsid": "WS-BNI-JKT-002",
  "reason": "Bank restructured branch codes"
}
```

### DELETE /machines/:id
Delete machine (Super Admin only).

## Cassette Management Endpoints

### GET /cassettes
Get all cassettes (filtered by user permissions).

### GET /cassettes/:id
Get cassette by ID with full history.

### GET /cassettes/spare-pool/:bankId
Get available spare cassettes for a bank.

### GET /cassettes/statistics/:bankId
Get cassette statistics for a bank.

### GET /cassettes/:id/swap-history
Get cassette swap history.

### POST /cassettes
Create new cassette (Super Admin only).

### POST /cassettes/swap
Perform cassette swap (Vendor Technicians only).

**Request Body:**
```json
{
  "brokenCassetteId": "uuid",
  "spareCassetteId": "uuid",
  "reason": "Cassette jammed and not accepting bills",
  "notes": "Machine operational after swap"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cassette swap completed successfully",
  "brokenCassette": {...},
  "installedCassette": {...}
}
```

### PATCH /cassettes/:id/mark-broken
Mark installed cassette as broken.

## Repair Center Endpoints

### GET /repairs
Get all repair tickets (RC Staff only).

### GET /repairs/:id
Get repair ticket by ID.

### GET /repairs/statistics
Get repair statistics.

### POST /repairs
Create repair ticket when cassette arrives at RC.

**Request Body:**
```json
{
  "cassetteId": "uuid",
  "reportedIssue": "Cassette jammed - sensor belt broken",
  "notes": "Physical damage visible on sensor unit"
}
```

### PATCH /repairs/:id
Update repair ticket.

### POST /repairs/:id/complete
Complete repair and perform QC.

**Request Body:**
```json
{
  "repairActionTaken": "Replaced sensor belt and recalibrated unit",
  "partsReplaced": ["Sensor Belt Model SB-100", "Roller Kit RK-50"],
  "qcPassed": true
}
```

**Effect:**
- If `qcPassed: true` → Cassette returns to SPARE_POOL
- If `qcPassed: false` → Cassette is SCRAPPED

## Problem Ticket Endpoints

### GET /tickets
Get all problem tickets (filtered by user permissions).

### GET /tickets/:id
Get ticket by ID.

### GET /tickets/statistics
Get ticket statistics.

### POST /tickets
Create new problem ticket.

**Request Body:**
```json
{
  "machineId": "uuid",
  "title": "Machine not accepting bills",
  "description": "Customer reported error E101",
  "priority": "HIGH",
  "affectedComponents": ["Cassette RB-1", "Sensor Unit"]
}
```

### PATCH /tickets/:id
Update ticket.

### POST /tickets/:id/close
Close ticket with resolution notes.

## Status Enums Reference

### Machine Status
- `OPERATIONAL` - Machine is working normally
- `MAINTENANCE` - Under scheduled maintenance
- `DECOMMISSIONED` - No longer in service
- `UNDER_REPAIR` - Currently being repaired

### Cassette Status
- `INSTALLED` - Currently installed in a machine
- `SPARE_POOL` - Available as spare for swaps
- `BROKEN` - Identified as broken, awaiting removal
- `IN_TRANSIT_TO_RC` - Removed from machine, being sent to RC
- `IN_REPAIR` - At Repair Center being repaired
- `SCRAPPED` - Failed QC, no longer usable

### User Roles

**Hitachi Users:**
- `SUPER_ADMIN` - Full system access
- `RC_MANAGER` - Manage repair operations
- `RC_STAFF` - Execute repairs

**Vendor Users:**
- `ADMIN` - Manage vendor operations
- `SUPERVISOR` - Monitor operations
- `TECHNICIAN` - Field operations (branch-level access)

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Resource already exists"
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production, it's recommended to add rate limiting middleware.

## Pagination

Pagination is not yet implemented. All list endpoints return full datasets. For production with large datasets, implement pagination.

## Interactive Documentation

Access the interactive Swagger UI documentation at:
```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing

---

**Version**: 1.0.0
**Last Updated**: 2025-01-18

