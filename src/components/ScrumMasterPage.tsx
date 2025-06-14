import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Loader2,
  Calendar,
  Users,
  Bug
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ScrumMasterPageProps {
  onBack: () => void;
}

interface SprintTimeline {
  progress: number;
  deviation: number;
  startDate: string;
  dueDate: string;
}

interface JiraConfig {
  id: string;
  email: string;
  domain: string;
  last_used: string | null;
  managementCredentials: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const [managementEmail, setManagementEmail] = useState('');
  const [managementDomain, setManagementDomain] = useState('');
  const [managementConnected, setManagementConnected] = useState(false);
  const [managementConnectionError, setManagementConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, key: string, name: string}>>([]);
  const [boards, setBoards] = useState<Array<{id: number, name: string, projectId: number}>>([]);
  const [filteredBoards, setFilteredBoards] = useState<Array<{id: number, name: string}>>([]);

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

  const [jiraConfigs, setJiraConfigs] = useState<JiraConfig[]>([]);
  const [showNewJiraForm, setShowNewJiraForm] = useState(false);
  const [isJiraOnline, setIsJiraOnline] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  // Move Jira config state to top level
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<JiraConfig | null>(null);
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [domain, setDomain] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sprintTimeline, setSprintTimeline] = useState<SprintTimeline | null>(null);

  const { toast } = useToast();

  // Add new state for team members
  const [teamMembers] = useState([
    'John Doe', 
    'Sarah Kim', 
    'Mike Chen', 
    'Emily Rodriguez', 
    'David Wilson',
    'Lisa Zhang',
    'Alex Thompson'
  ]);

  // Add useEffect to fetch initial data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Check Jira status
        const statusResponse = await fetch('http://localhost:6001/api/scrum-master/jira/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (statusResponse.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('jiraStatus');
          window.location.href = '/login';
          return;
        }

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('Jira status:', statusData);
          setIsJiraOnline(statusData.is_online);
          setIsConfigured(statusData.is_online);
          
          if (statusData.is_online) {
            // Fetch projects
            console.log('Fetching projects...');
            const projectsResponse = await fetch('http://localhost:6001/api/scrum-master/jira/projects', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              credentials: 'include'
            });

            if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json();
              console.log('Raw projects data:', projectsData);
              
              // Handle both array and object responses
              let projectsArray = Array.isArray(projectsData) ? projectsData : 
                                projectsData.values ? projectsData.values : 
                                projectsData.projects ? projectsData.projects : [];
              
              console.log('Processed projects array:', projectsArray);
              
              if (projectsArray.length > 0) {
                const formattedProjects = projectsArray.map((project: any) => ({
                  id: project.id || project.key,
                  key: project.key,
                  name: project.name || project.displayName || project.key
                }));
                console.log('Formatted projects:', formattedProjects);
                setProjects(formattedProjects);
              } else {
                console.log('No projects found in the response');
                setProjects([]);
              }
            } else {
              console.error('Failed to fetch projects:', projectsResponse.status);
              setProjects([]);
            }

            // Fetch boards
            console.log('Fetching boards...');
            const boardsResponse = await fetch('http://localhost:6001/api/scrum-master/jira/boards', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              credentials: 'include'
            });

            if (boardsResponse.ok) {
              const boardsData = await boardsResponse.json();
              console.log('Raw boards data:', boardsData);
              
              // Handle both array and object responses
              let boardsArray = Array.isArray(boardsData) ? boardsData : 
                              boardsData.values ? boardsData.values : 
                              boardsData.boards ? boardsData.boards : [];
              
              console.log('Processed boards array:', boardsArray);
              
              if (boardsArray.length > 0) {
                const formattedBoards = boardsArray.map((board: any) => ({
                  id: board.id,
                  name: board.name,
                  projectId: board.projectId || board.location?.projectId
                }));
                console.log('Formatted boards:', formattedBoards);
                setBoards(formattedBoards);
              } else {
                console.log('No boards found in the response');
                setBoards([]);
              }
            } else {
              console.error('Failed to fetch boards:', boardsResponse.status);
              setBoards([]);
            }

            // Fetch Jira configs
            const configsResponse = await fetch('http://localhost:6001/api/scrum-master/jira/configs', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              credentials: 'include'
            });

            if (configsResponse.ok) {
              const configsData = await configsResponse.json();
              console.log('Jira configs:', configsData);
              setJiraConfigs(configsData.configs || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch initial data. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    };

    fetchInitialData();
  }, []);

  const handleConfigure = async () => {
    if (managementTool && managementConnected && aiEngine && aiConnected) {
      await checkJiraStatus();
    }
  };

  const handleProjectBoardSelect = async () => {
    if (selectedProject && selectedBoard) {
      setShowSettings(false);
      // Get the board ID from the selected board name
      const boardId = boards.find(b => b.name === selectedBoard)?.id;
      if (boardId) {
        await fetchSprintTimeline(boardId.toString());
      }
    }
  };

  useEffect(() => {
    handleProjectBoardSelect();
  }, [selectedProject, selectedBoard]);

  useEffect(() => {
    if (selectedProject) {
      const projectId = projects.find(p => p.name === selectedProject)?.id;
      const filtered = boards
        .filter(board => board.projectId.toString() === projectId)
        .map(board => ({ id: board.id, name: board.name }));
      setFilteredBoards(filtered);
      setSelectedBoard(''); // Reset board selection when project changes
    } else {
      setFilteredBoards([]);
      setSelectedBoard('');
    }
  }, [selectedProject, projects, boards]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedProject || !selectedBoard) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to send messages",
          variant: "destructive"
        });
        return;
      }

      // Add user message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get project key and board ID
      const project = projects.find(p => p.name === selectedProject);
      const board = boards.find(b => b.name === selectedBoard);

      if (!project || !board) {
        toast({
          title: "Error",
          description: "Invalid project or board selection",
          variant: "destructive"
        });
        return;
      }

      // Send message to chat API
      const response = await fetch('http://localhost:6001/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: message,
          projectKey: project.key,
          boardId: board.id,
          aiEngine: aiEngine
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Clear message input
      setMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagementConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = 'http://localhost:6001/api/scrum-master/config';
      const method = selectedConfig ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      console.log('Making request:', {
        method,
        endpoint,
        selectedConfigId: selectedConfig?.id,
        email,
        domain
      });

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          api_token: apiToken,
          domain
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to Jira');
      }

      // Fetch projects and boards after successful connection
      try {
        // Fetch projects
        console.log('Fetching projects...');
        const projectsResponse = await fetch('http://localhost:6001/api/scrum-master/jira/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!projectsResponse.ok) {
          throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
        }

        const projectsData = await projectsResponse.json();
        console.log('Fetched projects:', projectsData);

        if (Array.isArray(projectsData)) {
          const formattedProjects = projectsData.map((project: any) => ({
            id: project.id || project.key,
            key: project.key,
            name: project.name || project.displayName || project.key
          }));
          console.log('Formatted projects:', formattedProjects);
          setProjects(formattedProjects);
        } else {
          console.error('Projects data is not an array:', projectsData);
          setProjects([]);
        }

        // Fetch boards
        console.log('Fetching boards...');
        const boardsResponse = await fetch('http://localhost:6001/api/scrum-master/jira/boards', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!boardsResponse.ok) {
          throw new Error(`Failed to fetch boards: ${boardsResponse.status}`);
        }

        const boardsData = await boardsResponse.json();
        console.log('Fetched boards:', boardsData);

        if (Array.isArray(boardsData)) {
          const formattedBoards = boardsData.map((board: any) => ({
            id: board.id,
            name: board.name,
            projectId: board.projectId
          }));
          console.log('Formatted boards:', formattedBoards);
          setBoards(formattedBoards);
        } else {
          console.error('Boards data is not an array:', boardsData);
          setBoards([]);
        }
      } catch (error) {
        console.error('Error fetching Jira data:', error);
        toast({
          title: "Warning",
          description: "Connected to Jira but failed to fetch projects and boards. Please try refreshing the page.",
          variant: "destructive"
        });
      }

      setIsConnected(true);
      setIsEditing(false);
      setManagementConnected(true);
      toast({
        title: "Success",
        description: "Successfully connected to Jira",
      });

      // Update the stored Jira status
      localStorage.setItem('jiraStatus', JSON.stringify({
        isOnline: true,
        isConfigured: true
      }));

    } catch (error) {
      console.error('Connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to Jira');
      setManagementConnected(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to Jira',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to log projects state changes
  useEffect(() => {
    console.log('Projects state updated:', projects);
  }, [projects]);

  // Add useEffect to log boards state changes
  useEffect(() => {
    console.log('Boards state updated:', boards);
  }, [boards]);

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

  const handleAiConnect = async () => {
    if (!aiCredentials.trim() || !aiEngine) return;
    
    try {
      setIsConnecting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to connect AI engine",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:6001/api/ai-config/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aiEngine: aiEngine.toLowerCase(),
          aiCredentials: aiCredentials
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect AI engine');
      }

      const data = await response.json();
      setAiConnected(true);
      toast({
        title: "Success",
        description: data.message || "AI engine connected successfully",
      });
    } catch (error) {
      console.error('Error connecting AI engine:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect AI engine",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkJiraStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:6001/api/scrum-master/jira/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsJiraOnline(data.is_online);
        if (data.is_online) {
          setIsConfigured(true);
        }
        // Store the updated status
        localStorage.setItem('jiraStatus', JSON.stringify({
          isOnline: data.is_online,
          isConfigured: data.is_online
        }));
      }
    } catch (error) {
      console.error('Error checking Jira status:', error);
      setIsJiraOnline(false);
      setIsConfigured(false);
      // Update stored status on error
      localStorage.setItem('jiraStatus', JSON.stringify({
        isOnline: false,
        isConfigured: false
      }));
    }
  };

  // Add useEffect to check status on mount and after config changes
  useEffect(() => {
    // Check for stored Jira status from login
    const storedStatus = localStorage.getItem('jiraStatus');
    if (storedStatus) {
      const { isOnline, isConfigured } = JSON.parse(storedStatus);
      setIsJiraOnline(isOnline);
      setIsConfigured(isConfigured);
    } else {
      // If no stored status, check the API
      checkJiraStatus();
    }
  }, []);

  const handleConfigSelect = (config: JiraConfig) => {
    setSelectedConfig(config);
    setEmail(config.email);
    setApiToken(config.managementCredentials);
    setDomain(config.domain);
    setIsConnected(false);
    setIsEditing(false);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setEmail('');
    setApiToken('');
    setDomain('');
    setIsConnected(false);
    setIsEditing(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const renderJiraConfig = () => {
    return (
      <div className="space-y-6">
        {/* Header with Title and Controls */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-white dark:text-black">Jira Configuration</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select
                value={selectedConfig?.id || ''}
                onValueChange={(value) => {
                  const config = jiraConfigs.find(c => c.id === value);
                  if (config) handleConfigSelect(config);
                }}
              >
                <SelectTrigger className="w-full input-modern">
                  <SelectValue placeholder="Select configuration" />
                </SelectTrigger>
                <SelectContent className="glass-morphism professional-border">
                  {jiraConfigs.length > 0 ? (
                    jiraConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.domain}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No configurations available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleNewConfig}
              className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black whitespace-nowrap"
            >
              New Connection
            </Button>
          </div>
        </div>

        {/* Configuration Form or Details */}
        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-800/20 dark:bg-gray-200/20 rounded-lg professional-border">
            <div>
              <Label htmlFor="email" className="text-white dark:text-black">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Jira email"
                className="input-modern mt-1"
              />
            </div>
            <div>
              <Label htmlFor="apiToken" className="text-white dark:text-black">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Jira API token"
                className="input-modern mt-1"
              />
            </div>
            <div>
              <Label htmlFor="domain" className="text-white dark:text-black">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter your Jira domain (e.g., your-domain.atlassian.net)"
                className="input-modern mt-1"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManagementConnect}
                disabled={isLoading || !email.trim() || !apiToken.trim() || !domain.trim()}
                className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
              >
                {isLoading ? (
                  <><Clock className="w-4 h-4 mr-2 animate-spin" />Connecting...</>
                ) : (
                  <><Link className="w-4 h-4 mr-2" />Connect</>
                )}
              </Button>
            </div>
          </div>
        ) : selectedConfig ? (
          <div className="space-y-4 p-4 bg-gray-800/20 dark:bg-gray-200/20 rounded-lg professional-border">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-white dark:text-black font-medium">Email</Label>
                <div className="p-2 bg-gray-900/30 dark:bg-gray-100/30 rounded-md">
                  <p className="text-sm text-gray-300 dark:text-gray-700">{selectedConfig.email}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-white dark:text-black font-medium">Domain</Label>
                <div className="p-2 bg-gray-900/30 dark:bg-gray-100/30 rounded-md">
                  <p className="text-sm text-gray-300 dark:text-gray-700">{selectedConfig.domain}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleEdit}
                variant="outline"
                className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
              >
                Edit
              </Button>
              <Button
                onClick={handleManagementConnect}
                disabled={isLoading}
                className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
              >
                {isLoading ? (
                  <><Clock className="w-4 h-4 mr-2 animate-spin" />Connecting...</>
                ) : isConnected ? (
                  <><Check className="w-4 h-4 mr-2" />Connected</>
                ) : (
                  <><Link className="w-4 h-4 mr-2" />Connect</>
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = () => {
    if (isConfigured) {
      if (isJiraOnline) {
      return "bg-green-100/20 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/30 dark:border-green-800/30";
      }
      return "bg-yellow-100/20 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200/30 dark:border-yellow-800/30";
    }
    return "bg-purple-100/20 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200/30 dark:border-purple-800/30";
  };

  const getStatusText = () => {
    if (isConfigured) {
      return isJiraOnline ? 'Online' : 'Setup Required';
    }
    return 'Setup Required';
  };

  // Add this useEffect for auto-scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSprintTimeline = async (boardId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // First get the active sprint for the board
      const activeSprintResponse = await fetch(`http://localhost:6001/api/scrum-master/jira/board/${boardId}/active-sprint`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (activeSprintResponse.ok) {
        const activeSprint = await activeSprintResponse.json();
        if (activeSprint) {
          // Then get the timeline data for the active sprint
          const timelineResponse = await fetch(`http://localhost:6001/api/scrum-master/sprint-timeline?boardId=${boardId}&sprintId=${activeSprint.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json();
            setSprintTimeline(timelineData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sprint timeline:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sprint timeline data",
        variant: "destructive"
      });
    }
  };

  const handleTeamMemberSelect = (memberName: string) => {
    setMessage(`What is the current status of ${memberName}?`);
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
                  <span className="opacity-100 group-hover:opacity-100 hover:opacity-100 transition-opacity">Settings</span>
                </Button>
                <Badge className={`btn-3d ${getStatusColor()}`}>
                  {isJiraOnline ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />Online</>
                  ) : (
                    <><AlertTriangle className="w-3 h-3 mr-1" />Setup Required</>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Selection and Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Selection - Always visible when Jira is configured */}
            {isConfigured && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Project Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white dark:text-black mb-2 block">Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="input-modern">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism professional-border">
                        {projects && projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.name}>
                              {project.name} {project.key ? `(${project.key})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {isLoading ? "Loading projects..." : "No projects available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white dark:text-black mb-2 block">Board</Label>
                    <Select 
                      value={selectedBoard} 
                      onValueChange={setSelectedBoard}
                      disabled={!selectedProject}
                    >
                      <SelectTrigger className="input-modern">
                        <SelectValue placeholder={selectedProject ? "Select Board" : "Select a project first"} />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism professional-border">
                        {filteredBoards && filteredBoards.length > 0 ? (
                          filteredBoards.map((board) => (
                            <SelectItem key={board.id} value={board.name}>
                              {board.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {selectedProject ? "No boards available" : "Select a project first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 1: Sprint Details */}
            {selectedProject && selectedBoard && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sprint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Title:</span>
                      <span className="text-white dark:text-black font-semibold">Sprint 24.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">State:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Start Date:</span>
                      <span className="text-white dark:text-black">2025-06-04</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Due Date:</span>
                      <span className="text-white dark:text-black">2025-06-12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Days Remaining:</span>
                      <span className="text-white dark:text-black font-bold">4 day(s)</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-300 dark:text-slate-700">Goal:</span>
                      <p className="text-white dark:text-black text-sm mt-1">Complete user authentication and dashboard features</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 2: Current Story Progress */}
            {selectedProject && selectedBoard && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Current Story Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Sprint Planning:</span>
                      <Badge variant="outline" className="text-white dark:text-black">1 (7.14%)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">In Development:</span>
                      <Badge variant="outline" className="text-white dark:text-black">2 (14.29%)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">In Test:</span>
                      <Badge variant="outline" className="text-white dark:text-black">11 (78.57%)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Ready For Test:</span>
                      <Badge variant="outline" className="text-white dark:text-black">1 (7.14%)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Done:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">5 (35.71%)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 3: Individual Status */}
            {selectedProject && selectedBoard && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Individual Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-slate-300 dark:text-slate-700 text-sm mb-3">Select a team member to check their status:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {teamMembers.map((member, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleTeamMemberSelect(member)}
                          className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black text-left justify-start"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          <span className="opacity-100">{member}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 4: Bug Status */}
            {selectedProject && selectedBoard && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    Bug Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-500/10 rounded-lg professional-border">
                      <div className="text-2xl font-bold text-red-400">3</div>
                      <div className="text-xs text-slate-400 dark:text-slate-600">Critical</div>
                    </div>
                    <div className="text-center p-3 bg-orange-500/10 rounded-lg professional-border">
                      <div className="text-2xl font-bold text-orange-400">7</div>
                      <div className="text-xs text-slate-400 dark:text-slate-600">High</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg professional-border">
                      <div className="text-2xl font-bold text-yellow-400">12</div>
                      <div className="text-xs text-slate-400 dark:text-slate-600">Medium</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg professional-border">
                      <div className="text-2xl font-bold text-blue-400">5</div>
                      <div className="text-xs text-slate-400 dark:text-slate-600">Low</div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Total Bugs:</span>
                      <span className="text-white dark:text-black font-bold">27</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 dark:text-slate-700">Resolved Today:</span>
                      <span className="text-green-400">4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Configuration Panel */}
          {showSettings && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ... keep existing code (all configuration sections) */}
                  </CardContent>
                </Card>
              )}
                    </div>

          {/* Right Column - Chat and Activity Monitor */}
          <div className={`${(!selectedProject || !selectedBoard) && !showSettings ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            {/* ... keep existing code (chat area and activity monitor) */}
          </div>
        </div>
      </div>
    </div>
  );
};
