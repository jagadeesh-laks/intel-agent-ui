
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
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-2xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-cyan-600/90 dark:from-slate-800/90 dark:to-slate-700/90"></div>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center card-3d float">
            <span className="text-teal-600 font-bold text-xl">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Agents Hub</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-12 h-12 rounded-full glass-effect hover:bg-white/20 transition-all duration-300 btn-3d">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">U</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-effect border-0 card-3d">
              <DropdownMenuItem 
                onClick={onLogout} 
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 btn-3d"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
