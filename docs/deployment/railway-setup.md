# Railway Deployment Setup

## Prerequisites

1. Railway account with GitHub connected
2. PostgreSQL database added to your Railway project

## Environment Variables

Add these environment variables in your Railway service settings:

### Required Variables

```bash
# GitHub OAuth (from your GitHub OAuth App)
VITE_GITHUB_APP_ID=your_app_id
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_CLIENT_SECRET=your_client_secret

# Application URL (Railway provides this as RAILWAY_PUBLIC_DOMAIN)
VITE_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}

# Session Secret (generate a secure 32+ character string)
VITE_SESSION_SECRET=your-production-secret-at-least-32-characters-long

# Gel Database Configuration
# Use Railway's PostgreSQL DATABASE_URL
GEL_SERVER_BACKEND_DSN=${{Postgres.DATABASE_URL}}
# OR if Railway provides as DATABASE_URL:
# GEL_SERVER_BACKEND_DSN_ENV=DATABASE_URL

# Gel Instance Name
GEL_INSTANCE=maglev
```

### Optional Variables

```bash
# Railway API Token (for Railway GraphQL API access)
RAILWAY_API_TOKEN=your_railway_api_token
```

## PostgreSQL Setup

1. **Add PostgreSQL to your Railway project**:
   - In Railway dashboard, click "New Service"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically provides `DATABASE_URL`

2. **Connect Gel to PostgreSQL**:
   - Gel will automatically use the `GEL_SERVER_BACKEND_DSN` variable
   - The schema from `/dbschema/default.gel` will be applied

## Build Configuration

The `railway.toml` and `nixpacks.toml` files are already configured to:
- Use Node.js 22 with pnpm
- Run all code generation steps (`pnpm gen`)
- Build the React Router application
- Start the production server

## Post-Deployment Steps

1. **Update GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Update the Authorization callback URL to:
     ```
     https://your-app.railway.app/auth/callback
     ```

2. **Verify Database Connection**:
   - Check Railway deployment logs for successful Gel initialization
   - The app should connect to PostgreSQL through Gel

## Troubleshooting

### If Gel client generation fails:
- Ensure `GEL_SERVER_BACKEND_DSN` is set correctly
- Check that PostgreSQL service is running in Railway
- Verify the database URL format is correct

### If build fails on generated files:
- The build command runs `pnpm gen` to generate:
  - Panda CSS styles
  - React Router types
  - Graffle GraphQL client
  - Gel database client

### Connection issues:
- Verify all environment variables are set
- Check Railway logs for specific error messages
- Ensure PostgreSQL service is linked to your app service