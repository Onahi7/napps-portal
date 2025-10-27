import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'import' | 'settings'>('dashboard');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
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
          email: loginForm.username,
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('admin_token', data.access_token);
      setAuthToken(data.access_token);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${data.user.firstName}!`, {
        description: 'Login successful',
      });
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Invalid credentials. Please try again.',
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setLoginForm({ username: "", password: "" });
    setCurrentPage('dashboard');
    toast.info('Logged out successfully');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'proprietors':
        return <ProprietorsPage authToken={authToken} />;
      case 'import':
        return <ImportDataPage authToken={authToken} />;
      case 'payments':
        return <PaymentsPage authToken={authToken} />;
      case 'fees':
        return <FeesPage authToken={authToken} />;
      case 'chapters':
        return <ChaptersPage authToken={authToken} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      defaultValue="NAPPS Nasarawa Proprietors Portal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      defaultValue="admin@nappsnasarawa.gov.ng"
                    />
                  </div>
                  <Button>Save Settings</Button>
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
        <div className="min-h-[80vh] flex items-center justify-center bg-muted/30">
          <Card className="w-full max-w-md elegant-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Shield className="w-6 h-6 text-primary" />
                Admin Portal
              </CardTitle>
              <CardDescription>
                Authorized personnel only. Please enter your credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email Address</Label>
                  <Input
                    id="username"
                    type="email"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin@nappsnasarawa.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="government" 
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  <Shield className="w-4 h-4" />
                  Login to Admin Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <AdminLayout
      sidebar={<AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />}
      header={<AdminHeader onLogout={handleLogout} />}
    >
      {renderPage()}
    </AdminLayout>
  );
}