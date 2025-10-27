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
import { NAPPS_CHAPTERS } from '@/lib/constants/chapters';

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
  chapters: z.array(z.enum(NAPPS_CHAPTERS)).optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
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
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">NAPPS Chapters</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Select the NAPPS chapters you belong to (optional)</p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Available Chapters</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border">
            {NAPPS_CHAPTERS.map((chapter) => (
              <div key={chapter} className="flex items-center space-x-2">
                <Checkbox
                  id={`chapter-${chapter}`}
                  {...register('chapters')}
                  value={chapter}
                />
                <Label 
                  htmlFor={`chapter-${chapter}`} 
                  className="text-sm cursor-pointer"
                >
                  {chapter}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            You can select multiple chapters. These can be updated later by an administrator.
          </p>
        </div>
      </div>

      {/* NAPPS Participation */
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">NAPPS Participation</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Optional: Tell us about your NAPPS involvement</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nappsRegistered" className="text-sm font-medium">NAPPS Registration Status</Label>
          <Select
            onValueChange={(value) => setValue('nappsRegistered', value as 'Not Registered' | 'Registered' | 'Registered with Certificate')}
            defaultValue={initialData?.nappsRegistered || 'Not Registered'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select registration status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Registered">Not Registered</SelectItem>
              <SelectItem value="Registered">Registered</SelectItem>
              <SelectItem value="Registered with Certificate">Registered with Certificate</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Select your current NAPPS registration status</p>
        </div>

        {nappsRegistered !== 'Not Registered' && (
          <div className="space-y-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-700 font-medium">📋 Additional Information Required</p>
            
            <div className="space-y-1.5">
              <Label htmlFor="participationHistory" className="text-sm font-medium">Participation History</Label>
              <Card className="p-4">
                <div className="space-y-4">
                  {['National', 'State', 'Zonal'].map((level) => (
                    <div key={level}>
                      <h5 className="font-medium mb-2 text-sm">{level} Level</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['2022/2023', '2023/2024', '2024/2025', '2025/2026'].map((year) => {
                          const key = `${level}-${year}`;
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox
                                id={key}
                                checked={participation[key] || false}
                                onCheckedChange={(checked) => {
                                  setParticipation(prev => ({
                                    ...prev,
                                    [key]: checked === true
                                  }));
                                }}
                              />
                              <label
                                htmlFor={key}
                                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {year}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <p className="text-xs text-muted-foreground mt-1">
                Select the academic years and levels where your school participated in NAPPS examinations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="timesParticipated" className="text-sm font-medium">Times Participated in NAPPS Exam</Label>
                <Input
                  id="timesParticipated"
                  type="number"
                  {...register('timesParticipated', { valueAsNumber: true })}
                  min="0"
                  placeholder="0"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Total number of times</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pupilsPresentedLastExam" className="text-sm font-medium">Pupils Presented (Last Exam)</Label>
                <Input
                  id="pupilsPresentedLastExam"
                  type="number"
                  {...register('pupilsPresentedLastExam', { valueAsNumber: true })}
                  min="0"
                  placeholder="0"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Number of pupils in last exam</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="awards" className="text-sm font-medium">Awards from NAPPS</Label>
              <Textarea
                id="awards"
                {...register('awards')}
                placeholder="List any awards or recognitions received from NAPPS"
                rows={3}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Include year and award name</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="positionHeld" className="text-sm font-medium">Position Held at NAPPS</Label>
              <Input
                id="positionHeld"
                {...register('positionHeld')}
                placeholder="E.g., Zonal Chairman, State Secretary"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Current or previous position</p>
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
