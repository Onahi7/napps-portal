import { API_BASE_URL } from '@/config/api';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Lock, CheckCircle, Loader2, Sparkles, School, User } from 'lucide-react';



interface FeeItem {
  name?: string;
  amount?: number;
}

interface PaymentInfo {
  status?: string;
  reference?: string;
  submissionId?: string;
  registrationNumber?: string;
  amount?: number;
  paidAt?: string;
  paymentType?: string;
  simulated?: boolean;
  fees?: FeeItem[];
  proprietor?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  school?: {
    schoolName?: string;
    lga?: string;
  } | null;
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

  const proprietorName = useMemo(() => {
    const p = paymentInfo?.proprietor;
    if (!p) return '';
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();
  }, [paymentInfo]);

  useEffect(() => {
    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/');
      return;
    }

    const fetchPaymentInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);

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
    const digits = value.replace(/\D/g, '');
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

  const fillDemoCard = () => {
    setFormData({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: (proprietorName || 'TEST PROPRIETOR').toUpperCase(),
      expiryMonth: '12',
      expiryYear: '30',
      cvv: '123',
    });
    toast.info('Demo card details filled');
  };

  const handlePayment = async () => {
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

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch(`${API_BASE_URL}/payments/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolder: formData.cardHolder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const regNo = data?.payment?.registrationNumber;
        toast.success('Payment successful! 🎉', {
          description: regNo ? `Registration number: ${regNo}` : 'Your registration is confirmed.',
        });

        setTimeout(() => {
          navigate(`/payment/success?reference=${reference}`);
        }, 1500);
      } else {
        const error = await response.json().catch(() => ({}));
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

  if (paymentInfo?.status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Payment already completed</CardTitle>
              <CardDescription>
                This reference has already been paid for successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" onClick={() => navigate(`/payment/success?reference=${reference}`)}>
                View receipt
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Go to home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-green-600" />
          <p className="text-sm text-muted-foreground">Secure Payment Portal</p>
          <Badge variant="secondary" className="text-[11px]">Test mode</Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>
              Enter any card details to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentInfo && (
              <>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary">
                    ₦{(paymentInfo.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 break-all">
                    Reference: {reference}
                  </p>
                </div>

                {(paymentInfo.fees?.length ?? 0) > 0 && (
                  <div className="rounded-lg border p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Fee breakdown
                    </p>
                    {paymentInfo.fees!.map((fee, index) => (
                      <div key={`${fee.name}-${index}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{fee.name}</span>
                        <span className="font-medium">₦{(fee.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  {proprietorName && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{proprietorName}</p>
                        {paymentInfo.proprietor?.email && (
                          <p className="text-xs text-muted-foreground">{paymentInfo.proprietor.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {paymentInfo.school?.schoolName && (
                    <div className="flex items-start gap-2">
                      <School className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{paymentInfo.school.schoolName}</p>
                        {paymentInfo.school.lga && (
                          <p className="text-xs text-muted-foreground">{paymentInfo.school.lga}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {paymentInfo.submissionId && (
                    <p className="text-xs text-muted-foreground break-all">
                      Submission ID: {paymentInfo.submissionId}
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={fillDemoCard}
              disabled={processing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use demo card details
            </Button>

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
              <p className="text-xs text-muted-foreground">Enter any 16-digit number</p>
            </div>

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
                  Pay ₦{(paymentInfo?.amount || 0).toLocaleString()}
                </>
              )}
            </Button>

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

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            🔒 Secure payments — no real card is charged in test mode
          </p>
        </div>
      </div>
    </div>
  );
};
