import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CameraCapture } from '@/components/ui/camera-capture';
import { NASARAWA_LGAS, NasarawaLga } from '@/lib/nasarawaLgas';
import { MapPin, Navigation, School, Users, ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AiDocumentScannerModal } from './AiDocumentScannerModal';

const enrollmentFieldSchema = z.number().min(0, 'Cannot be negative').optional();

const step2Schema = z.object({
  schoolName: z.string().min(3, 'School name is required'),
  schoolName2: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  lga: z
    .string()
    .optional()
    .refine((value) => !value || NASARAWA_LGAS.includes(value as NasarawaLga), {
      message: 'Select a valid LGA',
    }),
  aeqeoZone: z.string().optional(),
  gpsLongitude: z.number().optional(),
  gpsLatitude: z.number().optional(),
  typeOfSchool: z.enum(['Faith Based', 'Conventional', 'Islamiyah Integrated', 'Secular', 'Other']).optional(),
  categoryOfSchool: z.string().optional(),
  ownership: z.enum(['Individual(s)', 'Sole', 'Partnership', 'Corporate', 'Community', 'Religious Organization', 'Other']).optional(),
  yearOfEstablishment: z.number().min(1900).max(2100).optional(),
  yearOfApproval: z.number().min(1900).max(2100).optional(),
  cacNumber: z.string().optional(),
  nnsuceTimesWritten: z.string().optional(),
  nnsucePupilsCount: z.number().min(0, 'Cannot be negative').optional(),
  registrationEvidence: z.string().optional(),
  registrationEvidencePhoto: z.string().optional(),
  totalEnrollment: z.number().min(0, 'Cannot be negative').optional(),
  
  // All enrollment fields (optional detailed breakdown)
  kg1Male: enrollmentFieldSchema, kg1Female: enrollmentFieldSchema,
  kg2Male: enrollmentFieldSchema, kg2Female: enrollmentFieldSchema,
  eccdMale: enrollmentFieldSchema, eccdFemale: enrollmentFieldSchema,
  nursery1Male: enrollmentFieldSchema, nursery1Female: enrollmentFieldSchema,
  nursery2Male: enrollmentFieldSchema, nursery2Female: enrollmentFieldSchema,
  primary1Male: enrollmentFieldSchema, primary1Female: enrollmentFieldSchema,
  primary2Male: enrollmentFieldSchema, primary2Female: enrollmentFieldSchema,
  primary3Male: enrollmentFieldSchema, primary3Female: enrollmentFieldSchema,
  primary4Male: enrollmentFieldSchema, primary4Female: enrollmentFieldSchema,
  primary5Male: enrollmentFieldSchema, primary5Female: enrollmentFieldSchema,
  primary6Male: enrollmentFieldSchema, primary6Female: enrollmentFieldSchema,
  jss1Male: enrollmentFieldSchema, jss1Female: enrollmentFieldSchema,
  jss2Male: enrollmentFieldSchema, jss2Female: enrollmentFieldSchema,
  jss3Male: enrollmentFieldSchema, jss3Female: enrollmentFieldSchema,
  ss1Male: enrollmentFieldSchema, ss1Female: enrollmentFieldSchema,
  ss2Male: enrollmentFieldSchema, ss2Female: enrollmentFieldSchema,
  ss3Male: enrollmentFieldSchema, ss3Female: enrollmentFieldSchema,
});

type Step2FormData = z.infer<typeof step2Schema> & { lga?: NasarawaLga };

