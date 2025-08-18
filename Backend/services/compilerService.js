// services/compilerService.js
const executeCode = async (code, format, input) => {
  const compilerUrl = process.env.COMPILER_URL;
  console.log(compilerUrl);

  if (!compilerUrl) {
    throw new Error('COMPILER_URL not configured in environment variables');
  }

  try {
    console.log(`Making request to: ${compilerUrl}/execute`);
    console.log(`Language: ${format}`);
    
    const response = await fetch(`${compilerUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, format, input }),
    });

    const text = await response.text(); // read body once

    let data;
    try {
      data = JSON.parse(text); // try parsing as JSON
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', text);
      data = { error: text }; // fallback if it's plain text
    }

    if (!response.ok) {
      console.log("Error response data:", data);
      throw new Error(data.error || `Compiler service error: ${response.status} - ${response.statusText}`);
    }

    return data;

  } catch (error) {
    console.error("=== COMPILER SERVICE ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (error.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
      throw new Error(`Cannot connect to compiler service at ${compilerUrl}. Is the compiler service running?`);
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(`Network error connecting to compiler service: ${error.message}`);
    }

    throw error;
  }
};

// Add the missing runTestCases function
const runTestCases = async (code, format, testCases) => {
  const results = [];
  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await executeCode(code, format, testCase.input);
      
      const actualOutput = result.output ? result.output.trim() : '';
      const expectedOutput = testCase.output.trim();
      const passed = actualOutput === expectedOutput;
      
      if (!passed) {
        allPassed = false;
      }

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: actualOutput,
        passed: passed,
        visibility: testCase.visibility || 'Public',
        error: result.error || null
      });

    } catch (error) {
      allPassed = false;
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: '',
        passed: false,
        visibility: testCase.visibility || 'Public',
        error: error.message
      });
    }
  }

  return { results, allPassed };
};

module.exports = {
  executeCode,
  runTestCases  // Export the missing function
};