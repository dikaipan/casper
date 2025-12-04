# 📚 Penjelasan Blok Kode - HCM System

Dokumen ini menjelaskan struktur kode, arsitektur, dan komponen-komponen penting dalam aplikasi HCM (Hitachi Cassette Management) System.

---

## 📁 Struktur Proyek

### Backend (`backend/src/`)

```
backend/src/
├── analytics/          # Modul untuk analytics dan reporting
├── auth/              # Authentication & Authorization
│   ├── guards/        # JWT dan Local auth guards
│   ├── strategies/    # Passport strategies
│   └── dto/           # Data Transfer Objects untuk auth
├── banks/             # Manajemen Customer Bank
├── bank-customers/    # Manajemen Customer Bank (legacy)
├── cassettes/         # Manajemen Cassette
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators (@Roles, @CurrentUser)
│   ├── filters/       # Exception filters
│   ├── guards/        # Role guards, CSRF guards
│   ├── services/      # Logger, SecurityLogger
│   └── validators/    # Custom validators
├── data-management/   # Backup, restore, maintenance
├── import/            # Bulk import dari CSV/Excel
├── machines/          # Manajemen Machine
├── pengelola/         # Manajemen Pengelola (Vendor)
├── preventive-maintenance/  # Preventive maintenance
├── prisma/            # Prisma ORM service
├── repairs/           # Manajemen Repair Ticket
├── tickets/           # Manajemen Problem Ticket
├── users/             # Manajemen Users
├── app.module.ts      # Root module
└── main.ts            # Entry point aplikasi
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── app/               # Next.js App Router
│   ├── dashboard/     # Dashboard page
│   ├── tickets/       # Ticket management pages
│   ├── cassettes/     # Cassette management pages
│   ├── machines/      # Machine management pages
│   └── ...
├── components/        # React components
│   ├── layout/        # Layout components (Sidebar, Header)
│   ├── ui/           # UI components (Button, Table, etc)
│   └── ...
├── lib/              # Utilities & helpers
│   ├── api.ts        # Axios instance & API calls
│   └── store.ts      # Zustand store
└── ...
```

---

## 🏗️ Arsitektur Aplikasi

### 1. **Modular Architecture (NestJS)**

Aplikasi menggunakan **NestJS** dengan pola modular. Setiap fitur memiliki modul sendiri yang terdiri dari:

- **Module** (`*.module.ts`) - Mendefinisikan dependencies dan exports
- **Controller** (`*.controller.ts`) - Menangani HTTP requests
- **Service** (`*.service.ts`) - Business logic
- **DTO** (`dto/*.dto.ts`) - Data Transfer Objects untuk validasi

**Contoh: TicketsModule**

```typescript
@Module({
  imports: [PrismaModule],           // Import Prisma untuk database access
  controllers: [TicketsController],  // Controller untuk HTTP endpoints
  providers: [TicketsService],        // Service untuk business logic
  exports: [TicketsService],          // Export service untuk digunakan modul lain
})
export class TicketsModule {}
```

### 2. **Dependency Injection**

NestJS menggunakan Dependency Injection (DI) untuk mengelola dependencies.

**Contoh di Controller:**

```typescript
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService  // DI: NestJS inject service
  ) {}
}
```

**Contoh di Service:**

```typescript
@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,  // DI: Prisma service untuk database
    private logger: Logger,          // DI: Logger untuk logging
  ) {}
}
```

---

## 🔐 Authentication & Authorization

### 1. **Authentication Flow**

**File: `backend/src/auth/auth.service.ts`**

```typescript
// 1. User login dengan username & password
async login(user: any) {
  // 2. Generate JWT access token (15 menit)
  const accessToken = this.jwtService.sign({ ... });
  
  // 3. Generate refresh token (7 hari)
  const refreshToken = this.jwtService.sign({ ... }, { expiresIn: '7d' });
  
  // 4. Simpan refresh token ke database
  await this.prisma.hitachiUser.update({
    where: { id: user.id },
    data: { refreshToken }
  });
  
  return { accessToken, refreshToken };
}
```

