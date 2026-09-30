import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

export interface FidelityVirtualAccountData {
  accountNumber: string;
  accountName: string;
  bankName?: string;
  amount: number;
  expiryTime?: string;
  reference: string;
  status?: string;
}

interface FidelityVirtualAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  virtualAccount: FidelityVirtualAccountData | null;
  purposeTitle?: string;
}

export const FidelityVirtualAccountModal: React.FC<FidelityVirtualAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  virtualAccount,
  purposeTitle = 'NAPPS Dues & Registration Fee',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 60 minutes in seconds
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  // Calculate remaining time
  useEffect(() => {
    if (!virtualAccount) return;

    if (virtualAccount.expiryTime) {
      const expiry = new Date(virtualAccount.expiryTime).getTime();
      const now = Date.now();
      const diffInSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 3600);
    } else {
      setTimeLeft(3600);
    }
  }, [virtualAccount]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentConfirmed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentConfirmed, timeLeft]);

  // Check payment status from backend
  const checkPaymentStatus = async (manual = false) => {
    if (!virtualAccount?.reference || paymentConfirmed) return;

    if (manual) setIsVerifying(true);

    try {
      // Query fidelity status endpoint
      const response = await fetch(
        `${API_BASE_URL}/payments/fidelity/status/${encodeURIComponent(virtualAccount.reference)}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isCleared || data.status === 'success' || data.status === 'completed') {
          setPaymentConfirmed(true);
          toast.success('Payment Received Successfully!', {
            description: 'Your payment has been verified by Fidelity Bank.',
          });
          setTimeout(() => {
            onSuccess(data);
          }, 1800);
          return;
        }
      }

      if (manual) {
        toast.info('Payment still pending', {
          description:
            'We have not yet received confirmation from your bank. Transferred funds usually land within 30-60 seconds.',
        });
      }
    } catch (error) {
      if (manual) {
        console.error('Error verifying payment:', error);
        toast.error('Unable to verify at the moment. Polling will continue in the background.');
      }
    } finally {
      if (manual) setIsVerifying(false);
    }
  };

  // Background polling every 5 seconds
  useEffect(() => {
    if (!isOpen || paymentConfirmed || !virtualAccount?.reference) return;

    const interval = setInterval(() => {
      checkPaymentStatus(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, paymentConfirmed, virtualAccount?.reference]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!virtualAccount) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-2 border-primary/20 shadow-2xl">
        {/* Header with Fidelity Green / Brand Theme */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold tracking-wide uppercase text-xs sm:text-sm text-emerald-100">
                Fidelity Bank Dynamic Transfer
              </span>
            </div>
            <Badge className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white border-0 text-xs">
              Instant Settlement
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white mt-1">
            ₦{virtualAccount.amount.toLocaleString()}
          </DialogTitle>
          <DialogDescription className="text-emerald-100/90 text-xs sm:text-sm mt-1">
            {purposeTitle} — Transfer into the dynamic account below
          </DialogDescription>

          {/* Expiry Bar */}
          <div className="mt-3 flex items-center justify-between text-xs bg-black/20 rounded-md px-3 py-1.5 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <Clock className="w-3.5 h-3.5" />
              Account expires in:
            </span>
            <span
              className={`font-mono font-bold ${
                timeLeft < 300 ? 'text-amber-300 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {paymentConfirmed ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your transfer of ₦{virtualAccount.amount.toLocaleString()} has been confirmed.
                  Updating your membership and issuing clearance...
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            </div>
          ) : (
            <>
              {/* Account Number Box */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-xl p-4 relative group">
                <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider block mb-1">
                  Bank Account Number
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 tracking-wider">
                    {virtualAccount.accountNumber}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-sm"
                    onClick={() =>
                      copyToClipboard(virtualAccount.accountNumber, 'Account Number')
                    }
                  >
                    {copiedField === 'Account Number' ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bank & Beneficiary Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 border rounded-lg p-3">
                  <span className="text-xs text-muted-foreground block">Bank Name</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-gray-800">
                      {virtualAccount.bankName || 'Fidelity Bank'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          virtualAccount.bankName || 'Fidelity Bank',
                          'Bank Name',
                        )
                      }
                      className="text-muted-foreground hover:text-gray-800 p-1"
                      title="Copy Bank Name"
                    >
                      {copiedField === 'Bank Name' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <span className="text-xs text-muted-foreground block">Exact Amount</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-emerald-700">
                      ₦{virtualAccount.amount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(String(virtualAccount.amount), 'Amount')
                      }
                      className="text-muted-foreground hover:text-gray-800 p-1"
                      title="Copy Amount"
                    >
                      {copiedField === 'Amount' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-3">
                <span className="text-xs text-muted-foreground block">Beneficiary Name</span>
                <span className="font-semibold text-gray-800 text-xs sm:text-sm mt-0.5 block truncate">
                  {virtualAccount.accountName || 'NAPPS Nasarawa State Chapter'}
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Transfer Instructions:
                </div>
                <ol className="list-decimal ml-4 space-y-0.5 text-blue-800">
                  <li>Open your bank mobile app or USSD banking.</li>
                  <li>
                    Select <strong>Fidelity Bank</strong> as the destination bank.
                  </li>
                  <li>
                    Transfer <strong>exact amount (₦{virtualAccount.amount.toLocaleString()})</strong> to the account above.
                  </li>
                  <li>Payment will confirm automatically once transfer completes.</li>
                </ol>
              </div>

              {/* Live Polling Status */}
              <div className="flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Listening for payment confirmation from bank...</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5"
                  onClick={() => checkPaymentStatus(true)}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Transfer...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" /> I Have Made This Transfer
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground hover:text-gray-700"
                  onClick={onClose}
                >
                  Cancel or Choose Another Payment Method
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
