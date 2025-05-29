
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen gradient-bg circuit-pattern flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md card-3d glass-effect border-0 relative z-10 neon-border">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center card-3d float neon-glow pulse-glow">
            <Bot className="w-12 h-12 text-white icon-glow" />
          </div>
          <CardTitle className="text-5xl font-bold neon-text-blue mb-2">
            AI Agents Hub
          </CardTitle>
          <p className="text-slate-300 text-lg">Welcome to Sign In Buddy!</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-200 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 icon-glow" />
                Enter your email
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
              <Label htmlFor="password" className="text-slate-200 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 icon-glow" />
                Enter your password
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
                  className="border-slate-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 neon-border"
                />
                <Label htmlFor="remember" className="text-sm text-slate-300">
                  Remember Me
                </Label>
              </div>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors neon-text">
                Forgot Password?
              </button>
            </div>
            
            <Button
              type="submit"
              className="w-full btn-3d h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white neon-glow transition-all duration-500"
            >
              Sign In
            </Button>

            <div className="text-center text-slate-400">
              <p className="text-sm mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d neon-border-cyan text-slate-200 hover:text-white"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d neon-border-purple text-slate-200 hover:text-white"
                >
                  Facebook
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors neon-text">
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
