
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Header } from '@/components/Header';
import { AgentDirectory } from '@/components/AgentDirectory';
import { ScrumMasterPage } from '@/components/ScrumMasterPage';

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
          <div className="min-h-screen transition-colors duration-300">
            <Header 
              onLogout={handleLogout} 
              onHome={handleBackToDirectory}
              showHomeButton={!!selectedAgent}
            />
            
            {selectedAgent === 'scrum-master' ? (
              <ScrumMasterPage onBack={handleBackToDirectory} />
            ) : selectedAgent ? (
              <div className="pt-20 min-h-screen animated-bg flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white neon-text-blue mb-4">
                    {selectedAgent.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Bot
                  </h2>
                  <p className="text-slate-300 mb-8">This agent is under development</p>
                </div>
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
