
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, LogOut, User, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onLogout: () => void;
  onHome?: () => void;
  showHomeButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onHome, showHomeButton = false }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism neon-border-green transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-pink-500/10"></div>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-6">
          {showHomeButton && onHome && (
            <Button
              onClick={onHome}
              variant="ghost"
              className="btn-3d neon-border-blue text-white hover:neon-glow-blue"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-pink-500 rounded-xl flex items-center justify-center card-3d neon-glow-green pulse-neon">
              <Bot className="text-white font-bold text-xl w-6 h-6 icon-glow" />
            </div>
            <h1 className="text-2xl font-bold text-white neon-text-green">AI Agents Hub</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-12 h-12 rounded-full glass-morphism neon-border-blue btn-3d p-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="text-white font-bold text-lg w-5 h-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-morphism border-0 neon-border-green">
              <DropdownMenuItem 
                onClick={onLogout} 
                className="text-red-400 hover:bg-red-500/20 btn-3d flex items-center gap-2 neon-text-orange hover:neon-text-yellow"
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
