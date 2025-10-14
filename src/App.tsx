import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import PaymentStatus from "./pages/PaymentStatus";
import NotFound from "./pages/NotFound";
import ProprietorDetailPage from "./components/admin/pages/ProprietorDetailPage";
import { ProprietorLogin } from "./pages/ProprietorLogin";
import { ProprietorDashboard } from "./pages/ProprietorDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SimulatedPayment } from "./pages/SimulatedPayment";
import { PaymentSuccess } from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/proprietors/:id" element={<ProprietorDetailPage />} />
          <Route path="/payment/status" element={<PaymentStatus />} />
          <Route path="/payment/simulate" element={<SimulatedPayment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/registration/status" element={<PaymentStatus />} />
          <Route path="/proprietor-login" element={<ProprietorLogin />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProprietorDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
