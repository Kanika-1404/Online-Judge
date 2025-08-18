import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
    fetchContest();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://code-arena-backend-x83f.onrender.com/questions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setQuestions(response.data);
    } catch (err) {
      setError('Error fetching questions');
    }
  };

  const fetchContest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://code-arena-backend-x83f.onrender.com/contests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const contest = response.data;
      setFormData({
        name: contest.name,
        description: contest.description,
        startTime: contest.startTime ? contest.startTime.slice(0,16) : '',
        endTime: contest.endTime ? contest.endTime.slice(0,16) : '',
        questions: contest.questions || []
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching contest');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name || !formData.description || !formData.startTime || !formData.endTime) {
      setError('Please fill all required fields.');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://code-arena-backend-x83f.onrender.com/contests/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Contest updated successfully!');
      setTimeout(() => navigate('/admin/contests'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating contest.');
    }
  };

  const handleQuestionToggle = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.includes(questionId)
        ? prev.questions.filter(id => id !== questionId)
        : [...prev.questions, questionId]
    }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Contest</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Contest Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
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
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Start Time *</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">End Time *</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Select Questions</label>
          <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
            {questions.map((question) => (
              <div key={question._id} className="mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.questions.includes(question._id)}
                    onChange={() => handleQuestionToggle(question._id)}
                    className="mr-2"
                  />
                  <span>{question.title} ({question.difficulty})</span>
                </label>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Selected: {formData.questions.length} questions
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Contest
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/contests')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContest;
