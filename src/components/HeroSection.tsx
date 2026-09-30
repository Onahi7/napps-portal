import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, Shield, CreditCard, LogIn, GraduationCap, QrCode, Sparkles, BarChart3, CheckCircle2, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="hero-gradient text-white py-16 md:py-24 relative overflow-hidden">
      {/* Background Subtle Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>NAPPS Nasarawa State Unified Digital Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-semibold">2026 Upgraded Edition</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            NAPPS Nasarawa State
            <span className="block text-accent mt-1">Unified Examination &amp; Dues Portal</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed font-normal">
            Empowering private schools across Nasarawa's 13 LGAs with standardised <strong>NNSUCE AI-assisted examinations</strong>, 
            automated <strong>4-tier dues collection</strong> (Local, State, Zonal, National), and verifiable digital credentials.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8">
            <Link to="/nnsuce">
              <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-400">
                <GraduationCap className="w-5 h-5 mr-2" />
                NNSUCE Exam Portal
              </Button>
            </Link>

            <a href="#lookup">
              <Button variant="hero" size="lg" className="w-full sm:w-auto font-semibold">
                <Search className="w-5 h-5 mr-2" />
                Find My Record
              </Button>
            </a>
            
            <Link to="/register">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                New Registration
              </Button>
            </Link>

            <Link to="/proprietor-login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-emerald-950/40 border-emerald-400/40 text-emerald-200 hover:bg-emerald-900/60 font-semibold"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Proprietor Login
              </Button>
            </Link>
          </div>

          {/* Quick Sub-Links for Public Trust & Transparency */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/80 pb-6 border-b border-white/10">
            <Link to="/validation-form" className="inline-flex items-center gap-1.5 hover:text-white transition-colors bg-amber-400/20 text-amber-200 px-3 py-1 rounded-md border border-amber-400/30 font-semibold shadow-sm">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Validation Form (A4)</span>
            </Link>
            <Link to="/verify" className="inline-flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-md border border-white/10">
              <QrCode className="w-3.5 h-3.5 text-accent" />
              <span>Public QR Verification</span>
            </Link>
            <Link to="/monitoring" className="inline-flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-md border border-white/10">
              <BarChart3 className="w-3.5 h-3.5 text-accent" />
              <span>Multi-Level Monitoring</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Constitutional 20/35/20/25 Dues Formula</span>
            </span>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10 text-left">
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Standardised NNSUCE</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Anti-tamper customised candidate sheets, 50-bubble OMR grids, AI optical marking, and instant broadsheets.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold mb-1.5">4-Tier Dues Split</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Constitutional distribution: Local (20%), State (35%), Zonal (20%), and National (25%) with instant e-receipts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center mb-3">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Digital Member ID</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Standardised CR-80 PVC identity cards with unique numbers and scannable QR verification for field validation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Multi-Level Monitoring</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Real-time dashboards for Chapter Coordinators, State Chairman, Zonal President, and National leadership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};