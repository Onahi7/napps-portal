import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Info, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const step3Schema = z.object({
  paymentMethod: z.enum(['mock', 'online', 'fidelity', 'bank_transfer']),
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
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      paymentMethod: 'mock',
      ...initialData,
      confirmAccuracy: false
    }
  });

  const confirmAccuracy = watch('confirmAccuracy');

  // Fetch active fees from backend
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';
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
            Registration and annual dues for your school
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

      {/* Payment Method */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Method</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete your registration with a secure card payment
          </p>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600">
          <CreditCard className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                Secure Card Payment
              </span>
              <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                Recommended
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your card details on the secure payment page. Your registration is
              confirmed and your registration number is issued immediately after payment.
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-gray-700">
            <strong>Secure test mode:</strong> payments are currently processed in a
            simulation environment. No real card is charged, but every detail is captured
            and your registration is finalized automatically.
          </AlertDescription>
        </Alert>
      </div>

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
            <span>
              <strong>✅ Ready to proceed!</strong> Click below to continue to the secure
              payment page. Your registration is confirmed the moment payment succeeds.
            </span>
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
          {isSubmitting ? '⏳ Processing...' : '→ Proceed to Secure Payment'}
        </Button>
      </div>
    </form>
  );
};

export default Step3PaymentInfo;
