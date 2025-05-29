
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleRememberMeChange = (checked: boolean | "indeterminate") => {
    setRememberMe(checked === true);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md card-3d glass-effect border-0 relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center card-3d float">
            <span className="text-3xl font-bold text-white">AI</span>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            AI Agents Hub
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Welcome back! Sign in to continue</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="btn-3d border-slate-200 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-300 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="btn-3d border-slate-200 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-300 h-12"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                className="border-slate-300 dark:border-slate-600 btn-3d"
              />
              <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                Remember me for 30 days
              </Label>
            </div>
            
            <Button
              type="submit"
              className="w-full btn-3d bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-2xl transition-all duration-500 h-12 text-lg font-semibold"
            >
              Sign In Securely
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
