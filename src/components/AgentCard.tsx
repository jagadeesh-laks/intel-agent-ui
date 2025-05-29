
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
  onChatClick,
}) => {
  const isConfigured = status === 'configured';

  return (
    <Card className="card-3d group glass-morphism border-0 overflow-hidden professional-border comic-edges relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-white/2 via-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Comic-style robot edges */}
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/30 dark:border-black/30"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/30 dark:border-black/30"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-6 bg-gradient-to-br from-gray-900/80 to-black/80 dark:from-gray-100/80 dark:to-white/80 rounded-3xl card-3d group-hover:scale-110 transition-all duration-500 professional-border relative overflow-hidden backdrop-blur-sm comic-edges">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Icon className="w-12 h-12 text-white dark:text-black relative z-10" />
            
            {/* Robot-style decorative elements */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/20 dark:bg-black/20 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/40 dark:bg-black/40 rounded-full"></div>
          </div>
          
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={`btn-3d text-xs font-semibold px-4 py-2 ${
              isConfigured 
                ? "bg-gradient-to-r from-gray-800/30 to-black/30 dark:from-gray-200/30 dark:to-white/30 text-white dark:text-black professional-border" 
                : "bg-gradient-to-r from-gray-600/30 to-gray-800/30 dark:from-gray-400/30 dark:to-gray-600/30 text-gray-300 dark:text-gray-700 professional-border"
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
          <h3 className="font-bold text-2xl text-white dark:text-black mb-3 group-hover:text-slate-300 dark:group-hover:text-slate-700 transition-all duration-300">
            {title}
          </h3>
          <p className="text-slate-300 dark:text-slate-700 leading-relaxed text-base">
            {subtitle}
          </p>
        </div>
        
        <Button
          onClick={() => onChatClick(id)}
          disabled={!isConfigured}
          className={`w-full btn-3d h-14 transition-all duration-500 text-lg font-semibold ${
            isConfigured
              ? "bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black"
              : "bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-300 dark:to-gray-400 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
        >
          <MessageCircle className="w-5 h-5 mr-3" />
          <span>{isConfigured ? 'Start Chat' : 'Configure First'}</span>
        </Button>
      </CardContent>
    </Card>
  );
};
