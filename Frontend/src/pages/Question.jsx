import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; // You can import a different theme or create your own

function Question() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(`http://localhost:5000/questions/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuestion(data);
        } else {
          console.error('Failed to fetch question');
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    }
    fetchQuestion();
  }, [id]);

  const handleCodeChange = (code) => {
    setCode(code);
  };

  const runCode = () => {
    // For now, just echo the code as output (placeholder)
    setOutput(code);
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow p-4 bg-purple-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300">
          <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: description, test cases */}
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
            </div>

            {/* Right side: code editor, run button, output */}
            <div className="md:w-1/2 flex flex-col">
              <label htmlFor="code" className="block mb-2 font-semibold">Code Editor</label>
              <Editor
                value={code}
                onValueChange={handleCodeChange}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                className="flex-grow w-full h-48 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 font-mono text-sm"
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                }}
              />
              <div className="mt-4">
                <label className="block mb-2 font-semibold">Output</label>
                <pre className="p-2 border border-gray-300 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
              <button
                onClick={runCode}
                className="mt-4 px-4 py-2 bg-[#6767e1] text-white rounded hover:bg-[#5757c1] focus:outline-none self-start"
              >
                Run Code
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Question;
