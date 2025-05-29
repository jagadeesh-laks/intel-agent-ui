
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Header } from '@/components/Header';
import { AgentDirectory } from '@/components/AgentDirectory';
import { ChatInterface } from '@/components/ChatInterface';

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedAgent(null);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const handleBackToDirectory = () => {
    setSelectedAgent(null);
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LoginScreen onLogin={handleLogin} />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header onLogout={handleLogout} />
            
            {selectedAgent ? (
              <div>
                <button
                  onClick={handleBackToDirectory}
                  className="fixed top-20 left-4 z-40 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  ← Back to Directory
                </button>
                <ChatInterface />
              </div>
            ) : (
              <AgentDirectory onAgentSelect={handleAgentSelect} />
            )}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
