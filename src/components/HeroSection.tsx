import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="hero-gradient text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            NAPPS Nasarawa
            <span className="block text-accent">Proprietors Portal</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Official portal for private school proprietors in Nasarawa State. 
            Find your record, pay dues, and manage your school registration.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="#lookup">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Search className="w-5 h-5" />
                Find My Record
              </Button>
            </Link>
            
            <Link to="/register">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <UserPlus className="w-5 h-5" />
                New Registration
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold mb-2">Quick Lookup</h3>
                <p className="text-white/80 text-sm">
                  Search your records using phone number or email address
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                <p className="text-white/80 text-sm">
                  Pay your dues safely with Paystack integration
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-lg font-semibold mb-2">Official Portal</h3>
                <p className="text-white/80 text-sm">
                  Authorized by Nasarawa State Ministry of Education
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};