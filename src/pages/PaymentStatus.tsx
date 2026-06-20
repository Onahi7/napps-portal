import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PortalPageShell } from '@/components/portal/PortalPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, Copy, ExternalLink, Loader2, Printer, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type PaymentStatus = 'pending' | 'verifying' | 'success' | 'failed' | 'pending_verification';

export default function PaymentStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
  const reference = searchParams.get('reference');
  const submissionId = searchParams.get('submissionId');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !submissionId) {
        setStatus('failed');
        setIsLoading(false);
        return;
      }

      try {
        if (reference) {
          const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);
          if (response.ok) {
            const data = await response.json();
            setPaymentDetails(data);
            setStatus(data.status === 'completed' ? 'success' : 'failed');
          } else {
            setStatus('failed');
          }
        } else if (submissionId) {
          const response = await fetch(`${API_BASE_URL}/proprietors/registration/${submissionId}`);
          if (response.ok) {
            const data = await response.json();
            setPaymentDetails(data);
            setStatus('pending_verification');
          } else {
            setStatus('failed');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference, submissionId, API_BASE_URL]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const titleByStatus: Record<PaymentStatus, string> = {
    pending: 'Payment pending',
    verifying: 'Verifying payment',
    success: 'Payment successful',
    failed: 'Payment failed',
    pending_verification: 'Registration submitted',
  };

  const descriptionByStatus: Record<PaymentStatus, string> = {
    pending: 'Your payment is still pending confirmation.',
    verifying: 'Please wait while we confirm your registration payment.',
    success: 'Your registration payment has been completed successfully.',
    failed: 'We could not verify this payment.',
    pending_verification: 'Your registration is waiting for bank transfer verification.',
  };

  const renderLoadingCard = () => (
    <Card className="portal-panel mx-auto max-w-2xl">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
        <h2 className="mb-2 text-xl font-semibold">Verifying payment...</h2>
        <p className="text-center text-muted-foreground">Please wait while we confirm your payment.</p>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="portal-panel mx-auto max-w-2xl border-green-200 bg-green-50/70">
      <CardHeader>
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-green-500 p-3">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl text-green-900">Payment Successful</CardTitle>
        <CardDescription className="text-center text-green-700">
          Your registration has been completed successfully.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-white">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              {paymentDetails?.registrationNumber && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Registration Number</span>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-green-100 px-2 py-1 text-sm">{paymentDetails.registrationNumber}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(paymentDetails.registrationNumber)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {paymentDetails?.submissionId && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Submission ID</span>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-green-100 px-2 py-1 text-sm">{paymentDetails.submissionId}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(paymentDetails.submissionId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {paymentDetails?.amount && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Amount Paid</span>
                  <span className="font-semibold">NGN {paymentDetails.amount.toLocaleString()}</span>
                </div>
              )}
              {reference && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Payment Reference</span>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-green-100 px-2 py-1 text-xs">{reference}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(reference)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <div className="portal-panel-muted border border-green-200 p-4">
          <h3 className="mb-2 font-semibold text-green-900">What's next</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>A confirmation email has been sent to your registered email address.</li>
            <li>Your registration is now under review by NAPPS Nasarawa administration.</li>
            <li>You will be notified once your registration is approved.</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => navigate('/')} className="flex-1">
            Go to home
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPendingVerification = () => (
    <Card className="portal-panel mx-auto max-w-2xl border-amber-200 bg-amber-50/70">
      <CardHeader>
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-amber-500 p-3">
            <Clock className="h-12 w-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl text-amber-900">Registration Submitted</CardTitle>
        <CardDescription className="text-center text-amber-700">
          Your registration is pending payment verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-white">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              {submissionId && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Submission ID</span>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-amber-100 px-2 py-1 text-sm">{submissionId}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(submissionId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {paymentDetails?.amount && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Amount to Pay</span>
                  <span className="font-semibold">NGN {paymentDetails.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <div className="portal-panel-muted border border-amber-200 p-4">
          <h3 className="mb-2 font-semibold text-amber-900">Next steps for bank transfer</h3>
          <ol className="ml-4 list-decimal space-y-2 text-sm text-amber-800">
            <li>Make payment to the NAPPS Nasarawa State account.</li>
            <li>Keep your payment receipt or proof of transfer.</li>
            <li>Contact NAPPS admin with your submission ID and payment proof.</li>
            <li>Admin will verify and approve your registration.</li>
          </ol>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Save your submission ID. You can check your registration status anytime using this ID.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            Go to home
          </Button>
          <Button onClick={() => navigate(`/registration/status?submissionId=${submissionId}`)} className="flex-1">
            Check status later
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFailure = () => (
    <Card className="portal-panel mx-auto max-w-2xl border-red-200 bg-red-50/70">
      <CardHeader>
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-red-500 p-3">
            <XCircle className="h-12 w-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl text-red-900">Payment Failed</CardTitle>
        <CardDescription className="text-center text-red-700">
          We couldn't verify your payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-white">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">
            Your payment could not be processed. This may be due to a declined card, insufficient funds, a timeout, or an invalid payment reference.
          </AlertDescription>
        </Alert>

        <div className="portal-panel-muted border border-red-200 p-4">
          <h3 className="mb-2 font-semibold text-red-900">What you can do</h3>
          <ul className="space-y-2 text-sm text-red-800">
            <li>Try the payment again with a different card or payment method.</li>
            <li>Contact your bank if you were charged but payment failed.</li>
            <li>Reach out to NAPPS support if the problem persists.</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => navigate('/register')} className="flex-1">
            Try again
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            Go to home
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.45))] py-8">
        <div className="container mx-auto px-4">
          <PortalPageShell
            eyebrow="Registration Payment"
            title={titleByStatus[status]}
            description={descriptionByStatus[status]}
            badge={reference ? 'Online payment' : submissionId ? 'Bank transfer' : 'Unknown'}
            icon={status === 'success' ? CheckCircle2 : status === 'pending_verification' ? Clock : XCircle}
            stats={[
              { label: 'Reference', value: reference || 'Not provided', helper: 'Gateway payment reference.' },
              { label: 'Submission', value: submissionId || 'Not provided', helper: 'Used to resume or check later.' },
            ]}
          >
            {isLoading
              ? renderLoadingCard()
              : status === 'success'
                ? renderSuccess()
                : status === 'pending_verification'
                  ? renderPendingVerification()
                  : renderFailure()}
          </PortalPageShell>
        </div>
      </div>
    </Layout>
  );
}
