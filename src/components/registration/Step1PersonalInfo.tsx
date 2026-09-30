import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { CameraCapture } from '@/components/ui/camera-capture';
import { NASARAWA_LGAS, NasarawaLga } from '@/lib/nasarawaLgas';
import { NAPPS_CHAPTERS } from '@/constants/napps-chapters';
import { Sparkles } from 'lucide-react';
import { AiDocumentScannerModal } from './AiDocumentScannerModal';

const step1Schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name is required'),
  lga: z
    .string({ required_error: 'Local Government Area is required' })
    .min(1, 'Local Government Area is required')
    .refine((value) => NASARAWA_LGAS.includes(value as NasarawaLga), {
      message: 'Select a valid LGA',
    }),
  sex: z.enum(['Male', 'Female'], { required_error: 'Please select your gender' }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  chapters: z.array(z.string()).optional().default([]),
  passportPhoto: z.string().optional(),
  nappsRegistered: z.enum(['Not Registered', 'Registered', 'Registered with Certificate']).optional(),
  participationHistory: z.union([z.string(), z.array(z.string())]).optional(),
  timesParticipated: z.number().min(0).optional(),
  pupilsPresentedLastExam: z.number().min(0).optional(),
  awards: z.string().optional(),
  positionHeld: z.string().optional(),
});

type Step1FormData = z.infer<typeof step1Schema> & { lga: NasarawaLga };

interface Step1PersonalInfoProps {
  initialData?: Partial<Step1FormData>;
  onSubmit: (data: Step1FormData) => void;
  isSubmitting: boolean;
}

