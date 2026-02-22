import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  Download,
  Home
} from 'lucide-react';
import { generateLevyReceipt } from '@/utils/receiptGenerator';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'pending';

const LevyPaymentVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
  const reference = searchParams.get('reference') || searchParams.get('tx_ref');

  useEffect(() => {
    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    if (!reference) {
      setStatus('failed');
      setIsLoading(false);
      toast.error('Invalid payment reference');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/levy-payments/verify/${reference}`);

      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);

        if (data.status === 'success') {
          setStatus('success');
          // Clear saved form data
          localStorage.removeItem('levyPaymentFormData');
          toast.success('Payment verified successfully!');
        } else if (data.status === 'failed') {
          setStatus('failed');
          toast.error('Payment failed');
        } else {
          setStatus('pending');
          toast.warning('Payment is still being processed');
        }
      } else {
        setStatus('failed');
        toast.error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      toast.error('An error occurred while verifying payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentDetails) return;

    setDownloading(true);
    try {
      await generateLevyReceipt(paymentDetails);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-24 h-24 text-green-600" />;
      case 'failed':
        return <XCircle className="w-24 h-24 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-24 h-24 text-yellow-600 animate-spin" />;
      default:
        return <Loader2 className="w-24 h-24 text-primary animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Verifying Payment...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your NAPPS Nasarawa State Secretariat Building Levy payment has been processed successfully.';
      case 'failed':
        return 'Your payment could not be completed. Please try again.';
      case 'pending':
        return 'Your payment is being processed. Please wait...';
      default:
        return 'Please wait while we verify your payment...';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">{getStatusIcon()}</div>
              <CardTitle className="text-3xl mb-2">{getStatusTitle()}</CardTitle>
              <p className="text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-secondary/10 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg mb-4">Payment Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm font-medium">{paymentDetails.reference}</p>
                  </div>

                  {paymentDetails.receiptNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Receipt Number</p>
                      <p className="font-mono text-sm font-medium">{paymentDetails.receiptNumber}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold">₦{(paymentDetails.amount / 100).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={status === 'success' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
                      {paymentDetails.status}
                    </Badge>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Member Name</p>
                    <p className="font-medium">{paymentDetails.memberName}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Chapter</p>
                    <p className="font-medium">{paymentDetails.chapter}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium">{paymentDetails.schoolName}</p>
                  </div>

                  {paymentDetails.wards && paymentDetails.wards.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Wards</p>
                      <p className="font-medium">{paymentDetails.wards.join(', ')}</p>
                    </div>
                  )}

                  {paymentDetails.paidAt && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                      <p className="font-medium">
                        {new Date(paymentDetails.paidAt).toLocaleString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {status === 'success' && paymentDetails && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleDownloadReceipt}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Receipt...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </>
                  )}
                </Button>
              )}

              {status === 'failed' && (
                <Button size="lg" className="w-full" onClick={() => navigate('/levy-payment')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LevyPaymentVerify;
