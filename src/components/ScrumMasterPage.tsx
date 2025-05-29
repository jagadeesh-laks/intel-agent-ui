
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
  Calendar,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Slack,
  Mail
} from 'lucide-react';

interface ScrumMasterPageProps {
  onBack: () => void;
}

export const ScrumMasterPage: React.FC<ScrumMasterPageProps> = ({ onBack }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [managementTool, setManagementTool] = useState('');
  const [communicationTool, setCommunicationTool] = useState('');
  const [aiEngine, setAiEngine] = useState('');

  const handleConfigure = () => {
    if (managementTool && aiEngine && apiKey) {
      setIsConfigured(true);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];
  const boards = ['Sprint Board 1', 'Sprint Board 2', 'Kanban Board'];

  return (
    <div className="pt-20 min-h-screen animated-bg relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-xl float"></div>
      <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-xl float" style={{animationDelay: '2s'}}></div>

      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Header */}
        <Card className="mb-6 glass-morphism neon-border-green">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg neon-glow-green card-3d">
                  <Bot className="w-6 h-6 text-white icon-glow" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white neon-text-green">Scrum Master Bot</CardTitle>
                  <p className="text-slate-300">
                    {selectedProject && selectedBoard ? `${selectedProject} • ${selectedBoard}` : 'No project selected'}
                  </p>
                </div>
              </div>
              <Badge className={`btn-3d ${isConfigured ? 'bg-green-500/20 text-green-400 neon-border-green neon-glow-green' : 'bg-orange-500/20 text-orange-400 neon-border-orange'}`}>
                <Zap className="w-3 h-3 mr-1" />
                {isConfigured ? 'Connected' : 'Setup Required'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Integrations */}
            <Card className="glass-morphism neon-border-blue">
              <CardHeader>
                <CardTitle className="text-white neon-text-blue flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Management Tools */}
                <div>
                  <Label className="text-white mb-3 block">Management Tool</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Jira', 'Azure', 'Trello', 'GitHub'].map((tool) => (
                      <Button
                        key={tool}
                        variant={managementTool === tool ? 'default' : 'outline'}
                        onClick={() => setManagementTool(tool)}
                        className={`btn-3d text-sm ${managementTool === tool ? 'neon-glow-green' : 'neon-border-green'}`}
                      >
                        {tool}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Communication Tools */}
                <div>
                  <Label className="text-white mb-3 block">Communication</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Slack', 'Teams'].map((tool) => (
                      <Button
                        key={tool}
                        variant={communicationTool === tool ? 'default' : 'outline'}
                        onClick={() => setCommunicationTool(tool)}
                        className={`btn-3d text-sm ${communicationTool === tool ? 'neon-glow-blue' : 'neon-border-blue'}`}
                      >
                        {tool}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* AI Engine */}
                <div>
                  <Label className="text-white mb-3 block">AI Engine</Label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['ChatGPT', 'Gemini', 'DeepSeek', 'Meta'].map((engine) => (
                      <Button
                        key={engine}
                        variant={aiEngine === engine ? 'default' : 'outline'}
                        onClick={() => setAiEngine(engine)}
                        className={`btn-3d text-xs ${aiEngine === engine ? 'neon-glow-pink' : 'neon-border-pink'}`}
                      >
                        {engine}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="API Key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="input-neon text-white"
                  />
                </div>

                <Button
                  onClick={handleConfigure}
                  disabled={!managementTool || !aiEngine || !apiKey}
                  className="w-full btn-3d bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 neon-glow-green"
                >
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            {/* Project Selection */}
            {isConfigured && (
              <Card className="glass-morphism neon-border-orange">
                <CardHeader>
                  <CardTitle className="text-white neon-text-orange">Project Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="input-neon text-white">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism neon-border-orange">
                        {projects.map((project) => (
                          <SelectItem key={project} value={project}>{project}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-2 block">Board</Label>
                    <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                      <SelectTrigger className="input-neon text-white">
                        <SelectValue placeholder="Select Board" />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism neon-border-orange">
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
              <Card className="glass-morphism neon-border-yellow">
                <CardHeader>
                  <CardTitle className="text-white neon-text-yellow flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Progress</span>
                    <span className="neon-text-green font-bold">68%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full neon-glow-green" style={{width: '68%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deviation</span>
                    <span className="text-red-400">+5%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Date</span>
                      <span className="text-white">Jan 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Due Date</span>
                      <span className="text-white">Mar 30, 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Area */}
            <Card className="h-96 flex flex-col glass-morphism neon-border-green">
              <CardHeader className="pb-3">
                <CardTitle className="text-white neon-text-green flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 mb-4 p-4 bg-slate-900/30 rounded-lg overflow-y-auto">
                  {selectedProject && selectedBoard ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-3 rounded-lg">
                        <p className="text-white">Hello! I'm your Scrum Master Bot. How can I help you today?</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Sprint Status', 'Create Sprint', 'Team Velocity', 'Burndown Chart'].map((action) => (
                          <Button key={action} variant="outline" size="sm" className="btn-3d neon-border-blue text-xs">
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Configure your setup and select a project to start chatting
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-neon text-white"
                    disabled={!selectedProject || !selectedBoard}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!selectedProject || !selectedBoard}
                    className="btn-3d bg-gradient-to-r from-green-500 to-blue-500 neon-glow-green"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Monitor */}
            <Card className="glass-morphism neon-border-pink">
              <CardHeader>
                <CardTitle className="text-white neon-text-pink flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Team Activity Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg neon-border-green">
                    <CheckCircle className="w-8 h-8 neon-text-green mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-sm text-slate-400">Completed</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg neon-border-blue">
                    <Clock className="w-8 h-8 neon-text-blue mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-sm text-slate-400">In Progress</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg neon-border-orange">
                    <AlertTriangle className="w-8 h-8 neon-text-orange mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-sm text-slate-400">Blocked</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-white font-semibold">Recent Activities</h4>
                  <div className="space-y-2">
                    {[
                      { user: 'John Doe', action: 'completed TASK-123', time: '2 min ago', icon: CheckCircle, color: 'green' },
                      { user: 'Sarah Kim', action: 'started TASK-124', time: '5 min ago', icon: Clock, color: 'blue' },
                      { user: 'Mike Chen', action: 'blocked TASK-125', time: '10 min ago', icon: AlertTriangle, color: 'orange' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                        <activity.icon className={`w-4 h-4 neon-text-${activity.color}`} />
                        <span className="text-white text-sm">{activity.user}</span>
                        <span className="text-slate-400 text-sm">{activity.action}</span>
                        <span className="text-slate-500 text-xs ml-auto">{activity.time}</span>
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
