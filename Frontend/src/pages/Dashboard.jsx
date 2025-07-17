import React, { useEffect, useState } from 'react';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [problems, setProblems] = useState([]);
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
    fetchQuestions();
  }, []);

  const handleQuestionClick = (id) => {
    navigate(`/question/${id}`);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow p-4">
          <h2 className="text-2xl font-bold mb-4">Problems List</h2>
          <table className="min-w-full bg-purple-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
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
