import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardPage } from "@/components/admin/pages/DashboardPage";
import { ProprietorsPage } from "@/components/admin/pages/ProprietorsPage";
import { ImportDataPage } from "@/components/admin/pages/ImportDataPage";
import { PaymentsPage } from "@/components/admin/pages/PaymentsPage";
import { FeesPage } from "@/components/admin/pages/FeesPage";
import { ChaptersPage } from "@/components/admin/pages/ChaptersPage";
import { LevyPaymentsPage } from "@/components/admin/pages/LevyPaymentsPage";
import NnsucePortal from "@/pages/NnsucePortal";
import MonitoringDashboards from "@/pages/MonitoringDashboards";
import nappsLogo from "@/assets/napps-logo.png";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'levy-payments' | 'import' | 'settings' | 'nnsuce' | 'monitoring'
  >('dashboard');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setAdminUser(JSON.parse(storedUser));
        } catch (_) {}
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.username.trim(),
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid administrative credentials');
      }

      const data = await response.json();
      
      // Save token and user info
      localStorage.setItem('admin_token', data.access_token);
      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        setAdminUser(data.user);
      }
      setAuthToken(data.access_token);
      setIsAuthenticated(true);
      
      toast.success(`Welcome, ${data.user?.firstName || 'Administrator'}!`, {
        description: 'Secure session established.',
      });
    } catch (error) {
      toast.error('Authentication Failed', {
        description: error instanceof Error ? error.message : 'Invalid credentials. Please verify your email and password.',
      });
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuthToken(null);
    setAdminUser(null);
    setIsAuthenticated(false);
    setLoginForm({ username: "", password: "" });
    setCurrentPage('dashboard');
    toast.info('Logged out securely');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'proprietors':
        return <ProprietorsPage authToken={authToken} />;
      case 'schools':
        return <ProprietorsPage authToken={authToken} />;
      case 'import':
        return <ImportDataPage authToken={authToken} />;
      case 'payments':
        return <PaymentsPage authToken={authToken} />;
      case 'fees':
        return <FeesPage authToken={authToken} />;
      case 'chapters':
        return <ChaptersPage authToken={authToken} />;
      case 'levy-payments':
        return <LevyPaymentsPage authToken={authToken} />;
      case 'nnsuce':
        return <NnsucePortal />;
      case 'monitoring':
        return <MonitoringDashboards />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
              <p className="text-slate-500 mt-1 text-sm">Configure state association governance and portal defaults</p>
            </div>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">State Chapter Configuration</CardTitle>
                <CardDescription>Default administrative parameters and contact channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Portal Title</Label>
                  <Input
                    id="systemName"
                    defaultValue="NAPPS Nasarawa State Unified Proprietors Portal"
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Secretariat Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    defaultValue="admin@nappsnasarawa.com"
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-semibold mb-1">Active Payment Gateway: Fidelity Bank (Virtuda)</p>
                  <p>All online dues collections and school registrations automatically disburse following the constitutional 4-tier formula (Local 20%, State 35%, Zonal 20%, National 25%).</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
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
                  Executive
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">National Association of Proprietors of Private Schools</p>
            </div>
          </div>

          {/* Middle Typography & Metrics */}
          <div className="relative z-10 max-w-xl space-y-8 my-auto py-12">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 backdrop-blur-sm border border-white/10">
                State Secretariat Console
              </span>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                Unified Digital Governance for Accredited Private Schools
              </h1>
              <p className="text-base text-slate-300 leading-relaxed font-normal">
                Centralized administrative intelligence, real-time 4-tier statutory remittance tracking, and centralized NNSUCE examination records across all 13 Local Government Chapters.
              </p>
            </div>

            {/* 3 Metric counters */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl xl:text-3xl font-extrabold text-white">800+</div>
                <div className="text-xs text-slate-400 mt-1">Accredited Schools</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl xl:text-3xl font-extrabold text-emerald-400">13 LGAs</div>
                <div className="text-xs text-slate-400 mt-1">Zonal Coverage</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl xl:text-3xl font-extrabold text-amber-400">100%</div>
                <div className="text-xs text-slate-400 mt-1">Automated Clearance</div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-6">
            <span>Official Secretariat Cloud &bull; Nasarawa State</span>
            <span>Session 2025/2026</span>
          </div>
        </div>

        {/* Right Panel: Clean Auth Form */}
        <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-white min-h-screen">
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors group"
            >
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
              <span>Back to Portal Home</span>
            </a>

            {/* Mobile Crest */}
            <div className="lg:hidden flex items-center gap-2">
              <img src={nappsLogo} alt="NAPPS Logo" className="w-7 h-7 object-contain" />
              <span className="text-xs font-bold text-slate-900">NAPPS Nasarawa</span>
            </div>
          </div>

          {/* Center Form */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Executive Access
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Enter your administrative email and password to access the state governance dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin@nappsnasarawa.com"
                  className="h-12 px-4 rounded-xl text-sm border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all text-slate-900 placeholder:text-slate-400 bg-white"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </Label>
                  <a 
                    href="mailto:admin@nappsnasarawa.com?subject=Admin%20Password%20Reset%20Request"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className="h-12 px-4 pr-12 rounded-xl text-sm border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all text-slate-900 placeholder:text-slate-400 bg-white"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm transition-all duration-200 text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span>Sign In to Executive Console</span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2.5 text-center text-xs text-slate-500">
              <p>
                Are you a school proprietor?{" "}
                <a href="/proprietor-login" className="text-emerald-700 font-bold hover:underline">
                  Go to Proprietor Login &rarr;
                </a>
              </p>
              <p className="text-[11px] text-slate-400">
                Authorized for State Executives, LGA Chapter Coordinators, and Secretariat Staff only.
              </p>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="w-full text-center lg:text-left text-xs text-slate-400 border-t border-slate-100 pt-4">
            &copy; 2026 National Association of Proprietors of Private Schools (NAPPS) Nasarawa State Chapter.
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      sidebar={<AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />}
      header={<AdminHeader onLogout={handleLogout} user={adminUser} />}
    >
      {renderPage()}
    </AdminLayout>
  );
}