**Flow:**
1. User mengirim `username` dan `password` ke `/auth/login`
2. `LocalAuthGuard` memvalidasi credentials
3. Jika valid, `AuthService.login()` dipanggil
4. Generate JWT tokens (access + refresh)
5. Refresh token disimpan di database
6. Return tokens ke client

### 2. **JWT Strategy**

**File: `backend/src/auth/strategies/jwt.strategy.ts`**

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    // Payload dari JWT token
    // Return user object yang akan di-attach ke request
    return {
      id: payload.sub,
      username: payload.username,
      userType: payload.userType,
      role: payload.role,
    };
  }
}
```

**Cara Kerja:**
- Setiap request dengan header `Authorization: Bearer <token>` akan divalidasi
- JWT token di-decode dan payload di-extract
- `validate()` method dipanggil untuk mendapatkan user info
- User object di-attach ke `req.user`

### 3. **Authorization (Role-Based Access Control)**

**File: `backend/src/common/decorators/roles.decorator.ts`**

```typescript
// Decorator untuk membatasi akses berdasarkan role
@Roles('RC_STAFF', 'RC_MANAGER')
@Get('repairs')
getRepairs() {
  // Hanya user dengan role RC_STAFF atau RC_MANAGER yang bisa akses
}
```

**File: `backend/src/common/guards/roles.guard.ts`**

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    // Cek apakah user memiliki role yang diperlukan
    return requiredRoles?.some(role => user.role === role) ?? true;
  }
}
```

**Cara Kerja:**
1. `@Roles()` decorator menambahkan metadata ke handler
2. `RolesGuard` membaca metadata dan memeriksa role user
3. Jika user tidak memiliki role yang diperlukan, return `403 Forbidden`

### 4. **User Type Restriction**

**File: `backend/src/common/decorators/roles.decorator.ts`**

```typescript
// Membatasi berdasarkan user type (HITACHI, PENGELOLA)
@AllowUserTypes(UserType.HITACHI)
@Post('repairs')
createRepair() {
  // Hanya user type HITACHI yang bisa akses
}
```

---

## 📊 Database & Prisma ORM

### 1. **Prisma Service**

