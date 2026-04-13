import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import SmartLayout from './components/SmartLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';

// Lazy loaded pages for performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Notes = lazy(() => import('./pages/Notes'));
const Materials = lazy(() => import('./pages/Materials'));
const Discussion = lazy(() => import('./pages/Discussion'));
const FocusMode = lazy(() => import('./pages/FocusMode'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const StudyPlanner = lazy(() => import('./pages/StudyPlanner'));
const Feed = lazy(() => import('./pages/Feed'));
const AIReportGenerator = lazy(() => import('./pages/AIReportGenerator'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OAuthSuccess = lazy(() => import('./pages/OAuthSuccess'));



import LoadingSpinner from './components/LoadingSpinner';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#07071c]">
    <div className="flex flex-col items-center gap-6">
      <LoadingSpinner size="lg" color="primary" />
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-slate-400 text-sm font-medium tracking-widest uppercase"
      >
        Initializing CampusHub
      </motion.p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 31, 61, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/success" element={<OAuthSuccess />} />


            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<SmartLayout />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/discussion" element={<Discussion />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/planner" element={<StudyPlanner />} />
                <Route path="/ai-report" element={<AIReportGenerator />} />
                <Route path="/admin" element={<AdminDashboard />} />

              </Route>
              <Route path="/focus" element={<FocusMode />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