interface Step2SchoolInfoProps {
  initialData?: Partial<Step2FormData>;
  onSubmit: (data: Step2FormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const Step2SchoolInfo: React.FC<Step2SchoolInfoProps> = ({
  initialData,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const [showDetailedEnrollment, setShowDetailedEnrollment] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [aiScannerOpen, setAiScannerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      categoryOfSchool: 'Private',
      typeOfSchool: 'Conventional',
      ownership: 'Individual(s)',
    }
  });

  const lgaValue = watch('lga');
  const typeOfSchoolValue = watch('typeOfSchool');
  const ownershipValue = watch('ownership');
  const nnsuceTimesWrittenValue = watch('nnsuceTimesWritten');

  type EnrollmentFieldKey = Extract<keyof Step2FormData, `${string}Male` | `${string}Female`>;

  // Function to auto-detect browser GPS coordinates
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('gpsLatitude', Number(position.coords.latitude.toFixed(6)));
        setValue('gpsLongitude', Number(position.coords.longitude.toFixed(6)));
        toast.success('School GPS location detected successfully!');
        setLocatingGps(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        toast.info('Could not auto-detect location. You can enter it manually or skip.');
        setLocatingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Helper to create an enrollment input row
  const EnrollmentInput = ({ level, label }: { level: string; label: string }) => {
    const maleField = `${level}Male` as EnrollmentFieldKey;
    const femaleField = `${level}Female` as EnrollmentFieldKey;

    return (
      <div className="grid grid-cols-3 gap-2 items-center py-2 border-b border-slate-100 last:border-b-0">
        <Label className="font-medium text-xs text-slate-700 truncate">{label}</Label>
        <Input
          type="number"
          {...register(maleField, { valueAsNumber: true })}
          min="0"
          placeholder="0"
          className="text-center text-xs h-8"
        />
        <Input
          type="number"
          {...register(femaleField, { valueAsNumber: true })}
          min="0"
          placeholder="0"
          className="text-center text-xs h-8"
        />
      </div>
    );
  };

  const handleApplyAiData = (data: any) => {
    if (data.schoolName) setValue('schoolName', data.schoolName, { shouldValidate: true });
    if (data.schoolAddress) setValue('address', data.schoolAddress, { shouldValidate: true });
    if (data.lga && NASARAWA_LGAS.includes(data.lga as NasarawaLga)) {
      setValue('lga', data.lga as NasarawaLga, { shouldValidate: true });
    }
    if (data.cacNumber) setValue('cacNumber', data.cacNumber);
    if (data.yearOfEstablishment) setValue('yearOfEstablishment', Number(data.yearOfEstablishment));
    if (data.yearOfApproval) setValue('yearOfApproval', Number(data.yearOfApproval));
    if (data.typeOfSchool) setValue('typeOfSchool', data.typeOfSchool as any);
    if (data.categoryOfSchool) setValue('categoryOfSchool', data.categoryOfSchool);
    if (data.ownership) setValue('ownership', data.ownership as any);
    if (data.totalEnrollment) setValue('totalEnrollment', Number(data.totalEnrollment));
    if (data.nnsuceTimesWritten) setValue('nnsuceTimesWritten', String(data.nnsuceTimesWritten));
    if (data.nnsuce2025PupilsCount || data.nnsucePupilsCount) {
      setValue('nnsucePupilsCount', Number(data.nnsuce2025PupilsCount || data.nnsucePupilsCount));
    }
    toast.success("School details auto-filled from scanned document!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-1">
      {/* AI Fast-Track Document Capture Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Smart School Document Scanner
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Fast Auto-Fill</span>
            </h4>
            <p className="text-xs text-slate-600">Scan your school's approval letter or CAC document to auto-fill identity and category data.</p>
          </div>
        </div>
        <Button 
          type="button" 
          onClick={() => setAiScannerOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Scan School Document
        </Button>
      </div>

      <AiDocumentScannerModal
        open={aiScannerOpen}
        onOpenChange={setAiScannerOpen}
        onApplyData={handleApplyAiData}
      />

      {/* 1. Primary School Identification */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" />
            School Identity & Location
          </h3>
          <p className="text-xs text-slate-500">Provide official details of the institution</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="schoolName" className="text-sm font-medium">
              Official School Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolName"
              {...register('schoolName')}
              placeholder="e.g. Model Science Academy, Sunnah International School"
              className={errors.schoolName ? 'border-red-500 focus-visible:ring-red-500 h-11' : 'h-11'}
            />
            {errors.schoolName && (
              <p className="text-xs text-red-500">{errors.schoolName.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className="text-sm font-medium">
              School Physical Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Street name, landmark, town/village"
              className={errors.address ? 'border-red-500 focus-visible:ring-red-500 h-11' : 'h-11'}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Local Government Area (LGA) <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('lga', value as NasarawaLga, { shouldDirty: true, shouldValidate: true })}
              value={lgaValue ?? undefined}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {NASARAWA_LGAS.map((lga) => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aeqeoZone" className="text-sm font-medium">
              AEQEO Educational Zone <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="aeqeoZone"
              {...register('aeqeoZone')}
              placeholder="e.g. Zone A, Western Zone"
              className="h-11"
            />
          </div>
        </div>

        {/* GPS Quick Capture Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">School GPS Location</p>
              <p className="text-xs text-slate-500">Auto-tag school coordinates for ministry GIS verification</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoDetectLocation}
            disabled={locatingGps}
            className="shrink-0 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            {locatingGps ? 'Detecting...' : '📍 Use My Location'}
          </Button>
        </div>
      </div>

      {/* 2. Institutional Type & Ownership */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-lg font-bold text-slate-900">Classification & Approvals</h3>
          <p className="text-xs text-slate-500">School status and establishment records</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Type of School</Label>
            <Select
              onValueChange={(value) => setValue('typeOfSchool', value as Step2FormData['typeOfSchool'])}
              value={typeOfSchoolValue ?? 'Conventional'}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conventional">Conventional</SelectItem>
                <SelectItem value="Faith Based">Faith Based</SelectItem>
                <SelectItem value="Islamiyah Integrated">Islamiyah Integrated</SelectItem>
                <SelectItem value="Secular">Secular</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Ownership Structure</Label>
            <Select
              onValueChange={(value) => setValue('ownership', value as Step2FormData['ownership'])}
              value={ownershipValue ?? 'Individual(s)'}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual(s)">Individual(s) / Proprietor</SelectItem>
                <SelectItem value="Sole">Sole Proprietorship</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Corporate">Corporate / Limited Company</SelectItem>
                <SelectItem value="Community">Community Owned</SelectItem>
                <SelectItem value="Religious Organization">Religious Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearOfEstablishment" className="text-sm font-medium">
              Year of Establishment <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="yearOfEstablishment"
              type="number"
              {...register('yearOfEstablishment', { valueAsNumber: true })}
              placeholder="e.g. 2012"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearOfApproval" className="text-sm font-medium">
              Ministry Approval Year <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="yearOfApproval"
              type="number"
              {...register('yearOfApproval', { valueAsNumber: true })}
              placeholder="e.g. 2015"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cacNumber" className="text-sm font-medium">
              CAC Registration / RC Number <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="cacNumber"
              {...register('cacNumber')}
              placeholder="e.g. RC 145920 or BN 284910"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Previous NNSUCE Participation</Label>
            <Select
              onValueChange={(value) => setValue('nnsuceTimesWritten', value)}
              value={nnsuceTimesWrittenValue ?? 'Never'}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select participation history" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Never">Never (First Time)</SelectItem>
                <SelectItem value="1 time">1 Time</SelectItem>
                <SelectItem value="2 times">2 Times</SelectItem>
                <SelectItem value="3+ times">3 or More Times</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nnsucePupilsCount" className="text-sm font-medium">
              Last Exam Candidates Presented <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="nnsucePupilsCount"
              type="number"
              {...register('nnsucePupilsCount', { valueAsNumber: true })}
              placeholder="e.g. 45 pupils"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* 3. Streamlined Student Enrollment */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Student Enrollment
            </h3>
            <p className="text-xs text-slate-500">Provide the total student capacity of your school</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="totalEnrollment" className="text-base font-bold text-slate-900">
              Total Student Population <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalEnrollment"
              type="number"
              {...register('totalEnrollment', { valueAsNumber: true })}
              placeholder="e.g. 350"
              className="h-12 text-lg font-bold bg-white"
            />
            <p className="text-xs text-slate-500">Total boys and girls across all classes</p>
          </div>

          {/* Optional Class-by-Class Breakdown Toggle */}
          <div className="mt-4 pt-4 border-t border-emerald-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedEnrollment(!showDetailedEnrollment)}
              className="text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 flex items-center gap-1.5 p-0"
            >
              {showDetailedEnrollment ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide class-by-class grade breakdown
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  + Provide detailed class-by-class grade breakdown (Optional)
                </>
              )}
            </Button>

            {showDetailedEnrollment && (
              <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-500 border-b pb-2">
                  <span>Class Level</span>
                  <span className="text-center">Boys</span>
                  <span className="text-center">Girls</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600 uppercase pt-1">Early Years</p>
                  <EnrollmentInput level="kg1" label="KG 1" />
                  <EnrollmentInput level="kg2" label="KG 2" />
                  <EnrollmentInput level="nursery1" label="Nursery 1" />
                  <EnrollmentInput level="nursery2" label="Nursery 2" />
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-xs font-bold text-slate-600 uppercase pt-1">Primary School</p>
                  <EnrollmentInput level="primary1" label="Primary 1" />
                  <EnrollmentInput level="primary2" label="Primary 2" />
                  <EnrollmentInput level="primary3" label="Primary 3" />
                  <EnrollmentInput level="primary4" label="Primary 4" />
                  <EnrollmentInput level="primary5" label="Primary 5" />
                  <EnrollmentInput level="primary6" label="Primary 6" />
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-xs font-bold text-slate-600 uppercase pt-1">Secondary School</p>
                  <EnrollmentInput level="jss1" label="JSS 1" />
                  <EnrollmentInput level="jss2" label="JSS 2" />
                  <EnrollmentInput level="jss3" label="JSS 3" />
                  <EnrollmentInput level="ss1" label="SS 1" />
                  <EnrollmentInput level="ss2" label="SS 2" />
                  <EnrollmentInput level="ss3" label="SS 3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Document / Certificate Evidence (Optional) */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-lg font-bold text-slate-900">Registration Document (Optional)</h3>
          <p className="text-xs text-slate-500">Upload approval letter, CAC document, or school certificate if available</p>
        </div>

        <CameraCapture
          label="Approval / Certificate Photograph"
          value={watch('registrationEvidencePhoto') || ''}
          onChange={(value) => setValue('registrationEvidencePhoto', value || '')}
          maxSizeMB={5}
          folder="napps/proprietors/documents"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="w-full sm:w-auto order-2 sm:order-1 h-12"
        >
          ← Back to Personal Info
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full sm:w-auto min-w-[220px] order-1 sm:order-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md text-base"
        >
          {isSubmitting ? '⏳ Saving School Details...' : 'Continue to Dues & Verification →'}
        </Button>
      </div>
    </form>
  );
};

export default Step2SchoolInfo;
