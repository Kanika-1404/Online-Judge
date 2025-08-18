import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    difficulty: 'Easy',
    testCases: [{ input: '', output: '', visibility: 'Private' }]
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://code-arena-backend-x83f.onrender.com/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const question = response.data;
      setFormData({
        title: question.title,
        description: question.description,
        tags: question.tags?.join(', ') || '',
        difficulty: question.difficulty,
        testCases: question.testCases || []
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching question');
      setLoading(false);
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', visibility: 'Private' }]
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Detailed validation
    if (!formData.title || formData.title.trim().length === 0) {
      setError('Title is required.');
      return;
    }

    if (!formData.description || formData.description.trim().length === 0) {
      setError('Description is required.');
      return;
    }

    if (!formData.difficulty || !['Easy', 'Medium', 'Hard'].includes(formData.difficulty)) {
      setError('Please select a valid difficulty level.');
      return;
    }

    if (!Array.isArray(formData.testCases) || formData.testCases.length === 0) {
      setError('At least one test case is required.');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Validate test cases
    for (let i = 0; i < formData.testCases.length; i++) {
      const tc = formData.testCases[i];
      if (!tc.input || tc.input.trim().length === 0) {
        setError(`Test case ${i + 1} input is required.`);
        return;
      }
      if (!tc.output || tc.output.trim().length === 0) {
        setError(`Test case ${i + 1} output is required.`);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.put(`https://code-arena-backend-x83f.onrender.com/questions/${id}`, {
        ...formData,
        tags: tagsArray
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage('Question updated successfully!');
      setTimeout(() => navigate('/admin/questions'), 1500);
    } catch (err) {
      console.error('Error updating question:', err);
      
      // Handle different error types
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.details && Array.isArray(errorData.details)) {
          setError(`Validation Error: ${errorData.details.join(', ')}`);
        } else {
          setError(errorData.error || 'Validation error. Please check your input.');
        }
      } else if (err.response?.status === 403) {
        setError('Access denied. Please ensure you have admin privileges.');
      } else if (err.response?.status === 404) {
        setError('Question not found.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.response?.data?.error || 'Server error updating question. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Question</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Description *</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="e.g. arrays, sorting"
          />
        </div>

        <div>
          <label className="block font-semibold">Difficulty *</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Test Cases *</label>
          {formData.testCases.map((tc, index) => (
            <div key={index} className="mb-4 border p-3 rounded">
              <div className="mb-2">
                <label className="block font-semibold">Input</label>
                <textarea
                  value={tc.input}
                  onChange={e => handleTestCaseChange(index, 'input', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block font-semibold">Output</label>
                <textarea
                  value={tc.output}
                  onChange={e => handleTestCaseChange(index, 'output', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold">Visibility</label>
                <select
                  value={tc.visibility}
                  onChange={e => handleTestCaseChange(index, 'visibility', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option>Private</option>
                  <option>Public</option>
                </select>
              </div>
              {formData.testCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTestCase(index)}
                  className="mt-2 text-red-600 hover:underline"
                >
                  Remove Test Case
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="text-blue-600 hover:underline"
          >
            Add Test Case
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Question
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/questions')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuestion;
