import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import AccuracyDisplay from '../components/AccuracyDisplay';

function UserDashboard() {
  const [userStats, setUserStats] = useState({
    questionsSolved: 0,
    contestsParticipated: 0,
    totalSubmissions: 0,
    accuracy: 0
  });
  const [userAccuracy, setUserAccuracy] = useState(null);
  const [loadingAccuracy, setLoadingAccuracy] = useState(false);
  const [user, setUser] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Fetch detailed user accuracy
        setLoadingAccuracy(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user accuracy statistics
        const accuracyResponse = await fetch(`http://localhost:5000/api/user/accuracy/${userData._id || userData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!accuracyResponse.ok) {
          throw new Error(`HTTP error! status: ${accuracyResponse.status}`);
        }

        const accuracyData = await accuracyResponse.json();
        console.log('Accuracy data received:', accuracyData);
        
        setUserAccuracy(accuracyData);
        
        // Update stats with accurate data
        setUserStats({
          questionsSolved: accuracyData.questionAccuracy?.length || 0,
          contestsParticipated: 0, // Placeholder - can be updated when contests API is ready
          totalSubmissions: accuracyData.totalSubmissions || 0,
          accuracy: accuracyData.overallAccuracy || 0
        });

        // Fetch recent questions
        const questionsResponse = await fetch('http://localhost:5000/questions');
        if (!questionsResponse.ok) {
          throw new Error(`HTTP error! status: ${questionsResponse.status}`);
        }
        
        const questions = await questionsResponse.json();
        setRecentQuestions(questions.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        
        // Fallback to localStorage data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData && userData._id) {
          setUserStats({
            questionsSolved: userData.questionsSolved || 0,
            contestsParticipated: userData.contestsParticipated || 0,
            totalSubmissions: userData.totalSubmissions || 0,
            accuracy: userData.accuracy || 0
          });
        }
        
      } finally {
        setLoadingAccuracy(false);
      }
    };

    fetchUserData();
  }, []);

  const handleQuestionClick = (id) => {
    navigate(`/question/${id}`);
  };

  const handleContestClick = () => {
    navigate('/contests');
  };

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-purple-900">
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.fullName || 'User'}
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your personal dashboard. Track your progress and manage your activities.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">Your Accuracy</h2>
          {loadingAccuracy ? (
            <p className="text-center py-4">Loading accuracy data...</p>
          ) : (
            userAccuracy && <AccuracyDisplay accuracyData={userAccuracy} type="user" />
          )}
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Questions Solved</h3>
            <p className="text-3xl font-bold text-purple-600">{userStats.questionsSolved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contests Participated</h3>
            <p className="text-3xl font-bold text-purple-600">{userStats.contestsParticipated}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-purple-600">{userStats.totalSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overall Accuracy</h3>
            <p className="text-3xl font-bold text-purple-600">{userStats.accuracy}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/questions')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Browse All Questions
              </button>
              <button
                onClick={handleContestClick}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                View Contests
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Questions</h3>
            <div className="space-y-2">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div
                    key={question._id}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleQuestionClick(question._id)}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{question.title}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No recent questions available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default UserDashboard;
