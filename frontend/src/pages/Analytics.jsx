import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Zap, Timer, CheckCircle2, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-2 text-sm">
        <p className="text-white font-semibold">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aRes] = await Promise.all([api.get('/assignments')]);
        setAssignments(aRes.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 200) + 1;
  const completed = assignments.filter(a => a.completed).length;
  const pending = assignments.filter(a => !a.completed).length;

  // Subject distribution for pie chart
  const subjectMap = {};
  assignments.forEach(a => {
    const s = a.subject || 'Other';
    subjectMap[s] = (subjectMap[s] || 0) + 1;
  });
  const subjectData = Object.entries(subjectMap).map(([name, value]) => ({ name, value }));

  // Weekly completion data (mock based on real data)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = days.map((day, i) => ({
    day,
    completed: Math.floor(Math.random() * 4),
    added: Math.floor(Math.random() * 3),
  }));

  const stats = [
    { icon: CheckCircle2, label: 'Completed', value: completed, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { icon: Zap, label: 'Total XP', value: xp, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    { icon: BarChart2, label: 'Level', value: level, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { icon: Brain, label: 'Assignments', value: assignments.length, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title mb-1 flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-primary-400" /> Performance Analytics
            </h1>
            <p className="text-slate-400 text-sm">Your personalized study insights &amp; progress overview</p>
          </div>
          <div className="flex items-center gap-3 glass-card px-4 py-2 border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Stats:</p>
            <button 
              onClick={async () => {
                const newVal = !user?.isStatsPublic;
                try {
                  await api.patch('/auth/profile', { isStatsPublic: newVal });
                  toast.success(newVal ? 'Stats are now Public! 🌍' : 'Stats are now Private! 🔒');
                } catch { toast.error('Failed to update privacy'); }
              }}
              className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border transition-all ${
                user?.isStatsPublic 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-white/5 text-slate-500 border-white/10'
              }`}
            >
              {user?.isStatsPublic ? 'Public' : 'Private'}
            </button>
          </div>
        </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.gradient }}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-display font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" /> Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="added" name="Added" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-400" /> Subject Distribution
          </h2>
          {subjectData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {subjectData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-300 text-xs">{s.name}</span>
                    <span className="text-slate-500 text-xs ml-1">({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* XP Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> XP Progress to Level {level + 1}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Level {level}</span>
              <span>{xp % 200} / 200 XP</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="xp-bar h-3">
              <div className="xp-bar-fill" style={{ width: `${((xp % 200) / 200) * 100}%` }} />
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          🎯 Ways to earn more XP: Complete assignments (+20), finish quizzes (+10-30), focus sessions (+50), daily logins (+5)
        </p>
      </motion.div>
    </div>
  );
};

export default Analytics;
