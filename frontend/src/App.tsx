import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import LeaderboardPage from './pages/LeaderboardPage';
import InterviewPage from './pages/InterviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminAddQuestionPage from './pages/AdminAddQuestionPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/add-question" element={<AdminAddQuestionPage />} />
        </Routes>
      </main>
    </div>
  );
}
