import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  Menu, 
  X, 
  QrCode, 
  LogIn, 
  Search,
  CheckCircle2
} from "lucide-react";
import nappsLogo from "@/assets/napps-logo.png";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: "Find Record / Pay Dues", path: "/", icon: Search },
    { name: "School Registration", path: "/register", icon: Users },
    { name: "Verify School", path: "/verify", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Main Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Official Logo Only - Clean & Uncluttered */}
            <Link to="/" className="flex items-center group py-0.5">
              <img 
                src={nappsLogo} 
                alt="NAPPS Nasarawa" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      active 
                        ? "bg-emerald-50 text-emerald-950 font-bold" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/proprietor-login">
                <Button className="bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-5 h-10 rounded-xl shadow-xs transition-all hover:shadow-md">
                  <LogIn className="w-4 h-4 mr-2 text-amber-400" />
                  Proprietor Sign-In
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link to="/proprietor-login" className="sm:hidden">
                <Button size="sm" variant="outline" className="h-9 px-2.5 text-xs font-semibold">
                  <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  Sign In
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1.5">
              {navLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? "bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-700" 
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-500"}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <Link 
                to="/proprietor-login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block"
              >
                <Button className="w-full justify-center bg-[#064e3b] hover:bg-[#047857] text-white font-semibold">
                  <LogIn className="w-4 h-4 mr-2 text-amber-400" />
                  Proprietor Dashboard Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Official Institutional Footer */}
      <footer className="bg-[#022c22] text-slate-300 mt-20 border-t border-emerald-900/60">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Identity & Credentials */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img 
                  src={nappsLogo} 
                  alt="NAPPS Logo" 
                  className="w-12 h-12 rounded-full ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">NAPPS Nasarawa</h3>
                  <p className="text-emerald-400 text-xs font-medium">State Chapter Headquarters</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                National Association of Proprietors of Private Schools (NAPPS) Nasarawa State Chapter &mdash; the apex regulatory and cooperative body for accredited private institutions across 13 Local Government Areas.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>CAC Certified &bull; State Accredited</span>
              </div>
            </div>
            
            {/* Col 2: Services & Exams */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 uppercase tracking-wider text-emerald-400">
                Examination &amp; Dues
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/verify" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    School Membership Verification
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Proprietor Record &amp; Dues Lookup
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    New School Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Accreditation & Verification */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 uppercase tracking-wider text-emerald-400">
                Accreditation &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/verify" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Public School &amp; ID Verification
                  </Link>
                </li>
                <li>
                  <Link to="/proprietor-login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Proprietor Self-Service Portal
                  </Link>
                </li>
                <li>
                  <a href="/#lookup" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Dues Receipt &amp; Status Lookup
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: State Secretariat Contacts */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 uppercase tracking-wider text-emerald-400">
                State Secretariat
              </h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>NAPPS State Secretariat, Lafia, Nasarawa State, Nigeria</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>+234 806 977 0126</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>info@nappsnasarawa.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>&copy; {new Date().getFullYear()} NAPPS Nasarawa State Chapter. All statutory rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">Powered by Fidelity Bank (Virtuda)</span>
              <span className="text-slate-600">&bull;</span>
              <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                Staff Console
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};