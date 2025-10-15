import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Info, CreditCard, Upload, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const step3Schema = z.object({
  paymentMethod: z.enum(['online', 'bank_transfer']),
  confirmAccuracy: z.boolean().refine(val => val === true, {
    message: 'You must confirm the accuracy of the information'
  })
});

type Step3FormData = z.infer<typeof step3Schema>;

interface FeeItem {
  _id: string;
  name: string;
  amount: number;
  description?: string;
  isActive: boolean;
}

interface Step3PaymentInfoProps {
  initialData?: Partial<Step3FormData>;
  onSubmit: (data: Omit<Step3FormData, 'confirmAccuracy'>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const Step3PaymentInfo: React.FC<Step3PaymentInfoProps> = ({
  initialData,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loadingFees, setLoadingFees] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData || {
      paymentMethod: 'online',
      confirmAccuracy: false
    }
  });

  const confirmAccuracy = watch('confirmAccuracy');
  const paymentMethod = watch('paymentMethod');

  // Fetch active fees from backend
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
        const response = await fetch(`${API_BASE_URL}/fees/active`);
        
        if (response.ok) {
          const data = await response.json();
          // Handle both array response and object with data property
          const feesArray = Array.isArray(data) ? data : (data.data || data.fees || []);
          setFees(feesArray);
          
          // Calculate total
          const total = feesArray.reduce((sum: number, fee: FeeItem) => sum + fee.amount, 0);
          setTotalAmount(total);
        }
      } catch (error) {
        console.error('Failed to fetch fees:', error);
      } finally {
        setLoadingFees(false);
      }
    };

    fetchFees();
  }, []);

  const handleFormSubmit = (data: Step3FormData) => {
    // Remove confirmAccuracy before sending to backend
    const { confirmAccuracy, ...paymentData } = data;
    onSubmit(paymentData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 px-1">
      {/* Fee Breakdown */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Registration Fees
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Applicable fees for your school registration
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          {loadingFees ? (
            <div className="text-center py-4 text-muted-foreground">
              <div className="animate-pulse">Loading fees...</div>
            </div>
          ) : fees.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                No fees configured. You can proceed with registration.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {fees.map((fee) => (
                <div key={fee._id} className="flex justify-between items-start py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{fee.name}</p>
                    {fee.description && (
                      <p className="text-xs text-muted-foreground">{fee.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-sm">₦{fee.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <p className="font-bold text-base sm:text-lg">Total Amount</p>
                <p className="font-bold text-base sm:text-lg text-primary">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Method</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Choose how you would like to make payment
          </p>
        </div>

        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setValue('paymentMethod', value as 'online' | 'bank_transfer')}
          className="space-y-3"
        >
          {/* Online Payment */}
          <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            paymentMethod === 'online' 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <RadioGroupItem value="online" id="online" className="mt-1" />
            <Label htmlFor="online" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm sm:text-base">Pay Online (Recommended)</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pay instantly with card, bank transfer, or USSD. Your registration will be processed immediately upon successful payment.
              </p>
            </Label>
          </div>

          {/* Bank Transfer */}
          <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            paymentMethod === 'bank_transfer' 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
            <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm sm:text-base">Bank Transfer</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Make payment directly to NAPPS account. Registration will be marked as "Pending Payment Verification" until admin confirms your payment.
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Bank Transfer Instructions */}
      {paymentMethod === 'bank_transfer' && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs sm:text-sm text-gray-700">
            <strong>Bank Transfer Instructions:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Submit this form to receive your submission ID</li>
              <li>Make payment to the NAPPS Nasarawa account</li>
              <li>Contact the admin with your submission ID and payment proof</li>
              <li>Admin will verify and approve your registration</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Information Summary Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-gray-700">
          <strong>Before submitting:</strong> Please review all information entered in previous steps. 
          Once submitted, your registration will be processed by the NAPPS Nasarawa administration.
        </AlertDescription>
      </Alert>

      {/* Confirmation Checkbox */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Declaration</h3>
          <p className="text-xs sm:text-sm text-red-600 mt-1">Required: You must accept the declaration to proceed</p>
        </div>
        
        <div className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Checkbox
            id="confirmAccuracy"
            checked={confirmAccuracy}
            onCheckedChange={(checked) => setValue('confirmAccuracy', checked as boolean)}
            className="mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Label 
              htmlFor="confirmAccuracy" 
              className="text-xs sm:text-sm font-normal leading-relaxed cursor-pointer block"
            >
              I hereby declare that all information provided in this registration form is accurate 
              and complete to the best of my knowledge. I understand that providing false information 
              may result in the rejection of my application or cancellation of my membership with 
              NAPPS Nasarawa State.
            </Label>
            {errors.confirmAccuracy && (
              <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.confirmAccuracy.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {confirmAccuracy && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-gray-700">
            {paymentMethod === 'online' ? (
              <span>
                <strong>✅ Ready to proceed!</strong> Click below to continue to secure payment.
              </span>
            ) : (
              <span>
                <strong>✅ Ready to submit!</strong> Your registration will be pending payment verification.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="w-full sm:w-auto order-2 sm:order-1"
          disabled={isSubmitting}
        >
          ← Back
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !confirmAccuracy}
          className="w-full sm:w-auto min-w-[220px] order-1 sm:order-2 bg-green-600 hover:bg-green-700 text-sm sm:text-base font-semibold"
        >
          {isSubmitting ? '⏳ Processing...' : paymentMethod === 'online' ? '→ Proceed to Payment' : '✓ Submit Registration'}
        </Button>
      </div>
    </form>
  );
};

export default Step3PaymentInfo;
