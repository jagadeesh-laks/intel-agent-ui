
import React from 'react';
import { AgentCard } from './AgentCard';
import { Calculator, Users, BarChart3, Search, Zap, Bot } from 'lucide-react';

const agents = [
  {
    id: 'scrum-master',
    title: 'Scrum Master',
    subtitle: 'Manage sprints, track velocity, and coordinate team activities with AI-powered insights',
    icon: BarChart3,
    status: 'configured' as const,
    neonColor: 'white',
  },
  {
    id: 'hr',
    title: 'HR Assistant',
    subtitle: 'Handle recruitment, employee management, and HR analytics with intelligent automation',
    icon: Users,
    status: 'not-configured' as const,
    neonColor: 'white',
  },
  {
    id: 'accountant',
    title: 'Finance Bot',
    subtitle: 'Financial reporting, expense tracking, and budget analysis with real-time insights',
    icon: Calculator,
    status: 'not-configured' as const,
    neonColor: 'white',
  },
  {
    id: 'research',
    title: 'Research Agent',
    subtitle: 'Market research, data analysis, and competitive intelligence gathering',
    icon: Search,
    status: 'not-configured' as const,
    neonColor: 'white',
  },
];

interface AgentDirectoryProps {
  onAgentSelect: (agentId: string) => void;
}

export const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onAgentSelect }) => {
  return (
    <div className="pt-20 min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-r from-white/10 to-white/5 blur-xl float"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-white/8 to-white/3 blur-xl float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-white/6 to-white/8 blur-xl float" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-white/4 to-white/6 blur-xl float" style={{animationDelay: '6s'}}></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <Zap className="w-10 h-10 text-white dark:text-black float" />
            <div className="flex items-center gap-3">
              <Bot className="w-12 h-12 text-white dark:text-black" />
              <h1 className="text-7xl font-bold accent-text float">
                AI Agents Hub
              </h1>
              <Bot className="w-12 h-12 text-white dark:text-black" />
            </div>
            <Zap className="w-10 h-10 text-white dark:text-black float" style={{animationDelay: '2s'}} />
          </div>
          
          <p className="text-2xl text-slate-300 dark:text-slate-700 max-w-4xl mx-auto leading-relaxed mb-8">
            Professional AI-powered automation for modern businesses
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-20 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full pulse-modern"></div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white rounded-full flex items-center justify-center pulse-modern">
              <Bot className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full pulse-modern"></div>
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
            <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 dark:from-gray-200/50 dark:to-gray-300/50 rounded-full flex items-center justify-center card-3d professional-border backdrop-blur-sm">
              <Bot className="text-8xl text-white dark:text-black" />
            </div>
            <h3 className="text-3xl font-semibold text-white dark:text-black mb-6">
              No Agents Available
            </h3>
            <p className="text-slate-300 dark:text-slate-700 text-xl">
              Please contact your admin to configure AI agents for your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
