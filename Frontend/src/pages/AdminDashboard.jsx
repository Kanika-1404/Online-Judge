import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalContests: 0,
    totalUsers: 0,
    totalSubmissions: 0
  });
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentContests, setRecentContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for new question
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [testCases, setTestCases] = useState([
    { input: '', output: '', visibility: 'Private' }
  ]);

  // Form states for new contest
  const [contestName, setContestName] = useState('');
  const [contestDescription, setContestDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchQuestions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://code-arena-backend-x83f.onrender.com/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.stats);
      setRecentQuestions(response.data.recentQuestions);
      setRecentContests(response.data.recentContests);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Fallback to basic counts if API fails
      setStats({
        totalQuestions: 0,
        totalContests: 0,
        totalUsers: 1,
        totalSubmissions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://code-arena-backend-x83f.onrender.com/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', visibility: 'Private' }]);
  };

  const removeTestCase = (index) => {
    const newTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(newTestCases);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!title || !description || !difficulty || testCases.length === 0) {
      setError('Please fill all required fields and add at least one test case.');
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    for (const tc of testCases) {
      if (!tc.input || !tc.output) {
        setError('All test cases must have input and output.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://code-arena-backend-x83f.onrender.com/questions', {
        title,
        description,
        tags: tagsArray,
        difficulty,
        testCases
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Question created successfully!');
      setTitle('');
      setDescription('');
      setTags('');
      setDifficulty('Easy');
      setTestCases([{ input: '', output: '', visibility: 'Private' }]);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating question.');
    }
  };

  const handleContestSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!contestName || !contestDescription || !startTime || !endTime) {
      setError('Please fill all required fields.');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End time must be after start time.');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question for the contest.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://code-arena-backend-x83f.onrender.com/contests', {
        contestId: `contest-${Date.now()}`,
        name: contestName,
        description: contestDescription,
        startTime,
        endTime,
        questions: selectedQuestions
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Contest created successfully!');
      setContestName('');
      setContestDescription('');
      setStartTime('');
      setEndTime('');
      setSelectedQuestions([]);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating contest.');
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const renderDashboard = () => (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-lg shadow-lg text-white">
              <h3 className="text-lg font-semibold opacity-90">Total Questions</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalQuestions}</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
              <h3 className="text-lg font-semibold opacity-90">Total Contests</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalContests}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-400 to-pink-600 p-6 rounded-lg shadow-lg text-white">
              <h3 className="text-lg font-semibold opacity-90">Total Users</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-gradient-to-r from-violet-400 to-violet-600 p-6 rounded-lg shadow-lg text-white">
              <h3 className="text-lg font-semibold opacity-90">Total Submissions</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalSubmissions}</p>
            </div>
          </div>

          {/* Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Recent Questions</h3>
              <div className="space-y-3">
                {recentQuestions.map(question => (
                  <div key={question._id} className="border-b border-purple-200 pb-3">
                    <h4 className="font-medium text-purple-700">{question.title}</h4>
                    <p className="text-sm text-purple-600">{question.difficulty}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Recent Contests</h3>
              <div className="space-y-3">
                {recentContests.map(contest => (
                  <div key={contest._id} className="border-b border-purple-200 pb-3">
                    <h4 className="font-medium text-purple-700">{contest.name}</h4>
                    <p className="text-sm text-purple-600">
                      {new Date(contest.startTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderNewQuestion = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Question</h2>
      
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleQuestionSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="array, string, sorting"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Test Cases</label>
          {testCases.map((testCase, index) => (
            <div key={index} className="mt-2 p-4 border rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Input</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Output</label>
                  <textarea
                    value={testCase.output}
                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    rows="2"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-600">Visibility</label>
                <select
                  value={testCase.visibility}
                  onChange={(e) => handleTestCaseChange(index, 'visibility', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeTestCase(index)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Test Case
          </button>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Create Question
        </button>
      </form>
    </div>
  );

  const renderNewContest = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Contest</h2>
      
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleContestSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contest Name</label>
          <input
            type="text"
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={contestDescription}
            onChange={(e) => setContestDescription(e.target.value)}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Questions</label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
            {questions.map(question => (
              <label key={question._id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(question._id)}
                  onChange={() => handleQuestionSelect(question._id)}
                  className="mr-2"
                />
                <span>{question.title} ({question.difficulty})</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Create Contest
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <nav className="mt-8">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full text-left px-4 py-3 text-sm font-medium ${
                activeSection === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveSection('new-question')}
              className={`w-full text-left px-4 py-3 text-sm font-medium ${
                activeSection === 'new-question' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ➕ New Question
            </button>
            <button
              onClick={() => setActiveSection('new-contest')}
              className={`w-full text-left px-4 py-3 text-sm font-medium ${
                activeSection === 'new-contest' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏆 New Contest
            </button>
            <button
              onClick={() => navigate('/admin/questions')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              📋 Manage Questions
            </button>
            <button
              onClick={() => navigate('/admin/contests')}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              🎯 Manage Contests
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'new-question' && renderNewQuestion()}
          {activeSection === 'new-contest' && renderNewContest()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
