import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';

function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`http://localhost:5000/contests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setContest(data);
          
          // Check if user is registered
          const token = localStorage.getItem('token');
          if (token) {
            const userResponse = await fetch('http://localhost:5000/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUserId(userData.user._id);
              setIsRegistered(data.registeredUsers?.some(user => user._id === userData.user._id));
            }
          }
        } else {
          setError('Contest not found');
        }
      } catch (error) {
        console.error('Error fetching contest:', error);
        setError('Failed to load contest');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800', canStart: false };
    } else if (now >= start && now <= end) {
      return { status: 'Active', color: 'bg-green-100 text-green-800', canStart: true };
    } else {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800', canStart: false };
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to register for contests');
        navigate('/login');
        return;
      }

      const response = await fetch(`/contests/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Successfully registered for contest!');
        setIsRegistered(true);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 dark:bg-purple-900">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 dark:bg-purple-900">
        <UserNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <button
              onClick={() => navigate('/contests')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Back to Contests
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-purple-50 dark:bg-purple-900">
        <UserNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contest Not Found</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const status = getContestStatus(contest.startTime, contest.endTime);

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-purple-900">
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contest.name}</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${status.color}`}>
              {status.status}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {contest.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-purple-50 dark:bg-purple-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Start Time</h3>
              <p className="text-gray-900 dark:text-white">{formatDate(contest.startTime)}</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">End Time</h3>
              <p className="text-gray-900 dark:text-white">{formatDate(contest.endTime)}</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Total Questions</h3>
              <p className="text-gray-900 dark:text-white">{contest.questions?.length || 0}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Registration</h2>
            <div className="bg-purple-50 dark:bg-purple-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Register for this contest to participate and access all questions.
              </p>
              {isRegistered ? (
                <div className="text-green-600 font-semibold">
                  ✓ You are registered for this contest
                </div>
              ) : (
                <button 
                  onClick={handleRegister}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Register for Contest
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/contests')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Contests
            </button>
            
            {status.canStart && isRegistered && (
              <button
                onClick={() => navigate(`/contest/${contest._id}/start`)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start Contest
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContestDetail;
