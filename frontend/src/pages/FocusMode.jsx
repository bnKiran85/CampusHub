import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, Pause, RotateCcw, Settings, Check, Coffee, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const MODES = [
  { label: 'Focus', duration: 25, color: '#6366f1', icon: Zap },
  { label: 'Short Break', duration: 5, color: '#10b981', icon: Coffee },
  { label: 'Long Break', duration: 15, color: '#34d399', icon: BookOpen },
];

const FocusMode = () => {
  const { user } = useAuth();
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [task, setTask] = useState('');
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const mode = MODES[modeIdx];
  const totalSeconds = mode.duration * 60;
  const progress = (timeLeft / totalSeconds) * 100;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  const handleSessionComplete = async () => {
    if (modeIdx === 0) { // Focus session completed
      setSessions(s => s + 1);
      toast.success('🎉 Focus session complete! +50 XP');
      try {
        await api.post('/ai/focus-session', { duration: mode.duration, task });
      } catch { /* silent */ }
    } else {
      toast.success('Break time over! Time to focus again 💪');
    }
  };

  const switchMode = (idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(idx);
    setTimeLeft(MODES[idx].duration * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(totalSeconds);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d1117 100%)' }}>
      {/* Escape */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <button onClick={() => navigate('/dashboard')}
          className="btn-ghost text-sm">
          ← Back to Dashboard
        </button>

        {user && (
          <div className="flex items-center gap-3 glass-card px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-white/80 text-xs font-medium">{user.name}</span>
          </div>
        )}
      </div>

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${mode.color}, transparent)` }} />
      </div>

      <motion.div className="flex flex-col items-center gap-8 z-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display font-bold text-4xl text-white">Focus Mode</h1>
          <p className="text-slate-400 mt-2">Stay in flow, stay ahead 🧠</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {MODES.map((m, i) => (
            <button key={m.label} onClick={() => switchMode(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                modeIdx === i ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              style={modeIdx === i ? { background: m.color, boxShadow: `0 0 20px ${m.color}60` } : {}}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer Ring */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90 timer-ring" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={radius} fill="none" strokeWidth="8"
              stroke="rgba(255,255,255,0.08)" />
            <motion.circle cx="110" cy="110" r={radius} fill="none" strokeWidth="8"
              stroke={mode.color} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 12px ${mode.color})` }}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-5xl text-white">{formatTime(timeLeft)}</span>
            <span className="text-slate-400 text-sm mt-1">{mode.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RotateCcw className="w-5 h-5 text-slate-300" />
          </button>
          <motion.button
            onClick={() => setRunning(!running)}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}99)`, boxShadow: `0 0 30px ${mode.color}60` }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {running ? <Pause className="w-8 h-8 text-white" fill="white" />
              : <Play className="w-8 h-8 text-white fill-white ml-1" />}
          </motion.button>
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-white font-bold text-sm">{sessions}</span>
          </div>
        </div>

        {/* Task Input */}
        <div className="w-80">
          <input className="glass-input text-center text-sm" placeholder="What are you focusing on? (optional)"
            value={task} onChange={e => setTask(e.target.value)} />
        </div>

        {/* Sessions info */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all"
              style={{ background: i < sessions % 4 ? mode.color : 'rgba(255,255,255,0.15)' }} />
          ))}
          <span className="text-slate-400 text-sm ml-2">{sessions} sessions completed · {sessions * 50} XP earned</span>
        </div>
      </motion.div>
    </div>
  );
};

export default FocusMode;
