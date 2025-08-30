// Simple Node.js script to test the Level 1 API endpoint

const testPayload = {
  name: "John Doe",
  location: "New York"
};

async function testAPI() {
  try {
    console.log("Testing API endpoint...");
    console.log("Payload:", testPayload);
    
    const response = await fetch("https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Response Body:", result);
    
    // Check for expected success message
    if (result.SUCCUSS || result.SUCCESS) {
      console.log("✅ API test successful!");
      console.log("Success message:", result.SUCCUSS || result.SUCCESS);
    } else {
      console.log("❌ Unexpected response format");
    }
    
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

// For Node.js environment, we need to import fetch
if (typeof fetch === 'undefined') {
  import('node-fetch').then(nodeFetch => {
    global.fetch = nodeFetch.default;
    testAPI();
  }).catch(() => {
    console.log("Node-fetch not available. This script should be run in a browser environment or with node-fetch installed.");
  });
} else {
  testAPI();
}
