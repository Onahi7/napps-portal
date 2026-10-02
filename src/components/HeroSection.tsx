import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  UserPlus, 
  Shield, 
  CreditCard, 
  GraduationCap, 
  QrCode, 
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="hero-mesh text-white py-16 md:py-24 relative overflow-hidden">
      {/* Background Soft Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Institutional State Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-200 font-semibold tracking-wide uppercase text-[11px] sm:text-xs">
              Federal Republic of Nigeria
            </span>
            <span className="text-white/40">&bull;</span>
            <span className="text-amber-300 font-bold">NAPPS Nasarawa State Chapter</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.12] tracking-tight">
            Unified Digital Portal for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200 mt-1">
              Private School Proprietors
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl mb-10 text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-normal">
            The official state platform for private school accreditation, automated dues clearance with Fidelity Bank, and institutional records across Nasarawa&apos;s 13 Local Government Areas.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <a href="#lookup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-6 text-base shadow-lg shadow-amber-500/25 border-0 rounded-xl transition-all hover:scale-[1.02]">
                <Search className="w-5 h-5 mr-2 text-slate-950" />
                Find School Record &amp; Pay Dues
              </Button>
            </a>

            <Link to="/register" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/25 px-7 py-6 text-base font-semibold backdrop-blur-sm rounded-xl transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4 mr-2 text-emerald-300" />
                Register New School
              </Button>
            </Link>

            <Link to="/verify" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="ghost" 
                className="w-full sm:w-auto text-emerald-200 hover:text-white hover:bg-white/10 px-6 py-6 text-base font-semibold rounded-xl"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Verify Institution
              </Button>
            </Link>
          </div>

          {/* Live System Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">800+</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">Registered Schools</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">13</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">LGA Chapters Covered</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">4-Tier</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">Automated Dues Split</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">100%</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">Verified Dues Clearance</div>
            </div>
          </div>
        </div>

        {/* Pillar Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left max-w-6xl mx-auto">
          <Card className="bg-white/[0.06] border-white/15 text-white backdrop-blur-md hover:bg-white/[0.10] transition-all">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3.5 border border-amber-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-white">Standardised NNSUCE</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Centralised examination registration, anti-tamper OMR bubble grading, and instant verified broadsheets.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.06] border-white/15 text-white backdrop-blur-md hover:bg-white/[0.10] transition-all">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3.5 border border-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-white">Automated Virtual Accounts</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Dedicated virtual collection accounts generated per school with instant payment reconciliation and 4-tier statutory remittance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.06] border-white/15 text-white backdrop-blur-md hover:bg-white/[0.10] transition-all">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-3.5 border border-teal-500/30">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-white">Tamper-Proof ID Cards</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Standardised CR-80 PVC credentials with scannable QR verification for field ministry enforcement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.06] border-white/15 text-white backdrop-blur-md hover:bg-white/[0.10] transition-all">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3.5 border border-blue-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-white">Multi-Tier Governance</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Real-time ledgers accessible by Local Chapter Coordinators, State Executive Council, and Zonal Leadership.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};