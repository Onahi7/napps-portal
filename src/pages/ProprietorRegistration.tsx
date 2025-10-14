import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Step1PersonalInfo, 
  Step2SchoolInfo, 
  Step3PaymentInfo 
} from '@/components/registration';

interface RegistrationData {
  personalInfo?: any;
  schoolInfo?: any;
  paymentInfo?: any;
  submissionId?: string;
}

const ProprietorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic details and NAPPS participation' },
    { number: 2, title: 'School Information', description: 'School details and enrollment data' },
    { number: 3, title: 'Payment & Verification', description: 'Payment method and approval status' }
  ];

  const handleStep1Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Save Step 1 data and get submission ID
      const response = await fetch('/api/proprietors/registration/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save personal information');

      const result = await response.json();
      setRegistrationData({
        ...registrationData,
        personalInfo: data,
        submissionId: result.submissionId
      });

      toast.success('Personal information saved successfully');
      setCurrentStep(2);
    } catch (error) {
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
      const response = await fetch('/api/proprietors/registration/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save school information');

      setRegistrationData({
        ...registrationData,
        schoolInfo: data
      });

      toast.success('School information saved successfully');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Failed to save school information');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Final submission - save Step 3 and mark as complete
      const response = await fetch('/api/proprietors/registration/step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          submissionId: registrationData.submissionId,
          finalSubmit: true
        }),
      });

      if (!response.ok) throw new Error('Failed to complete registration');

      const result = await response.json();
      
      toast.success('Registration completed successfully!');
      
      // Redirect to success page or dashboard
      setTimeout(() => {
        navigate(`/registration-success/${result.registrationNumber}`);
      }, 1500);
    } catch (error) {
      toast.error('Failed to complete registration');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proprietor Registration
          </h1>
          <p className="text-gray-600">
            Complete all three steps to register your school with NAPPS Nasarawa
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-start gap-3 ${
                  currentStep === step.number ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : currentStep === step.number ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {step.number}
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    currentStep === step.number ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
        <Alert className="mt-6">
          <AlertDescription>
            <strong>Need help?</strong> Your progress is automatically saved. You can return later to complete your registration using the submission ID provided after Step 1.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProprietorRegistration;
