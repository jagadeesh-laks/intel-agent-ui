import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, LogOut, User, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onLogout: () => void;
  onHome?: () => void;
  showHomeButton?: boolean;
  user: {
    email: string;
    name: string;
    role: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onHome, showHomeButton = false, user }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism professional-border transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 dark:from-black/5 dark:via-black/10 dark:to-black/5"></div>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-6">
          {showHomeButton && onHome && (
            <Button
              onClick={onHome}
              variant="ghost"
              className="btn-3d professional-border text-white dark:text-black"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black dark:from-gray-200 dark:to-white rounded-xl flex items-center justify-center card-3d pulse-modern comic-edges">
              <Bot className="text-white dark:text-black font-bold text-xl w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold modern-text">AI Agents Hub</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-12 h-12 rounded-full glass-morphism professional-border btn-3d p-0">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 rounded-full flex items-center justify-center">
                  <User className="text-white dark:text-black font-bold text-lg w-5 h-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-morphism border-0 professional-border">
              {user && (
                <>
                  <DropdownMenuLabel className="text-white dark:text-black">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700/30 dark:bg-slate-300/30" />
                </>
              )}
              <DropdownMenuItem 
                onClick={onLogout} 
                className="text-red-400 dark:text-red-600 hover:bg-red-500/20 btn-3d flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
