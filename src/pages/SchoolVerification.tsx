import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Building2, 
  User, 
  MapPin, 
  Award, 
  CreditCard, 
  Printer, 
  ArrowRight,
  Loader2,
  FileCheck,
  FileText
} from "lucide-react";
import nappsLogo from "@/assets/napps-logo.png";
import { OfficialReceiptModal } from "@/components/dues/OfficialReceiptModal";
import { toast } from "sonner";

export default function SchoolVerification() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('receipt') || searchParams.get('nnsuce') || searchParams.get('regNo');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';

  const [searchTerm, setSearchTerm] = useState(queryId || "");
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (queryId) {
      handleVerify(queryId);
    }
  }, [queryId]);

  const handleVerify = async (identifierToVerify?: string) => {
    const target = (identifierToVerify || searchTerm).trim();
    if (!target) {
      toast.error("Please enter a Membership ID, Receipt Number, or School Name");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`${API_BASE_URL}/proprietors/verify-member/${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setVerifiedData(data);
        toast.success("Official NAPPS credentials verified successfully!");
      } else {
        setVerifiedData(null);
        toast.error("No accredited NAPPS record found for this identifier.");
      }
    } catch (err: any) {
      setVerifiedData(null);
      toast.error("Verification server error: " + (err.message || "Failed to reach registry database."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Public Verification Gateway
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verify NAPPS Membership &amp; Credentials
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Scan QR codes on official NAPPS ID cards, exam sheets, or receipts, or enter a membership number below to confirm accreditation and dues clearance.
            </p>
          </div>

          {/* Search Box */}
          <Card className="border-slate-200 shadow-md overflow-hidden bg-white">
            <CardContent className="p-4 sm:p-6">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleVerify(); }} 
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Enter Membership ID (e.g. NAPPS/NAS/2026/LAF/0142), Receipt No, or School Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-sm bg-slate-50 border-slate-300 focus-visible:ring-emerald-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Verify Now
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verifiedData ? (
            <Card className="border-2 border-emerald-500 shadow-xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <img src={nappsLogo} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-white shrink-0" />
                  <div>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs mb-1">
                      OFFICIAL ACCREDITATION CERTIFIED
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-black">{verifiedData.schoolName}</h2>
                    <p className="text-xs text-emerald-100">{verifiedData.schoolAddress}</p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <Badge className="bg-amber-400 text-slate-950 font-bold text-xs uppercase px-3 py-1">
                    DUES CLEARED 2025/2026
                  </Badge>
                  <p className="text-[11px] text-emerald-100 font-mono mt-1">Status: Active Member</p>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-medium">Membership Number</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm mt-0.5 block">{verifiedData.membershipId}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-medium">Accredited Proprietor</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{verifiedData.proprietorName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-medium">LGA Chapter Affiliation</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{verifiedData.lga} ({verifiedData.chapter})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 block font-medium">NNSUCE Examination Status</span>
                    <span className="font-bold text-emerald-950 text-sm mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Accredited Center
                    </span>
                  </div>
                </div>

                {/* Audit & Verification Sign-off */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="font-bold text-slate-800 block">Verified under the Constitution of NAPPS Nigeria</span>
                    <span className="text-slate-500">Issued by State Secretariat • Valid through 31st December, 2026</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setReceiptModalOpen(true)}
                      className="text-xs h-9 border-slate-300"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                      View Official Receipt
                    </Button>
                    <Link to={`/validation-form?id=${encodeURIComponent(verifiedData.membershipId)}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-9 border-amber-400 text-amber-950 bg-amber-50 hover:bg-amber-100 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Validation Form (A4)
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={() => window.print()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5" />
                      Print Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : hasSearched && !loading ? (
            <Card className="border-red-200 bg-red-50/50 shadow-sm text-center p-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-red-950">No Verified Member Record Found</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto mt-1 mb-4">
                We could not find an accredited member matching &quot;{searchTerm}&quot;. Please check the number or register your school to obtain an official membership credential.
              </p>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
                  Register Your School Now
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {verifiedData && (
        <OfficialReceiptModal
          open={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
          data={{
            payerName: verifiedData.proprietorName,
            schoolName: verifiedData.schoolName,
            lga: verifiedData.lga,
            chapter: verifiedData.chapter,
            membershipId: verifiedData.membershipId,
            amountPaid: 14500,
            academicSession: verifiedData.validSession
          }}
        />
      )}
    </Layout>
  );
}
