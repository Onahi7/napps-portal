import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Mail, Phone, ShieldCheck, UserCheck, ArrowRight, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import nappsLogo from '@/assets/napps-logo.png';

export const ProprietorLogin = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error(`Please enter your registered ${loginMethod === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    setLoading(true);

    try {
      const queryParam = loginMethod === 'email' 
        ? `email=${encodeURIComponent(identifier.trim())}` 
        : `phone=${encodeURIComponent(identifier.trim())}`;

      const response = await fetch(`${API_BASE_URL}/proprietors/lookup?${queryParam}`);

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const proprietorData = data[0];
        localStorage.setItem('proprietor', JSON.stringify(proprietorData));
        localStorage.setItem('proprietorId', proprietorData._id || proprietorData.submissionId);
        
        toast.success(`Welcome back, ${proprietorData.name || proprietorData.firstName || 'Proprietor'}!`, {
          description: 'Accessing your verified school dashboard...',
        });
        navigate('/dashboard');
      } else {
        toast.error('No proprietor record found', {
          description: 'No registered school matched this phone or email. Please register your institution first.',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'Unable to reach the verification server. Please check your internet connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-50/60 font-sans">
        <div className="w-full max-w-md">
          {/* Top Institutional Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 mb-3 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Proprietor Self-Service Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 font-bold">2026 Session</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Proprietor Sign-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Access your school profile, digital ID card, dues clearance certificate, and NNSUCE exam candidate broadsheets.
            </p>
          </div>

          {/* Elevated Card */}
          <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-500" />
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center gap-3">
                <img src={nappsLogo} alt="NAPPS Logo" className="w-10 h-10 rounded-full ring-2 ring-emerald-600/20" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    NAPPS Nasarawa State
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Sign in with your registered contact details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-2">
              <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2 mb-5 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger value="email" className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-xs">
                    <Mail className="w-3.5 h-3.5" />
                    Email Sign-In
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-xs">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Sign-In
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleLogin} className="space-y-4">
                  <TabsContent value="email" className="space-y-3 mt-0">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                        Registered Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="proprietor@school.edu.ng"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          disabled={loading}
                          autoComplete="email"
                          className="pl-9.5 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        The exact email address supplied during school registration or verification.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-3 mt-0">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                        Registered Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="08031234567 or +234..."
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          disabled={loading}
                          autoComplete="tel"
                          className="pl-9.5 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Phone number used on official NAPPS correspondence.
                      </p>
                    </div>
                  </TabsContent>

                  <Button 
                    type="submit" 
                    size="lg"
                    loading={loading}
                    className="w-full h-11 bg-[#064e3b] hover:bg-[#047857] text-white font-bold shadow-md shadow-emerald-950/10 mt-3"
                  >
                    <UserCheck className="w-4 h-4 mr-2 text-amber-400" />
                    Access Proprietor Dashboard
                  </Button>
                </form>
              </Tabs>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Haven&apos;t registered your school?</span>
                  <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                    Register Now &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span>Looking up dues without login?</span>
                  <a href="/#lookup" className="text-amber-700 font-semibold hover:underline">
                    Quick Dues Lookup
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