const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  // Parse existing participation history (handles both string and array formats)
  const parseParticipationHistory = (history?: string | string[]) => {
    const participation: Record<string, boolean> = {};
    if (!history) return participation;
    
    // Convert to string if array
    const historyString = Array.isArray(history) ? history.join(' | ') : history;
    
    const entries = historyString.split('|').map(e => e.trim());
    entries.forEach(entry => {
      const [level, years] = entry.split(':').map(s => s.trim());
      if (level && years) {
        const yearsList = years.split(',').map(y => y.trim());
        yearsList.forEach(year => {
          const key = `${level}-${year}`;
          participation[key] = true;
        });
      }
    });
    return participation;
  };

  const [participation, setParticipation] = useState<Record<string, boolean>>(
    parseParticipationHistory(initialData?.participationHistory as string | string[] | undefined)
  );

  const [aiScannerOpen, setAiScannerOpen] = useState(false);

  const handleApplyAiData = (extracted: any) => {
    if (extracted.firstName) setValue('firstName', extracted.firstName);
    if (extracted.middleName) setValue('middleName', extracted.middleName);
    if (extracted.lastName) setValue('lastName', extracted.lastName);
    if (extracted.email) setValue('email', extracted.email);
    if (extracted.phone) setValue('phone', extracted.phone);
    if (extracted.lga && NASARAWA_LGAS.includes(extracted.lga as NasarawaLga)) {
      setValue('lga', extracted.lga as NasarawaLga);
    }
    if (extracted.nappsRegistered) {
      setValue('nappsRegistered', extracted.nappsRegistered);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    getValues
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      chapters: [],
      nappsRegistered: 'Not Registered',
      timesParticipated: 0,
      pupilsPresentedLastExam: 0
    }
  });

  const nappsRegistered = watch('nappsRegistered');

  const handleFormSubmit = (data: Step1FormData) => {
    // Convert participation checkboxes to string format
    const participationByLevel: Record<string, string[]> = {
      'National': [],
      'State': [],
      'Zonal': [],
    };

    Object.entries(participation).forEach(([key, isChecked]) => {
      if (isChecked) {
        const [level, year] = key.split('-');
        if (participationByLevel[level]) {
          participationByLevel[level].push(year);
        }
      }
    });

    const participationHistory = Object.entries(participationByLevel)
      .filter(([_, years]) => years.length > 0)
      .map(([level, years]) => `${level}: ${years.join(', ')}`)
      .join(' | ');

    // Convert participationHistory string to array format for backend
    const participationHistoryArray = participationHistory 
      ? participationHistory.split(' | ').filter(entry => entry.trim())
      : [];

    // Submit with formatted participation history as array
    onSubmit({
      ...data,
      participationHistory: participationHistoryArray.length > 0 ? participationHistoryArray : undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 px-1">
      {/* AI Fast-Track Document Capture Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Smart Document Scanner &amp; Auto-Fill
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">New Feature</span>
            </h4>
            <p className="text-xs text-slate-600">Scan your membership slip or approval letter to auto-populate your details in seconds.</p>
          </div>
        </div>
        <Button 
          type="button" 
          onClick={() => setAiScannerOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Scan Document
        </Button>
      </div>

      <AiDocumentScannerModal
        open={aiScannerOpen}
        onOpenChange={setAiScannerOpen}
        onApplyData={handleApplyAiData}
      />

      {/* Basic Personal Information */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Basic Information</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Fields marked with * are required</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Enter first name"
              className={errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.firstName.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="middleName" className="text-sm font-medium">
              Middle Name <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="middleName"
              {...register('middleName')}
              placeholder="Enter middle name"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Enter last name"
              className={errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.lastName.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            onValueChange={(value) => setValue('sex', value as 'Male' | 'Female')}
            defaultValue={initialData?.sex}
            className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer text-sm">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer text-sm">Female</Label>
            </div>
          </RadioGroup>
          {errors.sex && (
            <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">⚠</span>
              <span>{errors.sex.message}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your.email@example.com"
              className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.email.message}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">We'll use this to contact you</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+2348012345678"
              className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.phone.message}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +234)</p>
          </div>
          <Controller
            name="lga"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">
                  Local Government Area <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={errors.lga ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  >
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
                {errors.lga ? (
                  <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <span>{errors.lga.message}</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Select your LGA within Nasarawa State</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Passport Photo Section */}
        <div className="space-y-1.5">
          <Controller
            name="passportPhoto"
            control={control}
            render={({ field }) => (
              <CameraCapture
                label="Passport Photograph"
                value={field.value}
                onChange={field.onChange}
                maxSizeMB={5}
                folder="napps/proprietors/passports"
                error={errors.passportPhoto?.message}
              />
            )}
          />
          <p className="text-xs text-muted-foreground">
            Take a clear photo of yourself or upload from gallery
          </p>
        </div>
      </div>

      {/* Chapters Assignment */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">NAPPS Chapter</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Select the NAPPS chapter you belong to. If unsure, select &quot;General / Unassigned&quot;.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Assigned Chapter</Label>
          <Controller
            name="chapters"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value ? [value] : [])}
                value={field.value && field.value.length > 0 ? field.value[0] : ''}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select chapter (or General / Unassigned)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General / Unassigned">General / Unassigned (Can be set later)</SelectItem>
                  {NAPPS_CHAPTERS.map((chapter) => (
                    <SelectItem key={chapter} value={chapter}>
                      {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.chapters && (
            <p className="text-xs text-red-500 mt-1">{errors.chapters.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your LGA and Zonal executives can also update your chapter affiliation anytime.
          </p>
        </div>
      </div>

      {/* NAPPS Participation */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">NAPPS Membership &amp; Activities</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Optional: Tell us about your prior NAPPS involvement</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nappsRegistered" className="text-sm font-medium">Prior Registration Status</Label>
          <Select
            onValueChange={(value) => setValue('nappsRegistered', value as 'Not Registered' | 'Registered' | 'Registered with Certificate')}
            defaultValue={initialData?.nappsRegistered || 'Not Registered'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select registration status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Registered">Not Registered / First-Time Applicant</SelectItem>
              <SelectItem value="Registered">Previously Registered with NAPPS</SelectItem>
              <SelectItem value="Registered with Certificate">Registered with Certificate</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Select your existing status with the association</p>
        </div>

        {nappsRegistered !== 'Not Registered' && (
          <div className="space-y-5 p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-emerald-800 font-semibold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                Prior Examination &amp; Event Participation (Optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-slate-700">Participation by Level &amp; Academic Session</Label>
              <Card className="p-4 bg-white border-slate-200">
                <div className="space-y-4 divide-y divide-slate-100">
                  {['National', 'State', 'Zonal'].map((level) => (
                    <div key={level} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">{level} Level</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {['2022/2023', '2023/2024', '2024/2025', '2025/2026'].map((year) => {
                          const key = `${level}-${year}`;
                          const isChecked = participation[key] || false;
                          return (
                            <label
                              key={key}
                              htmlFor={key}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                                  : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                              }`}
                            >
                              <Checkbox
                                id={key}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  setParticipation(prev => ({
                                    ...prev,
                                    [key]: checked === true
                                  }));
                                }}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <span className="select-none">{year}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <p className="text-xs text-muted-foreground mt-1">
                Tick the sessions your pupils sat for unified exams or state/zonal events.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="timesParticipated" className="text-xs sm:text-sm font-medium">Times Participated in NAPPS Exam</Label>
                <Input
                  id="timesParticipated"
                  type="number"
                  {...register('timesParticipated', { valueAsNumber: true })}
                  min="0"
                  placeholder="e.g. 3"
                  className="w-full bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pupilsPresentedLastExam" className="text-xs sm:text-sm font-medium">Pupils Presented (Last Exam)</Label>
                <Input
                  id="pupilsPresentedLastExam"
                  type="number"
                  {...register('pupilsPresentedLastExam', { valueAsNumber: true })}
                  min="0"
                  placeholder="e.g. 45"
                  className="w-full bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="positionHeld" className="text-xs sm:text-sm font-medium">Position Held in NAPPS (if any)</Label>
                <Input
                  id="positionHeld"
                  {...register('positionHeld')}
                  placeholder="e.g., LGA Secretary, Member"
                  className="w-full bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="awards" className="text-xs sm:text-sm font-medium">Awards / Recognitions (if any)</Label>
                <Input
                  id="awards"
                  {...register('awards')}
                  placeholder="e.g. 2024 Best STEM School Award"
                  className="w-full bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Your progress will be saved automatically
        </p>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full sm:w-auto min-w-[200px] text-sm sm:text-base"
        >
          {isSubmitting ? '⏳ Saving...' : 'Next: School Information →'}
        </Button>
      </div>
    </form>
  );
};

export default Step1PersonalInfo;
