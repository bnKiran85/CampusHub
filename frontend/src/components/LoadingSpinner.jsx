import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-indigo-500',
    secondary: 'border-emerald-500',
    white: 'border-white',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${color === 'primary' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
        
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full shadow-lg`}
        />
        
        {/* Center Dot */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full shadow-glow"
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