**File: `backend/src/prisma/prisma.service.ts`**

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Connect ke database saat aplikasi start
    await this.$connect();
  }
  
  async onModuleDestroy() {
    // Disconnect saat aplikasi shutdown
    await this.$disconnect();
  }
}
```

**Cara Penggunaan:**

```typescript
@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}
  
  async findAll() {
    // Query menggunakan Prisma Client
    return this.prisma.problemTicket.findMany({
      include: {
        cassette: true,
        machine: true,
      },
    });
  }
}
```

### 2. **Database Transactions**

```typescript
// Menggunakan transaction untuk operasi yang harus atomic
await this.prisma.$transaction(async (tx) => {
  // 1. Create ticket
  const ticket = await tx.problemTicket.create({ ... });
  
  // 2. Update cassette status
  await tx.cassette.update({
    where: { id: cassetteId },
    data: { status: 'BAD' },
  });
  
  // 3. Create delivery
  await tx.cassetteDelivery.create({ ... });
  
  // Jika salah satu gagal, semua akan di-rollback
});
```

---

## 🎫 Tickets Module (Contoh Detail)

### 1. **Tickets Service**

**File: `backend/src/tickets/tickets.service.ts`**

**a. Create Ticket**

```typescript
async create(createDto: CreateTicketDto, userId: string, userType: string) {
  // 1. Validasi: Cek apakah cassette ada
  const cassette = await this.prisma.cassette.findUnique({
    where: { serialNumber: createDto.cassetteSerialNumber },
  });
  
  // 2. Validasi: Cek apakah cassette sudah memiliki active ticket
  const activeTicket = await this.prisma.problemTicket.findFirst({
    where: {
      cassetteId: cassette.id,
      status: { not: 'CLOSED' },
      deletedAt: null,
    },
  });
  
  // 3. Generate ticket number
  const ticketNumber = await this.generateTicketNumber();
  
  // 4. Tentukan initial status berdasarkan delivery method
  const initialStatus = createDto.deliveryMethod === 'COURIER' 
    ? 'IN_DELIVERY' 
    : 'OPEN';
  
  // 5. Create ticket dengan transaction
  return this.prisma.$transaction(async (tx) => {
    // Update cassette status
    await tx.cassette.update({
      where: { id: cassette.id },
      data: { status: 'BAD' },
    });
    
    // Create ticket
    const ticket = await tx.problemTicket.create({
      data: {
        ticketNumber,
        cassetteId: cassette.id,
        reportedBy: userId,
        status: initialStatus,
        ...createDto,
      },
    });
    
    // Create delivery jika method COURIER
    if (createDto.deliveryMethod === 'COURIER') {
      await tx.cassetteDelivery.create({
        data: {
          ticketId: ticket.id,
          cassetteId: cassette.id,
          trackingNumber: createDto.trackingNumber,
          ...deliveryData,
        },
      });
    }
    
    return ticket;
  });
}
```

**b. Soft Delete Ticket**

```typescript
async softDelete(id: string, userId: string, userType: string) {
  // 1. Cek apakah user memiliki permission (HITACHI only)
  if (userType !== 'HITACHI') {
    throw new ForbiddenException('Only Hitachi users can delete tickets');
  }
  
  // 2. Get ticket dengan relations
  const ticket = await this.prisma.problemTicket.findUnique({
    where: { id },
    include: {
      cassetteDetails: {
        include: { cassette: true },
      },
    },
  });
  
  // 3. Soft delete: Set deletedAt dan deletedBy
  await this.prisma.problemTicket.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
  
  // 4. Restore cassette status ke OK
  const cassetteIds = ticket.cassetteDetails.map(d => d.cassetteId);
  await this.prisma.cassette.updateMany({
    where: { id: { in: cassetteIds } },
    data: { status: 'OK' },
  });
  
  return { message: 'Ticket berhasil dihapus' };
}
```

### 2. **Tickets Controller**

**File: `backend/src/tickets/tickets.controller.ts`**

```typescript
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)  // Semua endpoint memerlukan JWT auth
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  
  @Get()
  @Throttle({ short: { limit: 60, ttl: 60000 } })  // Rate limiting: 60 req/min
  @ApiOperation({ summary: 'Get all problem tickets' })
  findAll(@Request() req, @Query() query) {
    // Extract user info dari JWT token (via JwtAuthGuard)
    return this.ticketsService.findAll(
      req.user.userType,
      req.user.pengelolaId,
      query.page,
      query.limit,
      query.search,
      query.status,
    );
  }
  
  @Post()
  @AllowUserTypes(UserType.PENGELOLA)  // Hanya PENGELOLA yang bisa create
  @ApiOperation({ summary: 'Create new problem ticket' })
  create(@Body() createDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(
      createDto,
      req.user.id,
      req.user.userType,
    );
  }
  
  @Delete(':id')
  @AllowUserTypes(UserType.HITACHI)
  @Roles('SUPER_ADMIN', 'RC_MANAGER')
  softDelete(@Param('id') id: string, @Request() req) {
    return this.ticketsService.softDelete(
      id,
      req.user.id,
      req.user.userType,
    );
  }
}
```

### 3. **DTO (Data Transfer Objects)**

**File: `backend/src/tickets/dto/create-ticket.dto.ts`**

```typescript
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  cassetteSerialNumber: string;  // Serial number cassette
  
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;  // Judul masalah
  
  @IsString()
  @IsOptional()
  description?: string;  // Deskripsi detail
  
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;  // LOW, MEDIUM, HIGH, CRITICAL
  
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;  // COURIER atau HAND_DELIVERY
  
  @IsString()
  @IsOptional()
  trackingNumber?: string;  // Nomor tracking jika COURIER
  
  // Validasi otomatis oleh class-validator
  // Jika data tidak valid, akan throw BadRequestException
}
```

---

## 🛡️ Security Features

### 1. **Rate Limiting**

**File: `backend/src/app.module.ts`**

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 60000,      // 1 menit
    limit: 30,       // Maksimal 30 requests per menit
  },
  {
    name: 'medium',
    ttl: 600000,     // 10 menit
    limit: 200,      // Maksimal 200 requests per 10 menit
  },
])
```

