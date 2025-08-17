const executeCode = async (code, format, input) => {
  const compilerUrl = process.env.COMPILER_URL || "http://localhost:8000";

  const response = await fetch(`${compilerUrl}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, format, input }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Compiler service error");
  }

  return await response.json();
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
