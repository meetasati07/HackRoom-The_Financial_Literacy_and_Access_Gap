// Test script for Money Management API

const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGUwNTI3ZGMyYThjZDU4MGU4OWUxM2QiLCJtb2JpbGUiOiI5NjU3MDM5MDc1IiwiaWF0IjoxNzU5NTY2OTQ5LCJleHAiOjE3NjAxNzE3NDl9.UE2M8E2NgwZEmgoUHFz5JmdI8dZu0spVT7tjyJSRSto';

async function testMoneyManagementAPI() {
  try {
    console.log('Testing Money Management API...');
    
    const response = await fetch(`${API_BASE_URL}/financial/money-management`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Response successful!');
      console.log('📊 Data structure:');
      console.log('- Monthly Income:', data.data?.monthlyIncome);
      console.log('- Total Spent:', data.data?.totalSpent);
      console.log('- Remaining Money:', data.data?.remainingMoney);
      console.log('- Spending Percentage:', data.data?.spendingPercentage);
      console.log('- Transaction Count:', data.data?.transactionCount);
      console.log('- Categories:', data.data?.categories?.length || 0);
      console.log('- Weekly Trends:', data.data?.weeklyTrends?.length || 0);
      
      if (data.data?.categories) {
        console.log('\n📈 Category Breakdown:');
        data.data.categories.forEach(cat => {
          console.log(`- ${cat.name}: ₹${cat.spent} / ₹${cat.limit} (${cat.percentage}%)`);
        });
      }
    } else {
      console.log('❌ API Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to start, then test
setTimeout(testMoneyManagementAPI, 5000);
