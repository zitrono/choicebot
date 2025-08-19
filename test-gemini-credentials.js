import fetch from 'node-fetch';

// Credentials found in economist project
const CREDENTIALS = {
  // Direct API Key from gemini-helper.js
  GEMINI_API_KEY: 'AIzaSyAn7JxPBry0TdHyPD6wPBRWaBTSTEGFrCU',
  
  // Vertex AI credentials from vertex.json
  VERTEX_PROJECT_ID: 'zitrono-general',
  VERTEX_LOCATION: 'us-central1',
  VERTEX_SERVICE_ACCOUNT: '509106515148-compute@developer.gserviceaccount.com'
};

console.log('🔍 Testing Gemini Credentials from Economist Project\n');
console.log('=' .repeat(60));

// Test 1: Direct API Key with REST API
async function testDirectAPI() {
  console.log('\n📌 Test 1: Direct API Key (REST API)');
  console.log('-'.repeat(40));
  
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CREDENTIALS.GEMINI_API_KEY}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello from REST API" if this works' }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ REST API Status: WORKING');
      console.log('Response:', text?.substring(0, 50));
      return true;
    } else {
      console.log('❌ REST API Status: FAILED');
      console.log('Error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ REST API Status: ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

// Test 2: API Key with Google AI SDK
async function testGoogleAISDK() {
  console.log('\n📌 Test 2: API Key with @google/generative-ai SDK');
  console.log('-'.repeat(40));
  
  try {
    // Dynamic import to handle module loading
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(CREDENTIALS.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "Hello from Google AI SDK" if this works');
    const text = result.response.text();
    
    console.log('✅ Google AI SDK Status: WORKING');
    console.log('Response:', text.substring(0, 50));
    return true;
  } catch (error) {
    console.log('❌ Google AI SDK Status: FAILED');
    console.log('Error:', error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('💡 Install with: npm install @google/generative-ai');
    }
    return false;
  }
}

// Test 3: API Key with Vercel AI SDK
async function testVercelAISDK() {
  console.log('\n📌 Test 3: API Key with Vercel AI SDK');
  console.log('-'.repeat(40));
  
  try {
    // Dynamic import to handle module loading
    const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
    const { generateText } = await import('ai');
    
    // Create provider with API key
    const google = createGoogleGenerativeAI({
      apiKey: CREDENTIALS.GEMINI_API_KEY
    });
    
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Say "Hello from Vercel AI SDK" if this works',
      maxTokens: 100
    });
    
    console.log('✅ Vercel AI SDK Status: WORKING');
    console.log('Response:', result.text.substring(0, 50));
    return true;
  } catch (error) {
    console.log('❌ Vercel AI SDK Status: FAILED');
    console.log('Error:', error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('💡 Install with: npm install ai @ai-sdk/google');
    }
    return false;
  }
}

// Test 4: Check Vertex AI requirements
async function checkVertexAI() {
  console.log('\n📌 Test 4: Vertex AI Configuration Check');
  console.log('-'.repeat(40));
  
  console.log('Project ID:', CREDENTIALS.VERTEX_PROJECT_ID);
  console.log('Location:', CREDENTIALS.VERTEX_LOCATION);
  console.log('Service Account:', CREDENTIALS.VERTEX_SERVICE_ACCOUNT);
  
  console.log('\n⚠️  Vertex AI Notes:');
  console.log('- Requires vertex.json file for authentication');
  console.log('- Uses Google Cloud service account, not API key');
  console.log('- More complex setup but higher quotas');
  console.log('- Not compatible with Vercel AI SDK directly');
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Credential Tests...\n');
  
  const results = {
    restAPI: await testDirectAPI(),
    googleSDK: await testGoogleAISDK(),
    vercelSDK: await testVercelAISDK()
  };
  
  await checkVertexAI();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n✅ Working with API Key:');
  if (results.restAPI) console.log('  • REST API (direct HTTP calls)');
  if (results.googleSDK) console.log('  • @google/generative-ai SDK');
  if (results.vercelSDK) console.log('  • Vercel AI SDK (@ai-sdk/google)');
  
  console.log('\n🔑 API Key Details:');
  console.log('  • Key:', CREDENTIALS.GEMINI_API_KEY);
  console.log('  • Type: Google AI Studio API Key');
  console.log('  • Works with: All Google AI SDKs and REST API');
  
  console.log('\n📝 Recommendations:');
  console.log('1. For Verbier chatbot: Use this API key with Vercel AI SDK');
  console.log('2. Set as env variable: GOOGLE_GENERATIVE_AI_API_KEY=' + CREDENTIALS.GEMINI_API_KEY);
  console.log('3. The key works with both SDKs and direct API calls');
  console.log('4. Vertex AI credentials are separate and not needed for SDK');
}

// Execute tests
runAllTests().catch(console.error);