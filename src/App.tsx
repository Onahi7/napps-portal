import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import LevyPayment from "./pages/LevyPayment";
import LevyPaymentVerify from "./pages/LevyPaymentVerify";
import LevyPaymentDownload from "./pages/LevyPaymentDownload";
import NnsucePortal from "./pages/NnsucePortal";
import SchoolVerification from "./pages/SchoolVerification";
import MonitoringDashboards from "./pages/MonitoringDashboards";
import { ValidationFormPage } from "./pages/ValidationFormPage";

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
          <Route path="/levy-payment" element={<LevyPayment />} />
          <Route path="/levy-payment/verify" element={<LevyPaymentVerify />} />
          <Route path="/levy-payment/download" element={<LevyPaymentDownload />} />
          {/* Secured administrative & internal features redirect to /admin */}
          <Route path="/nnsuce" element={<Navigate to="/admin" replace />} />
          <Route path="/verify" element={<SchoolVerification />} />
          <Route path="/verify-member" element={<SchoolVerification />} />
          <Route path="/monitoring" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboards" element={<Navigate to="/admin" replace />} />
          <Route path="/validation-form" element={<Navigate to="/register" replace />} />
          <Route path="/membership-validation" element={<Navigate to="/register" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
