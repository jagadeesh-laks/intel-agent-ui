
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-slate-800 dark:to-slate-700 shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-teal-600 font-bold text-lg">AI</span>
          </div>
          <h1 className="text-xl font-bold text-white">AI Agents Hub</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-medium text-sm">U</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
