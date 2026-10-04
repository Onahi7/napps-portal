import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PortalPageShell } from '@/components/portal/PortalPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Mail,
  Phone,
  Plus,
  School as SchoolIcon,
  Trash2,
  User,
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
  'Nas Poly',
];

const LEVY_AMOUNT = 5600;
const LEVY_BASE = 5500;
const PAYMENT_CHARGE = 100;

const LevyPayment = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';

  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [showManualSchoolInput, setShowManualSchoolInput] = useState(false);
  const [formData, setFormData] = useState<LevyPaymentFormData>({
    memberName: '',
    email: '',
    phone: '',
    chapter: '',
    schoolName: '',
    isManualSchoolEntry: false,
    wards: [{ id: '1', name: '' }],
  });

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

    fetchSchools();
  }, []);

  useEffect(() => {
    if (formData.email || formData.phone || formData.memberName) {
      localStorage.setItem('levyPaymentFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const fetchSchools = async (selectedChapter?: string) => {
    setLoadingSchools(true);
    try {
      const url = selectedChapter
        ? `${API_BASE_URL}/levy-payments/schools/postgres?chapter=${encodeURIComponent(selectedChapter)}`
        : `${API_BASE_URL}/levy-payments/schools/postgres`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSchools(data);
        if (data.length === 0) {
          toast.info('No schools found for this chapter. Please enter the school name manually.');
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
        description: 'Please enter your school name manually or refresh the page.',
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
    setFormData((prev) => ({
      ...prev,
      wards: [...prev.wards, { id: Date.now().toString(), name: '' }],
    }));
  };

  const removeWard = (id: string) => {
    if (formData.wards.length > 1) {
      setFormData((prev) => ({
        ...prev,
        wards: prev.wards.filter((ward) => ward.id !== id),
      }));
    }
  };

  const updateWard = (id: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      wards: prev.wards.map((ward) => (ward.id === id ? { ...ward, name } : ward)),
    }));
  };

  const checkDuplicate = async () => {
    if (!formData.email && !formData.phone) return;

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
              description: 'A levy payment with this email or phone has already been completed.',
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

  const validateForm = () => {
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
    if (formData.wards.filter((ward) => ward.name.trim()).length === 0) {
      toast.error('Please add at least one ward');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const canProceed = await checkDuplicate();
    if (canProceed === false) return;

    setLoading(true);
    try {
      const proprietorData = localStorage.getItem('proprietor');
      let proprietorId: string | undefined;

      if (proprietorData) {
        try {
          const parsed = JSON.parse(proprietorData);
          proprietorId = parsed._id || parsed.submissionId;
        } catch (error) {
          console.error('Unable to parse proprietor session:', error);
        }
      }

      const payload: Record<string, any> = {
        memberName: formData.memberName,
        email: formData.email,
        phone: formData.phone,
        chapter: formData.chapter,
        schoolName: formData.schoolName,
        isManualSchoolEntry: formData.isManualSchoolEntry,
        wards: formData.wards.filter((ward) => ward.name.trim()).map((ward) => ward.name),
        amount: LEVY_AMOUNT,
        isContinuation: Boolean(existingPayment),
        previousPaymentReference: existingPayment?.reference,
      };

      if (proprietorId) payload.proprietorId = proprietorId;

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
      localStorage.setItem('levyPaymentReference', result.reference);
      localStorage.setItem('levyReceiptNumber', result.receiptNumber);

      toast.success('Redirecting to payment gateway...', {
        description: 'Your progress has been saved.',
      });

      setTimeout(() => {
        window.location.href = result.paymentUrl;
      }, 500);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error('Payment initialization failed', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueExisting = () => {
    if (!existingPayment) return;
    toast.info('Continuing with existing payment...');
    navigate(`/levy-payment/verify?reference=${existingPayment.reference}`);
  };

  const toggleManualSchool = () => {
    setShowManualSchoolInput((prev) => !prev);
    handleInputChange('isManualSchoolEntry', !showManualSchoolInput);
    handleInputChange('schoolName', '');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.45))] py-8">
        <div className="container mx-auto max-w-5xl px-4">
          <PortalPageShell
            eyebrow="Levy Collection"
            title="Secretariat building levy"
            description="This flow now follows the SPRS-style fidelity upgrade with cleaner payment framing, stronger guidance around chapter and school selection, and easier recovery when a payment is already in progress."
            badge={`NGN ${LEVY_AMOUNT.toLocaleString()}`}
            icon={CreditCard}
            stats={[
              { label: 'Base levy', value: `NGN ${LEVY_BASE.toLocaleString()}`, helper: 'Core chapter levy amount.' },
              { label: 'Processing', value: `NGN ${PAYMENT_CHARGE.toLocaleString()}`, helper: 'Gateway and transaction fee.' },
              { label: 'Coverage', value: 'All chapters', helper: 'School lookup narrows after chapter selection.' },
            ]}
          >
            <div className="mb-2">
              <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full px-0 text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to previous page
              </Button>
            </div>

            <Card className="portal-panel">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="h-6 w-6" />
                      NAPPS Secretariat Building Levy
                    </CardTitle>
                    <CardDescription>Pay your NAPPS Nasarawa State secretariat building levy.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    NGN {LEVY_AMOUNT.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {existingPayment && (
                  <div className="portal-panel-muted mb-6 border border-amber-200/70 p-4">
                    <h3 className="mb-2 font-semibold text-amber-800">Existing payment detected</h3>
                    <p className="mb-3 text-sm text-amber-700">
                      We found a pending levy payment for this contact. You can continue it or start a new one.
                    </p>
                    <Button onClick={handleContinueExisting} variant="outline" size="sm">
                      Continue existing payment
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="portal-panel-muted space-y-4 border border-primary/10 p-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <User className="h-5 w-5" />
                      Personal information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => formData.email && checkDuplicate()}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="080XXXXXXXX"
                            className="pl-10"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            onBlur={() => formData.phone && checkDuplicate()}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="chapter">Chapter *</Label>
                        <Select
                          value={formData.chapter}
                          onValueChange={(value) => {
                            handleInputChange('chapter', value);
                            handleInputChange('schoolName', '');
                            fetchSchools(value);
                          }}
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
                          <p className="mt-1 text-xs text-muted-foreground">
                            Schools will be filtered for {formData.chapter}.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="portal-panel-muted space-y-4 border border-primary/10 p-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <SchoolIcon className="h-5 w-5" />
                      School information
                    </h3>

                    {!formData.chapter && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                        Please select a chapter first to see available schools.
                      </div>
                    )}

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor="school">School Name *</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={toggleManualSchool}>
                          {showManualSchoolInput ? 'Select from list' : 'Manual entry'}
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
                        <div className="flex items-center gap-2 rounded-xl border bg-background p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
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
                                  ? 'Select a chapter first'
                                  : schools.length > 0
                                    ? `Select your school (${schools.length} available)`
                                    : 'No schools available. Use manual entry.'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.length > 0 ? (
                              schools.map((school) => (
                                <SelectItem key={school.id} value={school.name}>
                                  {school.name} {school.lga ? `(${school.lga})` : ''}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No schools available for {formData.chapter}.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="portal-panel-muted space-y-4 border border-primary/10 p-5">
                    <div className="flex items-center justify-between">
                      <Label>Wards *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addWard}>
                        <Plus className="mr-2 h-4 w-4" />
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
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeWard(ward.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="portal-panel-muted space-y-3 border border-primary/10 p-6">
                    <h3 className="text-lg font-semibold">Payment summary</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Levy amount:</span>
                      <span>NGN {LEVY_BASE.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment processing charge:</span>
                      <span>NGN {PAYMENT_CHARGE.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold">NGN {LEVY_AMOUNT.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Includes NGN {PAYMENT_CHARGE.toLocaleString()} payment processing charge.
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading || checkingDuplicate}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to payment
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Your information is saved automatically, so you can return later if needed.
                  </p>
                </form>
              </CardContent>
            </Card>

            <Card className="portal-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download receipt
                </CardTitle>
                <CardDescription>Use your saved contact details to download a completed levy receipt.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/levy-payment/download')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Open receipt download
                </Button>
              </CardContent>
            </Card>

            <div className="portal-panel-muted flex items-start gap-3 border border-primary/10 p-4 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              Chapter assignment controls which schools appear. If your school is missing, switch to manual entry and continue without losing your saved progress.
            </div>
          </PortalPageShell>
        </div>
      </div>
    </Layout>
  );
};

export default LevyPayment;
