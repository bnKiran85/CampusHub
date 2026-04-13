import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Brain, 
  User 
} from 'lucide-react';

const navItems = [
  { path: '/feed', label: 'Home', icon: Home },
  { path: '/assignments', label: 'Tasks', icon: BookOpen },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/quiz', label: 'AI Quiz', icon: Brain },
  { path: '/leaderboard', label: 'Rank', icon: User }, // Using User for profile link in bottom nav
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f23]/80 backdrop-blur-2xl border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors tap-highlight-none"
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'text-primary-400 -translate-y-1' : 'text-slate-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-all duration-300 ${
                    isActive ? 'text-primary-400 opacity-100 scale-100' : 'text-slate-500 opacity-60 scale-95'
                  }`}
                >
                  {label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
