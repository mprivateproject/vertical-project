import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm transition-all active:scale-95"
    >
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Moon className="w-4 h-4 text-secondary-foreground" />
        )}
      </motion.div>
    </button>
  );
}