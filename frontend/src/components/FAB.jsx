import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PenTool, FileUp, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: PenTool, label: 'Add Note', color: 'bg-indigo-500', path: '/notes' },
    { icon: FileUp, label: 'Upload Material', color: 'bg-emerald-500', path: '/materials' },
    { icon: Sparkles, label: 'Ask AI', color: 'bg-amber-500', path: '/quiz' },
  ];

  return (
    <div className="md:hidden fixed bottom-20 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col-reverse items-end gap-4 mb-4">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setIsOpen(false);
                  navigate(action.path);
                }}
                className="flex items-center gap-3 pr-2 group"
              >
                <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f0f23]/90 backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <div className={`${action.color} p-3.5 rounded-2xl text-white shadow-lg shadow-${action.color}/20`}>
                  <action.icon className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-3xl text-white shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-700 rotate-0' : 'bg-primary-500 shadow-primary-500/40'
        }`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
      </motion.button>

      {/* Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAB;
