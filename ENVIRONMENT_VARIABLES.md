# Environment Variables for Netlify

Add these in your Netlify dashboard under Site Settings → Environment Variables:

## Required Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hackwave?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-at-least-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-different-super-secret-refresh-key-make-it-different-from-jwt-secret
JWT_REFRESH_EXPIRE=30d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://hackroomfinlearn.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://hackroomfinlearn.netlify.app
```

## How to Set Environment Variables:

1. Go to your Netlify dashboard
2. Select your site (hackroomfinlearn)
3. Go to Site Settings → Environment Variables
4. Click "Add a variable" for each one above
5. After adding all variables, trigger a new deployment

## MongoDB Atlas Setup:

If you haven't set up MongoDB Atlas yet:

1. Go to https://mongodb.com/atlas
2. Create a free account and cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Netlify functions
5. Get your connection string and replace the MONGODB_URI above

## Security Notes:

- Generate strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Use a password generator for 32+ character random strings
- Never commit these secrets to your repository
- The CORS_ORIGIN should match your frontend URL exactly
