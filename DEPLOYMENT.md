# HackWave Netlify Deployment Guide

This guide will help you deploy the HackWave FinTech application to Netlify with full-stack functionality.

## 🏗️ Architecture Overview

- **Frontend**: React app deployed as static site on Netlify
- **Backend**: Express.js API converted to Netlify serverless functions
- **Database**: MongoDB Atlas (cloud database)

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Git Repository**: Push your code to GitHub/GitLab

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create a new project and cluster (free tier available)
   - Choose a cloud provider and region

2. **Configure Database Access**:
   - Go to "Database Access" → "Add New Database User"
   - Create a user with read/write permissions
   - Note down the username and password

3. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` to allow access from anywhere (for Netlify functions)

4. **Get Connection String**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string (replace `<password>` with your actual password)

## 🚀 Netlify Deployment

### Step 1: Deploy to Netlify

1. **Connect Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub/GitLab repository
   - Select the HackWave repository

2. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

3. **Deploy Site**:
   - Click "Deploy site"
   - Wait for initial deployment (may fail due to missing environment variables)

### Step 2: Configure Environment Variables

In your Netlify site dashboard, go to "Site settings" → "Environment variables" and add:

#### Required Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hackwave?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-make-it-different
JWT_REFRESH_EXPIRE=30d
BCRYPT_ROUNDS=12
FRONTEND_URL=https://your-site-name.netlify.app
```

#### Important Notes:
- Replace `username:password` in MONGODB_URI with your actual MongoDB credentials
- Replace `cluster` with your actual cluster name
- Generate strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Replace `your-site-name` with your actual Netlify site name

### Step 3: Configure Functions

1. **Enable Functions**:
   - In Netlify dashboard, go to "Functions"
   - Functions should be automatically detected from `netlify.toml`

2. **Install Function Dependencies**:
   - The build process will automatically install dependencies from `netlify/functions/package.json`

### Step 4: Update Site Settings

1. **Custom Domain** (Optional):
   - Go to "Domain settings" → "Add custom domain"
   - Follow instructions to configure your domain

2. **HTTPS**:
   - Netlify automatically provides HTTPS
   - Ensure "Force HTTPS" is enabled

## 🔧 Local Development with Production Setup

To test the production configuration locally:

1. **Install Dependencies**:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install function dependencies
   cd ../netlify/functions
   npm install
   ```

2. **Set Environment Variables**:
   Create `.env` file in the root directory with the same variables as above

3. **Run Netlify Dev**:
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli
   
   # Run local development server
   netlify dev
   ```

## 🔍 Testing the Deployment

1. **Health Check**:
   - Visit: `https://your-site-name.netlify.app/.netlify/functions/api/health`
   - Should return: `{"status": "OK", "message": "HackWave API is running on Netlify"}`

2. **Frontend**:
   - Visit: `https://your-site-name.netlify.app`
   - Test user registration and login
   - Verify all features work correctly

3. **API Endpoints**:
   - Authentication: `/.netlify/functions/api/auth/register`
   - User Profile: `/.netlify/functions/api/users/profile`
   - Financial Data: `/.netlify/functions/api/financial/*`

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are listed in package.json
   - Verify environment variables are set

2. **Function Errors**:
   - Check function logs in Netlify dashboard
   - Verify MongoDB connection string is correct
   - Ensure all required environment variables are set

3. **CORS Issues**:
   - Verify frontend URL is added to CORS origins in `netlify/functions/api.ts`
   - Update `FRONTEND_URL` environment variable

4. **Database Connection Issues**:
   - Verify MongoDB Atlas network access allows `0.0.0.0/0`
   - Check database user permissions
   - Ensure connection string is correct

### Debugging Steps:

1. **Check Netlify Function Logs**:
   - Go to Netlify dashboard → Functions → View logs
   - Look for error messages and stack traces

2. **Test API Endpoints**:
   - Use tools like Postman or curl to test API endpoints
   - Check response status codes and error messages

3. **Monitor Database**:
   - Use MongoDB Atlas monitoring to check connection attempts
   - Verify queries are being executed

## 📚 Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secrets**: Use long, random strings for production
3. **Database Access**: Restrict IP access when possible
4. **HTTPS**: Always use HTTPS in production (automatic with Netlify)
5. **CORS**: Configure CORS origins to match your domain

## 📞 Support

If you encounter issues during deployment, check:
1. Netlify build logs
2. Function execution logs
3. MongoDB Atlas logs
4. Browser developer console for frontend errors
