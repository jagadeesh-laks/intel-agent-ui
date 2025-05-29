
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
  neonColor: string;
  onChatClick: (id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  title,
  subtitle,
  icon: Icon,
  status,
  neonColor,
  onChatClick,
}) => {
  const isConfigured = status === 'configured';
  
  const getNeonClasses = (color: string) => {
    switch (color) {
      case 'green': return { border: 'neon-border-green', glow: 'neon-glow-green', text: 'neon-text-green' };
      case 'blue': return { border: 'neon-border-blue', glow: 'neon-glow-blue', text: 'neon-text-blue' };
      case 'pink': return { border: 'neon-border-pink', glow: 'neon-glow-pink', text: 'neon-text-pink' };
      case 'orange': return { border: 'neon-border-orange', glow: 'neon-glow-orange', text: 'neon-text-orange' };
      case 'yellow': return { border: 'neon-border-yellow', glow: 'neon-glow-yellow', text: 'neon-text-yellow' };
      default: return { border: 'neon-border-green', glow: 'neon-glow-green', text: 'neon-text-green' };
    }
  };

  const neonClasses = getNeonClasses(neonColor);

  return (
    <Card className={`card-3d group glass-morphism border-0 overflow-hidden ${neonClasses.border} relative h-full`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Comic-style robot edges */}
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-current opacity-30"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className={`p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-3xl card-3d group-hover:scale-110 transition-all duration-500 ${neonClasses.border} relative overflow-hidden backdrop-blur-sm`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Icon className={`w-12 h-12 ${neonClasses.text} icon-glow relative z-10`} />
            
            {/* Robot-style decorative elements */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-current opacity-20 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-current opacity-40 rounded-full"></div>
          </div>
          
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={`btn-3d text-xs font-semibold px-4 py-2 ${
              isConfigured 
                ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 neon-border-green border-green-500/50 neon-glow-green" 
                : "bg-gradient-to-r from-orange-500/30 to-yellow-500/30 text-orange-400 neon-border-orange border-orange-500/50"
            }`}
          >
            {isConfigured ? (
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ⚡ SETUP
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div>
          <h3 className={`font-bold text-2xl text-white mb-3 group-hover:${neonClasses.text} transition-all duration-300`}>
            {title}
          </h3>
          <p className="text-slate-300 leading-relaxed text-base">
            {subtitle}
          </p>
        </div>
        
        <Button
          onClick={() => onChatClick(id)}
          disabled={!isConfigured}
          className={`w-full btn-3d h-14 transition-all duration-500 text-lg font-semibold ${
            isConfigured
              ? `bg-gradient-to-r from-${neonColor}-500 via-blue-500 to-pink-500 hover:from-${neonColor}-400 hover:via-blue-400 hover:to-pink-400 text-white ${neonClasses.glow}`
              : "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400 cursor-not-allowed border-slate-600"
          }`}
        >
          <MessageCircle className="w-5 h-5 mr-3" />
          <span>{isConfigured ? 'Start Chat' : 'Configure First'}</span>
        </Button>
      </CardContent>
    </Card>
  );
};
