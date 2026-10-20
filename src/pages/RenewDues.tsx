import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = "https://napps-backend.dicksonhardy7.workers.dev/api/v1";

interface FeeItem {
  code?: string;
  name: string;
  amount: number;
}

interface RenewalStatus {
  sessionId: string;
  alreadyPaid: boolean;
  amount: number;
  fees: FeeItem[];
  lastRenewedSession?: string | null;
  proprietor: {
    id: string;
    fullName: string;
    registrationNumber?: string;
    email?: string;
    phone?: string;
    lga?: string;
    schoolName?: string;
    chapter?: string;
  };
  duesPaymentHistory?: Array<{
    sessionId: string;
    amountPaid: number;
    paymentDate?: string;
    receiptNumber?: string;
  }>;
}

const RenewDues = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<RenewalStatus | null>(null);

  const lookup = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!value) {
      toast.error("Enter your email, phone or registration number");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/proprietors/renewal/status/${encodeURIComponent(value)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not find your registration");
      setStatus(data);
      setSearchParams({ identifier: value }, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not find your registration");
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  const checkStatus = (e?: React.FormEvent) => {
    e?.preventDefault();
    void lookup(identifier);
  };

  useEffect(() => {
    const seed = searchParams.get("identifier");
    if (seed) {
      setIdentifier(seed);
      void lookup(seed);
    }
  }, [lookup]);

  const payRenewal = async () => {
    if (!status) return;
    setPaying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/proprietors/renewal/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), sessionId: status.sessionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not start renewal payment");
      const reference = data.reference || data.payment?.reference;
      if (!reference) throw new Error("Payment initialization failed");
      toast.success("Redirecting to secure payment...");
      navigate(`/payment/simulate?reference=${reference}`);
    } catch (err: any) {
      toast.error(err.message || "Could not start renewal payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Renew Annual Dues</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Already registered? Pay your dues for the new session without registering again.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find your registration</CardTitle>
            <CardDescription>
              Use your email, phone number or NAPPS registration number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={checkStatus} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="identifier" className="sr-only">
                  Email, phone or registration number
                </Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. NAPPS20260009 or you@example.com"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={loading} className="sm:w-auto">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Check status
              </Button>
            </form>
          </CardContent>
        </Card>

        {status && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{status.proprietor.fullName}</CardTitle>
                <CardDescription>
                  {status.proprietor.registrationNumber || "Registration"} ·{" "}
                  {status.proprietor.schoolName || "School not recorded"}
                </CardDescription>
              </div>
              <Badge variant={status.alreadyPaid ? "default" : "secondary"}>
                {status.sessionId}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Chapter</p>
                  <p className="font-medium">{status.proprietor.chapter || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LGA</p>
                  <p className="font-medium">{status.proprietor.lga || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{status.proprietor.email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{status.proprietor.phone || "—"}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">Dues breakdown — {status.sessionId}</p>
                {status.fees.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active fees configured.</p>
                )}
                {status.fees.map((fee, i) => (
                  <div key={`${fee.name}-${i}`} className="flex justify-between text-sm">
                    <span>{fee.name}</span>
                    <span>₦{fee.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>₦{status.amount.toLocaleString()}</span>
                </div>
              </div>

              {status.alreadyPaid ? (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    Your dues for {status.sessionId} have been paid. Thank you.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={payRenewal} disabled={paying} className="w-full" size="lg">
                  {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Pay ₦{status.amount.toLocaleString()} for {status.sessionId}
                </Button>
              )}

              {status.lastRenewedSession && (
                <p className="text-xs text-muted-foreground">
                  Last renewed session: {status.lastRenewedSession}
                </p>
              )}

              {status.duesPaymentHistory && status.duesPaymentHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment history</p>
                  {status.duesPaymentHistory
                    .slice()
                    .reverse()
                    .map((entry, i) => (
                      <div
                        key={`${entry.sessionId}-${i}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{entry.sessionId}</span>
                        <span>₦{Number(entry.amountPaid || 0).toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs">
                          {entry.receiptNumber || ""}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            New proprietor? <a className="underline font-medium" href="/register">Register here</a>{" "}
            instead. Renewals keep your existing registration number.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default RenewDues;
