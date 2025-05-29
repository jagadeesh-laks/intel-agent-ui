
import React from 'react';
import { AgentCard } from './AgentCard';
import { Calculator, Users, BarChart3, Search, Sparkles, Bot } from 'lucide-react';

const agents = [
  {
    id: 'scrum-master',
    title: 'Scrum Master',
    subtitle: 'Manage sprints, track velocity, and coordinate team activities with AI-powered insights',
    icon: BarChart3,
    status: 'configured' as const,
    neonColor: 'green',
  },
  {
    id: 'hr',
    title: 'HR Assistant',
    subtitle: 'Handle recruitment, employee management, and HR analytics with intelligent automation',
    icon: Users,
    status: 'not-configured' as const,
    neonColor: 'blue',
  },
  {
    id: 'accountant',
    title: 'Finance Bot',
    subtitle: 'Financial reporting, expense tracking, and budget analysis with real-time insights',
    icon: Calculator,
    status: 'not-configured' as const,
    neonColor: 'pink',
  },
  {
    id: 'research',
    title: 'Research Agent',
    subtitle: 'Market research, data analysis, and competitive intelligence gathering',
    icon: Search,
    status: 'not-configured' as const,
    neonColor: 'orange',
  },
];

interface AgentDirectoryProps {
  onAgentSelect: (agentId: string) => void;
}

export const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onAgentSelect }) => {
  return (
    <div className="pt-20 min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-xl float"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-xl float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/20 to-green-500/20 blur-xl float" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-pink-500/20 blur-xl float" style={{animationDelay: '6s'}}></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <Sparkles className="w-10 h-10 neon-text-yellow icon-glow float" />
            <div className="flex items-center gap-3">
              <Bot className="w-12 h-12 neon-text-green icon-glow" />
              <h1 className="text-7xl font-bold neon-text-green float">
                AI Agents Hub
              </h1>
              <Bot className="w-12 h-12 neon-text-blue icon-glow" />
            </div>
            <Sparkles className="w-10 h-10 neon-text-pink icon-glow float" style={{animationDelay: '2s'}} />
          </div>
          
          <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Choose your AI-powered robotic assistant to automate and enhance your workflow
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full pulse-neon"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center pulse-neon">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full pulse-neon"></div>
          </div>
        </div>
        
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                onChatClick={onAgentSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center card-3d neon-border-green backdrop-blur-sm">
              <Bot className="text-8xl neon-text-green icon-glow" />
            </div>
            <h3 className="text-3xl font-semibold text-white mb-6 neon-text-blue">
              No Agents Available
            </h3>
            <p className="text-slate-300 text-xl">
              Please contact your admin to configure AI agents for your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
