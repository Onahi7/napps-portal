import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface PaymentInfo {
  reference: string;
  amount: number;
  status: string;
}

export const SimulatedPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/');
      return;
    }

    // Fetch payment info
    const fetchPaymentInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/payments/reference/${reference}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentInfo(data);
        } else {
          toast.error('Failed to load payment information');
        }
      } catch (error) {
        console.error('Error fetching payment info:', error);
        toast.error('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [reference, navigate]);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add space every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      const formatted = formatCardNumber(value);
      if (formatted.replace(/\s/g, '').length <= 16) {
        setFormData({ ...formData, [field]: formatted });
      }
    } else if (field === 'expiryMonth') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2 && (digits === '' || parseInt(digits) <= 12)) {
        setFormData({ ...formData, [field]: digits });
      }
    } else if (field === 'expiryYear') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) {
        setFormData({ ...formData, [field]: digits });
      }
    } else if (field === 'cvv') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) {
        setFormData({ ...formData, [field]: digits });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handlePayment = async () => {
    // Validate form
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    if (!formData.cardHolder.trim()) {
      toast.error('Please enter cardholder name');
      return;
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      toast.error('Please enter card expiry date');
      return;
    }

    if (!formData.cvv || formData.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }

    try {
      setProcessing(true);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call simulated payment endpoint
      const response = await fetch(`${API_BASE_URL}/payments/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolder: formData.cardHolder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Payment successful! 🎉');
        
        // Redirect to success page
        setTimeout(() => {
          navigate(`/payment/success?reference=${reference}`);
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-green-600" />
          <p className="text-sm text-muted-foreground">
            Secure Simulated Payment Portal
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>
              Enter any card details to simulate payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Display */}
            {paymentInfo && (
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">
                  ₦{paymentInfo.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Reference: {reference}
                </p>
              </div>
            )}

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="pl-10 text-lg tracking-wider"
                  disabled={processing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any 16-digit number
              </p>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input
                id="cardHolder"
                type="text"
                placeholder="JOHN DOE"
                value={formData.cardHolder}
                onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
                disabled={processing}
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    value={formData.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    className="text-center"
                    disabled={processing}
                  />
                  <span className="self-center">/</span>
                  <Input
                    type="text"
                    placeholder="YY"
                    maxLength={2}
                    value={formData.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    className="text-center"
                    disabled={processing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="text-center"
                  disabled={processing}
                />
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Pay ₦{paymentInfo ? paymentInfo.amount.toLocaleString() : '0'}
                </>
              )}
            </Button>



            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={processing}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            🔒 Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
};
