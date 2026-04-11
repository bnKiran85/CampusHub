import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Settings, LogOut, Zap, Moon, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/assignments': 'Assignments',
  '/notes': 'Notes',
  '/materials': 'Study Materials',
  '/quiz': 'AI Quiz Generator',
  '/planner': 'Study Planner',
  '/discussion': 'Discussion Forum',
  '/focus': 'Focus Mode',
  '/analytics': 'Analytics',
  '/leaderboard': 'Leaderboard',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const title = pageTitles[location.pathname] || 'CampusHub';

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        background: 'rgba(15,15,35,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-white text-xl">{title}</h2>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Focus Mode Quick Access */}
        <motion.button
          onClick={() => navigate('/focus')}
          className="btn-ghost gap-2 text-sm hidden sm:flex"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Focus
        </motion.button>

        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white font-medium pr-2 hidden sm:block">{user?.name}</span>
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-[110%] w-52 rounded-2xl py-2 z-[100]"
              style={{
                background: 'rgba(20, 20, 50, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <p className="text-white text-sm font-semibold">{user?.name}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowDropdown(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
