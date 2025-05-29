
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon, MessageCircle, Zap } from 'lucide-react';

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
  const neonClass = id === 'scrum-master' ? 'neon-border-blue' : 
                   id === 'project-manager' ? 'neon-border-purple' : 
                   id === 'accountant' ? 'neon-border-pink' : 'neon-border-cyan';
  
  const glowClass = id === 'scrum-master' ? 'neon-glow' : 
                   id === 'project-manager' ? 'neon-glow-purple' : 
                   id === 'accountant' ? 'neon-glow-pink' : 'neon-glow-cyan';

  return (
    <Card className={`card-3d group glass-effect border-0 overflow-hidden ${neonClass} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className={`p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl card-3d group-hover:scale-110 transition-all duration-500 ${neonClass} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Icon className="w-10 h-10 text-blue-400 icon-glow relative z-10" />
          </div>
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={`btn-3d text-xs font-semibold px-3 py-1 ${
              isConfigured 
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 neon-border-cyan border-green-500/30" 
                : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 neon-border-pink border-amber-500/30"
            }`}
          >
            {isConfigured ? (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Ready
              </span>
            ) : (
              <span className="flex items-center gap-1">
                ⚠️ Setup needed
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div>
          <h3 className="font-bold text-2xl text-white mb-3 group-hover:neon-text-blue transition-all duration-300">
            {title}
          </h3>
          <p className="text-slate-300 leading-relaxed text-base">
            {subtitle}
          </p>
        </div>
        
        <Button
          onClick={() => onChatClick(id)}
          disabled={!isConfigured}
          className={`w-full btn-3d h-12 transition-all duration-500 text-lg font-semibold ${
            isConfigured
              ? `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white ${glowClass}`
              : "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400 cursor-not-allowed border-slate-600"
          }`}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span>Start Chat</span>
        </Button>
      </CardContent>
    </Card>
  );
};
