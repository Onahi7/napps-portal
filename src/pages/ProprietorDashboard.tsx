import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { 
  User, 
  School, 
  CreditCard, 
  LogOut, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  Award,
  FileText,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface ProprietorData {
  _id?: string;
  submissionId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  sex?: string;
  lga?: string;
  passportPhotoUrl?: string;
  schoolName?: string;
  schoolName2?: string;
  address?: string;
  schoolAddress?: string;
  typeOfSchool?: string;
  categoryOfSchool?: string;
  ownership?: string;
  yearOfEstablishment?: string;
  yearOfApproval?: string;
  registrationEvidence?: string;
  registrationEvidencePhotoUrl?: string;
  nappsRegistered?: string;
  participationHistory?: string[];
  pupilsPresentedLastExam?: number;
  awards?: string;
  positionHeld?: string;
  clearingStatus?: string;
  totalAmountDue?: number;
  paymentMethod?: string;
  lastPaymentDate?: string;
  paymentStatus?: string;
  submissionDate?: string;
  enrollment?: Record<string, number>;
  totalEnrollment?: number;
  totalMale?: number;
  totalFemale?: number;
}

export const ProprietorDashboard = () => {
  const [proprietor, setProprietor] = useState<ProprietorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const proprietorData = localStorage.getItem('proprietor');
    if (!proprietorData) {
      toast.error('Please login to access dashboard');
      navigate('/proprietor-login');
      return;
    }

    try {
      const data = JSON.parse(proprietorData);
      setProprietor(data);
    } catch (error) {
      console.error('Error parsing proprietor data:', error);
      toast.error('Invalid session data');
      navigate('/proprietor-login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('proprietor');
    localStorage.removeItem('proprietorId');
    toast.success('Logged out successfully');
    navigate('/proprietor-login');
  };

  const handleProfileUpdate = (updatedData: Partial<ProprietorData>) => {
    if (proprietor) {
      const newData = { ...proprietor, ...updatedData };
      setProprietor(newData);
      localStorage.setItem('proprietor', JSON.stringify(newData));
    }
  };

  const handlePayment = () => {
    toast.info('Redirecting to payment gateway...');
    // Implement Paystack payment here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!proprietor) {
    return null;
  }

  const displayName = proprietor.name || `${proprietor.firstName || ''} ${proprietor.middleName || ''} ${proprietor.lastName || ''}`.trim();

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'cleared':
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'outstanding':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const TabContent = ({ tab }: { tab: string }) => {
    switch (tab) {
      case 'personal':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {proprietor.passportPhotoUrl && (
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img 
                      src={proprietor.passportPhotoUrl} 
                      alt="Passport" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-border"
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-medium">{displayName}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Gender</Label>
                  <p className="text-lg font-medium">{proprietor.sex || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <p className="text-lg font-medium break-words">{proprietor.email}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <p className="text-lg font-medium">{proprietor.phone}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    LGA
                  </Label>
                  <p className="text-lg font-medium">{proprietor.lga || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submission ID
                  </Label>
                  <p className="text-lg font-medium break-all">{proprietor.submissionId || proprietor._id || 'N/A'}</p>
                </div>
              </div>

              {proprietor.submissionDate && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Registration Date
                  </Label>
                  <p className="text-lg font-medium">
                    {new Date(proprietor.submissionDate).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'school':
        return (
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Details about your educational institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label className="text-sm text-muted-foreground">School Name</Label>
                  <p className="text-lg font-medium">{proprietor.schoolName || 'N/A'}</p>
                  {proprietor.schoolName2 && (
                    <p className="text-sm text-muted-foreground">Also known as: {proprietor.schoolName2}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <p className="text-lg font-medium">{proprietor.schoolAddress || proprietor.address || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Type of School</Label>
                  <p className="text-lg font-medium">{proprietor.typeOfSchool || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Category</Label>
                  <p className="text-lg font-medium">{proprietor.categoryOfSchool || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Ownership</Label>
                  <p className="text-lg font-medium">{proprietor.ownership || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Year Established</Label>
                  <p className="text-lg font-medium">{proprietor.yearOfEstablishment || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Year of Approval</Label>
                  <p className="text-lg font-medium">{proprietor.yearOfApproval || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Registration Evidence</Label>
                  <p className="text-lg font-medium">{proprietor.registrationEvidence || 'N/A'}</p>
                </div>
              </div>

              {proprietor.registrationEvidencePhotoUrl && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">Registration Document</Label>
                  <img 
                    src={proprietor.registrationEvidencePhotoUrl} 
                    alt="Registration Document" 
                    className="max-w-full md:max-w-md rounded-lg border-2 border-border"
                  />
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Student Enrollment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{proprietor.totalEnrollment || 0}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                    <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{proprietor.totalMale || 0}</p>
                    <p className="text-sm text-muted-foreground">Male</p>
                  </div>
                  <div className="text-center p-4 bg-pink-500/5 rounded-lg">
                    <User className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                    <p className="text-2xl font-bold">{proprietor.totalFemale || 0}</p>
                    <p className="text-sm text-muted-foreground">Female</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'payment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Your payment status and transaction history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-primary/5 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Clearing Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(proprietor.clearingStatus)} className="text-lg px-4 py-1">
                      {proprietor.clearingStatus || 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 bg-accent/5 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Total Amount Due</Label>
                  <p className="text-3xl font-bold mt-2">
                    ₦{(proprietor.totalAmountDue || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Payment Method</Label>
                  <p className="text-lg font-medium">{proprietor.paymentMethod || 'N/A'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Payment Status</Label>
                  <p className="text-lg font-medium">{proprietor.paymentStatus || 'Pending'}</p>
                </div>

                {proprietor.lastPaymentDate && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Payment Date
                    </Label>
                    <p className="text-lg font-medium">
                      {new Date(proprietor.lastPaymentDate).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {proprietor.clearingStatus !== 'cleared' && proprietor.totalAmountDue && proprietor.totalAmountDue > 0 && (
                <div className="pt-6 border-t">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handlePayment}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₦{proprietor.totalAmountDue.toLocaleString()} Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'napps':
        return (
          <Card>
            <CardHeader>
              <CardTitle>NAPPS Participation</CardTitle>
              <CardDescription>Your involvement with NAPPS activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 p-6 bg-primary/5 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Registration Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" className="text-base px-4 py-1">
                      {proprietor.nappsRegistered || 'Not Registered'}
                    </Badge>
                  </div>
                </div>

                {proprietor.pupilsPresentedLastExam !== undefined && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Pupils Presented (Last Exam)</Label>
                    <p className="text-2xl font-bold">{proprietor.pupilsPresentedLastExam}</p>
                  </div>
                )}

                {proprietor.positionHeld && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Position Held</Label>
                    <p className="text-lg font-medium">{proprietor.positionHeld}</p>
                  </div>
                )}
              </div>

              {proprietor.participationHistory && proprietor.participationHistory.length > 0 && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-3 block">Participation History</Label>
                  <div className="space-y-2">
                    {proprietor.participationHistory.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{entry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {proprietor.awards && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">Awards from NAPPS</Label>
                  <div className="p-4 bg-accent/5 rounded-lg">
                    <p className="text-base">{proprietor.awards}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-7xl py-4 md:py-8">
          {/* Header - Desktop */}
          <div className="hidden md:flex justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Proprietor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {displayName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Header - Mobile */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                Hi, {proprietor.firstName || 'User'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">Payment</p>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(proprietor.clearingStatus)} className="text-xs md:text-sm">
                        {proprietor.clearingStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg md:text-2xl font-bold">₦{((proprietor.totalAmountDue || 0) / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="hidden md:flex w-12 h-12 bg-accent/10 rounded-full items-center justify-center">
                    {proprietor.clearingStatus === 'cleared' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">Students</p>
                    <p className="text-lg md:text-2xl font-bold">{proprietor.totalEnrollment || 0}</p>
                  </div>
                  <div className="hidden md:flex w-12 h-12 bg-secondary/10 rounded-full items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">NAPPS</p>
                    <p className="text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none">
                      {proprietor.nappsRegistered || 'Not Registered'}
                    </p>
                  </div>
                  <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content - No tabs visible on mobile, controlled by bottom nav */}
          <div className="md:hidden">
            <TabContent tab={activeTab} />
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <div className="flex gap-2 mb-6 border-b">
              {[
                { value: 'personal', label: 'Personal', icon: User },
                { value: 'school', label: 'School', icon: School },
                { value: 'payment', label: 'Payment', icon: CreditCard },
                { value: 'napps', label: 'NAPPS', icon: Award },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.value
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <TabContent tab={activeTab} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2 safe-area-inset-bottom">
          {[
            { value: 'personal', label: 'Personal', icon: User },
            { value: 'school', label: 'School', icon: School },
            { value: 'payment', label: 'Payment', icon: CreditCard },
            { value: 'napps', label: 'NAPPS', icon: Award },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground active:bg-gray-100'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.value ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        proprietorData={proprietor}
        onSave={handleProfileUpdate}
      />
    </>
  );
};

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
