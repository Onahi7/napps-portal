import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  Step1PersonalInfo, 
  Step2SchoolInfo, 
  Step3PaymentInfo 
} from "@/components/registration";

interface RegistrationData {
  personalInfo?: any;
  schoolInfo?: any;
  paymentInfo?: any;
  submissionId?: string;
  paymentPending?: boolean;
  paymentMethod?: 'online' | 'bank_transfer';
  registrationNumber?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'napps_registration_progress';
const PAYMENT_PENDING_KEY = 'napps_payment_pending';

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeId, setResumeId] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    const paymentPending = localStorage.getItem(PAYMENT_PENDING_KEY);
    
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setRegistrationData(parsed);
        
        // Check if user has a pending payment
        if (paymentPending && parsed.submissionId) {
          const pendingData = JSON.parse(paymentPending);
          
          // Show alert about pending payment
          toast.info('You have a pending registration', {
            description: 'Would you like to check your payment status?',
            duration: 10000,
            action: {
              label: 'Check Status',
              onClick: () => {
                if (pendingData.paymentMethod === 'online') {
                  navigate(`/payment/status?submissionId=${parsed.submissionId}`);
                } else {
                  navigate(`/payment/status?submissionId=${parsed.submissionId}&method=bank_transfer`);
                }
              },
            },
          });
          
          setShowResumeDialog(true);
        } else if (parsed.submissionId) {
          setShowResumeDialog(true);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, [navigate]);

  // Save progress to localStorage with timestamp
  const saveProgress = (data: RegistrationData) => {
    try {
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Save payment pending status
  const savePaymentPending = (paymentMethod: 'online' | 'bank_transfer', submissionId: string) => {
    try {
      const pendingData = {
        paymentMethod,
        submissionId,
        timestamp: Date.now()
      };
      localStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify(pendingData));
    } catch (error) {
      console.error('Failed to save payment pending status:', error);
    }
  };

  // Clear all saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PAYMENT_PENDING_KEY);
  };

  // Resume with existing submission ID
  const handleResumeRegistration = async () => {
    if (!resumeId.trim()) {
      toast.error('Please enter a valid submission ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proprietors/registration/${resumeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Submission ID not found');
      }

      const result = await response.json();
      
      // Restore the registration data and determine current step
      const restoredData: RegistrationData = {
        submissionId: result.proprietor.submissionId,
        personalInfo: result.proprietor,
        schoolInfo: result.school,
      };

      setRegistrationData(restoredData);
      saveProgress(restoredData);
      
      // Determine which step to show based on completion
      if (result.isComplete) {
        toast.info('Registration already completed');
        setCurrentStep(3);
      } else {
        setCurrentStep(result.currentStep || 2);
      }
      
      setShowResumeDialog(false);
      toast.success('Registration progress loaded successfully');
    } catch (error) {
      toast.error('Failed to load registration. Please check your submission ID.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic details and NAPPS participation' },
    { number: 2, title: 'School Information', description: 'School details and enrollment data' },
    { number: 3, title: 'Payment & Verification', description: 'Payment method and approval status' }
  ];

  const handleStep1Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Save Step 1 data and get submission ID
      const response = await fetch(`${API_BASE_URL}/proprietors/registration/step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 409) {
          // Conflict - email or phone already exists
          const message = errorData.message || 'Email or phone number already registered';
          toast.error(message, {
            description: 'If you already started registration, please use "Resume Registration" option',
            duration: 5000,
          });
          throw new Error(message);
        }
        
        throw new Error(errorData.message || 'Failed to save personal information');
      }

      const result = await response.json();
      const updatedData = {
        ...registrationData,
        personalInfo: data,
        submissionId: result.submissionId
      };
      
      setRegistrationData(updatedData);
      saveProgress(updatedData);

      toast.success('Personal information saved successfully', {
        description: `Submission ID: ${result.submissionId}`,
        duration: 5000,
      });
      setCurrentStep(2);
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        // Already shown detailed toast above
        return;
      }
      toast.error('Failed to save personal information');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Separate enrollment fields from school info fields
      const enrollmentFields = [
        'kg1Male', 'kg1Female', 'kg2Male', 'kg2Female',
        'eccdMale', 'eccdFemale', 'nursery1Male', 'nursery1Female',
        'nursery2Male', 'nursery2Female', 'primary1Male', 'primary1Female',
        'primary2Male', 'primary2Female', 'primary3Male', 'primary3Female',
        'primary4Male', 'primary4Female', 'primary5Male', 'primary5Female',
        'primary6Male', 'primary6Female', 'jss1Male', 'jss1Female',
        'jss2Male', 'jss2Female', 'jss3Male', 'jss3Female',
        'ss1Male', 'ss1Female', 'ss2Male', 'ss2Female',
        'ss3Male', 'ss3Female'
      ];

      // Extract enrollment data
      const enrollment: any = {};
      const schoolInfo: any = {};

      Object.keys(data).forEach(key => {
        if (enrollmentFields.includes(key)) {
          // Include enrollment field if it has a value (including 0)
          // Only exclude undefined, null, and empty string
          if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            enrollment[key] = Number(data[key]);
          }
        } else {
          schoolInfo[key] = data[key];
        }
      });

      // Structure the payload according to backend DTO
      const payload = {
        ...schoolInfo,
        submissionId: registrationData.submissionId,
        // Only include enrollment if there are enrollment fields
        ...(Object.keys(enrollment).length > 0 && { enrollment })
      };

      // Save Step 2 data with submission ID
      const response = await fetch(`${API_BASE_URL}/proprietors/registration/step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save school information');
      }

      const updatedData = {
        ...registrationData,
        schoolInfo: data
      };
      
      setRegistrationData(updatedData);
      saveProgress(updatedData);

      toast.success('School information saved successfully');
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save school information');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { paymentMethod } = data;

      if (paymentMethod === 'online') {
        // Handle online payment - initiate Paystack payment
        const response = await fetch(`${API_BASE_URL}/proprietors/registration/step3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'online',
            submissionId: registrationData.submissionId,
            finalSubmit: false // Don't finalize yet, waiting for payment
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to initiate payment');
        }

        const result = await response.json();
        
        // Save progress and payment pending status before redirecting
        const updatedData = {
          ...registrationData,
          paymentInfo: data,
          paymentPending: true,
          paymentMethod: 'online' as const
        };
        
        saveProgress(updatedData);
        savePaymentPending('online', registrationData.submissionId!);
        
        // Check if simulation mode
        if (result.payment?.simulationMode) {
          toast.success('Redirecting to simulated payment...', {
            description: 'Test payment mode for authorized personnel',
            duration: 3000
          });
          
          setTimeout(() => {
            window.location.href = result.payment.paymentUrl;
          }, 500);
        }
        // Redirect to Paystack payment page or initialize payment
        else if (result.paymentUrl) {
          toast.success('Redirecting to payment gateway...', {
            description: 'Your progress has been saved. You can return anytime.',
            duration: 3000
          });
          
          // Small delay to ensure storage is saved
          setTimeout(() => {
            window.location.href = result.paymentUrl;
          }, 500);
        } else {
          throw new Error('Payment initialization failed');
        }
      } else {
        // Handle bank transfer - submit without payment
        const response = await fetch(`${API_BASE_URL}/proprietors/registration/step3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'bank_transfer',
            paymentStatus: 'Pending',
            submissionId: registrationData.submissionId,
            finalSubmit: true
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to complete registration');
        }

        const result = await response.json();
        
        // Save payment pending status for bank transfer
        savePaymentPending('bank_transfer', registrationData.submissionId!);
        
        toast.success('Registration submitted successfully!', {
          description: 'Redirecting to payment instructions...',
          duration: 3000,
        });
        
        // Redirect to payment status page with bank transfer info
        setTimeout(() => {
          navigate(`/payment/status?submissionId=${registrationData.submissionId}&method=bank_transfer`);
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete registration');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <Layout>
      <div className="py-6 sm:py-8 bg-muted/30 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-5xl mx-auto">
            {/* Resume Registration Dialog */}
            {showResumeDialog && (
              <Card className="mb-6 border-2 border-primary shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Resume Registration
                  </CardTitle>
                  <CardDescription>
                    We found a saved registration in progress. Would you like to continue?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        setShowResumeDialog(false);
                        if (registrationData.submissionId) {
                          setResumeId(registrationData.submissionId);
                          handleResumeRegistration();
                        }
                      }}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Continue Saved Registration
                    </Button>
                    <Button
                      onClick={() => {
                        setShowResumeDialog(false);
                        clearProgress();
                        setRegistrationData({});
                        setCurrentStep(1);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Start New Registration
                    </Button>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Label htmlFor="resume-id" className="text-xs">
                      Or enter a different Submission ID:
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="resume-id"
                        placeholder="Enter submission ID"
                        value={resumeId}
                        onChange={(e) => setResumeId(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleResumeRegistration}
                        disabled={isSubmitting || !resumeId.trim()}
                        size="sm"
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 flex items-center justify-center gap-2 flex-wrap">
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span>New Proprietor Registration</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Complete all three steps to register your school with NAPPS Nasarawa State
              </p>
              {!showResumeDialog && (
                <Button
                  variant="link"
                  onClick={() => setShowResumeDialog(true)}
                  className="mt-2 text-xs sm:text-sm"
                >
                  Already started? Resume Registration
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      currentStep === step.number 
                        ? 'opacity-100 bg-primary/5 border-2 border-primary' 
                        : 'opacity-60 border border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                      ) : currentStep === step.number ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                          {step.number}
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-medium truncate ${
                        currentStep === step.number ? 'text-primary' : 'text-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <Card className="elegant-shadow">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">
                  Step {currentStep}: {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {steps[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {currentStep === 1 && (
                  <Step1PersonalInfo
                    initialData={registrationData.personalInfo}
                    onSubmit={handleStep1Submit}
                    isSubmitting={isSubmitting}
                  />
                )}

                {currentStep === 2 && (
                  <Step2SchoolInfo
                    initialData={registrationData.schoolInfo}
                    onSubmit={handleStep2Submit}
                    onBack={handleBack}
                    isSubmitting={isSubmitting}
                  />
                )}

                {currentStep === 3 && (
                  <Step3PaymentInfo
                    initialData={registrationData.paymentInfo}
                    onSubmit={handleStep3Submit}
                    onBack={handleBack}
                    isSubmitting={isSubmitting}
                  />
                )}
              </CardContent>
            </Card>

            {/* Help Text */}
            <Alert className="mt-4 sm:mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>
                    <strong>Need help?</strong> Your progress is automatically saved locally. 
                    {registrationData.submissionId && (
                      <span className="block sm:inline sm:ml-1 mt-1 sm:mt-0">
                        Your Submission ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{registrationData.submissionId}</code>
                      </span>
                    )}
                  </span>
                  {currentStep === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResumeDialog(true)}
                      className="text-xs self-start sm:self-center"
                    >
                      Resume Registration
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </Layout>
  );
}