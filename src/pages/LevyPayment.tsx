import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CreditCard, 
  School as SchoolIcon, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Trash2,
  Loader2,
  FileText,
  Download,
  Check
} from 'lucide-react';

interface School {
  id: string;
  name: string;
  lga?: string;
  chapter?: string;
}

interface Ward {
  id: string;
  name: string;
}

interface LevyPaymentFormData {
  memberName: string;
  email: string;
  phone: string;
  chapter: string;
  schoolName: string;
  isManualSchoolEntry: boolean;
  wards: Ward[];
}

const NAPPS_CHAPTERS = [
  'Asakioo',
  'Karu 1',
  'Doma',
  'Karu 2',
  'Mararaba Udege',
  'Masaka Ado',
  'Panda',
  'Akwanga',
  'Lafia A',
  'Shabu',
  'Lafia B',
  'Keffi',
  'Kokona',
  'Mararaba Guruku',
  'Jenkwe',
  'Uke Chapter',
  'Nasarawa Eggon',
  'Nas Poly'
];

const LEVY_AMOUNT = 5500;

const LevyPayment = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
  
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<LevyPaymentFormData>({
    memberName: '',
    email: '',
    phone: '',
    chapter: '',
    schoolName: '',
    isManualSchoolEntry: false,
    wards: [{ id: '1', name: '' }],
  });
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [showManualSchoolInput, setShowManualSchoolInput] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('levyPaymentFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setShowManualSchoolInput(parsed.isManualSchoolEntry || false);
        toast.info('Your previous form data has been restored');
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }

    // Fetch schools
    fetchSchools();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.email || formData.phone || formData.memberName) {
      localStorage.setItem('levyPaymentFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const fetchSchools = async (selectedChapter?: string) => {
    setLoadingSchools(true);
    try {
      // Use PostgreSQL endpoint for accurate school-chapter mappings
      const url = selectedChapter 
        ? `${API_BASE_URL}/levy-payments/schools/postgres?chapter=${encodeURIComponent(selectedChapter)}`
        : `${API_BASE_URL}/levy-payments/schools/postgres`;
      
      console.log('Fetching schools from PostgreSQL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Schools fetched from PostgreSQL:', data.length, selectedChapter ? `for chapter: ${selectedChapter}` : '(all)');
      
      if (data && Array.isArray(data)) {
        setSchools(data);
        if (data.length === 0) {
          toast.info('No schools found for this chapter. Please enter school name manually.');
          setShowManualSchoolInput(true);
          handleInputChange('isManualSchoolEntry', true);
        } else {
          setShowManualSchoolInput(false);
          handleInputChange('isManualSchoolEntry', false);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to load schools', {
        description: 'Please enter your school name manually or try refreshing the page.',
      });
      setShowManualSchoolInput(true);
      handleInputChange('isManualSchoolEntry', true);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleInputChange = (field: keyof LevyPaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addWard = () => {
    const newWard: Ward = { id: Date.now().toString(), name: '' };
    setFormData((prev) => ({ ...prev, wards: [...prev.wards, newWard] }));
  };

  const removeWard = (id: string) => {
    if (formData.wards.length > 1) {
      setFormData((prev) => ({
        ...prev,
        wards: prev.wards.filter((w) => w.id !== id),
      }));
    }
  };

  const updateWard = (id: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      wards: prev.wards.map((w) => (w.id === id ? { ...w, name } : w)),
    }));
  };

  const checkDuplicate = async () => {
    if (!formData.email && !formData.phone) {
      return;
    }

    setCheckingDuplicate(true);
    try {
      const response = await fetch(`${API_BASE_URL}/levy-payments/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isDuplicate) {
          if (data.canContinue) {
            setExistingPayment(data.payment);
            toast.warning('You have a pending payment', {
              description: 'You can continue with your existing payment or start a new one.',
            });
          } else {
            toast.error('Payment already completed', {
              description: 'A payment with this email/phone has already been completed successfully.',
            });
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    } finally {
      setCheckingDuplicate(false);
    }
    return true;
  };

  const handleEmailBlur = () => {
    if (formData.email) {
      checkDuplicate();
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone) {
      checkDuplicate();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.memberName.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    if (!formData.chapter) {
      toast.error('Please select a chapter');
      return false;
    }

    if (!formData.schoolName.trim()) {
      toast.error('Please select or enter a school name');
      return false;
    }

    const validWards = formData.wards.filter((w) => w.name.trim());
    if (validWards.length === 0) {
      toast.error('Please add at least one ward');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check for duplicates before proceeding
    const canProceed = await checkDuplicate();
    if (canProceed === false) {
      return;
    }

    setLoading(true);

    try {
      // Try to get proprietor ID from localStorage (optional - for auto-linking)
      const proprietorData = localStorage.getItem('proprietor');
      let proprietorId = undefined;

      if (proprietorData) {
        try {
          const parsed = JSON.parse(proprietorData);
          proprietorId = parsed._id || parsed.submissionId;
          console.log('Found logged in proprietor:', proprietorId);
        } catch (error) {
          console.log('No proprietor logged in - proceeding as public payment');
        }
      }

      const wardNames = formData.wards.filter((w) => w.name.trim()).map((w) => w.name);

      // proprietorId is now optional - backend will auto-link by email/phone if proprietor exists
      const payload: any = {
        memberName: formData.memberName,
        email: formData.email,
        phone: formData.phone,
        chapter: formData.chapter,
        schoolName: formData.schoolName,
        isManualSchoolEntry: formData.isManualSchoolEntry,
        wards: wardNames,
        amount: LEVY_AMOUNT,
        isContinuation: !!existingPayment,
        previousPaymentReference: existingPayment?.reference,
      };

      // Only include proprietorId if logged in
      if (proprietorId) {
        payload.proprietorId = proprietorId;
      }

      const response = await fetch(`${API_BASE_URL}/levy-payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize payment');
      }

      const result = await response.json();

      // Save reference for later use
      localStorage.setItem('levyPaymentReference', result.reference);
      localStorage.setItem('levyReceiptNumber', result.receiptNumber);

      toast.success('Redirecting to payment gateway...', {
        description: 'Your progress has been saved.',
      });

      // Redirect to Flutterwave payment page
      setTimeout(() => {
        window.location.href = result.paymentUrl;
      }, 500);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error('Payment initialization failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueExisting = async () => {
    if (!existingPayment) return;

    toast.info('Continuing with existing payment...');
    
    // Redirect to existing payment URL or verification
    navigate(`/levy-payment/verify?reference=${existingPayment.reference}`);
  };

  const toggleManualSchool = () => {
    setShowManualSchoolInput(!showManualSchoolInput);
    handleInputChange('isManualSchoolEntry', !showManualSchoolInput);
    handleInputChange('schoolName', '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  NAPPS Secretariat Building Levy
                </CardTitle>
                <CardDescription>Pay your NAPPS Nasarawa State Secretariat Building Levy</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                ₦{LEVY_AMOUNT.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {existingPayment && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Existing Payment Detected</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  You have a pending payment. You can continue with it or start a new payment.
                </p>
                <Button onClick={handleContinueExisting} variant="outline" size="sm">
                  Continue Existing Payment
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberName">Full Name *</Label>
                    <Input
                      id="memberName"
                      placeholder="Enter your full name"
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('memberName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={handleEmailBlur}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="080XXXXXXXX"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={handlePhoneBlur}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="chapter">Chapter *</Label>
                    <Select 
                      value={formData.chapter} 
                      onValueChange={(value) => handleInputChange('chapter', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {NAPPS_CHAPTERS.map((chapter) => (
                          <SelectItem key={chapter} value={chapter}>
                            {chapter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.chapter && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Schools will be filtered for {formData.chapter}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <SchoolIcon className="w-5 h-5" />
                  School Information
                </h3>

                {!formData.chapter && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    ℹ️ Please select a chapter first to see available schools
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="school">School Name *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleManualSchool}
                    >
                      {showManualSchoolInput ? 'Select from List' : 'Manual Entry'}
                    </Button>
                  </div>

                  {showManualSchoolInput ? (
                    <Input
                      id="school-manual"
                      placeholder="Enter school name manually"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      required
                    />
                  ) : loadingSchools ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {formData.chapter ? `Loading schools for ${formData.chapter}...` : 'Loading schools...'}
                      </span>
                    </div>
                  ) : (
                    <Select 
                      value={formData.schoolName} 
                      onValueChange={(value) => handleInputChange('schoolName', value)}
                      disabled={!formData.chapter}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !formData.chapter 
                              ? "Select a chapter first" 
                              : schools.length > 0 
                                ? `Select your school (${schools.length} available)` 
                                : "No schools available - use manual entry"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.length > 0 ? (
                          schools.map((school) => (
                            <SelectItem key={school.id} value={school.name}>
                              {school.name} {school.lga && `(${school.lga})`}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No schools available for {formData.chapter}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Wards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Wards *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addWard}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ward
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.wards.map((ward, index) => (
                    <div key={ward.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`Ward ${index + 1} name`}
                        value={ward.name}
                        onChange={(e) => updateWard(ward.id, e.target.value)}
                      />
                      {formData.wards.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWard(ward.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-primary/5 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Payment Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Levy Amount:</span>
                  <span className="text-2xl font-bold">₦{LEVY_AMOUNT.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || checkingDuplicate}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your information is saved automatically. You can return anytime to complete the payment.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Receipt Download Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Receipt
            </CardTitle>
            <CardDescription>
              Enter your email or phone number to download your payment receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/levy-payment/download')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LevyPayment;