**Penggunaan di Controller:**

```typescript
@Throttle({ short: { limit: 5, ttl: 60000 } })  // Login: 5 attempts/min
@Post('login')
login() { ... }
```

### 2. **Security Headers (Helmet)**

**File: `backend/src/main.ts`**

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],      // Hanya load dari domain sendiri
      scriptSrc: ["'self'"],       // Hanya script dari domain sendiri
      styleSrc: ["'self'", "'unsafe-inline'"],  // CSS dari domain sendiri
    },
  },
  hsts: {
    maxAge: 31536000,  // Force HTTPS untuk 1 tahun
    includeSubDomains: true,
  },
}));
```

### 3. **Password Hashing**

**File: `backend/src/auth/auth.service.ts`**

```typescript
import * as bcrypt from 'bcrypt';

async createUser(createUserDto: CreateUserDto) {
  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
  return this.prisma.user.create({
    data: {
      ...createUserDto,
      password: hashedPassword,  // Password di-hash, tidak disimpan plain text
    },
  });
}

async validateUser(username: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { username } });
  
  // Compare password dengan hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  return user;
}
```

### 4. **Security Logging**

**File: `backend/src/common/services/security-logger.service.ts`**

```typescript
@Injectable()
export class SecurityLoggerService {
  logLoginAttempt(username: string, ip: string, status: 'SUCCESS' | 'FAILED') {
    // Log semua login attempts untuk audit trail
    this.logSecurityEvent('LOGIN_ATTEMPT', {
      username,
      ip,
      status,
      timestamp: new Date().toISOString(),
    });
  }
  
  logUnauthorizedAccess(userId: string, resource: string, ip: string) {
    // Log unauthorized access attempts
    this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
      userId,
      resource,
      ip,
      status: 'BLOCKED',
    });
  }
}
```

---

## 📝 Logging System

### 1. **AppLogger Service**

**File: `backend/src/common/services/logger.service.ts`**

```typescript
@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = new Logger();
  
  // Log biasa - hanya muncul di development
  log(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(message, context);
    }
  }
  
  // Error log - selalu muncul (penting untuk monitoring)
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }
  
  // Warning log - selalu muncul
  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }
  
  // Debug log - hanya di development
  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(message, context);
    }
  }
}
```

**Penggunaan di Service:**

```typescript
@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,  // NestJS Logger (built-in)
  ) {}
  
  async create(dto: CreateTicketDto) {
    this.logger.debug(`Creating ticket for cassette: ${dto.cassetteSerialNumber}`);
    
    try {
      // Business logic
      const ticket = await this.prisma.problemTicket.create({ ... });
      
      this.logger.log(`Ticket ${ticket.ticketNumber} created successfully`);
      return ticket;
    } catch (error) {
      this.logger.error(`Failed to create ticket`, error.stack);
      throw error;
    }
  }
}
```

---

## ⚠️ Error Handling

### 1. **Global Exception Filter**

**File: `backend/src/common/filters/http-exception.filter.ts`**

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    
    // Handle HttpException (400, 401, 403, 404, etc)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      
      return response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Handle Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      return response.status(400).json({
        statusCode: 400,
        message: 'Database error occurred',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Handle unknown errors
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Registrasi di `main.ts`:**

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

### 2. **Validation Pipe**

**File: `backend/src/main.ts`**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Hapus properties yang tidak ada di DTO
    forbidNonWhitelisted: true,  // Throw error jika ada property tambahan
    transform: true,        // Auto-transform ke DTO class
    transformOptions: {
      enableImplicitConversion: true,  // Auto-convert types
    },
  }),
);
```

**Contoh Error Response:**

