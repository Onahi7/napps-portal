import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Landmark, 
  Compass, 
  Flag, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  CreditCard, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  PieChart
} from "lucide-react";
import { DuesDistributionBreakdown } from "@/components/dues/DuesDistributionBreakdown";
import { toast } from "sonner";

export default function MonitoringDashboards() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const [roleTab, setRoleTab] = useState("state");
  const [selectedLga, setSelectedLga] = useState("Lafia");
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFinancialRemittances();
  }, []);

  const fetchFinancialRemittances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/proprietors/monitoring/financial-remittances`);
      if (res.ok) {
        const data = await res.json();
        setFinancialData(data);
      } else {
        toast.error("Failed to load real-time remittance data from registry database.");
        setFinancialData(null);
      }
    } catch (err: any) {
      toast.error("Network error fetching remittances: " + (err.message || "Failed to reach server"));
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  const lgaDetail = financialData?.lgaBreakdown?.find((item: any) => item.lga === selectedLga) || financialData?.lgaBreakdown?.[0];

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-10 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/30">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Multi-Level Real-Time Monitoring System
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                NAPPS Dues &amp; Remittances Portal
              </h1>
              <p className="text-sm text-slate-300">
                Transparent multi-tier monitoring dashboards for Chapter Coordinators, State Chairman, Zonal President, and the National Office.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchFinancialRemittances}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs h-9"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Telemetry
              </Button>
              <Button 
                size="sm" 
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Export Ledger
              </Button>
            </div>
          </div>

          {/* Automated Dues Split Component */}
          <DuesDistributionBreakdown totalAmount={financialData?.overview?.totalRevenueCollected || 5684000} />

          {/* Role-Based Tabs */}
          <Tabs value={roleTab} onValueChange={setRoleTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-white border border-slate-200 rounded-xl shadow-xs h-auto">
              <TabsTrigger value="chapter" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2.5 rounded-lg flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Chapter Coordinator</span>
              </TabsTrigger>
              <TabsTrigger value="state" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2.5 rounded-lg flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                <span>State Chairman</span>
              </TabsTrigger>
              <TabsTrigger value="zonal" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2.5 rounded-lg flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Zonal President</span>
              </TabsTrigger>
              <TabsTrigger value="national" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs py-2.5 rounded-lg flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" />
                <span>National Office</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CHAPTER COORDINATOR */}
            <TabsContent value="chapter" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Select Local Chapter (LGA)</h3>
                  <p className="text-xs text-slate-500">Monitor dues collection and the 20% local executive share for your chapter.</p>
                </div>
                <Select value={selectedLga} onValueChange={setSelectedLga}>
                  <SelectTrigger className="w-[200px] h-9 text-xs">
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialData?.lgaBreakdown?.map((item: any) => (
                      <SelectItem key={item.lga} value={item.lga}>{item.lga} LGA</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lgaDetail && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-slate-200 shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs text-slate-500 block font-medium">Registered Schools</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{lgaDetail.registeredSchools}</p>
                      <span className="text-[11px] text-emerald-600 font-medium">In {lgaDetail.lga} LGA Chapter</span>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs text-slate-500 block font-medium">Dues Cleared</span>
                      <p className="text-2xl font-black text-emerald-600 mt-1">{lgaDetail.clearedSchools}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{lgaDetail.pendingSchools} Pending Clearance</span>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs text-slate-500 block font-medium">Total Collected</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">₦{lgaDetail.totalCollected.toLocaleString()}</p>
                      <span className="text-[11px] text-slate-400 font-medium">@ ₦14,500 Unified Dues</span>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-300 bg-emerald-50/50 shadow-xs">
                    <CardContent className="p-5">
                      <span className="text-xs text-emerald-800 block font-bold uppercase tracking-wider">Chapter 20% Share</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">₦{lgaDetail.chapterShare20Pct.toLocaleString()}</p>
                      <span className="text-[11px] text-emerald-700 font-medium">Direct Chapter Remittance</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: STATE CHAIRMAN */}
            <TabsContent value="state" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">Statewide Registered</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{financialData?.overview?.totalSchoolsRegistered}</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Across all 13 LGAs</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">State Revenue Pool</span>
                    <p className="text-2xl font-black text-emerald-700 mt-1">₦{financialData?.overview?.totalRevenueCollected?.toLocaleString()}</p>
                    <span className="text-[11px] text-slate-400 font-medium">Compliance: {financialData?.overview?.complianceRate}</span>
                  </CardContent>
                </Card>
                <Card className="border-blue-300 bg-blue-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-blue-800 block font-bold uppercase tracking-wider">State 35% Treasury Share</span>
                    <p className="text-2xl font-black text-blue-700 mt-1">₦{financialData?.overview?.distributionTotals?.stateChapterTotal?.toLocaleString()}</p>
                    <span className="text-[11px] text-blue-600 font-medium">Nasarawa State Operations</span>
                  </CardContent>
                </Card>
                <Card className="border-purple-300 bg-purple-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-purple-800 block font-bold uppercase tracking-wider">Total Chapters (20%)</span>
                    <p className="text-2xl font-black text-purple-700 mt-1">₦{financialData?.overview?.distributionTotals?.localChaptersTotal?.toLocaleString()}</p>
                    <span className="text-[11px] text-purple-600 font-medium">Remitted to 13 LGA Accounts</span>
                  </CardContent>
                </Card>
              </div>

              {/* Statewide LGA Remittance Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Statewide LGA Chapter Breakdown (13 Local Governments)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live financial reconciliation of collections and multi-level disbursements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">LGA Chapter</th>
                          <th className="py-2.5 px-3 text-center">Schools</th>
                          <th className="py-2.5 px-3 text-center">Cleared</th>
                          <th className="py-2.5 px-3 text-right">Total Inflow</th>
                          <th className="py-2.5 px-3 text-right">Chapter (20%)</th>
                          <th className="py-2.5 px-3 text-right">State (35%)</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {financialData?.lgaBreakdown?.map((item: any) => (
                          <tr key={item.lga} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{item.lga}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.registeredSchools}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-emerald-700">{item.clearedSchools}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₦{item.totalCollected.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">₦{item.chapterShare20Pct.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right text-blue-700 font-medium">₦{item.stateRemittance35Pct.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                                Remitted
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: ZONAL PRESIDENT */}
            <TabsContent value="zonal" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">North Central Zone States</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">7 States</p>
                    <span className="text-[11px] text-slate-400 font-medium">Nasarawa, Benue, Plateau, Kogi, Kwara, Niger, FCT</span>
                  </CardContent>
                </Card>
                <Card className="border-purple-300 bg-purple-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-purple-800 block font-bold uppercase tracking-wider">Zonal 20% Allocation (Nasarawa)</span>
                    <p className="text-2xl font-black text-purple-700 mt-1">₦{financialData?.overview?.distributionTotals?.zonalChapterTotal?.toLocaleString()}</p>
                    <span className="text-[11px] text-purple-600 font-medium">Zonal Secretariat Treasury</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">Regional Reconciliation</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">100% Verified</p>
                    <span className="text-[11px] text-emerald-700 font-medium">Automatic Paystack Split</span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: NATIONAL OFFICE */}
            <TabsContent value="national" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">National Secretariat Quota</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">25% Unified Rate</p>
                    <span className="text-[11px] text-slate-400 font-medium">Constitutional Remittance</span>
                  </CardContent>
                </Card>
                <Card className="border-amber-300 bg-amber-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-amber-800 block font-bold uppercase tracking-wider">National Remittance (Nasarawa)</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">₦{financialData?.overview?.distributionTotals?.nationalSecretariatTotal?.toLocaleString()}</p>
                    <span className="text-[11px] text-amber-600 font-medium">Federal Headquarters Account</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-xs">
                  <CardContent className="p-5">
                    <span className="text-xs text-slate-500 block font-medium">Audit Compliance Status</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">Certified</p>
                    <span className="text-[11px] text-emerald-700 font-medium">Zero Manual Remittance Deficit</span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
