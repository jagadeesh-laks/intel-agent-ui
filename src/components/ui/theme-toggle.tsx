
import React from 'react';
import { Button } from './button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-12 h-12 rounded-full glass-morphism professional-border btn-3d p-0"
    >
      <div className="text-2xl transition-transform duration-500 hover:scale-110">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-black" />
        )}
      </div>
    </Button>
  );
};
