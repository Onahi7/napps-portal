import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportDataPageProps {
  authToken: string | null;
}

export function ImportDataPage({ authToken }: ImportDataPageProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [skipValidation, setSkipValidation] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
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

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/v1/proprietors/import/csv', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadResult(result);
      
      toast.success(`CSV import completed! ${result.summary?.successful || 0} records processed successfully.`);
      
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
      'Name', 'Sex', 'Email', 'Phone/Mobile', 'Name Of School', 'Address', 
      'Registeration Status', 'Approval Status', 'Are you registered with NAPPs ?',
      'How many times your School participated in Napps Nasarawa State Unified Certificate Examination',
      'Number of Pupils presented in year 2023/2024 NAPPS Nasarawa State certificate examination',
      'Award given to you / your School by NAPPS for the past four years',
      'Position Held at NAPPS Level Progressively'
    ];
    
    const sampleData = [
      'John Michael Smith', 'Male', 'john.smith@email.com', '+2348123456789',
      'Greenfield Academy', '123 Main Street Lafia', 'approved', 'approved',
      'Registered', '3', '45', 'Best School Award 2023', 'State Chairman'
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-600 mt-1">Upload CSV files to import proprietor data in bulk</p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
          <CardDescription>
            Upload a CSV file with proprietor information. Maximum file size: 10MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-semibold text-gray-900 mb-2">
              {csvFile ? csvFile.name : 'Upload Proprietor Data'}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {csvFile
                ? `File size: ${(csvFile.size / 1024).toFixed(2)} KB`
                : 'Click to select a CSV file or drag and drop here'}
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {csvFile ? 'Change File' : 'Select CSV File'}
              </Button>
              
              {csvFile && (
                <Button
                  onClick={handleCsvUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Import Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">Import Options</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skipValidation"
                checked={skipValidation}
                onCheckedChange={(checked) => setSkipValidation(checked as boolean)}
                disabled={isUploading}
              />
              <Label htmlFor="skipValidation" className="cursor-pointer text-sm">
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
              <Label htmlFor="updateExisting" className="cursor-pointer text-sm">
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
                  <p className="text-sm">{uploadResult.error}</p>
                ) : uploadResult.summary ? (
                  <div className="space-y-2 mt-2 text-sm">
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
                  <p className="text-sm">Import completed successfully</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Template and Documentation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Download Template</CardTitle>
            <CardDescription>Get the CSV template with sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Format Requirements</CardTitle>
            <CardDescription>Important information about CSV format</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Required: Name, Sex, Email, Phone/Mobile</li>
                  <li>Name should be full name (e.g., "John Michael Smith")</li>
                  <li>Email and Phone must be unique</li>
                  <li>Sex must be "Male" or "Female"</li>
                  <li>Use the template for correct format</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
