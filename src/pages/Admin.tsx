import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Upload, 
  Settings, 
  Users, 
  CreditCard, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [skipValidation, setSkipValidation] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setCsvFile(file);
      setUploadResult(null);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('skipValidation', skipValidation.toString());
      formData.append('updateExisting', updateExisting.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/v1/proprietors/import/csv', {
        method: 'POST',
        body: formData,
        // Add authentication header if needed
        // headers: { 'Authorization': `Bearer ${token}` }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadResult(result);
      
      toast.success(`CSV import completed! ${result.summary?.successful || 0} records processed successfully.`);
      
      // Reset file input
      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload CSV. Please try again.');
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'First Name', 'Middle Name', 'Last Name', 'Sex', 'Email', 'Phone',
      'Registration Number', 'NAPPS Membership ID', 'Registration Status',
      'NAPPS Registered', 'Awards', 'Position Held', 'Clearing Status', 'Total Amount Due'
    ];
    
    const sampleData = [
      'John', 'Michael', 'Smith', 'Male', 'john.smith@email.com', '+2348123456789',
      'NAPPS202400001', 'NM2024001', 'approved', 'Registered',
      'Best Teacher 2023', 'Headmaster', 'cleared', '0'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proprietors-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
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
                    CSV Data Import
                  </CardTitle>
                  <CardDescription>
                    Upload CSV files to import proprietor data in bulk. Max file size: 10MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="font-semibold mb-2">
                        {csvFile ? csvFile.name : 'Upload Proprietor Data'}
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        {csvFile
                          ? `File size: ${(csvFile.size / 1024).toFixed(2)} KB`
                          : 'Upload a CSV file with proprietor information. Make sure it includes all required fields.'}
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                      />
                      
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="government"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="w-4 h-4" />
                          {csvFile ? 'Change File' : 'Select CSV File'}
                        </Button>
                        
                        {csvFile && (
                          <Button
                            variant="default"
                            onClick={handleCsvUpload}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Start Import
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading and processing...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}

                    {/* Import Options */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold">Import Options</h4>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="skipValidation"
                          checked={skipValidation}
                          onCheckedChange={(checked) => setSkipValidation(checked as boolean)}
                          disabled={isUploading}
                        />
                        <Label htmlFor="skipValidation" className="cursor-pointer">
                          Skip validation (faster import, use with caution)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="updateExisting"
                          checked={updateExisting}
                          onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                          disabled={isUploading}
                        />
                        <Label htmlFor="updateExisting" className="cursor-pointer">
                          Update existing records (match by email/phone)
                        </Label>
                      </div>
                    </div>

                    {/* Import Results */}
                    {uploadResult && (
                      <Alert variant={uploadResult.success === false ? "destructive" : "default"}>
                        {uploadResult.success === false ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                          {uploadResult.success === false ? 'Import Failed' : 'Import Complete'}
                        </AlertTitle>
                        <AlertDescription>
                          {uploadResult.error ? (
                            <p>{uploadResult.error}</p>
                          ) : uploadResult.summary ? (
                            <div className="space-y-2 mt-2">
                              <p><strong>Total Processed:</strong> {uploadResult.summary.total || 0}</p>
                              <p className="text-green-600"><strong>Successful:</strong> {uploadResult.summary.successful || 0}</p>
                              {uploadResult.summary.errors > 0 && (
                                <p className="text-red-600"><strong>Errors:</strong> {uploadResult.summary.errors}</p>
                              )}
                              {uploadResult.summary.warnings > 0 && (
                                <p className="text-yellow-600"><strong>Warnings:</strong> {uploadResult.summary.warnings}</p>
                              )}
                              {uploadResult.details && (
                                <div className="mt-2 space-y-1">
                                  {uploadResult.details.created > 0 && (
                                    <p>✓ Created: {uploadResult.details.created}</p>
                                  )}
                                  {uploadResult.details.updated > 0 && (
                                    <p>✓ Updated: {uploadResult.details.updated}</p>
                                  )}
                                  {uploadResult.details.skipped > 0 && (
                                    <p>⊘ Skipped: {uploadResult.details.skipped}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p>Import completed successfully</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV Template
                      </Button>
                      
                      <Button variant="outline" className="justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        View Import Documentation
                      </Button>
                    </div>

                    {/* Import Instructions */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>CSV Format Requirements</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Required fields: First Name, Last Name, Email, Phone</li>
                          <li>Email and Phone must be unique</li>
                          <li>Use the template for correct format</li>
                          <li>Max file size: 10MB</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
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