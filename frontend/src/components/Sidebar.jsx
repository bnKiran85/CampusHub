import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FileText, FolderOpen,
  MessageSquare, Zap, Trophy, BarChart2, Calendar,
  Brain, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/feed', label: 'Campus Feed', icon: MessageSquare },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assignments', label: 'Assignments', icon: BookOpen },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/materials', label: 'Materials', icon: FolderOpen },
  { path: '/quiz', label: 'AI Quiz', icon: Brain },
  { path: '/planner', label: 'Study Planner', icon: Calendar },
  { path: '/discussion', label: 'Discussion', icon: MessageSquare },
  { path: '/focus', label: 'Focus Mode', icon: Zap },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const adminItems = [
  { path: '/admin', label: 'Moderation', icon: Star },
];

const XP_PER_LEVEL = 200;

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const xp = user?.xp || 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPercent = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 flex-shrink-0 flex flex-col h-screen overflow-hidden"
      style={{
        background: 'rgba(15, 15, 35, 0.9)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #34d399)' }}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-xl leading-none">CampusHub</h1>
            <p className="text-xs text-slate-500 mt-0.5">AI Learning Platform</p>
          </div>
        </div>
      </div>

      {/* User XP Card */}
      {user && (
        <div className="mx-4 mt-4 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Level {level}</span>
              </div>
            </div>
          </div>
          <div className="xp-bar mb-1">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="text-xs text-slate-400">{xpInLevel} / {XP_PER_LEVEL} XP</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {[
          ...navItems,
          ...(user?.role === 'admin' || user?.role === 'faculty' ? adminItems : [])
        ].map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink key={path} to={path}>
              <motion.div
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-slate-600 text-center">© 2025 CampusHub</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
