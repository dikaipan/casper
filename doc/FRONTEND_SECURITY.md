# 🔐 Frontend Security Implementation Guide

## Overview

This document explains how security features are implemented in the frontend, particularly the JWT refresh token flow and security best practices.

## JWT Refresh Token Flow

### How It Works

1. **Login**: User logs in and receives both `access_token` (15 min) and `refresh_token` (7 days)
2. **Token Storage**: Both tokens stored in `localStorage` (consider using `httpOnly` cookies in production)
3. **Auto-Refresh**: When access token expires (401 error), frontend automatically refreshes using refresh token
4. **Logout**: Refresh token is revoked on backend, all tokens cleared from storage

### Implementation Details

#### Auth Store (`frontend/src/store/authStore.ts`)

**State:**
- `token`: Access token (short-lived, 15 minutes)
- `refreshToken`: Refresh token (long-lived, 7 days)
- `user`: User information

**Methods:**
- `login()`: Stores both tokens after successful login
- `logout()`: Revokes refresh token on backend, clears all storage
- `refreshAccessToken()`: Manually refresh access token
- `loadUser()`: Loads user and tokens from localStorage on app start

#### API Interceptor (`frontend/src/lib/api.ts`)

**Auto-Refresh Mechanism:**
- Intercepts 401 (Unauthorized) responses
- Automatically attempts to refresh access token
- Queues failed requests and retries after refresh
- Prevents multiple simultaneous refresh attempts
- Redirects to login if refresh fails

**Request Queue:**
- If refresh is in progress, new 401 requests are queued
- After successful refresh, all queued requests are retried with new token
- Prevents race conditions and duplicate refresh calls

## Security Best Practices

### 1. Token Storage

**Current Implementation:**
- Tokens stored in `localStorage`
- Accessible via JavaScript (XSS risk)

**Production Recommendations:**
- Consider using `httpOnly` cookies for refresh tokens (requires backend changes)
- Use `sessionStorage` for access tokens (cleared on tab close)
- Implement token encryption for sensitive environments

### 2. Token Expiration Handling

**Automatic Refresh:**
- Access token expires after 15 minutes
- Frontend automatically refreshes when 401 detected
- User experience: Seamless, no interruption

**Manual Refresh:**
- Can call `refreshAccessToken()` from auth store
- Useful for proactive refresh before expiration

### 3. Logout Security

**Implementation:**
- Calls `/api/auth/logout` to revoke refresh token
- Clears all tokens from storage
- Prevents token reuse after logout

### 4. Error Handling

**401 Unauthorized:**
- Attempts automatic token refresh
- If refresh fails, redirects to login
- Clears all stored tokens

**Other Errors:**
- Passed through to component for handling
- No automatic token refresh

## Usage Examples

### Login Flow

```typescript
import { useAuthStore } from '@/store/authStore';

const { login } = useAuthStore();

try {
  await login(username, password);
  // Tokens automatically stored
  // User redirected to dashboard
} catch (error) {
  // Handle login error
}
```

### Logout Flow

```typescript
import { useAuthStore } from '@/store/authStore';

const { logout } = useAuthStore();

await logout();
// Refresh token revoked on backend
// All tokens cleared
// User redirected to login
```

### Manual Token Refresh

```typescript
import { useAuthStore } from '@/store/authStore';

const { refreshAccessToken } = useAuthStore();

const success = await refreshAccessToken();
if (success) {
  // Token refreshed
} else {
  // Refresh failed, user logged out
}
```

### Protected API Calls

```typescript
import api from '@/lib/api';

// Token automatically added to request
// Auto-refresh happens if token expired
const response = await api.get('/some-protected-endpoint');
```

## Security Considerations

### 1. XSS Protection

**Current:**
- Tokens in localStorage are vulnerable to XSS
- Input validation and sanitization on backend
- CSP headers help prevent XSS

**Recommendations:**
- Sanitize all user inputs
- Use Content Security Policy (CSP)
- Consider httpOnly cookies for refresh tokens

### 2. CSRF Protection

**Current:**
- JWT in Authorization header (not cookies) reduces CSRF risk
- CORS configured for allowed origins
- Origin/Referer validation on backend

**Note:** CSRF is less critical for JWT-based APIs since tokens are in headers, not cookies.

### 3. Token Theft Mitigation

**Measures:**
- Short-lived access tokens (15 min) limit exposure window
- Refresh tokens can be revoked
- Automatic cleanup of old refresh tokens
- Request ID tracking for security logging

### 4. Secure Storage

**Current:**
- `localStorage` for both tokens
- Accessible via JavaScript

**Production Options:**
- `sessionStorage` for access tokens (cleared on tab close)
- `httpOnly` cookies for refresh tokens (requires backend support)
- Encrypted storage for sensitive environments

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

## Troubleshooting

### Token Refresh Fails

**Symptoms:**
- User gets logged out unexpectedly
- 401 errors persist

**Possible Causes:**
- Refresh token expired (7 days)
- Refresh token revoked
- Network issues

**Solution:**
- User needs to login again
- Check browser console for errors
- Verify backend refresh endpoint is working

### Multiple Refresh Attempts

**Symptoms:**
- Multiple refresh API calls
- Race conditions

**Solution:**
- Request queue prevents duplicate refreshes
- Only one refresh happens at a time
- Other requests wait in queue

### Token Not Refreshing

**Symptoms:**
- 401 errors not triggering refresh
- User logged out on token expiration

**Check:**
- Verify refresh token exists in localStorage
- Check API interceptor is working
- Verify backend refresh endpoint

## Migration from Old Token System

If upgrading from single token system:

1. **Clear old tokens:**
   ```javascript
   localStorage.removeItem('token');
   ```

2. **Users need to login again** to get refresh tokens

3. **Update any custom token handling** to use new auth store methods

## Production Checklist

- [ ] Test auto-refresh flow thoroughly
- [ ] Verify logout revokes refresh token
- [ ] Test token expiration scenarios
- [ ] Verify request queue works correctly
- [ ] Test with multiple tabs/windows
- [ ] Consider httpOnly cookies for refresh tokens
- [ ] Implement token encryption if needed
- [ ] Set up monitoring for refresh token failures
- [ ] Document refresh token rotation policy

---

**Last Updated**: 2024
**Version**: 1.0

