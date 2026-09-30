import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  CreditCard, 
  CheckCircle, 
  Edit, 
  School, 
  User, 
  Calendar, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Users,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { EditRecordDialog } from "./EditRecordDialog";
import { Link } from "react-router-dom";
import { FidelityVirtualAccountModal, FidelityVirtualAccountData } from "./payment/FidelityVirtualAccountModal";


export interface ProprietorRecord {
  name: string;
  sex: 'Male' | 'Female';
  email: string;
  schoolName: string;
  schoolName2?: string;
  address: string;
  phone: string;
  yearOfEstablishment: string;
  yearOfApproval: string;
  typeOfSchool: string;
  categoryOfSchool: string;
  ownership: string;
  registrationStatus: string;
  approvalStatus: string;
  gpsLongitude?: string;
  gpsLatitude?: string;
  nappsRegistered: string;
  participationHistory: string;
  pupilsPresented2023: number;
  awards?: string;
  positionHeld?: string;
  clearingStatus: string;
  paymentToBeMade: string;
  paymentMethod: string;
  submissionId: string;
  submissionDate: string;
  submissionStatus: string;
  chapters?: string[];
  id?: string;
  lga?: string;
  totalEnrollment?: number;
  enrollment: Record<string, number>;
  amountDue: number;
}

type SearchMode = 'all' | 'school' | 'phone' | 'name' | 'regNo';

