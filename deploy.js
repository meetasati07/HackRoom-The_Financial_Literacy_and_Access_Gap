// Simple deployment script for HackWave
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting HackWave deployment...');

try {
  // Build frontend
  console.log('📦 Building frontend...');
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit' 
  });

  // Deploy to Netlify
  console.log('🌐 Deploying to Netlify...');
  execSync('netlify deploy --prod', { 
    cwd: __dirname,
    stdio: 'inherit' 
  });

  console.log('✅ Deployment completed successfully!');
  console.log('🔗 Your site should be available at: https://hackroomfinlearn.netlify.app');
  console.log('🔍 Test API health: https://hackroomfinlearn.netlify.app/.netlify/functions/api/health');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
