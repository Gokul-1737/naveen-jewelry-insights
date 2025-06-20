
import { useState } from 'react';
import { Eye, EyeOff, Gem, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication (replace with actual Supabase auth)
    setTimeout(() => {
      if (email === 'naveenjewelry@gmail.com' && password === 'naveenjewelry123') {
        const userData = {
          id: '1',
          email: email,
          name: 'Naveen Jewelry Admin'
        };
        onLogin(userData);
        toast({
          title: "Welcome back!",
          description: "Successfully logged into Naveen Jewelry Dashboard",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Jewelry-themed background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(230, 230, 250, 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Floating jewelry icons */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 text-yellow-300 opacity-20 animate-pulse">
          <Gem size={40} />
        </div>
        <div className="absolute top-40 right-32 text-yellow-400 opacity-30 animate-pulse delay-1000">
          <Gem size={24} />
        </div>
        <div className="absolute bottom-32 left-32 text-amber-300 opacity-25 animate-pulse delay-2000">
          <Gem size={32} />
        </div>
        <div className="absolute bottom-20 right-20 text-yellow-300 opacity-20 animate-pulse delay-500">
          <Gem size={28} />
        </div>
      </div>

      {/* Glassmorphic login card */}
      <Card className="w-full max-w-md mx-4 backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-12">
            <Gem className="text-white animate-pulse" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent animate-fade-in">
            Naveen Jewelry
          </CardTitle>
          <CardDescription className="text-gray-600 animate-fade-in delay-200">
            Stock Maintenance Dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 animate-fade-in delay-300">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:bg-white/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in delay-400">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/50 border-white/30 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:bg-white/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2.5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in delay-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center space-y-2 text-sm animate-fade-in delay-600">
              <button type="button" className="text-amber-600 hover:text-amber-800 transition-colors duration-200 hover:underline">
                Forgot password?
              </button>
              <div className="text-gray-500">
                Need an account? <button type="button" className="text-amber-600 hover:text-amber-800 transition-colors duration-200 hover:underline">Sign up</button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
