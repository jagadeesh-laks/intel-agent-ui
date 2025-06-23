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

interface SprintDetails {
  sprint: {
    id: string;
    name: string;
    state: string;
    startDate: string;
    endDate: string;
    goal: string;
  };
  storyProgress: {
    toDo: { count: number; percentage: number };
    inProgress: { count: number; percentage: number };
    done: { count: number; percentage: number };
    total: number;
  };
  individualStatus: {
    [key: string]: Array<{
      key: string;
      title: string;
      status: string;
      type: string;
      priority: string;
    }>;
  };
  bugStatus: Array<{
    key: string;
    summary: string;
    assignee: string;
    status: string;
    priority: string;
  }>;
  sprintMetrics: {
    velocity: {
      plannedPoints: number;
      completedPoints: number;
      completionRate: number;
    };
    timeRemaining: {
      totalDays: number;
      elapsedDays: number;
      remainingDays: number;
    };
  };
}

interface JiraConfig {
  id: string;
  email: string;
  domain: string;
  last_used: string | null;
  managementCredentials: string;
}

interface UserConfig {
  aiEngine: string;
  aiCredentials: string;
  managementTool: string;
  managementEmail: string;
  managementDomain: string;
  managementCredentials: string;
  communicationTool: string;
  communicationCredentials: string;
  emailTool: string;
  emailCredentials: string;
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

  const [sprintDetails, setSprintDetails] = useState<SprintDetails | null>(null);
  const [isLoadingSprintDetails, setIsLoadingSprintDetails] = useState(false);

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

  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  const [activeSprint, setActiveSprint] = useState<any>(null);

  // Add getBoardId function
  const getBoardId = async (projectKey: string, boardName: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`http://localhost:6001/api/scrum-master/jira/boards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) return null;

      const data = await response.json();
      const board = data.boards.find((b: { name: string }) => b.name === boardName);
      return board?.id || null;
    } catch (error) {
      console.error('Error getting board ID:', error);
      return null;
    }
  };

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

  // Add useEffect to fetch user config and connect AI engine when component mounts
  useEffect(() => {
    const fetchUserConfig = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:6001/api/scrum-master/config', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const config = await response.json();
          setUserConfig(config);
          
          // Set AI engine if available (but don't connect yet)
          if (config.aiEngine) {
            setAiEngine(config.aiEngine);
            if (config.aiCredentials) {
              setAiCredentials(config.aiCredentials);
              // Don't set aiConnected here, wait for project selection
            }
          }

          // Set management tool if available
          if (config.managementTool) {
            setManagementTool(config.managementTool);
            if (config.managementEmail && config.managementDomain && config.managementCredentials) {
              setManagementEmail(config.managementEmail);
              setManagementDomain(config.managementDomain);
              setManagementCredentials(config.managementCredentials);
              setManagementConnected(true);
            }
          }

          // Set communication tool if available
          if (config.communicationTool) {
            setCommunicationTool(config.communicationTool);
            if (config.communicationCredentials) {
              setCommunicationCredentials(config.communicationCredentials);
              setCommunicationConnected(true);
            }
          }

          // Set email tool if available
          if (config.emailTool) {
            setEmailTool(config.emailTool);
            if (config.emailCredentials) {
              setEmailCredentials(config.emailCredentials);
              setEmailConnected(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user config:', error);
        toast({
          title: "Error",
          description: "Failed to load user configuration",
          variant: "destructive"
        });
      }
    };

    fetchUserConfig();
  }, []);

  // Update handleConfigure to save the complete configuration
  const handleConfigure = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:6001/api/scrum-master/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          managementTool,
          managementEmail,
          managementDomain,
          managementCredentials,
          communicationTool,
          communicationCredentials,
          emailTool,
          emailCredentials,
          aiEngine,
          aiCredentials,
          selectedProject,
          selectedBoard
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Configuration saved successfully"
        });
      setShowSettings(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const fetchSprintDetails = async (projectKey: string, boardId: string) => {
    try {
      setIsLoadingSprintDetails(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:6001/api/sprint-details/status?projectKey=${projectKey}&boardId=${boardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sprint details');
      }

      const data = await response.json();
      setSprintDetails(data);
    } catch (error) {
      console.error('Error fetching sprint details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sprint details",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSprintDetails(false);
    }
  };

  // Update handleProjectBoardSelect to fetch sprint details
  const handleProjectBoardSelect = async (project: string, board: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const projectObj = projects.find(p => p.name === project);
      const boardObj = boards.find(b => b.name === board);

      if (!projectObj || !boardObj) {
        throw new Error('Invalid project or board selection');
      }

      // Fetch sprint details
      await fetchSprintDetails(projectObj.key, boardObj.id.toString());

      // First get the user's configuration to check AI engine status
      const configResponse = await fetch('http://localhost:6001/api/scrum-master/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!configResponse.ok) {
        throw new Error('Failed to fetch user configuration');
      }

      const configData = await configResponse.json();
      setUserConfig(configData);

      // Fetch active sprint
      const activeSprintResponse = await fetch(`http://localhost:6001/api/scrum-master/jira/board/${boardObj.id}/active-sprint`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!activeSprintResponse.ok) {
        throw new Error('Failed to fetch active sprint');
      }

