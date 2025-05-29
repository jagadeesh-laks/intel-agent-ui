
import React from 'react';
import { AgentCard } from './AgentCard';
import { Calculator, GanttChart, Users, Kanban, Sparkles } from 'lucide-react';

const agents = [
  {
    id: 'scrum-master',
    title: 'Scrum Master Bot',
    subtitle: 'Manage sprints via chat',
    icon: Kanban,
    status: 'configured' as const,
  },
  {
    id: 'project-manager',
    title: 'Project Manager Bot',
    subtitle: 'Track projects and deadlines',
    icon: GanttChart,
    status: 'not-configured' as const,
  },
  {
    id: 'accountant',
    title: 'Accountant Bot',
    subtitle: 'Financial reporting and analysis',
    icon: Calculator,
    status: 'not-configured' as const,
  },
  {
    id: 'hr',
    title: 'HR Bot',
    subtitle: 'Human resources assistance',
    icon: Users,
    status: 'not-configured' as const,
  },
];

interface AgentDirectoryProps {
  onAgentSelect: (agentId: string) => void;
}

export const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onAgentSelect }) => {
  return (
    <div className="pt-20 min-h-screen gradient-bg circuit-pattern transition-colors duration-300 relative">
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400 icon-glow" />
            <h2 className="text-6xl font-bold neon-text-blue float">
              AI Agents Hub
            </h2>
            <Sparkles className="w-8 h-8 text-purple-400 icon-glow" />
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose an AI agent to get started with your workflow automation
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mt-6 rounded-full pulse-glow"></div>
        </div>
        
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
            <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center card-3d float neon-border">
              <span className="text-6xl">🤖</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 neon-text">
              No agents available
            </h3>
            <p className="text-slate-300 text-lg">
              Please contact your admin to set up AI agents for your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
