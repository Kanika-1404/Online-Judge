// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/register`,
  login: `${API_BASE_URL}/login`,
  questions: `${API_BASE_URL}/questions`,
  contests: `${API_BASE_URL}/contests`,
  submitCode: `${API_BASE_URL}/submit-code`,
  generateReview: `${API_BASE_URL}/generate-review`,
  runCode: `${API_BASE_URL}/run-code`
};

export default API_ENDPOINTS;
