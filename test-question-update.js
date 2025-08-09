// Simple test script to verify question update functionality
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_QUESTION_ID = 'your-question-id-here'; // Replace with actual question ID
const TEST_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

// Test data
const testQuestionData = {
  title: 'Test Question Updated',
  description: 'This is a test question that has been updated',
  tags: ['test', 'update', 'verification'],
  difficulty: 'Medium',
  testCases: [
    {
      input: '5\n1 2 3 4 5',
      output: '15',
      visibility: 'Public'
    },
    {
      input: '3\n10 20 30',
      output: '60',
      visibility: 'Private'
    }
  ]
};

async function testQuestionUpdate() {
  console.log('Testing question update functionality...');
  
  try {
    // Test 1: Valid update
    console.log('\n1. Testing valid question update...');
    const response = await axios.put(
      `${BASE_URL}/questions/${TEST_QUESTION_ID}`,
      testQuestionData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Valid update successful:', response.data.message);
    
    // Test 2: Missing required fields
    console.log('\n2. Testing missing required fields...');
    try {
      await axios.put(
        `${BASE_URL}/questions/${TEST_QUESTION_ID}`,
        { ...testQuestionData, title: '' },
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.log('✅ Missing field validation works:', error.response.data.error);
    }
    
    // Test 3: Invalid test case format
    console.log('\n3. Testing invalid test case format...');
    try {
      await axios.put(
        `${BASE_URL}/questions/${TEST_QUESTION_ID}`,
        { ...testQuestionData, testCases: [{ input: '', output: '' }] },
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.log('✅ Invalid test case validation works:', error.response.data.error);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testQuestionUpdate();
}

module.exports = { testQuestionUpdate };
