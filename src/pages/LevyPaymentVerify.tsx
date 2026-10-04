import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PortalPageShell } from '@/components/portal/PortalPageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle,
  Download,
  FileText,
  Home,
  Loader2,
  RefreshCcw,
  XCircle,
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';
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

    setIsLoading(true);
    setStatus('verifying');

    try {
      const response = await fetch(`${API_BASE_URL}/levy-payments/verify/${reference}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);

        if (data.status === 'success') {
          setStatus('success');
          localStorage.removeItem('levyPaymentFormData');
          toast.success('Payment verified successfully');
        } else if (data.status === 'failed') {
          setStatus('failed');
          toast.error('Payment failed');
        } else {
          setStatus('pending');
          toast.warning('Payment is still being processed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Verification failed:', errorData);
        setStatus('failed');
        toast.error(errorData.message || 'Failed to verify payment');
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

  const getStatusCopy = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Levy payment confirmed',
          description: 'Your NAPPS Nasarawa secretariat building levy has been verified successfully.',
          badge: 'Verified',
          icon: <CheckCircle className="h-20 w-20 text-green-600" />,
        };
      case 'failed':
        return {
          title: 'Verification failed',
          description: 'We could not confirm this levy payment. You can retry verification or start a new payment.',
          badge: 'Needs attention',
          icon: <XCircle className="h-20 w-20 text-red-600" />,
        };
      case 'pending':
        return {
          title: 'Verification pending',
          description: 'The payment is still being processed. Try again shortly if it does not update.',
          badge: 'Processing',
          icon: <Loader2 className="h-20 w-20 animate-spin text-amber-600" />,
        };
      default:
        return {
          title: 'Verifying payment',
          description: 'Please wait while we confirm your levy payment.',
          badge: 'Checking',
          icon: <Loader2 className="h-20 w-20 animate-spin text-primary" />,
        };
    }
  };

  const statusCopy = getStatusCopy();

  return (
    <Layout>
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.45))] py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <PortalPageShell
            eyebrow="Levy Verification"
            title={statusCopy.title}
            description={statusCopy.description}
            badge={statusCopy.badge}
            icon={FileText}
            stats={[
              { label: 'Reference', value: reference || 'Unavailable', helper: 'Returned by the payment gateway.' },
              { label: 'Status', value: status.toUpperCase(), helper: 'Current verification state.' },
            ]}
          >
            <Card className="portal-panel">
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{statusCopy.icon}</div>
                  <CardTitle className="text-3xl">{statusCopy.title}</CardTitle>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">{statusCopy.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="portal-panel-muted flex flex-col items-center justify-center gap-3 border border-primary/10 py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Verifying your payment...</p>
                  </div>
                ) : (
                  <>
                    {paymentDetails && (
                      <div className="portal-panel-muted space-y-4 border border-primary/10 p-6">
                        <h3 className="text-lg font-semibold">Payment details</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
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
                            <p className="text-lg font-bold">
                              NGN {Math.round((paymentDetails.amount || 0) / 100).toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={status === 'success' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
                              {paymentDetails.status}
                            </Badge>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">Member Name</p>
                            <p className="font-medium">{paymentDetails.memberName}</p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">Chapter</p>
                            <p className="font-medium">{paymentDetails.chapter}</p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">School</p>
                            <p className="font-medium">{paymentDetails.schoolName}</p>
                          </div>

                          {paymentDetails.wards?.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="text-sm text-muted-foreground">Wards</p>
                              <p className="font-medium">{paymentDetails.wards.join(', ')}</p>
                            </div>
                          )}

                          {paymentDetails.paidAt && (
                            <div className="sm:col-span-2">
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
                        <Button size="lg" className="w-full" onClick={handleDownloadReceipt} disabled={downloading}>
                          {downloading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating receipt...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download receipt
                            </>
                          )}
                        </Button>
                      )}

                      {(status === 'failed' || status === 'pending') && (
                        <Button size="lg" className="w-full" onClick={verifyPayment} disabled={isLoading}>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Retry verification
                        </Button>
                      )}

                      {status === 'failed' && (
                        <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/levy-payment')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Start new payment
                        </Button>
                      )}

                      <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                        <Home className="mr-2 h-4 w-4" />
                        Back to dashboard
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </PortalPageShell>
        </div>
      </div>
    </Layout>
  );
};

export default LevyPaymentVerify;
