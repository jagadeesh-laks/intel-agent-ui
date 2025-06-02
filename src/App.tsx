import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Header } from '@/components/Header';
import { AgentDirectory } from '@/components/AgentDirectory';
import { ScrumMasterPage } from '@/components/ScrumMasterPage';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token and user data
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('jiraStatus');
    setIsLoggedIn(false);
    setSelectedAgent(null);
    setUser(null);
    navigate('/login');
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const handleBackToDirectory = () => {
    setSelectedAgent(null);
  };

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
        <Route path="/scrum-master" element={<ScrumMasterPage onBack={handleBackToDirectory} />} />
      </Routes>
    );
  }

  return (
          <div className="min-h-screen transition-colors duration-300">
            <Header 
              onLogout={handleLogout} 
              onHome={handleBackToDirectory}
              showHomeButton={!!selectedAgent}
        user={user}
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
  );
};

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
        </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
