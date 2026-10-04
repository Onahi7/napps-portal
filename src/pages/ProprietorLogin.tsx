import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import nappsLogo from '@/assets/napps-logo.png';

export const ProprietorLogin = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';

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
    <div className="min-h-screen flex w-full bg-white font-sans antialiased">
      {/* Left Panel: Desktop Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

        {/* Top Brand Crest */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg">
            <img src={nappsLogo} alt="NAPPS Nasarawa Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">NAPPS Nasarawa State</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Proprietor
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">Proprietor Self-Service & Institutional Registry</p>
          </div>
        </div>

        {/* Middle Typography & Metrics */}
        <div className="relative z-10 max-w-xl space-y-8 my-auto py-12">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 backdrop-blur-sm border border-white/10">
              Official Institutional Portal
            </span>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              Empowering School Proprietors Across Nasarawa State
            </h1>
            <p className="text-base text-slate-300 leading-relaxed font-normal">
              Instant access to your verified school accreditation profile, digital dues clearance certificates, automated bank payment receipts, and NNSUCE examination records.
            </p>
          </div>

          {/* 3 Metric / Feature cards */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl xl:text-2xl font-extrabold text-white">Digital ID</div>
              <div className="text-xs text-slate-400 mt-1">Accredited Standing</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl xl:text-2xl font-extrabold text-emerald-400">Clearance</div>
              <div className="text-xs text-slate-400 mt-1">Instant Certificate</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl xl:text-2xl font-extrabold text-amber-400">NNSUCE</div>
              <div className="text-xs text-slate-400 mt-1">Exam Broadsheets</div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Note */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-6">
          <span>Unified Proprietors Cloud &bull; Nasarawa State Chapter</span>
          <span>Session 2025/2026</span>
        </div>
      </div>

      {/* Right Panel: Clean Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-white min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors group"
          >
            <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
            <span>Back to Portal Home</span>
          </Link>

          {/* Mobile Crest */}
          <div className="lg:hidden flex items-center gap-2">
            <img src={nappsLogo} alt="NAPPS Logo" className="w-7 h-7 object-contain" />
            <span className="text-xs font-bold text-slate-900">NAPPS Nasarawa</span>
          </div>
        </div>

        {/* Center Form */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Proprietor Access
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign in with your registered contact details to access your institution dashboard.
            </p>
          </div>

          {/* Segmented Method Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                loginMethod === 'email' 
                  ? "bg-white text-emerald-950 shadow-xs" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Email Sign-In
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setIdentifier(''); }}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                loginMethod === 'phone' 
                  ? "bg-white text-emerald-950 shadow-xs" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Phone Sign-In
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="proprietor-identifier" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {loginMethod === 'email' ? 'Registered Email Address' : 'Registered Phone Number'}
              </Label>
              <Input
                id="proprietor-identifier"
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={loginMethod === 'email' ? 'proprietor@school.edu.ng' : '08031234567 or +234...'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                className="h-12 px-4 rounded-xl text-sm border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all text-slate-900 placeholder:text-slate-400 bg-white"
                required
              />
              <p className="text-[11px] text-slate-400">
                {loginMethod === 'email'
                  ? 'The official email address supplied during registration or dues payment.'
                  : 'The official phone number registered with the state secretariat.'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm transition-all duration-200 text-sm mt-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Institution...</span>
                </span>
              ) : (
                <span>Access Proprietor Dashboard</span>
              )}
            </Button>
          </form>

          {/* Quick Support & Alternative Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Haven&apos;t registered your school?</span>
              <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                Register Institution &rarr;
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>State Executive or Coordinator?</span>
              <Link to="/admin" className="text-slate-700 font-semibold hover:text-emerald-700 hover:underline">
                Executive Portal &rarr;
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>Check dues without logging in?</span>
              <a href="/#lookup" className="text-amber-700 font-semibold hover:underline">
                Quick Dues Lookup
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="w-full text-center lg:text-left text-xs text-slate-400 border-t border-slate-100 pt-4">
          &copy; 2026 National Association of Proprietors of Private Schools (NAPPS) Nasarawa State Chapter.
        </div>
      </div>
    </div>
  );
};
