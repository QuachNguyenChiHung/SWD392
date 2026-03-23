# Environment Variables Setup

## How Environment Variables Work in Vite

Vite uses `import.meta.env` to access environment variables. All environment variables must be prefixed with `VITE_` to be exposed to your client-side code.

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your actual values:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
   ```

3. **Restart the development server** after changing .env files:
   ```bash
   npm run dev
   ```

## Available Environment Variables

### `VITE_API_URL`
- **Description:** Backend API base URL
- **Default:** `http://localhost:3000/api`
- **Used in:** `src/services/api.ts`
- **Example:** `http://localhost:3000/api` or `https://api.yourdomain.com/api`

### `VITE_GOOGLE_CLIENT_ID`
- **Description:** Google OAuth Client ID for authentication
- **Used in:** `src/main.tsx`
- **How to get:** 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a project or select existing one
  3. Enable Google+ API
  4. Create OAuth 2.0 credentials
  5. Copy the Client ID

## Different Environments

You can create different .env files for different environments:

- `.env` - Default environment variables
- `.env.local` - Local overrides (not committed to git)
- `.env.development` - Development environment
- `.env.production` - Production environment

Priority order (highest to lowest):
1. `.env.[mode].local`
2. `.env.[mode]`
3. `.env.local`
4. `.env`

## Deployment

For production deployment, make sure to set these environment variables in your hosting platform:

### Vercel / Netlify
Add environment variables in the project settings dashboard.

### Docker
Pass environment variables using `-e` flag or docker-compose.yml:
```yaml
environment:
  - VITE_API_URL=https://api.production.com/api
  - VITE_GOOGLE_CLIENT_ID=prod-client-id
```

### Build Time vs Runtime
⚠️ **Important:** Vite environment variables are embedded at **build time**, not runtime. This means:
- You must set env vars before running `npm run build`
- Changing env vars after build requires rebuilding
- For runtime configuration, consider using a config.json file loaded at startup

## Troubleshooting

### Environment variables not working?

1. **Check the prefix:** Variables must start with `VITE_`
   ```env
   ✅ VITE_API_URL=http://localhost:3000
   ❌ API_URL=http://localhost:3000
   ```

2. **Restart dev server:** Changes to .env require restart
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

3. **Check the file location:** .env must be in the same directory as vite.config.ts
   ```
   SWD392Front/swd392/
   ├── .env              ✅ Correct location
   ├── vite.config.ts
   └── src/
       └── .env          ❌ Wrong location
   ```

4. **Verify in browser console:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```

5. **Check .gitignore:** Make sure .env is ignored to avoid committing secrets
   ```gitignore
   .env
   .env.local
   ```

## Security Notes

- ⚠️ Never commit `.env` files with real credentials to git
- ✅ Always commit `.env.example` with dummy values
- ⚠️ Remember: VITE_ variables are exposed to the client (visible in browser)
- ✅ Never put sensitive secrets (API keys, passwords) in VITE_ variables
- ✅ For sensitive data, use backend environment variables instead
