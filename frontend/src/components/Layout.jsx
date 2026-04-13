import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import FAB from './FAB';
import AiAssistantChat from './AiAssistantChat';

const SmartLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#07071c]">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar />
        
        <main className="flex-1 overflow-auto relative no-scrollbar pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-4 md:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Navigation */}
        <BottomNav />
        <FAB />
      </div>

      {/* Persistent AI Assistant - Hidden on small mobile screens if drawer-style is used in component */}
      <AiAssistantChat />
    </div>
  );
};

export default SmartLayout;
