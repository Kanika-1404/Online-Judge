import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Question from './pages/Question';
import UserDashboard from './pages/UserDashboard';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';

import AdminNavbar from './components/AdminNavbar';
import QuestionsManagement from './pages/admin/QuestionsManagement';
import ContestsManagement from './pages/admin/ContestsManagement';
import NewQuestion from './pages/admin/NewQuestion';
import NewContest from './pages/admin/NewContest';
import EditQuestion from './pages/admin/EditQuestion';
import EditContest from './pages/admin/EditContest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<AdminSignup />} />
        <Route path="/questions" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/question/:id" element={<Question />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetail />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Admin routes with navbar */}
        <Route path="/admin/questions" element={<><AdminNavbar /><QuestionsManagement /></>} />
        <Route path="/admin/questions/new" element={<><AdminNavbar /><NewQuestion /></>} />
        <Route path="/admin/questions/edit/:id" element={<><AdminNavbar /><EditQuestion /></>} />

        <Route path="/admin/contests" element={<><AdminNavbar /><ContestsManagement /></>} />
        <Route path="/admin/contests/new" element={<><AdminNavbar /><NewContest /></>} />
        <Route path="/admin/contests/edit/:id" element={<><AdminNavbar /><EditContest /></>} />
      </Routes>
    </Router>
  );
}

export default App;
