
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
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={`${
              isConfigured 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {isConfigured ? "Configured ✅" : "Not configured ⚠️"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{subtitle}</p>
        </div>
        
        <Button
          onClick={() => onChatClick(id)}
          disabled={!isConfigured}
          className={`w-full transition-all duration-300 ${
            isConfigured
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          <span className="mr-2">💬</span>
          Chat
        </Button>
      </CardContent>
    </Card>
  );
};
