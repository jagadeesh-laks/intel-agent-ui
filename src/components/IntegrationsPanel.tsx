
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check } from 'lucide-react';

interface IntegrationsPanelProps {
  onConfigured: () => void;
}

export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ onConfigured }) => {
  const [managementTool, setManagementTool] = useState<string>('');
  const [communicationTool, setCommunicationTool] = useState<string>('');
  const [emailTool, setEmailTool] = useState<string>('');
  const [aiEngine, setAiEngine] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  const isConfigured = managementTool && aiEngine && apiKey;

  const handleSaveAndContinue = () => {
    if (isConfigured) {
      onConfigured();
    }
  };

  return (
    <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          ⚙️ Agent Configuration
          {isConfigured && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Ready</Badge>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="management">
            <AccordionTrigger className="text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                {managementTool && <Check className="w-4 h-4 text-green-600" />}
                Management Tool
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">Connect your Agile Tool</p>
              <div className="flex gap-3">
                <Button
                  variant={managementTool === 'jira' ? 'default' : 'outline'}
                  onClick={() => setManagementTool('jira')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Jira OAuth
                </Button>
                <Button
                  variant={managementTool === 'azure' ? 'default' : 'outline'}
                  onClick={() => setManagementTool('azure')}
                >
                  Azure DevOps
                </Button>
                <Button
                  variant={managementTool === 'trello' ? 'default' : 'outline'}
                  onClick={() => setManagementTool('trello')}
                >
                  Trello
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="communication">
            <AccordionTrigger className="text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                {communicationTool && <Check className="w-4 h-4 text-green-600" />}
                Communication Tool
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">Enable team chat integration</p>
              <div className="flex gap-3">
                <Button
                  variant={communicationTool === 'slack' ? 'default' : 'outline'}
                  onClick={() => setCommunicationTool('slack')}
                >
                  Slack
                </Button>
                <Button
                  variant={communicationTool === 'teams' ? 'default' : 'outline'}
                  onClick={() => setCommunicationTool('teams')}
                >
                  Teams
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="email">
            <AccordionTrigger className="text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                {emailTool && <Check className="w-4 h-4 text-green-600" />}
                Email Integration
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">Enable email notifications</p>
              <div className="flex gap-3">
                <Button
                  variant={emailTool === 'gmail' ? 'default' : 'outline'}
                  onClick={() => setEmailTool('gmail')}
                >
                  Gmail
                </Button>
                <Button
                  variant={emailTool === 'office365' ? 'default' : 'outline'}
                  onClick={() => setEmailTool('office365')}
                >
                  Office 365
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ai">
            <AccordionTrigger className="text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2">
                {aiEngine && apiKey && <Check className="w-4 h-4 text-green-600" />}
                AI Engine *
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">Choose your AI Engine</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={aiEngine === 'chatgpt' ? 'default' : 'outline'}
                  onClick={() => setAiEngine('chatgpt')}
                >
                  ChatGPT
                </Button>
                <Button
                  variant={aiEngine === 'gemini' ? 'default' : 'outline'}
                  onClick={() => setAiEngine('gemini')}
                >
                  Gemini
                </Button>
                <Button
                  variant={aiEngine === 'deepseek' ? 'default' : 'outline'}
                  onClick={() => setAiEngine('deepseek')}
                >
                  DeepSeek
                </Button>
                <Button
                  variant={aiEngine === 'llama' ? 'default' : 'outline'}
                  onClick={() => setAiEngine('llama')}
                >
                  Meta LLaMA
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-slate-700 dark:text-slate-300">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="border-slate-200 dark:border-slate-600"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleSaveAndContinue}
            disabled={!isConfigured}
            className={`w-full ${
              isConfigured
                ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
            }`}
          >
            Save & Continue
          </Button>
          
          {!isConfigured && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
              * Management Tool and AI Engine are required
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
