const executeCode = async (code, format, input) => {
  const compilerUrl = process.env.COMPILER_URL || "http://localhost:8000";
  
  console.log("=== COMPILER SERVICE REQUEST ===");
  console.log("Compiler URL:", compilerUrl);
  console.log("Request payload:", { code: code.substring(0, 100) + "...", format, input });

  try {
    const response = await fetch(`${compilerUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, format, input }),
    });

    console.log("Compiler service response status:", response.status);
    console.log("Compiler service response ok:", response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log("Error response data:", errorData);
      } catch (parseError) {
        const textError = await response.text();
        console.log("Error response text:", textError);
        throw new Error(`Compiler service error: ${response.status} - ${textError}`);
      }
      throw new Error(errorData.error || `Compiler service error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Compiler service success:", result);
    return result;
    
  } catch (error) {
    console.error("=== COMPILER SERVICE ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    
    // Check if it's a network error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Cannot connect to compiler service at ${compilerUrl}. Is the compiler service running?`);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error connecting to compiler service: ${error.message}`);
    }
    
    throw error;
  }
};

const runTestCases = async (code, format, testCases) => {
  const results = [];
  let allPassed = true;

  for (const testCase of testCases) {
    try {
      const result = await executeCode(code, format, testCase.input);
      const output = result.output;

      const trimmedOutput = output.trim();
      const expectedOutput = testCase.output.trim();

      const passed = trimmedOutput === expectedOutput;
      if (!passed) {
        allPassed = false;
      }

      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: output,
        passed,
        visibility: testCase.visibility,
      });
    } catch (error) {
      allPassed = false;
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: error.toString(),
        passed: false,
        visibility: testCase.visibility,
      });
    }
  }

  return { results, allPassed };
};

module.exports = {
  executeCode,
  runTestCases,
};