import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, Copy, ExternalLink, Loader2 } from 'lucide-react';
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
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !submissionId) {
        setStatus('failed');
        setIsLoading(false);
        return;
      }

      try {
        // If we have a payment reference (from Paystack), verify it
        if (reference) {
          const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);
          
          if (response.ok) {
            const data = await response.json();
            setPaymentDetails(data);
            setStatus(data.status === 'completed' ? 'success' : 'failed');
          } else {
            setStatus('failed');
          }
        } 
        // If bank transfer, check submission status
        else if (submissionId) {
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your payment
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (status) {
      case 'success':
        return (
          <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-500 p-3">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-green-900">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-center text-green-700">
                Your registration has been completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    {paymentDetails?.registrationNumber && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Registration Number:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-green-100 px-2 py-1 rounded text-sm">
                            {paymentDetails.registrationNumber}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(paymentDetails.registrationNumber)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {paymentDetails?.submissionId && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Submission ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-green-100 px-2 py-1 rounded text-sm">
                            {paymentDetails.submissionId}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(paymentDetails.submissionId)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {paymentDetails?.amount && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Amount Paid:</span>
                        <span className="font-semibold">₦{paymentDetails.amount.toLocaleString()}</span>
                      </div>
                    )}
                    {reference && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Reference:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">
                            {reference}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(reference)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-2 text-green-900">What's Next?</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>A confirmation email has been sent to your registered email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Your registration is now under review by NAPPS Nasarawa administration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>You will be notified once your registration is approved</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => navigate('/')} className="flex-1">
                  Go to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1"
                >
                  Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'pending_verification':
        return (
          <Card className="max-w-2xl mx-auto border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-amber-500 p-3">
                  <Clock className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-amber-900">
                Registration Submitted
              </CardTitle>
              <CardDescription className="text-center text-amber-700">
                Your registration is pending payment verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-amber-200">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    {submissionId && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Submission ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-amber-100 px-2 py-1 rounded text-sm">
                            {submissionId}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(submissionId)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {paymentDetails?.amount && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Amount to Pay:</span>
                        <span className="font-semibold">₦{paymentDetails.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold mb-2 text-amber-900">Next Steps for Bank Transfer:</h3>
                <ol className="space-y-2 text-sm text-amber-800 list-decimal ml-4">
                  <li>Make payment to the NAPPS Nasarawa State account</li>
                  <li>Keep your payment receipt/proof</li>
                  <li>Contact NAPPS admin with your <strong>Submission ID</strong> and payment proof</li>
                  <li>Admin will verify and approve your registration</li>
                </ol>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>Important:</strong> Save your Submission ID. You can check your registration status anytime using this ID.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  Go to Home
                </Button>
                <Button
                  onClick={() => navigate(`/registration/status?submissionId=${submissionId}`)}
                  className="flex-1"
                >
                  Check Status Later
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'failed':
      default:
        return (
          <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-red-500 p-3">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-red-900">
                Payment Failed
              </CardTitle>
              <CardDescription className="text-center text-red-700">
                We couldn't verify your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  Your payment could not be processed. This could be due to:
                  <ul className="list-disc ml-4 mt-2">
                    <li>Payment was declined by your bank</li>
                    <li>Insufficient funds</li>
                    <li>Network timeout</li>
                    <li>Invalid payment reference</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900">What You Can Do:</h3>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">1.</span>
                    <span>Try the payment again with a different card or payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">2.</span>
                    <span>Contact your bank if you were charged but payment failed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">3.</span>
                    <span>Contact NAPPS support if the problem persists</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('/register')}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {renderContent()}
      </div>
    </Layout>
  );
}
