import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Building2, 
  KeyRound,
  GraduationCap,
  BarChart3,
  Users,
  CreditCard
} from "lucide-react";
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
      <Layout>
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-50/60">
          <div className="w-full max-w-md">
            {/* Security Top Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-900 mb-3 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Executive Administrative Console</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-bold">256-Bit SSL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                State Secretariat Sign-In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Authorized for State Executives, LGA Chapter Coordinators, and Electoral Officers only.
              </p>
            </div>

            {/* Elevated Auth Card */}
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
                      Enter administrative credentials to continue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-2">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="username"
                        type="email"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="admin@nappsnasarawa.com"
                        className="pl-9.5 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••••••"
                        className="pl-9.5 pr-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    loading={loading}
                    className="w-full h-11 bg-[#064e3b] hover:bg-[#047857] text-white font-bold shadow-md shadow-emerald-950/10 mt-2"
                  >
                    <Shield className="w-4 h-4 mr-2 text-amber-400" />
                    Sign In to Executive Console
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
                  <p>
                    Are you a school proprietor?{" "}
                    <a href="/proprietor-login" className="text-emerald-700 font-semibold hover:underline">
                      Go to Proprietor Login
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    For access requests, contact{" "}
                    <a href="mailto:admin@nappsnasarawa.com" className="text-slate-600 underline">
                      admin@nappsnasarawa.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
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