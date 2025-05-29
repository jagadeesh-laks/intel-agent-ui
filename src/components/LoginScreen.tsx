
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleRememberMeChange = (checked: boolean | "indeterminate") => {
    setRememberMe(checked === true);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-xl float"></div>
      <div className="absolute top-1/3 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-xl float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500/20 to-green-500/20 blur-xl float" style={{animationDelay: '4s'}}></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md card-3d glass-morphism border-0 relative z-10 neon-border-green">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 via-blue-500 to-pink-500 rounded-2xl flex items-center justify-center card-3d neon-glow-green pulse-neon">
            <Bot className="w-10 h-10 text-white icon-glow" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold neon-text-green mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 neon-text-yellow icon-glow" />
              AI Agents Hub
              <Sparkles className="w-8 h-8 neon-text-yellow icon-glow" />
            </CardTitle>
            <p className="text-slate-300 text-lg">Welcome to the Future of AI</p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 icon-glow neon-text-blue" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="input-neon text-white placeholder-slate-400 h-12 text-lg"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 icon-glow neon-text-pink" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-neon text-white placeholder-slate-400 h-12 text-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  className="border-slate-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 neon-border-green"
                />
                <Label htmlFor="remember" className="text-sm text-slate-300">
                  Remember Me
                </Label>
              </div>
              <button type="button" className="text-sm neon-text-blue hover:neon-text-green transition-colors">
                Forgot Password?
              </button>
            </div>
            
            <Button
              type="submit"
              className="w-full btn-3d h-14 text-lg font-semibold bg-gradient-to-r from-green-500 via-blue-500 to-pink-500 hover:from-green-400 hover:via-blue-400 hover:to-pink-400 text-white neon-glow-green transition-all duration-500"
            >
              Sign In to AI Hub
            </Button>

            <div className="text-center text-slate-400">
              <p className="text-sm mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d neon-border-blue text-slate-200 hover:text-white hover:neon-glow-blue"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d neon-border-pink text-slate-200 hover:text-white hover:neon-glow-pink"
                >
                  Microsoft
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <button type="button" className="neon-text-orange hover:neon-text-yellow transition-colors">
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
