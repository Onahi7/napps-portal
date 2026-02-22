import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Upload, 
  Settings, 
  FileText, 
  BarChart3, 
  Bell,
  School,
  ExternalLink,
  DollarSign,
  BookOpen,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'levy-payments' | 'import' | 'settings') => void;
}

const navigationItems = [
  {
    title: 'Overview',
    items: [
      { 
        name: 'Dashboard', 
        icon: LayoutDashboard, 
        page: 'dashboard' as const,
        badge: null
      },
      { 
        name: 'Analytics', 
        icon: BarChart3, 
        page: 'analytics' as const,
        badge: null
      },
    ]
  },
  {
    title: 'Management',
    items: [
      { 
        name: 'Proprietors', 
        icon: Users, 
        page: 'proprietors' as const,
        badge: '1,247'
      },
      { 
        name: 'Schools', 
        icon: School, 
        page: 'schools' as const,
        badge: '485'
      },
      { 
        name: 'Chapters', 
        icon: BookOpen, 
        page: 'chapters' as const,
        badge: null
      },
    ]
  },
  {
    title: 'Data',
    items: [
      { 
        name: 'Payments', 
        icon: CreditCard, 
        page: 'payments' as const,
        badge: '391'
      },
      { 
        name: 'Levy Payments', 
        icon: Building2, 
        page: 'levy-payments' as const,
        badge: null
      },
      { 
        name: 'Fees', 
        icon: DollarSign, 
        page: 'fees' as const,
        badge: null
      },
      { 
        name: 'Import Data', 
        icon: Upload, 
        page: 'import' as const,
        badge: null
      },
      { 
        name: 'Reports', 
        icon: FileText, 
        page: 'reports' as const,
        badge: null
      },
    ]
  },
  {
    title: 'System',
    items: [
      { 
        name: 'Notifications', 
        icon: Bell, 
        page: 'notifications' as const,
        badge: '3'
      },
      { 
        name: 'Settings', 
        icon: Settings, 
        page: 'settings' as const,
        badge: null
      },
    ]
  },
];

export function AdminSidebar({ currentPage, onNavigate }: SidebarProps) {
  const handleItemClick = (page: string) => {
    // Only navigate for implemented pages
    const validPages = ['dashboard', 'proprietors', 'payments', 'fees', 'chapters', 'levy-payments', 'import', 'settings'] as const;
    type ValidPage = typeof validPages[number];
    
    if (validPages.includes(page as ValidPage)) {
      onNavigate(page as 'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'levy-payments' | 'import' | 'settings');
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NP</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">NAPPS Admin</h2>
            <p className="text-xs text-gray-500">Nasarawa Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = currentPage === item.page;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => handleItemClick(item.page)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "secondary" : "outline"}
                          className={cn(
                            "text-xs",
                            isActive && "bg-white/20 text-white border-white/30"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Quick Action */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => window.open('/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Portal Site
        </Button>
      </div>
    </div>
  );
}
