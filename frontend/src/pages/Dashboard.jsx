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

const StatCard = ({ icon: Icon, label, value, gradient }) => (
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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div 
        variants={itemVariants} 
        className="glass-card p-5 md:p-8 relative overflow-hidden group"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.1) 100%)' }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-24 h-24 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Student Hub</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Academic Year 2025</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black text-white leading-tight">
              Welcome back,<br className="md:hidden" />
              <span className="text-gradient font-black"> {user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base font-medium max-w-md">
              {pending === 0 
                ? "Excellent work! You've cleared all your assignments. Enjoy your free time! 🍀" 
                : `You have ${pending} task${pending > 1 ? 's' : ''} to complete today. You've got this!`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Level</span>
              <span className="text-xl font-display font-black text-indigo-400">{level}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">XP</span>
              <span className="text-xl font-display font-black text-emerald-400">{xp}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Work" value={assignments.length}
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed}
          gradient="linear-gradient(135deg, #10b981, #34d399)" />
        <StatCard icon={Clock} label="Focus Hours" value={`${Math.floor(xp / 50)}h`}
          gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" />
        <StatCard icon={TrendingUp} label="Daily Goal" value="85%"
          gradient="linear-gradient(135deg, #f43f5e, #fb7185)" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Priority Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20">
                <Target className="w-5 h-5 text-red-500" />
              </div>
              Top Priorities
            </h2>
            <Link to="/assignments" className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Manage Tasks
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-white font-bold">You're All Set!</p>
                <p className="text-slate-500 text-sm mt-1">No pending assignments for today.</p>
              </div>
            ) : (
              todayTasks.map((task, i) => {
                const days = daysUntil(task.dueDate);
                const isUrgent = days <= 1;
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate group-hover:text-indigo-400 transition-colors leading-tight">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{task.subject || 'General'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className={`text-[10px] font-bold ${isUrgent ? 'text-red-400' : 'text-slate-400'}`}>
                          {days <= 0 ? 'Due Today' : `Due in ${days} days`}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* AI Smart Assistant Widget */}
        <motion.div variants={itemVariants} className="glass-card flex flex-col bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              AI Study Guru
            </h2>
          </div>

          <div className="p-6 flex flex-col flex-1">
            {aiSuggestion || loadingAI || errorAI ? (
              <div className="flex-1 min-h-[300px]">
                <SmartAIView 
                  data={aiSuggestion} 
                  loading={loadingAI} 
                  error={errorAI} 
                  onAction={getAISuggestion} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full"></div>
                  <Brain className="relative w-16 h-16 text-indigo-400 animate-pulse-slow" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Smart Planning</p>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Let AI analyze your assignments and generate a high-performance study plan for today.
                </p>
                <button
                  onClick={getAISuggestion}
                  className="w-full btn-primary !rounded-2xl !py-4 shadow-xl shadow-indigo-500/20 group flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold">Generate Daily Plan</span>
                </button>
              </div>
            )}
            
            {aiSuggestion && (
              <button
                onClick={() => setAiSuggestion(null)}
                className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2"
              >
                Clear History
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">Jump Back In</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Deep Focus', desc: 'Flow State', icon: Zap, path: '/focus', color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Materials', desc: 'Reference', icon: BookOpen, path: '/materials', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'AI Review', desc: 'Summaries', icon: Brain, path: '/ai-report', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { label: 'Statistics', desc: 'Performance', icon: BarChart2, path: '/analytics', color: 'text-rose-400', bg: 'bg-rose-400/10' },
          ].map(item => (
            <Link key={item.path} to={item.path} className="flex">
              <motion.div
                className="glass-card p-5 cursor-pointer group flex flex-col items-center text-center w-full"
                whileHover={{ y: -5, background: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${item.bg} ${item.color}`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="text-white font-black text-sm">{item.label}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Space for Bottom Nav padding */}
      <div className="md:hidden h-20" />
    </motion.div>
  );
};

export default Dashboard;