```json
{
  "statusCode": 400,
  "message": [
    "cassetteSerialNumber should not be empty",
    "title must be longer than or equal to 5 characters"
  ],
  "error": "Bad Request"
}
```

---

## 🔄 Data Flow (Request → Response)

### Contoh: Create Ticket

```
1. Client Request
   POST /tickets
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: {
     cassetteSerialNumber: "ABC123",
     title: "Cassette Error",
     deliveryMethod: "COURIER"
   }

2. JwtAuthGuard
   - Validasi JWT token
   - Extract user info → req.user

3. RolesGuard
   - Cek apakah user memiliki permission
   - @AllowUserTypes(UserType.PENGELOLA)

4. ValidationPipe
   - Validasi body sesuai CreateTicketDto
   - Transform ke DTO instance

5. TicketsController.create()
   - Panggil ticketsService.create()

6. TicketsService.create()
   - Validasi business rules
   - Query database (Prisma)
   - Create ticket dengan transaction
   - Return result

7. Response
   {
     "id": "uuid",
     "ticketNumber": "TKT-2025-001",
     "status": "IN_DELIVERY",
     ...
   }
```

---

## 📦 Modul-Modul Utama

### 1. **Tickets Module**
- **Fungsi**: Manajemen Problem Ticket (Service Order)
- **Features**:
  - Create single/multi-cassette ticket
  - Update ticket status
  - Create delivery & return
  - Soft delete ticket
  - Statistics & reporting

### 2. **Repairs Module**
- **Fungsi**: Manajemen Repair Ticket
- **Features**:
  - Create repair ticket dari problem ticket
  - Update repair progress
  - Complete repair dengan QC
  - Repair statistics

### 3. **Cassettes Module**
- **Fungsi**: Manajemen Cassette
- **Features**:
  - CRUD cassette
  - Update status (OK, BAD, IN_REPAIR, etc)
  - Replace cassette
  - Mark broken

### 4. **Machines Module**
- **Fungsi**: Manajemen Machine
- **Features**:
  - CRUD machine
  - Update WSID
  - Machine statistics
  - Dashboard stats

### 5. **Pengelola Module**
- **Fungsi**: Manajemen Vendor/Pengelola
- **Features**:
  - CRUD pengelola
  - Manage pengelola users
  - Assignment ke banks

### 6. **Banks Module**
- **Fungsi**: Manajemen Customer Bank
- **Features**:
  - CRUD bank
  - Bank-vendor assignments
  - Contract management

### 7. **Data Management Module**
- **Fungsi**: Backup, restore, maintenance
- **Features**:
  - Create database backup
  - Restore dari backup
  - Database statistics
  - Maintenance (VACUUM, ANALYZE, REINDEX)

### 8. **Import Module**
- **Fungsi**: Bulk import data
- **Features**:
  - Import dari CSV/Excel
  - Import cassettes, machines, banks
  - Progress tracking

---

## 🎯 Best Practices yang Diterapkan

### 1. **Separation of Concerns**
- **Controller**: Hanya handle HTTP requests/responses
- **Service**: Business logic
- **DTO**: Data validation
- **Module**: Dependency management

### 2. **Error Handling**
- Global exception filter
- Specific error types (NotFoundException, BadRequestException)
- Proper error messages

### 3. **Security**
- JWT authentication
- Role-based authorization
- Password hashing
- Rate limiting
- Security headers
- Input validation

### 4. **Logging**
- Structured logging
- Debug logs hanya di development
- Error logs selalu aktif
- Security event logging

### 5. **Database**
- Transactions untuk operasi atomic
- Soft delete untuk data integrity
- Proper indexes untuk performance
- Query optimization (select vs include)

### 6. **Code Quality**
- TypeScript untuk type safety
- DTO untuk validation
- Decorators untuk metadata
- Dependency injection untuk testability

---

## 📖 Referensi

- **NestJS Documentation**: https://docs.nestjs.com/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **JWT**: https://jwt.io/
- **TypeScript**: https://www.typescriptlang.org/

---

**Last Updated**: 2025-11-28
**Version**: 1.0.0

