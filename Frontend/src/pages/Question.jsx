import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import AccuracyDisplay from '../components/AccuracyDisplay';

function Question() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('py');
  const [customInput, setCustomInput] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [showTestCases, setShowTestCases] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [questionAccuracy, setQuestionAccuracy] = useState(null);
  const [loadingAccuracy, setLoadingAccuracy] = useState(false);

  const languageOptions = [
    { label: 'C++', value: 'cpp' },
    { label: 'C', value: 'c' },
    { label: 'Python', value: 'py' }
  ];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const getAIReview = async () => {
    if (!question || !code) {
      setAiReview('Question or code is missing.');
      return;
    }
    setAiReviewLoading(true);
    setAiReview('');
    try {
      const response = await fetch('https://code-arena-backend-x83f.onrender.com/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.title, code }),
      });
      const data = await response.json();
      if (response.ok) {
        setAiReview(data.review);
      } else {
        setAiReview(`Error: ${data.error}`);
      }
    } catch (error) {
      setAiReview(`Error: ${error.message}`);
    } finally {
      setAiReviewLoading(false);
    }
  };

  const runCode = async () => {
    setOutput("Running...");
    setVerdict(null);
    setTestResults([]);
    try {
      const response = await fetch("https://code-arena-backend-x83f.onrender.com/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, format: language, input: customInput }),
      });
      const data = await response.json();
      if (response.ok) {
        setOutput(data.output);
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    await getAIReview();
  };

  const submitCode = async () => {
    setOutput("Submitting...");
    setVerdict(null);
    setTestResults([]);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const response = await fetch("https://code-arena-backend-x83f.onrender.com/submit-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ code, format: language, questionId: id, userId }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerdict(data.verdict);
        setTestResults(data.results);
        setOutput(data.verdict === "Accepted" ? "Accepted" : "Rejected");
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    await getAIReview();
  };

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(`https://code-arena-backend-x83f.onrender.com/questions/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuestion(data);
          fetchQuestionAccuracy();
        } else {
          console.error('Failed to fetch question');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    }

    async function fetchQuestionAccuracy() {
      setLoadingAccuracy(true);
      try {
        const response = await fetch(`https://code-arena-backend-x83f.onrender.com/api/question/accuracy/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuestionAccuracy(data);
        }
      } catch (error) {
        console.error('Error fetching question accuracy:', error);
      } finally {
        setLoadingAccuracy(false);
      }
    }

    fetchQuestion();
  }, [id]);

  const handleCodeChange = (code) => {
    setCode(code);
  };

  const handleCustomInputChange = (e) => {
    setCustomInput(e.target.value);
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <UserNavbar />
        <div className="flex-grow p-4 bg-purple-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300">
          <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: description, test cases, accuracy */}
            <div className="md:w-1/2">
              <p className="mb-4">{question.description}</p>
              
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Test Cases</h2>
                {question.testCases && question.testCases.length > 0 ? (
                  <div className="space-y-4">
                    {question.testCases
                      .filter(testCase => testCase.visibility === 'Public')
                      .map((testCase, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-600"
                        >
                          <p><strong>Input:</strong> {testCase.input}</p>
                          <p><strong>Output:</strong> {testCase.output}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>No public test cases available.</p>
                )}
              </div>
              {/*{loadingAccuracy ? (
                <p>Loading accuracy...</p>
              ) : (
                questionAccuracy && <AccuracyDisplay accuracyData={questionAccuracy} type="question" />
              )} */}
            </div>

            {/* Right side: code editor, run button, output */}
            <div className="md:w-1/2 flex flex-col">
              <div className="flex items-center mb-2 space-x-4">
                <label htmlFor="code" className="font-semibold">Code Editor</label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`https://code-arena-backend-x83f.onrender.com/submissions/${id}`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });
                      const data = await response.json();
                      if (response.ok) {
                        alert('Previous submissions:\n' + data.submissions.map((sub, idx) => `#${idx + 1} - Verdict: ${sub.verdict}, Score: ${sub.score}, Language: ${sub.language}, Time: ${new Date(sub.timeSubmitted).toLocaleString()}`).join('\n'));
                      } else {
                        alert('Error fetching submissions: ' + data.error);
                      }
                    } catch (error) {
                      alert('Error fetching submissions: ' + error.message);
                    }
                  }}
                >
                  Previous Submissions
                </button>
              </div>
              <div className="flex-grow w-full max-h-[50vh] border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 overflow-y-auto font-mono text-sm" style={{ minHeight: '40vh' }}>
                <Editor
                  value={code}
                  onValueChange={handleCodeChange}
                  highlight={code => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                    minHeight: '100%',
                    outline: 'none',
                  }}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="customInput" className="block mb-2 font-semibold">Custom Input</label>
                <textarea
                  id="customInput"
                  value={customInput}
                  onChange={handleCustomInputChange}
                  className="w-full h-24 p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 font-mono text-sm resize-none"
                  placeholder="Enter custom input here"
                />
              </div>
              <div className="mt-4">
                <label className="block mb-2 font-semibold">Output</label>
                <pre className="p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
              <div className="mt-4">
                <button
                  onClick={runCode}
                  className="mr-4 px-4 py-2 bg-[#6767e1] text-white rounded hover:bg-[#5757c1] focus:outline-none self-start"
                >
                  Run on Custom Input
                </button>
                <button
                  onClick={submitCode}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none self-start"
                >
                  Submit Code
                </button>
                <button
                  onClick={getAIReview}
                  className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none self-start"
                  disabled={aiReviewLoading}
                >
                  {aiReviewLoading ? 'Generating AI Review...' : 'Get AI Review'}
                </button>
              </div>
              {(aiReviewLoading || aiReview) && (
                <div className="mt-4 p-4 border border-purple-300 rounded bg-purple-50 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200 whitespace-pre-wrap font-mono text-sm max-h-64 overflow-auto break-words">
                  <h3 className="text-lg font-semibold mb-2">AI Review</h3>
                  <pre style={{whiteSpace: 'pre-wrap'}}>
                    {aiReviewLoading ? (
                      'Generating AI Review...'
                    ) : (
                      aiReview
                    )}
                  </pre>
                </div>
              )}
              {verdict && (
                <div className="mt-4 p-4 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                  <h3 className="text-xl font-bold mb-2">Verdict: {verdict}</h3>
                  <div>
                    <button
                      className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                      onClick={() => setShowTestCases(!showTestCases)}
                    >
                      {showTestCases ? 'Hide Test Cases' : 'Show Test Cases'}
                    </button>
                    {showTestCases && (
                      <div>
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`mb-2 p-2 rounded ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            <p><strong>Test Case {index + 1} ({result.visibility}):</strong></p>
                            {result.visibility === 'Public' ? (
                              <>
                                <p><strong>Input:</strong> {result.input}</p>
                                <p><strong>Expected Output:</strong> {result.expectedOutput}</p>
                                <p><strong>Actual Output:</strong> {result.actualOutput}</p>
                                <p><strong>Result:</strong> {result.passed ? 'Passed' : 'Failed'}</p>
                              </>
                            ) : (
                              <p><em>Private test case output hidden</em></p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Question;
