import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, TrendingUp, Star, Zap, Brain,
  BookOpen, Target, ArrowRight, Sparkles, Trophy, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import SmartAIView from '../components/SmartAIView';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <motion.div variants={itemVariants} className="stat-card">
    <div className="flex items-center justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: gradient }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-3xl font-display font-bold text-white">{value}</p>
    <p className="text-sm text-slate-400 mt-1">{label}</p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data);
      const pending = data.filter(a => !a.completed);
      // Sort by deadline proximity
      const sorted = pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setTodayTasks(sorted.slice(0, 3));
    } catch { /* silent */ }
  };

  const getAISuggestion = async () => {
    if (loadingAI) return;
    setErrorAI(null);
    try {
      const pending = assignments.filter(a => !a.completed).map(a => ({
        title: a.title, dueDate: a.dueDate, subject: a.subject || ''
      }));
      const { data } = await api.post('/ai/study-plan', { assignments: pending, userName: user?.name });
      setAiSuggestion(data);
    } catch {
      setErrorAI('Could not generate plan. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const completed = assignments.filter(a => a.completed).length;
  const pending = assignments.filter(a => !a.completed).length;
  const xp = user?.xp || 0;
  const level = Math.floor(xp / 200) + 1;
  const streak = user?.streak || 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="glass-card p-6"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(52,211,153,0.1))' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="text-gradient">{user?.name?.split(' ')[0]}! 👋</span>
            </h1>
            <p className="text-slate-400 mt-1">
              {pending === 0 ? "You're all caught up! 🎉" : `You have ${pending} pending assignment${pending > 1 ? 's' : ''}. Let's get to work!`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge-primary text-xs px-3 py-1.5">
              <Star className="w-3.5 h-3.5" />
              Level {level}
            </div>
            <div className="badge-success text-xs px-3 py-1.5">
              <Zap className="w-3.5 h-3.5" />
              {xp} XP
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Assignments" value={assignments.length}
          gradient="linear-gradient(135deg, #6366f1, #4f46e5)" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed}
          gradient="linear-gradient(135deg, #10b981, #059669)" />
        <StatCard icon={Clock} label="Pending" value={pending}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
        <StatCard icon={TrendingUp} label="Study Streak" value={`${streak}d`}
          gradient="linear-gradient(135deg, #ef4444, #dc2626)" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Priority Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-400" />
              What to do today
            </h2>
            <Link to="/assignments" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">All clear for today!</p>
                <p className="text-slate-500 text-sm">No pending assignments 🎉</p>
              </div>
            ) : (
              todayTasks.map((task, i) => {
                const days = daysUntil(task.dueDate);
                const urgency = days <= 1 ? 'danger' : days <= 3 ? 'warning' : 'primary';
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 badge-${urgency}`}
                      style={{
                        background: urgency === 'danger' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#6366f1',
                        width: '3px', padding: 0, border: 'none'
                      }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{task.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {task.subject && <span className="mr-2">{task.subject}</span>}
                        Due in {days <= 0 ? 'Today!' : `${days} day${days > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span className={`badge-${urgency} text-xs`}>
                      {days <= 0 ? '⚠️ Due' : days <= 1 ? '🔥 Urgent' : days <= 3 ? '⚡ Soon' : '📅 Normal'}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* AI Smart Plan */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-400" />
            AI Study Plan
          </h2>

          {aiSuggestion || loadingAI || errorAI ? (
            <div className="mt-2">
              <SmartAIView 
                data={aiSuggestion} 
                loading={loadingAI} 
                error={errorAI} 
                onAction={getAISuggestion} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <Brain className="w-14 h-14 text-primary-400 mb-3 opacity-80 animate-pulse-slow" />
              <p className="text-slate-300 text-sm mb-4">
                Let AI analyze your workload and create a personalized study plan.
              </p>
              <button
                onClick={getAISuggestion}
                className="btn-primary text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <Sparkles className="w-4 h-4" /> Generate Plan
              </button>
            </div>
          )}

          {aiSuggestion && (
            <button
              onClick={() => setAiSuggestion('')}
              className="btn-ghost text-xs mt-3 w-full"
            >
              Regenerate Plan
            </button>
          )}
        </motion.div>
      </div>

      {/* Quick Access */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'AI Quiz', desc: 'Test yourself', icon: Brain, path: '/quiz', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
            { label: 'Focus Mode', desc: 'Pomodoro timer', icon: Zap, path: '/focus', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
            { label: 'Leaderboard', desc: 'Check your rank', icon: Trophy, path: '/leaderboard', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
            { label: 'Analytics', desc: 'Study insights', icon: BarChart2, path: '/analytics', gradient: 'linear-gradient(135deg, #ef4444, #ec4899)' },
          ].map(item => (
            <Link key={item.path} to={item.path}>
              <motion.div
                className="glass-card p-4 cursor-pointer group"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: item.gradient }}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
