# Environment Variables Setup for Netlify

## Required Environment Variables

Add these in your Netlify dashboard under **Site Settings → Environment Variables**:

### Database & Authentication
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hackwave?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-make-it-at-least-32-characters-long
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-different-super-secret-refresh-key-32-chars
JWT_REFRESH_EXPIRE=30d
BCRYPT_ROUNDS=12
```

### CORS & Frontend
```
FRONTEND_URL=https://hackroomfinlearn.netlify.app
CORS_ORIGIN=https://hackroomfinlearn.netlify.app
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## MongoDB Atlas Setup

1. Go to https://mongodb.com/atlas
2. Create a free cluster
3. Create a database user with read/write permissions
4. Whitelist all IPs (0.0.0.0/0) for Netlify functions
5. Get your connection string and replace the MONGODB_URI above

## Security Notes

- Generate strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Use a password generator for 32+ character random strings
- Never commit these secrets to your repository

## After Setting Environment Variables

1. Trigger a new deployment in Netlify
2. Test the API health endpoint: `/.netlify/functions/api/health`
3. Test authentication endpoints: `/.netlify/functions/api/auth/register`