      const activeSprintData = await activeSprintResponse.json();
      setActiveSprint(activeSprintData);

    } catch (error) {
      console.error('Error in handleProjectBoardSelect:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to select project and board",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject && selectedBoard) {
      handleProjectBoardSelect(selectedProject, selectedBoard);
    }
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
    if (!message.trim() || !selectedProject || !selectedBoard || !aiEngine || !aiConnected) {
      if (!aiEngine || !aiConnected) {
        toast({
          title: "Error",
          description: "AI engine not connected. Please configure and connect an AI engine first.",
          variant: "destructive"
        });
      }
      return;
    }

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
          aiEngine: aiEngine.toLowerCase() // Ensure lowercase for consistency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
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
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
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

            {/* Sprint Details Card */}
            {selectedProject && selectedBoard && !showSettings && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sprint Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingSprintDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white dark:text-black" />
                    </div>
                  ) : sprintDetails ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">Title:</span>
                        <span className="text-white dark:text-black font-semibold">{sprintDetails.sprint.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">State:</span>
                        <Badge className={`${
                          sprintDetails.sprint.state === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-400/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                        }`}>
                          {sprintDetails.sprint.state.charAt(0).toUpperCase() + sprintDetails.sprint.state.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">Start Date:</span>
                        <span className="text-white dark:text-black">{new Date(sprintDetails.sprint.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">Due Date:</span>
                        <span className="text-white dark:text-black">{new Date(sprintDetails.sprint.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">Days Remaining:</span>
                        <span className="text-white dark:text-black font-bold">
                          {sprintDetails.sprintMetrics.timeRemaining.remainingDays} day(s)
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-300 dark:text-slate-700">Goal:</span>
                        <p className="text-white dark:text-black text-sm mt-1">{sprintDetails.sprint.goal}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 dark:text-slate-700 text-center">No sprint details available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Story Progress Card */}
            {selectedProject && selectedBoard && !showSettings && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Current Story Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingSprintDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white dark:text-black" />
                    </div>
                  ) : sprintDetails ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">To Do:</span>
                        <Badge variant="outline" className="text-white dark:text-black">
                          {sprintDetails.storyProgress.toDo.count} ({sprintDetails.storyProgress.toDo.percentage.toFixed(1)}%)
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">In Progress:</span>
                        <Badge variant="outline" className="text-white dark:text-black">
                          {sprintDetails.storyProgress.inProgress.count} ({sprintDetails.storyProgress.inProgress.percentage.toFixed(1)}%)
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 dark:text-slate-700">Done:</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          {sprintDetails.storyProgress.done.count} ({sprintDetails.storyProgress.done.percentage.toFixed(1)}%)
                        </Badge>
                      </div>
                      <div className="pt-2 border-t border-gray-700/30 dark:border-gray-300/30">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 dark:text-slate-700">Total Stories:</span>
                          <span className="text-white dark:text-black font-semibold">{sprintDetails.storyProgress.total}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 dark:text-slate-700 text-center">No story progress available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Individual Status Card */}
            {selectedProject && selectedBoard && !showSettings && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Individual Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSprintDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white dark:text-black" />
                    </div>
                  ) : sprintDetails ? (
                    <div className="space-y-2">
                      <p className="text-slate-300 dark:text-slate-700 text-sm mb-3">Team members with assigned tasks:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(sprintDetails.individualStatus).map(([assignee, issues]) => (
                          <Button
                            key={assignee}
                            variant="outline"
                            onClick={() => handleTeamMemberSelect(assignee)}
                            className="btn-3d professional-border text-white dark:text-black hover:text-white dark:hover:text-black text-left justify-start"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            <span className="opacity-100">{assignee}</span>
                            <Badge variant="outline" className="ml-auto">
                              {issues.length} task{issues.length !== 1 ? 's' : ''}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 dark:text-slate-700 text-center">No individual status available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bug Status Card */}
            {selectedProject && selectedBoard && !showSettings && (
              <Card className="glass-morphism professional-border">
                <CardHeader>
                  <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    Bug Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingSprintDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white dark:text-black" />
                    </div>
                  ) : sprintDetails ? (
                    <div className="grid grid-cols-2 gap-4">
                      {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
                        const bugs = sprintDetails.bugStatus.filter(bug => bug.priority.toLowerCase() === priority.toLowerCase());
                        return (
                          <div key={priority} className={`text-center p-3 ${
                            priority === 'Critical' ? 'bg-red-500/10' :
                            priority === 'High' ? 'bg-orange-500/10' :
                            priority === 'Medium' ? 'bg-yellow-500/10' :
                            'bg-blue-500/10'
                          } rounded-lg professional-border`}>
                            <div className={`text-2xl font-bold ${
                              priority === 'Critical' ? 'text-red-400' :
                              priority === 'High' ? 'text-orange-400' :
                              priority === 'Medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>{bugs.length}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-600">{priority}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-300 dark:text-slate-700 text-center">No bug status available</p>
                  )}
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
                  {/* Management Tools - Required */}
                  <div>
                    <Label className="text-white dark:text-black mb-3 block font-semibold">Management Tool *</Label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Jira', 'Azure', 'Trello', 'GitHub'].map((tool) => (
                        <Button
                          key={tool}
                          variant={managementTool === tool ? 'default' : 'outline'}
                          onClick={() => setManagementTool(managementTool === tool ? '' : tool)}
                          className={`btn-3d text-sm group relative ${
                            managementTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-100">{tool}</span>
                        </Button>
                      ))}
                    </div>
                    {managementTool && (
                      <div className="space-y-2">
                        {renderJiraConfig()}
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
                          onClick={() => setCommunicationTool(communicationTool === tool ? '' : tool)}
                          className={`btn-3d text-sm group relative ${
                            communicationTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-100">{tool}</span>
                        </Button>
                      ))}
                    </div>
                    {communicationTool && (
                      <div className="space-y-2">
                        <Input
                          placeholder={`${communicationTool} Webhook URL`}
                          value={communicationCredentials}
                          onChange={(e) => setCommunicationCredentials(e.target.value)}
                          className="input-modern placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          disabled={communicationConnected}
                        />
                        <div className="flex gap-2">
                        <Button
                          onClick={handleCommunicationConnect}
                          disabled={!communicationCredentials.trim() || communicationConnected}
                            className={`flex-1 btn-3d text-sm ${
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
                          {communicationConnected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCommunicationConnected(false);
                                setCommunicationCredentials('');
                              }}
                              className="btn-3d text-sm professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
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
                          onClick={() => setEmailTool(emailTool === tool ? '' : tool)}
                          className={`btn-3d text-sm group relative ${
                            emailTool === tool 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-100">{tool}</span>
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
                          className="input-modern placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          disabled={emailConnected}
                        />
                        <div className="flex gap-2">
                        <Button
                          onClick={handleEmailConnect}
                          disabled={!emailCredentials.trim() || emailConnected}
                            className={`flex-1 btn-3d text-sm ${
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
                          {emailConnected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEmailConnected(false);
                                setEmailCredentials('');
                              }}
                              className="btn-3d text-sm professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
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
                          onClick={() => setAiEngine(aiEngine === engine ? '' : engine)}
                          className={`btn-3d text-xs group relative ${
                            aiEngine === engine 
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black border-white/30 dark:border-black/30' 
                              : 'professional-border text-white dark:text-black hover:text-white dark:hover:text-black'
                          }`}
                        >
                          <span className="opacity-100">{engine}</span>
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
                          className="input-modern placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          disabled={aiConnected || isConnecting}
                        />
                        <div className="flex gap-2">
                        <Button
                          onClick={handleAiConnect}
                            disabled={!aiCredentials.trim() || aiConnected || isConnecting}
                            className={`flex-1 btn-3d text-sm ${
                            aiConnected 
                              ? 'bg-green-600/20 text-green-400 border-green-400/30' 
                              : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black'
                          }`}
                        >
                            {isConnecting ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting...</>
                            ) : aiConnected ? (
                            <><Check className="w-4 h-4 mr-2" />Connected</>
                          ) : (
                            <><Link className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                          {aiConnected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAiConnected(false);
                                setAiCredentials('');
                              }}
                              className="btn-3d text-sm professional-border text-white dark:text-black hover:text-white dark:hover:text-black"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
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
              )}
                    </div>

          {/* Right Column - Chat and Activity Monitor */}
          <div className={`${(!selectedProject || !selectedBoard) && !showSettings ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            {/* Chat Area */}
            <Card className="h-[600px] flex flex-col glass-morphism professional-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-white dark:text-black modern-text flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-900/30 dark:bg-gray-100/30 rounded-lg">
                  {selectedProject && selectedBoard ? (
                    <>
                      {messages.length === 0 ? (
                        <>
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
                        </>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <Card className={`max-w-[80%] ${
                              msg.role === 'user'
                                ? 'bg-blue-500/20 border-blue-500/30'
                                : 'bg-gray-800/20 dark:bg-gray-200/20 border-gray-700/30 dark:border-gray-300/30'
                            }`}>
                              <CardContent className="p-3">
                                <p className="text-white dark:text-black">{msg.content}</p>
                                <span className="text-xs opacity-70 text-white dark:text-black">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </CardContent>
                            </Card>
                    </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-center">
                          <Card className="bg-gray-800/20 dark:bg-gray-200/20 border-gray-700/30 dark:border-gray-300/30">
                            <CardContent className="p-3">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
                      Configure your setup and select a project to start chatting
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-auto">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-modern"
                    disabled={!selectedProject || !selectedBoard || isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!selectedProject || !selectedBoard || isLoading}
                    className="btn-3d bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                    <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Monitor */}
            {!showSettings && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
