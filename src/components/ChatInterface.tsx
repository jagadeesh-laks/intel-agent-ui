
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { IntegrationsPanel } from './IntegrationsPanel';
import { Send, RotateCcw, Edit3, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    source?: 'slack' | 'teams';
    hasChart?: boolean;
    hasIssueCard?: boolean;
    jiraKey?: string;
    issueTitle?: string;
    issueStatus?: string;
  };
}

export const ChatInterface: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [project, setProject] = useState('Demo Project');
  const [board, setBoard] = useState('Sprint Board');
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setShowCommandSuggestions(false);

    // Simulate agent response with rich content
    setTimeout(() => {
      let agentContent = "I'll help you with that! Here's what I found:";
      let metadata: any = {};

      if (inputValue.toLowerCase().includes('sprint status') || inputValue.toLowerCase().includes('/sprintstatus')) {
        agentContent = "Here's your current sprint status with burndown chart and active issues:";
        metadata = { hasChart: true, hasIssueCard: true, jiraKey: 'PROJ-123', issueTitle: 'Implement user authentication', issueStatus: 'In Progress' };
      } else if (inputValue.toLowerCase().includes('create sprint') || inputValue.toLowerCase().includes('/createsprint')) {
        agentContent = "I'll create a new sprint for you. Here are the current backlog items ready for sprint planning:";
        metadata = { hasIssueCard: true, jiraKey: 'PROJ-124', issueTitle: 'Add payment integration', issueStatus: 'Ready for Dev' };
      }

      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentContent,
        timestamp: new Date(),
        metadata,
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowCommandSuggestions(value.startsWith('/'));
  };

  const quickActions = [
    { label: "Create Sprint", command: "/createsprint" },
    { label: "Sprint Status", command: "/sprintstatus" }, 
    { label: "View Backlog", command: "/backlog" },
    { label: "Generate Report", command: "/report" },
    { label: "Sync Jira", command: "/sync" }
  ];

  const slashCommands = [
    "/createsprint - Create a new sprint",
    "/sprintstatus - Show current sprint status", 
    "/backlog - View product backlog",
    "/report - Generate sprint report",
    "/sync - Sync with Jira"
  ];

  if (!isConfigured) {
    return (
      <div className="pt-20 min-h-screen gradient-bg transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 float">
              🏃‍♂️ Scrum Master Bot
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Configure your integrations to unlock the full power of AI-driven sprint management
            </p>
          </div>
          
          <IntegrationsPanel onConfigured={() => setIsConfigured(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen gradient-bg transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Header */}
        <div className="mb-8 p-6 glass-effect card-3d rounded-2xl border-0 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <nav className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
              <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">Home</span> 
              <span>/</span> 
              <span className="text-teal-600 dark:text-teal-400 font-semibold">Scrum Master Bot</span>
            </nav>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 pulse-glow">
                Connected ✅
              </Badge>
              <Button variant="outline" size="sm" className="btn-3d">
                <RotateCcw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-700 dark:text-slate-300 flex items-center">
                Project: <strong className="ml-2 text-teal-600 dark:text-teal-400">{project}</strong>
              </span>
              <span className="text-slate-700 dark:text-slate-300 flex items-center">
                Board: <strong className="ml-2 text-teal-600 dark:text-teal-400">{board}</strong>
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400 btn-3d">
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Enhanced Chat Container */}
        <div className="glass-effect card-3d rounded-2xl border-0 shadow-2xl h-[700px] flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto chat-scrollbar space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center card-3d float">
                  <span className="text-3xl">🏃‍♂️</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Ready to manage your sprints!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Ask me about sprints, backlogs, or type "/" for available commands.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl px-6 py-4 rounded-2xl chat-bubble ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : 'bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 glass-effect'
                  }`}>
                    {message.metadata?.source && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        via {message.metadata.source}
                      </Badge>
                    )}
                    <p className="leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    
                    {message.metadata?.hasIssueCard && (
                      <Card className="mt-4 card-3d border-0 glass-effect">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-teal-600 dark:text-teal-400">
                              {message.metadata.jiraKey}
                            </span>
                            <Badge variant="outline" className="text-xs btn-3d">
                              {message.metadata.issueStatus}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm font-medium">{message.metadata.issueTitle}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Checkbox 
                              checked={slackIntegration}
                              onCheckedChange={(checked) => setSlackIntegration(checked === true)}
                              className="btn-3d"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Also post to Slack/Teams
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {message.metadata?.hasChart && (
                      <div className="mt-4 p-4 glass-effect rounded-xl border-0 card-3d">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-medium">
                          Sprint Burndown Chart
                        </p>
                        <div className="h-32 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl flex items-center justify-center card-3d">
                          <div className="text-center">
                            <Zap className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              Interactive Chart
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === 'agent' && (
                      <div className="mt-4 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={emailAlerts}
                            onCheckedChange={(checked) => setEmailAlerts(checked === true)}
                            className="btn-3d"
                          />
                          <span className="text-slate-600 dark:text-slate-400">
                            Send email summary
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(action.command)}
                  className="text-xs btn-3d hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Command Suggestions */}
          {showCommandSuggestions && (
            <div className="px-6 py-2 border-t border-slate-200/50 dark:border-slate-700/50 glass-effect">
              <div className="space-y-1">
                {slashCommands.map((command) => (
                  <div
                    key={command}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                    onClick={() => {
                      setInputValue(command.split(' - ')[0]);
                      setShowCommandSuggestions(false);
                    }}
                  >
                    {command}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input */}
          <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask about your sprint… (or type '/' for commands)"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 h-12 border-slate-200 dark:border-slate-600 btn-3d text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-12 px-6 btn-3d bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