export const RecordLookup = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProprietorRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ProprietorRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fidelityModalOpen, setFidelityModalOpen] = useState(false);
  const [virtualAccountData, setVirtualAccountData] = useState<FidelityVirtualAccountData | null>(null);


  const normalizePhone = (phoneStr: string) => {
    return phoneStr.replace(/\D/g, '');
  };

  const mapBackendDataToRecord = (data: any): ProprietorRecord => {
    const rawParticipation = data.participationHistory;
    const participationText = Array.isArray(rawParticipation)
      ? rawParticipation.join(' | ')
      : typeof rawParticipation === 'string'
        ? rawParticipation
        : '';

    return {
      name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim() || 'N/A',
      sex: data.sex || 'Male',
      email: data.email || 'N/A',
      schoolName: data.schoolName || data.school?.schoolName || 'N/A',
      schoolName2: data.schoolName2 || data.school?.schoolName2 || '',
      address: data.schoolAddress || data.address || data.school?.address || 'N/A',
      phone: data.phone || 'N/A',
      yearOfEstablishment: (data.yearOfEstablishment || data.school?.yearOfEstablishment)?.toString() || 'N/A',
      yearOfApproval: (data.yearOfApproval || data.school?.yearOfApproval)?.toString() || 'N/A',
      typeOfSchool: data.typeOfSchool || data.school?.typeOfSchool || 'N/A',
      categoryOfSchool: data.categoryOfSchool || data.school?.categoryOfSchool || 'Private',
      ownership: data.ownership || data.school?.ownership || 'N/A',
      registrationStatus: data.registrationStatus || 'Registered',
      approvalStatus: data.approvalStatus || 'pending',
      gpsLongitude: data.gpsLongitude?.toString(),
      gpsLatitude: data.gpsLatitude?.toString(),
      nappsRegistered: data.nappsRegistered || 'Registered',
      participationHistory: participationText,
      pupilsPresented2023: data.pupilsPresentedLastExam || 0,
      awards: data.awards,
      positionHeld: data.positionHeld,
      clearingStatus: data.clearingStatus || 'pending',
      paymentToBeMade: data.paymentMethod || 'ANNUAL DUES',
      paymentMethod: data.paymentMethod || 'Online',
      submissionId: data.submissionId || data._id,
      submissionDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : 'N/A',
      submissionStatus: data.submissionStatus || 'submitted',
      id: data._id,
      lga: data.lga || data.school?.lga || '',
      chapters: data.chapters || (data.chapter ? [data.chapter] : []),
      totalEnrollment: data.totalEnrollment || data.school?.totalEnrollment || 0,
      enrollment: data.enrollment || data.school?.enrollment || {},
      amountDue: data.totalAmountDue || 0,
    };
  };

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      toast.error("Please enter a search term (school name, phone, email, or proprietor name)");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setLastSearchedTerm(trimmed);
    setSelectedRecord(null);

    try {
      let queryParam = '';

      if (searchMode === 'phone') {
        const clean = normalizePhone(trimmed);
        queryParam = `phone=${encodeURIComponent(clean || trimmed)}`;
      } else if (searchMode === 'school') {
        queryParam = `schoolName=${encodeURIComponent(trimmed)}`;
      } else if (searchMode === 'name') {
        if (trimmed.includes(' ')) {
          const parts = trimmed.split(/\s+/).filter(Boolean);
          queryParam = `firstName=${encodeURIComponent(parts[0])}&lastName=${encodeURIComponent(parts.slice(1).join(' '))}`;
        } else {
          queryParam = `search=${encodeURIComponent(trimmed)}`;
        }
      } else if (searchMode === 'regNo') {
        queryParam = `registrationNumber=${encodeURIComponent(trimmed)}`;
      } else {
        // Smart mode: Check for obvious patterns, otherwise send unified search
        if (trimmed.includes('@')) {
          queryParam = `email=${encodeURIComponent(trimmed)}`;
        } else {
          // Unified search across all fields
          queryParam = `search=${encodeURIComponent(trimmed)}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/proprietors/lookup?${queryParam}`);

      if (!response.ok) {
        // Fallback for older backends: try searching by schoolName or phone if search parameter failed
        const fallbackQuery = trimmed.includes('@') 
          ? `email=${encodeURIComponent(trimmed)}`
          : /^[\d\s\-()+]+$/.test(trimmed)
            ? `phone=${encodeURIComponent(normalizePhone(trimmed))}`
            : `schoolName=${encodeURIComponent(trimmed)}`;

        const fallbackResponse = await fetch(`${API_BASE_URL}/proprietors/lookup?${fallbackQuery}`);
        if (!fallbackResponse.ok) {
          throw new Error('Lookup failed');
        }
        const fallbackData = await fallbackResponse.json();
        processSearchResults(fallbackData);
        return;
      }

      const data = await response.json();
      processSearchResults(data);

    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSelectedRecord(null);
      toast.error("Search request failed. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const processSearchResults = (data: any[]) => {
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapBackendDataToRecord);
      setResults(mapped);

      if (mapped.length === 1) {
        setSelectedRecord(mapped[0]);
        toast.success("School record found!");
      } else {
        setSelectedRecord(null);
        toast.success(`Found ${mapped.length} matching records. Please select your school.`);
      }
    } else {
      setResults([]);
      setSelectedRecord(null);
      toast.info("No record found matching your query.");
    }
  };

  const handlePayment = async (preferredGateway: 'fidelity' | 'paystack' = 'fidelity') => {
    if (!selectedRecord) {
      toast.error("No record selected");
      return;
    }

    if (selectedRecord.clearingStatus.toLowerCase() === 'cleared') {
      toast.info("Your dues have already been cleared for this session.");
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/initiate-lookup-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedRecord.id || selectedRecord.submissionId,
          email: selectedRecord.email,
          gateway: preferredGateway,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment initialization failed');
      }

      const result = await response.json();

      if (result.gateway === 'fidelity' && result.virtualAccount) {
        setVirtualAccountData(result.virtualAccount);
        setFidelityModalOpen(true);
      } else {
        const paymentUrl = result.paymentUrl || result.payment?.paymentUrl;
        if (paymentUrl) {
          toast.success('Redirecting to payment gateway...', { duration: 2000 });
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 500);
        } else {
          throw new Error('No payment URL or virtual account returned');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || "Unable to initiate payment. Please verify network or contact your chapter.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFidelityPaymentSuccess = () => {
    setFidelityModalOpen(false);
    if (selectedRecord) {
      setSelectedRecord({
        ...selectedRecord,
        clearingStatus: 'cleared',
        amountDue: 0,
      });
    }
    toast.success('Clearance Confirmed!', {
      description: 'Your institution has been formally cleared via Fidelity Bank transfer.',
    });
    handleSearch();
  };


  const handleEditSuccess = () => {
    handleSearch();
  };

  const isDuesCleared = (status?: string) => {
    const s = (status || '').toLowerCase();
    return s === 'cleared' || s === 'paid' || s === 'active';
  };

  return (
    <section id="lookup" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Title & Description */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            Official Member Verification
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find & Verify Your School Record
          </h2>
          <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
            Search the official NAPPS registry using your school name, phone number, email, or proprietor name to check dues and update your details.
          </p>
        </div>

        {/* Search Control Card */}
        <Card className="shadow-lg border-slate-200 mb-8 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-4">
            {/* Search Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Search By:</span>
              {[
                { id: 'all', label: '🌟 Smart All-in-One' },
                { id: 'school', label: '🏫 School Name' },
                { id: 'phone', label: '📱 Phone Number' },
                { id: 'name', label: '👤 Proprietor Name' },
                { id: 'regNo', label: '🆔 NAPPS Reg ID' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchMode(tab.id as SearchMode)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                    searchMode === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={
                    searchMode === 'phone'
                      ? 'e.g. 08012345678 or +2348012345678'
                      : searchMode === 'school'
                      ? 'e.g. Baptist Model Academy, Sunnah Nursery...'
                      : searchMode === 'name'
                      ? 'e.g. Hussain Muhammad, Dr. Bello...'
                      : searchMode === 'regNo'
                      ? 'e.g. NAPPS/NAS/2024/001'
                      : 'Search by School Name, Phone, Email, or Proprietor Name...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-11 h-12 text-base border-slate-300 focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Record
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS SECTION */}
        {hasSearched && !loading && (
          <div>
            {/* Multi-result candidate selection list */}
            {results.length > 1 && !selectedRecord && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    Search Results ({results.length} institutions found)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Click on your school to view details & dues
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {results.map((item, idx) => (
                    <Card 
                      key={item.id || idx}
                      className="border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-white"
                      onClick={() => setSelectedRecord(item)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                              {item.schoolName}
                            </h4>
                            {item.schoolName2 && (
                              <p className="text-xs text-slate-500">{item.schoolName2}</p>
                            )}
                            <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.address} {item.lga ? `(${item.lga} LGA)` : ''}
                            </p>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Proprietor: <span className="font-medium text-slate-800">{item.name}</span>
                            </p>
                          </div>

                          <Badge 
                            variant="outline" 
                            className={`shrink-0 text-xs font-semibold ${
                              isDuesCleared(item.clearingStatus)
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {isDuesCleared(item.clearingStatus) ? 'Cleared' : 'Pending'}
                          </Badge>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-mono">ID: {item.submissionId}</span>
                          <span className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                            Select School →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Single Selected Record View */}
            {selectedRecord && (
              <div className="space-y-4">
                {results.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecord(null)}
                    className="text-slate-600 hover:text-slate-900 -ml-2 mb-2 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all results ({results.length})
                  </Button>
                )}

                <Card className="shadow-xl border-slate-200 bg-white overflow-hidden">
                  {/* Record Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
                            {selectedRecord.categoryOfSchool}
                          </Badge>
                          {selectedRecord.lga && (
                            <Badge className="bg-emerald-950/40 text-emerald-100 border-0 text-xs">
                              {selectedRecord.lga} LGA
                            </Badge>
                          )}
                          <Badge className="bg-emerald-500 text-white border-0 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {selectedRecord.registrationStatus}
                          </Badge>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                          {selectedRecord.schoolName}
                        </h3>
                        {selectedRecord.schoolName2 && (
                          <p className="text-emerald-200 text-sm mt-0.5">{selectedRecord.schoolName2}</p>
                        )}
                        <p className="text-emerald-100/90 text-sm flex items-center gap-1.5 mt-2">
                          <MapPin className="w-4 h-4 shrink-0 text-emerald-300" />
                          {selectedRecord.address}
                        </p>
                      </div>

                      <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditDialogOpen(true)}
                          className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-sm flex items-center gap-1.5"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Record
                        </Button>
                        <span className="text-xs text-emerald-200/80 font-mono">
                          Ref: {selectedRecord.submissionId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: Proprietor & School Details */}
                      <div className="space-y-6">
                        {/* Proprietor Information */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-600" />
                            Proprietor Details
                          </h4>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Full Name:</span>
                              <span className="text-sm font-bold text-slate-900">{selectedRecord.name}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Phone Number:</span>
                              <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {selectedRecord.phone}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">Email Address:</span>
                              <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {selectedRecord.email}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">NAPPS Membership:</span>
                              <span className="text-sm font-semibold text-emerald-700">
                                {selectedRecord.nappsRegistered}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* School Academic Profile */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <School className="w-4 h-4 text-emerald-600" />
                            Institutional Profile
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 block">Established</span>
                              <span className="font-bold text-slate-800">{selectedRecord.yearOfEstablishment}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 block">Ministry Approval</span>
                              <span className="font-bold text-slate-800">{selectedRecord.yearOfApproval}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 block">School Type</span>
                              <span className="font-bold text-slate-800">{selectedRecord.typeOfSchool}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs text-slate-500 block">Ownership Structure</span>
                              <span className="font-bold text-slate-800">{selectedRecord.ownership}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment & Status Card */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            Dues & Clearance Status
                          </h4>

                          <div className={`rounded-xl p-6 border ${
                            isDuesCleared(selectedRecord.clearingStatus)
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-amber-50/70 border-amber-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-semibold text-slate-700">Clearance Status:</span>
                              <Badge 
                                className={`text-sm py-1 px-3 font-bold ${
                                  isDuesCleared(selectedRecord.clearingStatus)
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                                }`}
                              >
                                {isDuesCleared(selectedRecord.clearingStatus) ? '✓ Cleared & In Good Standing' : '⚠ Outstanding Dues'}
                              </Badge>
                            </div>

                            <div className="my-4 pt-4 border-t border-slate-200/60 flex items-baseline justify-between">
                              <div>
                                <span className="text-xs text-slate-500 block">Total Dues Payable:</span>
                                <span className="text-3xl font-extrabold text-slate-900">
                                  ₦{selectedRecord.amountDue.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                Session 2024/2025
                              </span>
                            </div>

                            {isDuesCleared(selectedRecord.clearingStatus) ? (
                              <div className="space-y-3 mt-4">
                                <p className="text-xs text-emerald-800 bg-white/80 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  Your institution is formally cleared for the current academic session.
                                </p>
                                <Link to={`/levy-payment/download?reference=${selectedRecord.submissionId}`} className="block">
                                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                                    Download Clearance Certificate
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <div className="space-y-3 mt-5">
                                <Button
                                  onClick={() => handlePayment('fidelity')}
                                  disabled={paymentLoading}
                                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2"
                                >
                                  {paymentLoading ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Generating Fidelity Account...
                                    </>
                                  ) : (
                                    <>
                                      <Building2 className="w-5 h-5 text-emerald-200" />
                                      Pay via Fidelity Bank Transfer (Instant)
                                    </>
                                  )}
                                </Button>

                                <Button
                                  onClick={() => handlePayment('paystack')}
                                  disabled={paymentLoading}
                                  variant="outline"
                                  className="w-full h-10 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                                >
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  Pay with Debit Card / Paystack
                                </Button>

                                <p className="text-center text-xs text-slate-500">
                                  Fidelity dynamic virtual accounts update and clear your dues automatically in real time.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Proprietor Portal Access Callout */}
                        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">Manage from Proprietor Dashboard</p>
                            <p className="text-xs text-slate-600">Login with your phone number to access full profile</p>
                          </div>
                          <Link to="/proprietor-login">
                            <Button size="sm" variant="outline" className="shrink-0 bg-white">
                              Dashboard Login
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Record Dialog Modal */}
                <EditRecordDialog
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  record={selectedRecord}
                  onSuccess={handleEditSuccess}
                />

                {/* Fidelity Dynamic Virtual Account Modal */}
                <FidelityVirtualAccountModal
                  isOpen={fidelityModalOpen}
                  onClose={() => setFidelityModalOpen(false)}
                  onSuccess={handleFidelityPaymentSuccess}
                  virtualAccount={virtualAccountData}
                  purposeTitle={`NAPPS Dues — ${selectedRecord?.schoolName || 'School'}`}
                />
              </div>
            )}


            {/* Empty State */}
            {results.length === 0 && (
              <Card className="border-dashed border-2 border-slate-300 bg-white text-center py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  No School Record Found
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  We couldn't locate any institution or proprietor matching <strong className="text-slate-900">"{lastSearchedTerm}"</strong>.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl max-w-md mx-auto text-left text-xs text-slate-600 space-y-1.5 mb-6 border border-slate-100">
                  <p className="font-semibold text-slate-800">💡 Helpful search tips:</p>
                  <p>• For phone search, enter standard 11 digits (e.g. 08012345678).</p>
                  <p>• If searching by school name, try a shorter keyword (e.g. "Sunnah" instead of "Sunnah Islamic Nursery").</p>
                  <p>• Ensure spelling matches the official registration document.</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link to="/register">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                      Register as New School
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSearchMode('all');
                      setHasSearched(false);
                    }}
                  >
                    Clear & Search Again
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
};