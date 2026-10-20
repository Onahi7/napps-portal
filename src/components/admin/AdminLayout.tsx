import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}

export function AdminLayout({ children, sidebar, header }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {header}
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Container */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-16 bottom-0 z-40 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <div onClick={() => setMobileOpen(false)}>{sidebar}</div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 min-h-[calc(100vh-4rem)] min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-50 rounded-full bg-emerald-600 p-3.5 text-white shadow-lg hover:bg-emerald-700"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
