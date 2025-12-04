# 🔐 Security Documentation - Hitachi CRM Management System

## Overview

This document outlines the security measures implemented in the Hitachi CRM Management System to ensure data protection and prevent unauthorized access.

## Security Features Implemented

### 1. Authentication & Authorization

- **JWT-based Authentication**: Secure token-based authentication
- **JWT Refresh Tokens**: Long-lived refresh tokens (7 days) with short-lived access tokens (15 minutes)
- **Token Revocation**: Refresh tokens can be revoked and tracked in database
- **Role-Based Access Control (RBAC)**: Granular permissions based on user roles
- **Password Hashing**: Bcrypt with salt rounds (10) for password storage
- **Session Management**: Secure token rotation with refresh token mechanism

### 2. Password Policy

**Strong Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Implementation:**
- Custom validator: `IsStrongPassword()` decorator
- Applied to all user creation endpoints
- Validation error messages guide users to create secure passwords

### 3. Rate Limiting

**Protection Against:**
- Brute force attacks
- DDoS attacks
- API abuse

**Limits Configured:**
- **Short-term**: 10 requests per minute
- **Medium-term**: 100 requests per 10 minutes
- **Long-term**: 1000 requests per hour
- **Login Endpoint**: 5 attempts per minute (stricter)

### 4. Security Headers (Helmet)

**Headers Configured:**
- **Content Security Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS attack protection

### 5. Input Validation

**Validation Features:**
- **Whitelist Validation**: Only allowed properties are accepted
- **Forbid Non-Whitelisted**: Rejects unknown properties
- **Type Transformation**: Automatic type conversion
- **Error Message Hiding**: Production mode hides detailed errors

**Validation Pipes:**
- Global ValidationPipe with strict settings
- DTO-based validation using class-validator
- Custom validators for business rules

### 6. CORS Configuration

**Security Settings:**
- **Strict Origin Validation**: Only allowed origins can access API
- **Development Mode**: Allows localhost ports for development
- **Production Mode**: Only configured CORS_ORIGIN allowed
- **Credentials**: Enabled for authenticated requests
- **Max Age**: 24 hours for preflight cache

### 7. SQL Injection Prevention

**Protection:**
- **Prisma ORM**: Parameterized queries prevent SQL injection
- **No Raw SQL**: All queries go through Prisma
- **Type Safety**: TypeScript + Prisma ensure type safety

### 8. XSS Prevention

**Measures:**
- **Input Sanitization**: All user inputs are validated
- **Output Encoding**: Frontend handles output encoding
- **CSP Headers**: Content Security Policy restricts script execution

### 9. CSRF Protection

**Measures:**
- **Origin/Referer Validation**: Validates request origin in production mode
- **JWT-based Auth**: CSRF risk is minimal with JWT (stored in localStorage/memory, not cookies)
- **CORS Protection**: Additional layer of protection
- **Request ID Tracking**: Each request gets unique ID for security logging

**Implementation:**
- Custom CSRF Guard validates Origin/Referer headers in production
- GET/HEAD/OPTIONS requests are exempt (read-only operations)
- JWT in Authorization header provides inherent CSRF protection

**Note**: For JWT-based REST APIs, CSRF protection is less critical than cookie-based sessions. However, Origin/Referer validation provides additional security for state-changing operations.

### 10. JWT Refresh Token System

**Security Benefits:**
- **Short-lived Access Tokens**: 15 minutes expiration reduces risk if token is compromised
- **Long-lived Refresh Tokens**: 7 days expiration for better user experience
- **Token Rotation**: New access token generated on each refresh
- **Token Revocation**: Refresh tokens can be revoked and tracked in database
- **Automatic Cleanup**: Old refresh tokens are automatically revoked (keeps latest 5 per user)

**Endpoints:**
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Revoke refresh token on logout

**Token Storage:**
- Refresh tokens stored in database with expiration tracking
- Tokens can be revoked individually or all at once (e.g., on password change)
- Automatic cleanup of expired tokens

### 11. Security Logging

**Logged Events:**
- Login attempts (success/failure)
- Unauthorized access attempts
- Password changes
- Sensitive operations
- Security violations

**Log Format:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "event": "LOGIN_ATTEMPT",
  "username": "user@example.com",
  "ip": "192.168.1.1",
  "status": "SUCCESS|FAILED|BLOCKED",
  "reason": "Optional reason"
}
```

### 10. Environment Variables Security

**Best Practices:**
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT_SECRET
- Rotate secrets regularly
- Use different secrets for development and production

**Required Environment Variables:**
```env
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=            # Strong secret for access tokens (use: openssl rand -base64 32)
JWT_EXPIRATION=        # Access token expiration (default: "15m")
JWT_REFRESH_SECRET=    # Strong secret for refresh tokens (use: openssl rand -base64 32)
JWT_REFRESH_EXPIRATION= # Refresh token expiration (default: "7d")
NODE_ENV=              # "development" or "production"
PORT=                  # API server port
CORS_ORIGIN=           # Allowed frontend origin (production only)
```

## Security Checklist for Production

### Before Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET using: `openssl rand -base64 32`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to production frontend URL only
- [ ] Enable SSL/TLS for database connections
- [ ] Enable HTTPS for API server
- [ ] Review and update rate limiting thresholds
- [ ] Set up proper logging and monitoring
- [ ] Configure database backups
- [ ] Review user permissions and roles
- [ ] Disable Swagger documentation in production
- [ ] Set up security monitoring and alerts

### Ongoing Security

- [ ] Regular dependency updates (`npm audit`)
- [ ] Monitor security logs for suspicious activity
- [ ] Regular password policy enforcement
- [ ] User access reviews
- [ ] Security patch management
- [ ] Regular security audits
- [ ] Penetration testing (recommended annually)

## Security Best Practices

### For Developers

1. **Never log sensitive data** (passwords, tokens, personal information)
2. **Always validate and sanitize user input**
3. **Use parameterized queries** (Prisma handles this)
4. **Follow principle of least privilege** for user roles
5. **Keep dependencies updated** (`npm audit fix`)
6. **Review security logs regularly**
7. **Use HTTPS in production**
8. **Implement proper error handling** (don't expose internal errors)

### For System Administrators

1. **Regular backups** of database
2. **Monitor security logs** for anomalies
3. **Keep server OS updated**
4. **Use firewall rules** to restrict access
5. **Implement network segmentation**
6. **Regular security audits**
7. **Incident response plan**

## Security Incident Response

If a security incident is detected:

1. **Immediately** revoke affected user sessions
2. **Log** the incident with full details
3. **Notify** security team and management
4. **Investigate** the root cause
5. **Remediate** the vulnerability
6. **Document** lessons learned
7. **Update** security measures if needed

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **Contact** the security team directly
3. **Provide** detailed information about the vulnerability
4. **Allow** time for the team to address the issue
5. **Follow** responsible disclosure practices

## Compliance

This system is designed to comply with:
- **Data Protection Regulations**: User data is encrypted and access-controlled
- **Industry Standards**: Follows OWASP Top 10 security practices
- **Company Policies**: Adheres to Hitachi security policies

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

---

**Last Updated**: 2024
**Version**: 1.0

