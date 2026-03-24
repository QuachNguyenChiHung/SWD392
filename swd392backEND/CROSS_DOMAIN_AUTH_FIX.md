# Cross-Domain Authentication Fix

## Problem
When frontend and backend are deployed on different domains, authentication was failing because:

1. **CORS errors** - Backend CORS wasn't configured for production frontend URL
2. **Cookie issues** - Cookies don't work reliably cross-domain even with `sameSite: "none"` and `secure: true`
3. **Middleware only checking cookies** - All authentication methods were only reading `req.signedCookies.Authorization`, ignoring the `Authorization` header

## Solution Applied

### 1. Updated `verifyRole.ts` Middleware
Added a helper method `getToken()` that checks both:
- **Authorization header** (primary for cross-domain) - `req.headers.authorization`
- **Signed cookies** (fallback for same-domain) - `req.signedCookies.Authorization`

All verify methods now use `this.getToken(req)` instead of directly accessing cookies:
- `verifyAdmin()`
- `verifyAdminOrModerator()`
- `verifyTeacher()`
- `verifyUser()`
- `verifyModerator()`
- `verifyStudent()`

### 2. Updated `UserController.ts`
Fixed methods that were only checking cookies:
- `getUserInfo()` - The `/me` endpoint (line 293)
- `updateSelf()` - The profile update endpoint (line 190)

Both now check Authorization header first, then fall back to cookies.

### 3. Updated `DashboardController.ts`
Fixed `getDashboard()` method to check Authorization header first.

### 4. Frontend Already Configured
The frontend API service (`api.ts`) already sends the token in the Authorization header:
```typescript
config.headers.Authorization = `Bearer ${token}`;
```

### 5. Backend Cookie Settings
Both `loginUser` and `googleLogin` set cookies with:
```typescript
{
  secure: true,        // HTTPS only
  sameSite: "none",    // Allow cross-domain
  httpOnly: true,      // Security
  signed: true         // Tamper protection
}
```

## Deployment Checklist

### Backend Environment Variables
Set these on your backend deployment:
```env
FE=https://your-frontend-domain.com
MONGO_URI=your-mongodb-connection-string
COOKIE_KEY=your-secure-cookie-key
PORT=3000
```

### Frontend Environment Variables
Create `.env.production` or set in your deployment:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### CORS Configuration
The backend CORS is configured to allow the frontend URL from `process.env.FE`:
```typescript
app.use(cors({
    origin: [
        process.env.FE || 'http://localhost:5173',
        `http://localhost:${process.env.PORT || 3000}`,
    ],
    credentials: true
}));
```

## How It Works Now

1. User logs in → Backend returns `{ token: "..." }`
2. Frontend stores token in localStorage
3. Frontend sends token in `Authorization: Bearer <token>` header on every request
4. Backend checks header first (for cross-domain), then falls back to cookies (for same-domain)
5. Authentication works across different domains ✓

## Files Modified

1. `src/ultis/verifyRole.ts` - Added `getToken()` helper, updated all 6 verify methods
2. `src/controller/UserController.ts` - Updated `getUserInfo()` and `updateSelf()`
3. `src/controller/DashboardController.ts` - Updated `getDashboard()`

## Testing

1. Deploy backend with correct `FE` environment variable
2. Deploy frontend with correct `VITE_API_URL`
3. Login should work and subsequent API calls should be authenticated
4. Check browser console for any CORS errors
5. Verify token is being sent in request headers (Network tab)
6. Test all protected endpoints (dashboard, profile, etc.)
