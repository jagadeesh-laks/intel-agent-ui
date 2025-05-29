
import React from 'react';
import { Button } from './button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-12 h-12 rounded-full glass-effect hover:bg-white/20 transition-all duration-300 btn-3d"
    >
      <div className="text-2xl transition-transform duration-500 hover:scale-110">
        {theme === 'light' ? (
          <span>🌙</span>
        ) : (
          <span>☀️</span>
        )}
      </div>
    </Button>
  );
};
