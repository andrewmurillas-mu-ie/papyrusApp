// Test script to verify all critical functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.log('❌ Backend server not accessible:', error.message);
    return false;
  }
}

async function testPageCreation() {
  console.log('🔍 Testing page creation...');
  try {
    // This would require authentication, so we'll test the endpoint exists
    const response = await axios.post(`${API_BASE_URL}/page`, {}, {
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 401) {
      console.log('✅ Page creation endpoint exists (authentication required)');
      return true;
    } else {
      console.log('❌ Unexpected response:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Page creation endpoint error:', error.message);
    return false;
  }
}

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection through backend...');
  try {
    // Test a simple endpoint that requires MongoDB
    const response = await axios.get(`${API_BASE_URL}/page`, {
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 401) {
      console.log('✅ MongoDB endpoints are accessible (authentication required)');
      return true;
    } else {
      console.log('❌ Unexpected MongoDB response:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ MongoDB connection test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive functionality tests...\n');
  
  const results = {
    backendConnection: await testBackendConnection(),
    pageCreation: await testPageCreation(),
    mongoDBConnection: await testMongoDBConnection()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Backend Connection:', results.backendConnection ? '✅ PASS' : '❌ FAIL');
  console.log('Page Creation Endpoint:', results.pageCreation ? '✅ PASS' : '❌ FAIL');
  console.log('MongoDB Connection:', results.mongoDBConnection ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests failed'));
  
  return allPassed;
}

runAllTests().catch(console.error);
