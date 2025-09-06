import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, Users, Phone, Mail } from "lucide-react";
import nappsLogo from "@/assets/napps-logo.png";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white elegant-shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={nappsLogo} 
                alt="NAPPS Nasarawa Logo" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">NAPPS Nasarawa</h1>
                <p className="text-sm text-muted-foreground">Proprietors Portal</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary smooth-transition font-medium"
              >
                Lookup Record
              </Link>
              <Link 
                to="/register" 
                className="text-foreground hover:text-primary smooth-transition font-medium"
              >
                Register
              </Link>
              {!isAdminRoute && (
                <Link to="/admin">
                  <Button variant="government" size="sm">
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Building2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">NAPPS Nasarawa State</h3>
              <p className="text-primary-foreground/80 text-sm">
                Nigeria Association of Proprietors of Private Schools - Nasarawa State Chapter
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-accent smooth-transition">
                  Find My Record
                </Link>
                <Link to="/register" className="block hover:text-accent smooth-transition">
                  New Registration
                </Link>
                <Link to="/payment-status" className="block hover:text-accent smooth-transition">
                  Payment Status
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+234 XXX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@nappsnasarawa.gov.ng</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/80">
            <p>&copy; 2024 NAPPS Nasarawa State. All rights reserved. | Ministry of Education Partnership</p>
          </div>
        </div>
      </footer>
    </div>
  );
};