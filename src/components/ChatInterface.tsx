
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IntegrationsPanel } from './IntegrationsPanel';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    source?: 'slack' | 'teams';
    hasChart?: boolean;
    hasIssueCard?: boolean;
  };
}

export const ChatInterface: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [project, setProject] = useState('');
  const [board, setBoard] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I understand you want to work with your sprint. Let me help you with that. Here's the current sprint status:",
        timestamp: new Date(),
        metadata: { hasChart: true, hasIssueCard: true },
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);
  };

  const quickActions = [
    "Create Sprint",
    "Show Sprint Status", 
    "View Backlog",
    "Generate Report"
  ];

  if (!isConfigured) {
    return (
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🏃‍♂️ Scrum Master Bot
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Configure your integrations to get started
            </p>
          </div>
          
          <IntegrationsPanel onConfigured={() => setIsConfigured(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <nav className="text-sm text-slate-600 dark:text-slate-400">
              <span>Home</span> / <span className="text-teal-600 dark:text-teal-400">Scrum Master Bot</span>
            </nav>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Connected ✅
              </Badge>
              <Button variant="outline" size="sm">
                ⟳ Sync
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-700 dark:text-slate-300">
              Project: <strong>{project || "My Project"}</strong>
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Board: <strong>{board || "Sprint Board"}</strong>
            </span>
            <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400">
              ✏️ Edit
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏃‍♂️</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Hi! I'm your Scrum Master Bot. Ask me about sprints, backlogs, or type "/" for commands.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    
                    {message.metadata?.hasIssueCard && (
                      <Card className="mt-3 bg-white dark:bg-slate-600 border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">PROJ-123</span>
                            <Badge variant="outline" className="text-xs">In Progress</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm">Implement user authentication</p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {message.metadata?.hasChart && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-600 rounded border">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Sprint Burndown</p>
                        <div className="h-20 bg-gradient-to-r from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800 rounded flex items-end justify-center">
                          <span className="text-xs text-slate-700 dark:text-slate-300">📊 Chart placeholder</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(action)}
                  className="text-xs"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your sprint… (or type '/' for commands)"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-slate-200 dark:border-slate-600"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                ✈️
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
