import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const ProprietorLogin = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error(`Please enter your ${loginMethod === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    setLoading(true);

    try {
      const queryParam = loginMethod === 'email' 
        ? `email=${encodeURIComponent(identifier)}` 
        : `phone=${encodeURIComponent(identifier)}`;

      const response = await fetch(`${API_BASE_URL}/proprietors/lookup?${queryParam}`);

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // Store proprietor data in session/local storage
        const proprietorData = data[0];
        localStorage.setItem('proprietor', JSON.stringify(proprietorData));
        localStorage.setItem('proprietorId', proprietorData._id || proprietorData.submissionId);
        
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('No record found. Please check your details or register first.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md elegant-shadow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Proprietor Dashboard</CardTitle>
          <CardDescription>
            Login to access your registration details and payment status
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-4">
              <TabsContent value="email" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email you used during registration
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+2348012345678"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your registered phone number with country code
                  </p>
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an account?</p>
            <Button 
              variant="link" 
              className="px-0"
              onClick={() => navigate('/register')}
            >
              Register as a Proprietor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
