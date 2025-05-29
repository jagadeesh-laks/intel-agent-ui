
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AgentCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  status: 'configured' | 'not-configured';
  onChatClick: (id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  title,
  subtitle,
  icon: Icon,
  status,
  onChatClick,
}) => {
  const isConfigured = status === 'configured';

  return (
    <Card className="card-3d group bg-white/70 dark:bg-slate-800/70 glass-effect border-0 overflow-hidden">
      <CardHeader className="pb-3 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 rounded-2xl card-3d group-hover:spin-slow">
            <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={`btn-3d ${
              isConfigured 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 pulse-glow" 
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {isConfigured ? "Ready ✅" : "Setup needed ⚠️"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <Button
          onClick={() => onChatClick(id)}
          disabled={!isConfigured}
          className={`w-full btn-3d transition-all duration-500 ${
            isConfigured
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-2xl"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          <span className="mr-2 text-lg">💬</span>
          <span className="font-semibold">Start Chat</span>
        </Button>
      </CardContent>
    </Card>
  );
};
