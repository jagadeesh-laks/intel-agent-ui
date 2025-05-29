
import React from 'react';
import { AgentCard } from './AgentCard';
import { Calculator, GanttChart, Users, Kanban } from 'lucide-react';

const agents = [
  {
    id: 'scrum-master',
    title: 'Scrum Master Bot',
    subtitle: 'Manage sprints via chat',
    icon: Kanban,
    status: 'not-configured' as const,
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
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Agent Directory
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Choose an AI agent to get started with your workflow automation
          </p>
        </div>
        
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                onChatClick={onAgentSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No agents available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Please contact your admin to set up AI agents for your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
