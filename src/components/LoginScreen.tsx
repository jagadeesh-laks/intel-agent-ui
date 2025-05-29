
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

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
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-white/5 to-white/10 blur-xl float"></div>
      <div className="absolute top-1/3 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-white/3 to-white/8 blur-xl float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-white/4 to-white/6 blur-xl float" style={{animationDelay: '4s'}}></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md card-3d glass-morphism border-0 relative z-10 professional-border comic-edges">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-800 to-black dark:from-gray-200 dark:to-white rounded-2xl flex items-center justify-center card-3d pulse-modern comic-edges">
            <Bot className="w-10 h-10 text-white dark:text-black" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold modern-text mb-2 flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-white dark:text-black" />
              <span className="accent-text">AI Agents Hub</span>
              <Zap className="w-8 h-8 text-white dark:text-black" />
            </CardTitle>
            <p className="text-slate-400 dark:text-slate-600 text-lg">Professional AI Solutions</p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white dark:text-black font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="input-modern h-12 text-lg placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white dark:text-black font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
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
                  className="input-modern h-12 text-lg pr-12 placeholder-slate-500 dark:placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white dark:hover:text-black transition-colors"
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
                  className="border-slate-400 data-[state=checked]:bg-white data-[state=checked]:border-white dark:data-[state=checked]:bg-black dark:data-[state=checked]:border-black"
                />
                <Label htmlFor="remember" className="text-sm text-slate-300 dark:text-slate-700">
                  Remember Me
                </Label>
              </div>
              <button type="button" className="text-sm text-white dark:text-black hover:text-slate-300 dark:hover:text-slate-700 transition-colors">
                Forgot Password?
              </button>
            </div>
            
            <Button
              type="submit"
              className="w-full btn-3d h-14 text-lg font-semibold bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black transition-all duration-300"
            >
              Sign In to AI Hub
            </Button>

            <div className="text-center text-slate-400 dark:text-slate-600">
              <p className="text-sm mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d professional-border text-slate-200 dark:text-slate-800 hover:text-white dark:hover:text-black"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-3d professional-border text-slate-200 dark:text-slate-800 hover:text-white dark:hover:text-black"
                >
                  Microsoft
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400 dark:text-slate-600">
                Don't have an account?{' '}
                <button type="button" className="text-white dark:text-black hover:text-slate-300 dark:hover:text-slate-700 transition-colors">
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
