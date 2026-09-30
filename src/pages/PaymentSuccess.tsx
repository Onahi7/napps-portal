import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

interface PaymentData {
  status: string;
  reference: string;
  submissionId?: string;
  registrationNumber?: string;
  amount: number;
  paidAt?: string;
  paymentType?: string;
  proprietor?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
  };
  school?: {
    schoolName: string;
    lga?: string;
  };
}

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const receiptRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`);
        
        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        } else {
          toast.error('Failed to verify payment');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !paymentData) {
      toast.error('Unable to generate receipt');
      return;
    }

    try {
      setDownloading(true);
      toast.info('Generating receipt...');

      // Generate canvas from receipt element
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `NAPPS-Receipt-${paymentData.reference}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Receipt downloaded successfully!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-background to-green-50/50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50/50 py-8 px-4">
      {/* Hidden Receipt for Download */}
      <div ref={receiptRef} className="fixed -left-[9999px] w-[800px] bg-white p-12">
        <div className="border-4 border-green-600 p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8 border-b-2 border-green-600 pb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-green-700 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                <div className="text-center">
                  <div className="text-2xl">NAPPS</div>
                  <div className="text-xs">NIGERIA</div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              NASARAWA STATE BRANCH
            </h1>
            <h2 className="text-xl font-semibold text-gray-700">
              2025/2026 NAPPS NASARAWA DUES
            </h2>
            <p className="text-lg text-gray-600 mt-2">PAYMENT RECEIPT</p>
          </div>

          {/* Receipt Content */}
          {paymentData && (
            <div className="space-y-6">
              {/* Payment Status */}
              <div className="text-center bg-green-100 py-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">PAID IN FULL</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  ₦{paymentData.amount.toLocaleString()}
                </p>
              </div>

              {/* Proprietor Details */}
              {paymentData.proprietor && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg border-b pb-2">PROPRIETOR DETAILS</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Full Name:</p>
                      <p className="font-semibold">
                        {paymentData.proprietor.firstName} {paymentData.proprietor.middleName || ''} {paymentData.proprietor.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-semibold">{paymentData.proprietor.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-semibold">{paymentData.proprietor.phone}</p>
                    </div>
                    {paymentData.registrationNumber && (
                      <div>
                        <p className="text-gray-600">Registration No:</p>
                        <p className="font-semibold">{paymentData.registrationNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* School Details */}
              {paymentData.school && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg border-b pb-2">SCHOOL DETAILS</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">School Name:</p>
                      <p className="font-semibold">{paymentData.school.schoolName}</p>
                    </div>
                    {paymentData.school.lga && (
                      <div>
                        <p className="text-gray-600">LGA:</p>
                        <p className="font-semibold">{paymentData.school.lga}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg border-b pb-2">TRANSACTION DETAILS</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Reference Number:</p>
                    <p className="font-mono font-semibold">{paymentData.reference}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Date:</p>
                    <p className="font-semibold">
                      {new Date(paymentData.paidAt || Date.now()).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Type:</p>
                    <p className="font-semibold capitalize">
                      {paymentData.paymentType?.replace('_', ' ') || 'Registration Fee'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-semibold text-green-600 uppercase">{paymentData.status}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
                <p className="mb-2">
                  This is an official receipt from the Nigeria Association of Proprietors of Private Schools (NAPPS)
                </p>
                <p className="font-semibold">Nasarawa State Branch</p>
                <p className="mt-4 text-xs">
                  Generated on {new Date().toLocaleString('en-NG')}
                </p>
                <p className="mt-2 text-xs">
                  For inquiries, contact: info@nappsnasarawa.org | Tel: +234 XXX XXX XXXX
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-center">
            Your registration fee has been processed successfully
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Your transaction information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentData && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₦{paymentData.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold text-green-600 capitalize">
                      {paymentData.status || 'Success'}
                    </p>
                  </div>
                </div>

                {/* Proprietor Info */}
                {paymentData.proprietor && (
                  <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Proprietor Information</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Name: </span>
                        <span className="font-medium">
                          {paymentData.proprietor.firstName} {paymentData.proprietor.middleName || ''} {paymentData.proprietor.lastName}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email: </span>
                        <span className="font-medium">{paymentData.proprietor.email}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone: </span>
                        <span className="font-medium">{paymentData.proprietor.phone}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* School Info */}
                {paymentData.school && (
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">School Information</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">School: </span>
                        <span className="font-medium">{paymentData.school.schoolName}</span>
                      </p>
                      {paymentData.school.lga && (
                        <p>
                          <span className="text-muted-foreground">LGA: </span>
                          <span className="font-medium">{paymentData.school.lga}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reference Number</span>
                    <span className="font-mono text-sm font-semibold">{paymentData.reference}</span>
                  </div>

                  {paymentData.submissionId && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Submission ID</span>
                      <span className="font-mono text-sm">{paymentData.submissionId}</span>
                    </div>
                  )}

                  {paymentData.registrationNumber && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Registration Number</span>
                      <span className="font-mono text-sm">{paymentData.registrationNumber}</span>
                    </div>
                  )}

                  {paymentData.paidAt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Payment Date</span>
                      <span className="text-sm">
                        {new Date(paymentData.paidAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Session</span>
                    <span className="text-sm font-semibold">2025/2026</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Payment Type</span>
                    <span className="text-sm capitalize">
                      {paymentData.paymentType?.replace('_', ' ') || 'NAPPS Nasarawa Data Capturing'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex-1"
            size="lg"
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </>
            )}
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
              📋 What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>✅ Your registration is now complete</li>
              <li>✅ You will receive a confirmation email shortly</li>
              <li>✅ Keep your reference number for future inquiries</li>
              <li>✅ You can now access the proprietor dashboard</li>
            </ul>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:support@napps.ng" className="text-primary hover:underline">
              support@napps.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
