import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Upload, 
  Settings, 
  BarChart3, 
  DollarSign, 
  BookOpen, 
  Building2,
  GraduationCap,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import nappsLogo from '@/assets/napps-logo.png';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'levy-payments' | 'import' | 'settings' | 'nnsuce' | 'monitoring') => void;
}

const navigationSections = [
  {
    title: 'Core Administration',
    items: [
      { 
        name: 'Dashboard', 
        icon: LayoutDashboard, 
        page: 'dashboard' as const,
      },
      { 
        name: 'Proprietors & Schools', 
        icon: Users, 
        page: 'proprietors' as const,
      },
      { 
        name: 'Chapters (13 LGAs)', 
        icon: BookOpen, 
        page: 'chapters' as const,
      },
    ]
  },
  {
    title: 'Exams & Governance',
    items: [
      { 
        name: 'NNSUCE Exams & OMR', 
        icon: GraduationCap, 
        page: 'nnsuce' as const,
      },
      { 
        name: '4-Tier Dues Ledger', 
        icon: BarChart3, 
        page: 'monitoring' as const,
      },
    ]
  },
  {
    title: 'Revenue & Finance',
    items: [
      { 
        name: 'Payment Transactions', 
        icon: CreditCard, 
        page: 'payments' as const,
      },
      { 
        name: 'Levy Payments', 
        icon: Building2, 
        page: 'levy-payments' as const,
      },
      { 
        name: 'Fee Schedule', 
        icon: DollarSign, 
        page: 'fees' as const,
      },
      { 
        name: 'Import Legacy Data', 
        icon: Upload, 
        page: 'import' as const,
      },
    ]
  },
  {
    title: 'System & Security',
    items: [
      { 
        name: 'System Settings', 
        icon: Settings, 
        page: 'settings' as const,
      },
    ]
  },
];

export function AdminSidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800 fixed left-0 top-0 flex flex-col z-30 font-sans shadow-lg">
      {/* Official Header Crest */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <img 
            src={nappsLogo} 
            alt="NAPPS Logo" 
            className="w-10 h-10 rounded-full ring-2 ring-emerald-500/30 object-contain bg-white/10"
          />
          <div>
            <h2 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>NAPPS Executive</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium">Nasarawa State Chapter</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left group",
                    active
                      ? "bg-emerald-600/90 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-400 group-hover:text-emerald-400")} />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Public Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <a 
          href="/" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span>View Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </aside>
  );
}
