
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Settings, 
  RefreshCw, 
  MessageCircle, 
  Zap,
  Bot,
  User,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Slack,
  Mail
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  source?: 'slack' | 'teams';
  hasChart?: boolean;
  issueCard?: {
    key: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
  };
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your Scrum Master Bot. I can help you manage sprints, track issues, and coordinate with your team. What would you like to do today?',
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [project] = useState('Project Alpha');
  const [board] = useState('Sprint Board 1');
  const [postToSlack, setPostToSlack] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: 'Create Sprint', command: '/createsprint' },
    { label: 'Sprint Status', command: '/sprintstatus' },
    { label: 'Team Velocity', command: '/velocity' },
    { label: 'Burndown Chart', command: '/burndown' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'I understand you want to ' + newMessage.toLowerCase() + '. Let me help you with that...',
        timestamp: new Date(),
        hasChart: newMessage.includes('chart') || newMessage.includes('velocity'),
        issueCard: newMessage.includes('issue') ? {
          key: 'PROJ-123',
          title: 'Implement user authentication',
          status: 'in-progress'
        } : undefined
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);

    setNewMessage('');
  };

  const handleQuickAction = (command: string) => {
    setNewMessage(command);
    handleSendMessage();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-600 text-slate-200';
      case 'in-progress': return 'bg-blue-600 text-blue-200';
      case 'done': return 'bg-green-600 text-green-200';
      default: return 'bg-slate-600 text-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="w-3 h-3" />;
      case 'in-progress': return <AlertTriangle className="w-3 h-3" />;
      case 'done': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg circuit-pattern relative">
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Header */}
        <Card className="mb-6 glass-effect neon-border-blue">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg neon-glow">
                  <Bot className="w-6 h-6 text-white icon-glow" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white neon-text-blue">Scrum Master Bot</CardTitle>
                  <p className="text-slate-300">
                    {project} • {board}
                    <Button variant="ghost" size="sm" className="ml-2 p-1 h-6 text-slate-400 hover:text-white">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500/20 text-green-400 neon-border-cyan">
                  <Zap className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Button variant="ghost" size="sm" className="btn-3d neon-border">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col glass-effect neon-border">
              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto chat-scrollbar space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-center gap-2 mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        } neon-glow`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.source && (
                          <Badge variant="outline" className="text-xs neon-border-cyan">
                            via {message.source}
                          </Badge>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-2xl chat-bubble ${
                        message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'
                      }`}>
                        <p className="text-white">{message.content}</p>
                        
                        {/* Issue Card */}
                        {message.issueCard && (
                          <Card className="mt-3 glass-effect neon-border-purple">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-white">{message.issueCard.key}</p>
                                  <p className="text-sm text-slate-300">{message.issueCard.title}</p>
                                </div>
                                <Badge className={`${getStatusColor(message.issueCard.status)} flex items-center gap-1`}>
                                  {getStatusIcon(message.issueCard.status)}
                                  {message.issueCard.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Chart */}
                        {message.hasChart && (
                          <Card className="mt-3 glass-effect neon-border-pink">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-white">Sprint Velocity Chart</span>
                              </div>
                              <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-slate-300">📊 Chart visualization would appear here</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      
                      {/* Agent response options */}
                      {message.type === 'agent' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                              type="checkbox"
                              checked={postToSlack}
                              onChange={(e) => setPostToSlack(e.target.checked)}
                              className="rounded"
                            />
                            <Slack className="w-3 h-3" />
                            Post to Slack
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                              type="checkbox"
                              checked={emailAlerts}
                              onChange={(e) => setEmailAlerts(e.target.checked)}
                              className="rounded"
                            />
                            <Mail className="w-3 h-3" />
                            Email alerts
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-700">
                <div className="flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask about your sprint… (or type / for commands)"
                    className="input-neon text-white placeholder-slate-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="btn-3d bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 neon-glow"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.command}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.command)}
                      className="btn-3d neon-border text-slate-300 hover:text-white text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <Card className="glass-effect neon-border-purple">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400 icon-glow" />
                  Sprint Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Days remaining</span>
                  <span className="text-white font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Issues completed</span>
                  <span className="text-green-400 font-medium">8/12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Story points</span>
                  <span className="text-blue-400 font-medium">34/50</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect neon-border-cyan">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400 icon-glow" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-slate-300">John moved PROJ-123 to Done</p>
                  <span className="text-xs text-slate-500">2 minutes ago</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-300">Sarah added a comment</p>
                  <span className="text-xs text-slate-500">1 hour ago</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-300">Sprint planning completed</p>
                  <span className="text-xs text-slate-500">Yesterday</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
