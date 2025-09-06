import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Upload, 
  Settings, 
  Users, 
  CreditCard, 
  FileText,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple authentication check
    setTimeout(() => {
      if (loginForm.username === "admin" && loginForm.password === "admin123") {
        setIsAuthenticated(true);
        toast.success("Login successful! Welcome to the admin portal.");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 1000);
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
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
    <Layout>
      <div className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                NAPPS Admin Portal
              </h1>
              <p className="text-muted-foreground">Manage proprietor records, payments, and system settings</p>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="elegant-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Proprietors</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="elegant-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid This Month</p>
                    <p className="text-2xl font-bold">856</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="elegant-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payments</p>
                    <p className="text-2xl font-bold">391</p>
                  </div>
                  <FileText className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="elegant-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue (₦)</p>
                    <p className="text-2xl font-bold">21.4M</p>
                  </div>
                  <Settings className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="records" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="records">Proprietor Records</TabsTrigger>
              <TabsTrigger value="payments">Payment Management</TabsTrigger>
              <TabsTrigger value="upload">Data Upload</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Proprietor Records Tab */}
            <TabsContent value="records">
              <Card className="elegant-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Proprietor Records Management
                  </CardTitle>
                  <CardDescription>
                    View, edit, and manage all proprietor records in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Search by name, email, or phone..."
                      className="flex-1"
                    />
                    <Button variant="government">Search</Button>
                  </div>

                  {/* Sample Records Table */}
                  <div className="space-y-4">
                    {[
                      { name: "Ahmed Yakubu", school: "Greenfield Academy", status: "Active", lastPayment: "2024-01-15" },
                      { name: "Fatima Hassan", school: "Bright Stars School", status: "Pending", lastPayment: "2023-12-10" },
                      { name: "John Okafor", school: "Excellence Academy", status: "Active", lastPayment: "2024-01-20" },
                    ].map((record, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{record.name}</h4>
                            <p className="text-sm text-muted-foreground">{record.school}</p>
                            <p className="text-xs text-muted-foreground">Last Payment: {record.lastPayment}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>
                              {record.status}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Management Tab */}
            <TabsContent value="payments">
              <Card className="elegant-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Management
                  </CardTitle>
                  <CardDescription>
                    Configure fees, manage Paystack settings, and view payment reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Payment Settings</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="annualFee">Annual Membership Fee (₦)</Label>
                        <Input
                          id="annualFee"
                          type="number"
                          placeholder="25000"
                          defaultValue="25000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="splitCode">Paystack Split Code</Label>
                        <Input
                          id="splitCode"
                          placeholder="SPL_xxxxxxxxxxxxxxx"
                        />
                      </div>

                      <Button variant="government">Update Settings</Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Quick Actions</h4>
                      
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Payment Report
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start">
                          <CreditCard className="w-4 h-4 mr-2" />
                          View Payment History
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Send Payment Reminders
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Upload Tab */}
            <TabsContent value="upload">
              <Card className="elegant-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Upload CSV files and manage proprietor data in bulk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="font-semibold mb-2">Upload Proprietor Data</h4>
                      <p className="text-muted-foreground mb-4">
                        Upload a CSV file with proprietor information. Make sure it includes all required fields.
                      </p>
                      <Button variant="government">
                        <Upload className="w-4 h-4" />
                        Select CSV File
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      
                      <Button variant="outline" className="justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Export Current Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="elegant-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">General Settings</h4>
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
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Security Settings</h4>
                      <div className="space-y-4">
                        <Button variant="outline" className="justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Change Admin Password
                        </Button>
                        
                        <Button variant="outline" className="justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          View System Logs
                        </Button>
                      </div>
                    </div>

                    <Button variant="government">Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}