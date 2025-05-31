import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Settings, 
  MessageCircle, 
  Send, 
  Zap, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Link,
  Check
} from 'lucide-react';

interface ScrumMasterPageProps {
  onBack: () => void;
}

export const ScrumMasterPage: React.FC<ScrumMasterPageProps> = ({ onBack }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Management tool states
  const [managementTool, setManagementTool] = useState('');
  const [managementCredentials, setManagementCredentials] = useState('');
  const [managementConnected, setManagementConnected] = useState(false);

  // Communication tool states (optional)
  const [communicationTool, setCommunicationTool] = useState('');
  const [communicationCredentials, setCommunicationCredentials] = useState('');
  const [communicationConnected, setCommunicationConnected] = useState(false);

  // Email tool states (optional)
  const [emailTool, setEmailTool] = useState('');
  const [emailCredentials, setEmailCredentials] = useState('');
  const [emailConnected, setEmailConnected] = useState(false);

  // AI Engine states
  const [aiEngine, setAiEngine] = useState('');
  const [aiCredentials, setAiCredentials] = useState('');
  const [aiConnected, setAiConnected] = useState(false);

  const handleConfigure = () => {
    if (managementTool && managementConnected && aiEngine && aiConnected) {
      setIsConfigured(true);
      setShowSettings(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  const handleManagementConnect = () => {
    if (managementCredentials.trim()) {
      setManagementConnected(true);
    }
  };

  const handleCommunicationConnect = () => {
    if (communicationCredentials.trim()) {
      setCommunicationConnected(true);
    }
  };

  const handleEmailConnect = () => {
    if (emailCredentials.trim()) {
      setEmailConnected(true);
    }
  };

  const handleAiConnect = () => {
    if (aiCredentials.trim()) {
      setAiConnected(true);
    }
  };

  const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];
  const boards = ['Sprint Board 1', 'Sprint Board 2', 'Kanban Board'];

  const getStatusColor = () => {
    if (isConfigured) {
      return "bg-green-100/20 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/30 dark:border-green-800/30";
    }
    return "bg-purple-100/20 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200/30 dark:border-purple-800/30";
  };

  return (
    <div className="pt-20 min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-white/5 blur-xl float"></div>
      <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-white/8 to-white/3 blur-xl float" style={{animationDelay: '2s'}}></div>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Header */}
        <Card className="mb-6 glass-morphism professional-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-gray-800 to-black dark:from-gray-200 dark:to-white rounded-lg card-3d comic-edges">
                  <Bot className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white dark:text-black modern-text">Scrum Master Bot</CardTitle>
                  <p className="text-slate-300 dark:text-slate-700">
                    {selectedProject && selectedBoard ? `${selectedProject} • ${selectedBoard}` : 'No project selected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="outline"
                  className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">Settings</span>
                </Button>
                <Badge className={`btn-3d ${getStatusColor()}`}>
                  <Zap className="w-3 h-3 mr-1" />
                  {isConfigured ? 'Connected' : 'Setup Required'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          {showSettings && (
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Management Tools - Required */}
                  <div>
                    <Label className="text-white dark:text-black mb-3 block font-semibold">Management Tool *</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Jira', 'Azure', 'Trello', 'GitHub'].map((tool) => (
                        <Button
                          key={tool}
                          variant={managementTool === tool ? 'default' : 'outline'}
                          onClick={() => setManagementTool(tool)}
                          className={`btn-3d text-sm group relative ${
                            managementTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{tool}</span>
                          <span className={managementTool === tool ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}>{tool}</span>
                        </Button>
                      ))}
                    </div>
                    {managementTool && (
                      <div className="space-y-2">
                        <Input
                          placeholder={`${managementTool} API Key/Token`}
                          type="password"
                          value={managementCredentials}
                          onChange={(e) => setManagementCredentials(e.target.value)}
                          className="input-modern"
                          disabled={managementConnected}
                        />
                        <Button
                          onClick={handleManagementConnect}
                          disabled={!managementCredentials.trim() || managementConnected}
                          className={`w-full btn-3d text-sm ${
                            managementConnected 
                              ? 'bg-green-600/20 text-green-400 border-green-400/30' 
                              : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black'
                          }`}
                        >
                          {managementConnected ? (
                            <><Check className="w-4 h-4 mr-2" />Connected</>
                          ) : (
                            <><Link className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Communication Tools - Optional */}
                  <div>
                    <Label className="text-white dark:text-black mb-3 block">Communication Tool (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Slack', 'Teams'].map((tool) => (
                        <Button
                          key={tool}
                          variant={communicationTool === tool ? 'default' : 'outline'}
                          onClick={() => setCommunicationTool(tool)}
                          className={`btn-3d text-sm group relative ${
                            communicationTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{tool}</span>
                          <span className={communicationTool === tool ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}>{tool}</span>
                        </Button>
                      ))}
                    </div>
                    {communicationTool && (
                      <div className="space-y-2">
                        <Input
                          placeholder={`${communicationTool} Webhook URL`}
                          value={communicationCredentials}
                          onChange={(e) => setCommunicationCredentials(e.target.value)}
                          className="input-modern"
                          disabled={communicationConnected}
                        />
                        <Button
                          onClick={handleCommunicationConnect}
                          disabled={!communicationCredentials.trim() || communicationConnected}
                          className={`w-full btn-3d text-sm ${
                            communicationConnected 
                              ? 'bg-green-600/20 text-green-400 border-green-400/30' 
                              : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black'
                          }`}
                        >
                          {communicationConnected ? (
                            <><Check className="w-4 h-4 mr-2" />Connected</>
                          ) : (
                            <><Link className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email Integration - Optional */}
                  <div>
                    <Label className="text-white dark:text-black mb-3 block">Email Integration (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Gmail', 'Office365'].map((tool) => (
                        <Button
                          key={tool}
                          variant={emailTool === tool ? 'default' : 'outline'}
                          onClick={() => setEmailTool(tool)}
                          className={`btn-3d text-sm group relative ${
                            emailTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{tool}</span>
                          <span className={emailTool === tool ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}>{tool}</span>
                        </Button>
                      ))}
                    </div>
                    {emailTool && (
                      <div className="space-y-2">
                        <Input
                          placeholder={`${emailTool} OAuth Token`}
                          type="password"
                          value={emailCredentials}
                          onChange={(e) => setEmailCredentials(e.target.value)}
                          className="input-modern"
                          disabled={emailConnected}
                        />
                        <Button
                          onClick={handleEmailConnect}
                          disabled={!emailCredentials.trim() || emailConnected}
                          className={`w-full btn-3d text-sm ${
                            emailConnected 
                              ? 'bg-green-600/20 text-green-400 border-green-400/30' 
                              : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black'
                          }`}
                        >
                          {emailConnected ? (
                            <><Check className="w-4 h-4 mr-2" />Connected</>
                          ) : (
                            <><Link className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* AI Engine - Required */}
                  <div>
                    <Label className="text-white dark:text-black mb-3 block font-semibold">AI Engine *</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['ChatGPT', 'Gemini', 'Ollama', 'Meta'].map((engine) => (
                        <Button
                          key={engine}
                          variant={aiEngine === engine ? 'default' : 'outline'}
                          onClick={() => setAiEngine(engine)}
                          className={`btn-3d text-xs group relative ${
                            aiEngine === engine 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{engine}</span>
                          <span className={aiEngine === engine ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}>{engine}</span>
                        </Button>
                      ))}
                    </div>
                    {aiEngine && (
                      <div className="space-y-2">
                        <Input
                          placeholder={`${aiEngine} API Key`}
                          type="password"
                          value={aiCredentials}
                          onChange={(e) => setAiCredentials(e.target.value)}
                          className="input-modern"
                          disabled={aiConnected}
                        />
                        <Button
                          onClick={handleAiConnect}
                          disabled={!aiCredentials.trim() || aiConnected}
                          className={`w-full btn-3d text-sm ${
                            aiConnected 
                              ? 'bg-green-600/20 text-green-400 border-green-400/30' 
                              : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black'
                          }`}
                        >
                          {aiConnected ? (
                            <><Check className="w-4 h-4 mr-2" />Connected</>
                          ) : (
                            <><Link className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleConfigure}
                    disabled={!managementTool || !managementConnected || !aiEngine || !aiConnected}
                    className="w-full btn-3d bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black"
                  >
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              {/* Project Selection */}
              {isConfigured && (
                <Card className="glass-morphism professional-border">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-black modern-text">Project Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white dark:text-black mb-2 block">Project</Label>
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="input-modern">
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent className="glass-morphism professional-border">
                          {projects.map((project) => (
                            <SelectItem key={project} value={project}>{project}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white dark:text-black mb-2 block">Board</Label>
                      <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                        <SelectTrigger className="input-modern">
                          <SelectValue placeholder="Select Board" />
                        </SelectTrigger>
                        <SelectContent className="glass-morphism professional-border">
                          {boards.map((board) => (
                            <SelectItem key={board} value={board}>{board}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Timeline */}
              {selectedProject && selectedBoard && (
                <Card className="glass-morphism professional-border">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Project Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Progress</span>
                      <span className="text-white dark:text-black font-bold">68%</span>
                    </div>
                    <div className="w-full bg-slate-700 dark:bg-slate-300 rounded-full h-3">
                      <div className="bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white h-3 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-slate-600">Deviation</span>
                      <span className="text-red-400 dark:text-red-600">+5%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-600">Start Date</span>
                        <span className="text-white dark:text-black">Jan 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-600">Due Date</span>
                        <span className="text-white dark:text-black">Mar 30, 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Chat Interface */}
          <div className={`${showSettings ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {/* Chat Area */}
            <Card className="h-96 flex flex-col glass-morphism professional-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 mb-4 p-4 bg-gray-900/30 dark:bg-gray-100/30 rounded-lg overflow-y-auto">
                  {selectedProject && selectedBoard ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-gray-800/20 to-black/20 dark:from-gray-200/20 dark:to-white/20 p-3 rounded-lg professional-border">
                        <p className="text-white dark:text-black">Hello! I'm your Scrum Master Bot. How can I help you today?</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Sprint Status', 'Create Sprint', 'Team Velocity', 'Burndown Chart'].map((action) => (
                          <Button key={action} variant="outline" size="sm" className="btn-3d professional-border text-xs">
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                      Configure your setup and select a project to start chatting
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-modern"
                    disabled={!selectedProject || !selectedBoard}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!selectedProject || !selectedBoard}
                    className="btn-3d bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Monitor */}
            <Card className="glass-morphism professional-border">
              <CardHeader>
                <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Team Activity Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800/10 dark:bg-gray-200/10 rounded-lg professional-border">
                    <CheckCircle className="w-8 h-8 text-white dark:text-black mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white dark:text-black">12</div>
                    <div className="text-sm text-slate-400 dark:text-slate-600">Completed</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/10 dark:bg-gray-200/10 rounded-lg professional-border">
                    <Clock className="w-8 h-8 text-white dark:text-black mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white dark:text-black">8</div>
                    <div className="text-sm text-slate-400 dark:text-slate-600">In Progress</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/10 dark:bg-gray-200/10 rounded-lg professional-border">
                    <AlertTriangle className="w-8 h-8 text-red-400 dark:text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white dark:text-black">3</div>
                    <div className="text-sm text-slate-400 dark:text-slate-600">Blocked</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-white dark:text-black font-semibold">Recent Activities</h4>
                  <div className="space-y-2">
                    {[
                      { user: 'John Doe', action: 'completed TASK-123', time: '2 min ago', icon: CheckCircle, color: 'white' },
                      { user: 'Sarah Kim', action: 'started TASK-124', time: '5 min ago', icon: Clock, color: 'white' },
                      { user: 'Mike Chen', action: 'blocked TASK-125', time: '10 min ago', icon: AlertTriangle, color: 'red' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-800/30 dark:bg-gray-200/30 rounded professional-border">
                        <activity.icon className={`w-4 h-4 ${activity.color === 'red' ? 'text-red-400 dark:text-red-600' : 'text-white dark:text-black'}`} />
                        <span className="text-white dark:text-black text-sm">{activity.user}</span>
                        <span className="text-slate-400 dark:text-slate-600 text-sm">{activity.action}</span>
                        <span className="text-slate-500 dark:text-slate-500 text-xs ml-auto">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
