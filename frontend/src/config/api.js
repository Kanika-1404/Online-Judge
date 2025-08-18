// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://code-arena-backend-x83f.onrender.com';

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/register`,
  login: `${API_BASE_URL}/api/login`,
  questions: `${API_BASE_URL}/questions`,
  contests: `${API_BASE_URL}/contests`,
  submitCode: `${API_BASE_URL}/submit-code`,
  generateReview: `${API_BASE_URL}/generate-review`,
  runCode: `${API_BASE_URL}/api/run-code`
};

export default API_ENDPOINTS;
