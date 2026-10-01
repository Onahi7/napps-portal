import { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown, CheckCircle2, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminHeaderProps {
  onLogout: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
}

export function AdminHeader({ onLogout, user }: AdminHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const initials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'AD'
    : 'AD';

  const displayName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'State Administrator'
    : 'State Administrator';

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left Section - Context Title & Live Indicator */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NAPPS Nasarawa State Cloud</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
          <span>Session: 2025/2026</span>
          <span className="text-slate-300">&bull;</span>
          <span>13 LGAs Live</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Current Time (Nasarawa Local Time) */}
        <div className="hidden lg:block text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          {currentTime.toLocaleDateString('en-GB', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>

        {/* System Health Status Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">System Status</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3 text-xs space-y-2">
            <DropdownMenuLabel className="p-0 font-bold text-slate-900">Live Service Telemetry</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600">Database Engine</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> MongoDB Atlas
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600">Payment Gateway</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fidelity Virtuda
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600">Dues Split Engine</span>
              <span className="font-semibold text-slate-900">4-Tier Automated</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 pl-2 h-9">
              <Avatar className="h-7 w-7 ring-1 ring-emerald-600/30">
                <AvatarFallback className="bg-[#064e3b] text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{displayName}</p>
                <p className="text-[10px] text-emerald-700 font-medium">{user?.role || 'Executive Admin'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-bold text-slate-900 text-xs">{displayName}</p>
                <p className="text-[11px] text-slate-500 font-normal truncate">{user?.email || 'admin@nappsnasarawa.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 font-medium cursor-pointer text-xs">
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out Securely
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
