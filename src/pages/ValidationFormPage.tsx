import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { NappsMembershipValidationForm, ValidationFormData } from '@/components/validation-form/NappsMembershipValidationForm';
import { AiDocumentScannerModal } from '@/components/registration/AiDocumentScannerModal';
import { Search, Sparkles, ArrowLeft, ShieldCheck, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ValidationFormPage = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ValidationFormData> | null>(null);

  useEffect(() => {
    // If ID is provided or user has token in localStorage
    const savedUser = localStorage.getItem('proprietor_user');
    const targetId = queryId || (savedUser ? JSON.parse(savedUser).id || JSON.parse(savedUser)._id : null);

    if (targetId) {
      loadFormData(targetId);
    }
  }, [queryId]);

  const loadFormData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/proprietors/${id}/validation-form`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      } else {
        toast.error('Could not find existing validation record. Starting with a blank form.');
      }
    } catch (err: any) {
      toast.error('Network error: unable to load validation record.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error('Please enter a phone number, email, or school name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/proprietors/verify-member/${encodeURIComponent(searchInput.trim())}`);
      if (res.ok) {
        const result = await res.json();
        if (result && result.proprietor) {
          await loadFormData(result.proprietor._id || result.proprietor.id);
          toast.success('School validation record found!');
          return;
        }
      }
      toast.info('No existing record found with that identifier. You can fill out and print a new validation form.');
    } catch {
      toast.info('Search completed. Template ready for entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      schoolName: data.schoolName || prev?.schoolName || '',
      schoolAddress: data.schoolAddress || prev?.schoolAddress || '',
      schoolPhone: data.phone || prev?.schoolPhone || '',
      aegeLgeaDa: data.aegeLgeaDa || `${data.lga || 'Lafia'} Central DA`,
      lga: data.lga || prev?.lga || 'Lafia',
      yearOfEstablishment: data.yearOfEstablishment || prev?.yearOfEstablishment || '2018',
      schoolRegistrationStatus: (data.schoolRegistrationStatus as any) || 'REGISTERED',
      levelsOfEducation: (data.levelsOfEducation as any) || 'Nursery/Primary',
      typeOfSchool: (data.typeOfSchool as any) || 'Regular',
      ownership: (data.ownership as any) || 'Individualist',
      fullName: data.fullName || (data.firstName ? `${data.firstName} ${data.lastName}` : prev?.fullName || ''),
      chapter: data.chapter || prev?.chapter || `${data.lga || 'Lafia'} Chapter`,
      schoolCode: data.schoolCode || prev?.schoolCode || 'SCH/NAS/001',
      phone: data.phone || prev?.phone || '',
      email: data.email || prev?.email || '',
      positionInNapps: data.positionInNapps || prev?.positionInNapps || 'Member',
      hasNappsIdCard: data.hasNappsIdCard !== undefined ? Boolean(data.hasNappsIdCard) : true,
      nnsuceTimesWritten: (data.nnsuceTimesWritten as any) || '2',
      nnsuce2025PupilsCount: data.nnsuce2025PupilsCount || 40,
      duesPaymentHistory: data.duesPaymentHistory || prev?.duesPaymentHistory,
    }));
    toast.success('Form automatically populated from scanned physical form!');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="print:hidden flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScannerOpen(true)}
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300 font-semibold shadow-sm text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Scan Paper Form
            </Button>
          </div>
        </div>

        {/* Quick Search Bar (Hidden in Print) */}
        <Card className="print:hidden bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Find your school record by phone number, email, or school name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
                Load Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Scanner Modal */}
        <AiDocumentScannerModal
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onApplyData={handleApplyAiData}
        />

        {/* The Exact Physical Form Twin */}
        <NappsMembershipValidationForm initialData={formData || undefined} isEditable={true} />
      </div>
    </div>
  );
};
