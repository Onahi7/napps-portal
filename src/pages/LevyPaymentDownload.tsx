import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Download, 
  Search, 
  Loader2, 
  FileText, 
  Mail, 
  Phone,
  Home
} from 'lucide-react';
import { generateLevyReceipt } from '@/utils/receiptGenerator';

const LevyPaymentDownload = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const handleSearch = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setPayments([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/levy-payments/by-identifier/${encodeURIComponent(identifier)}`
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data);

        if (data.length === 0) {
          toast.info('No payments found', {
            description: 'No successful payments found for this email/phone number.',
          });
        } else {
          toast.success(`Found ${data.length} payment(s)`);
        }
      } else {
        const error = await response.json();
        toast.error('Search failed', {
          description: error.message || 'No payments found for this identifier',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('An error occurred', {
        description: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (payment: any) => {
    setDownloading(payment.reference);
    try {
      await generateLevyReceipt(payment);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/levy-payment')}>
            ← Back to Levy Payment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Download className="w-6 h-6" />
              Download Payment Receipt
            </CardTitle>
            <CardDescription>
              Enter your email address or phone number to find and download your payment receipt
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <div className="relative">
                  {isEmail(identifier) ? (
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    id="identifier"
                    placeholder="Enter email or phone number"
                    className="pl-10"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Payments
                  </>
                )}
              </Button>
            </div>

            {payments.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Payments</h3>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <Card key={payment.reference} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div>
                              <p className="text-sm text-muted-foreground">Receipt Number</p>
                              <p className="font-mono font-medium">{payment.receiptNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Reference</p>
                              <p className="font-mono text-sm">{payment.reference}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Chapter</p>
                                <p className="font-medium">{payment.chapter}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-bold">₦{(payment.amount / 100).toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Payment Date</p>
                              <p className="text-sm">
                                {new Date(payment.paidAt).toLocaleDateString('en-NG', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleDownloadReceipt(payment)}
                            disabled={downloading === payment.reference}
                          >
                            {downloading === payment.reference ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Download Receipt
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
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

export default LevyPaymentDownload;
