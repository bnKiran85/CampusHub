import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Settings, LogOut, Zap, User, ChevronDown, CheckCircle, Brain, Star, BookOpen, FileText, FolderOpen, Calendar, Trophy, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/feed': 'Activity Feed',
  '/assignments': 'Assignments',
  '/notes': 'My Notes',
  '/materials': 'Study Materials',
  '/focus': 'Deep Focus',
  '/leaderboard': 'Leaderboard',
  '/quiz': 'AI Quiz',
  '/planner': 'Study Planner',
};

const navItems = [
  { path: '/materials', label: 'Materials', icon: FolderOpen },
  { path: '/planner', label: 'Study Planner', icon: Calendar },
  { path: '/focus', label: 'Focus Mode', icon: Zap },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/ai-report', label: 'AI Report', icon: FileText, premium: true },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const title = pageTitles[location.pathname] || 'CampusHub';

  const getInitials = (name) => {
    if (!name) return 'CH';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 relative z-50 bg-[#07071c]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button 
          onClick={() => setShowMobileMenu(true)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all tap-highlight-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Title Section */}
        <div className="flex flex-col">
          <h2 className="font-display font-bold text-white text-lg md:text-xl tracking-tight truncate max-w-[120px] sm:max-w-none leading-tight">
            {title}
          </h2>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-[#64748b] font-bold">
              Stable Connection
            </p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Streak Visual */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs" title="Current Daily Streak">
          🔥 {user?.streak || 0}
        </div>

        {/* Quick Focus Button - Desktop only */}
        <motion.button
          onClick={() => navigate('/focus')}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm font-medium"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4 fill-amber-500" />
          <span>Deep Focus</span>
        </motion.button>

        {/* Notifications */}
        <button className="relative p-2 md:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group tap-highlight-none">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full border-2 border-[#07071c]"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 md:gap-2.5 p-1 md:pr-3 rounded-2xl transition-all border tap-highlight-none ${showDropdown
              ? 'bg-white/10 border-white/20 ring-4 ring-indigo-500/10'
              : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shadow-lg shadow-black/20 group relative">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs md:text-sm text-white bg-gradient-to-br from-indigo-500 to-emerald-500">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>

            <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-slate-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="profile-dropdown"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden z-50 origin-top-right shadow-2xl"
                style={{
                  background: 'rgba(15, 15, 35, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {/* Header Profile Info */}
                <div className="p-4 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white text-lg">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold truncate max-w-[140px]">{user?.name}</h4>
                      <p className="text-slate-500 text-[10px] font-medium tracking-wide truncate max-w-[140px] uppercase">
                        {user?.course || 'Student'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Mini Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Lvl {Math.floor((user?.xp || 0) / 200) + 1}</span>
                      <span className="text-white font-bold">{(user?.xp || 0) % 200} / 200 XP</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((user?.xp || 0) % 200) / 2, 100)}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1.5">
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0f0f23] border-r border-white/10 z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-emerald-500">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-white text-xl leading-none">CampusHub</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">AI Companion</p>
                  </div>
                </div>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold px-3 mb-2">Academic Tools</p>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowMobileMenu(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      location.pathname === item.path 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm">{item.label}</span>
                    {item.premium && (
                      <span className="ml-auto text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Pro</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Star className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Free Plan</p>
                    <p className="text-slate-500 text-[10px]">Upgrade to unlock all features</p>
                  </div>
                </div>
                <button className="w-full btn-primary !py-2.5 !text-sm !font-bold">Upgrade to Plus</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
