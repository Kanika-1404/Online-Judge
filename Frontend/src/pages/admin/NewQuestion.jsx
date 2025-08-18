import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    difficulty: 'Easy',
    testCases: [{ input: '', output: '', visibility: 'Private' }]
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

    if (!formData.title || !formData.description || !formData.difficulty || formData.testCases.length === 0) {
      setError('Please fill all required fields and add at least one test case.');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    for (const tc of formData.testCases) {
      if (!tc.input || !tc.output) {
        setError('All test cases must have input and output.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://code-arena-backend-x83f.onrender.com/questions', {
        ...formData,
        tags: tagsArray
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Question created successfully!');
      setTimeout(() => navigate('/admin/questions'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating question.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Question</h1>
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
            Create Question
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

export default NewQuestion;
