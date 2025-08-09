import React, { useEffect, useState } from 'react';
import '../App.css';
import UserNavbar from '../components/UserNavbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import AccuracyDisplay from '../components/AccuracyDisplay';

function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [accuracyData, setAccuracyData] = useState(null);
  const [loadingAccuracy, setLoadingAccuracy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('http://localhost:5000/questions');
        if (response.ok) {
          const data = await response.json();
          setProblems(data);
        } else {
          console.error('Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    }

    async function fetchUserAccuracy() {
      setLoadingAccuracy(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/accuracy', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAccuracyData(data);
        } else {
          console.error('Failed to fetch user accuracy');
        }
      } catch (error) {
        console.error('Error fetching user accuracy:', error);
      } finally {
        setLoadingAccuracy(false);
      }
    }

    fetchQuestions();
    fetchUserAccuracy();
  }, []);

  const handleQuestionClick = (id) => {
    navigate(`/question/${id}`);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-purple-50 dark:bg-purple-900">
        <UserNavbar />
        <div className="flex-grow p-4">
          {/* <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">Your Accuracy</h2>
          {loadingAccuracy ? (
            <p>Loading accuracy...</p>
          ) : (
            accuracyData && <AccuracyDisplay accuracyData={accuracyData} type="user" />
          )} */}
          <h2 className="text-2xl font-bold mb-4 mt-8 text-purple-900 dark:text-purple-100">Problems List</h2>
          <table className="min-w-full bg-purple-100 dark:bg-purple-800 border border-purple-200 dark:border-purple-700 rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-300">Name</th>
                <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left text-gray-900 dark:text-gray-300">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr
                  key={problem._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleQuestionClick(problem._id)}
                >
                  <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300">{problem.title}</td>
                  <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300">{problem.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Dashboard;
