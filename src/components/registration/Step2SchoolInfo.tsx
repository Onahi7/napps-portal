import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraCapture } from '@/components/ui/camera-capture';
import { NASARAWA_LGAS, NasarawaLga } from '@/lib/nasarawaLgas';

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
  registrationEvidence: z.string().optional(),
  registrationEvidencePhoto: z.string().optional(),
  
  // All enrollment fields
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

const Step2SchoolInfo: React.FC<Step2SchoolInfoProps> = ({
  initialData,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {}
  });

  const [enrollmentTotals, setEnrollmentTotals] = useState({ male: 0, female: 0, total: 0 });
  const lgaValue = watch('lga');
  const typeOfSchoolValue = watch('typeOfSchool');
  const ownershipValue = watch('ownership');

  type EnrollmentFieldKey = Extract<keyof Step2FormData, `${string}Male` | `${string}Female`>;

  // Helper to create enrollment input group
  const EnrollmentInput = ({ level, label }: { level: string; label: string }) => {
    const maleField = `${level}Male` as EnrollmentFieldKey;
    const femaleField = `${level}Female` as EnrollmentFieldKey;

    return (
      <div className="grid grid-cols-3 gap-2 items-center py-2 border-b last:border-b-0">
        <Label className="font-medium text-xs sm:text-sm truncate">{label}</Label>
        <Input
          type="number"
          {...register(maleField, { valueAsNumber: true })}
          min="0"
          placeholder="0"
          className="text-center text-xs sm:text-sm h-9"
        />
        <Input
          type="number"
          {...register(femaleField, { valueAsNumber: true })}
          min="0"
          placeholder="0"
          className="text-center text-xs sm:text-sm h-9"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-1">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="basic" className="text-xs sm:text-sm py-2">Basic Info</TabsTrigger>
          <TabsTrigger value="location" className="text-xs sm:text-sm py-2">Location & GPS</TabsTrigger>
          <TabsTrigger value="enrollment" className="text-xs sm:text-sm py-2">Enrollment</TabsTrigger>
        </TabsList>

        {/* Basic School Information */}
        <TabsContent value="basic" className="space-y-4 mt-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">School Details</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Fields marked with * are required</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName" className="text-sm font-medium">
                School Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schoolName"
                {...register('schoolName')}
                placeholder="Enter school name"
                className={errors.schoolName ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.schoolName && (
                <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <span>{errors.schoolName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schoolName2" className="text-sm font-medium">
                Alternative School Name <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                id="schoolName2"
                {...register('schoolName2')}
                placeholder="E.g., annex or branch name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium">
              School Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Enter complete address"
              className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.address && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{errors.address.message}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">Include street, area, and landmarks</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine2" className="text-sm font-medium">
              Address Line 2 <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="Additional address details"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="typeOfSchool" className="text-sm font-medium">Type of School</Label>
              <Select
                onValueChange={(value) => setValue('typeOfSchool', value as Step2FormData['typeOfSchool'], { shouldDirty: true, shouldValidate: true })}
                value={typeOfSchoolValue ?? undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faith Based">Faith Based</SelectItem>
                  <SelectItem value="Conventional">Conventional</SelectItem>
                  <SelectItem value="Islamiyah Integrated">Islamiyah Integrated</SelectItem>
                  <SelectItem value="Secular">Secular</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the school's educational philosophy</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ownership" className="text-sm font-medium">Ownership</Label>
              <Select
                onValueChange={(value) => setValue('ownership', value as Step2FormData['ownership'], { shouldDirty: true, shouldValidate: true })}
                value={ownershipValue ?? undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual(s)">Individual(s)</SelectItem>
                  <SelectItem value="Sole">Sole</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Religious Organization">Religious Organization</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Who owns/operates the school</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="yearOfEstablishment" className="text-sm font-medium">Year of Establishment</Label>
              <Input
                id="yearOfEstablishment"
                type="number"
                {...register('yearOfEstablishment', { valueAsNumber: true })}
                min="1900"
                max="2100"
                placeholder="YYYY"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">When was the school founded</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="yearOfApproval" className="text-sm font-medium">Year of Approval</Label>
              <Input
                id="yearOfApproval"
                type="number"
                {...register('yearOfApproval', { valueAsNumber: true })}
                min="1900"
                max="2100"
                placeholder="YYYY"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">When was approval granted</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="registrationEvidence" className="text-sm font-medium">Registration Evidence</Label>
            <Input
              id="registrationEvidence"
              {...register('registrationEvidence')}
              placeholder="E.g., Certificate Number or Document Reference"
            />
            <p className="text-xs text-muted-foreground">Approval or registration document details</p>
          </div>

          {/* Registration Evidence Photo */}
          <div className="space-y-1.5">
            <CameraCapture
              label="Registration/Approval Document Photo"
              value={watch('registrationEvidencePhoto') || ''}
              onChange={(value) => setValue('registrationEvidencePhoto', value || '')}
              maxSizeMB={5}
              folder="napps/proprietors/documents"
            />
            <p className="text-xs text-muted-foreground">
              Take a photo of your registration or approval certificate
            </p>
          </div>
        </TabsContent>

        {/* Location & GPS */}
        <TabsContent value="location" className="space-y-4 mt-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Location Information</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Help us locate your school accurately</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Local Government Area (LGA)</Label>
              <Select
                onValueChange={(value) => setValue('lga', value as NasarawaLga, { shouldDirty: true, shouldValidate: true })}
                value={lgaValue ?? undefined}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={errors.lga ? 'w-full border-red-500 focus-visible:ring-red-500' : 'w-full'}
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
                <p className="text-xs text-muted-foreground">Which LGA is the school located in</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="aeqeoZone" className="text-sm font-medium">AEQEO Zone</Label>
              <Input
                id="aeqeoZone"
                {...register('aeqeoZone')}
                placeholder="Enter zone"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Educational zone designation</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-blue-600 text-lg">📍</span>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">GPS Coordinates</h4>
                <p className="text-xs text-blue-700 mt-0.5">Optional: Provide exact location coordinates</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gpsLatitude" className="text-sm font-medium">GPS Latitude</Label>
                <Input
                  id="gpsLatitude"
                  type="number"
                  step="0.0000001"
                  {...register('gpsLatitude', { valueAsNumber: true })}
                  placeholder="9.4567890"
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Example: 9.4567890</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gpsLongitude" className="text-sm font-medium">GPS Longitude</Label>
                <Input
                  id="gpsLongitude"
                  type="number"
                  step="0.0000001"
                  {...register('gpsLongitude', { valueAsNumber: true })}
                  placeholder="8.5123456"
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Example: 8.5123456</p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
              💡 <strong>Tip:</strong> You can find GPS coordinates using Google Maps by right-clicking on your location
            </div>
          </div>
        </TabsContent>

        {/* Enrollment Data */}
        <TabsContent value="enrollment" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Student Enrollment by Grade and Gender</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter the number of students in each grade level. All fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-2 items-center font-semibold text-xs sm:text-sm pb-2 border-b-2">
                <div className="text-left">Grade Level</div>
                <div className="text-center">Male</div>
                <div className="text-center">Female</div>
              </div>

              {/* Kindergarten */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Kindergarten</h4>
                <EnrollmentInput level="kg1" label="KG 1" />
                <EnrollmentInput level="kg2" label="KG 2" />
                <EnrollmentInput level="eccd" label="ECCD" />
              </div>

              {/* Nursery */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Nursery</h4>
                <EnrollmentInput level="nursery1" label="Nursery 1" />
                <EnrollmentInput level="nursery2" label="Nursery 2" />
              </div>

              {/* Primary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Primary</h4>
                <EnrollmentInput level="primary1" label="Primary 1" />
                <EnrollmentInput level="primary2" label="Primary 2" />
                <EnrollmentInput level="primary3" label="Primary 3" />
                <EnrollmentInput level="primary4" label="Primary 4" />
                <EnrollmentInput level="primary5" label="Primary 5" />
                <EnrollmentInput level="primary6" label="Primary 6" />
              </div>

              {/* Junior Secondary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Junior Secondary (JSS)</h4>
                <EnrollmentInput level="jss1" label="JSS 1" />
                <EnrollmentInput level="jss2" label="JSS 2" />
                <EnrollmentInput level="jss3" label="JSS 3" />
              </div>

              {/* Senior Secondary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Senior Secondary (SS)</h4>
                <EnrollmentInput level="ss1" label="SS 1" />
                <EnrollmentInput level="ss2" label="SS 2" />
                <EnrollmentInput level="ss3" label="SS 3" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          ← Back
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full sm:w-auto min-w-[200px] order-1 sm:order-2 text-sm sm:text-base"
        >
          {isSubmitting ? '⏳ Saving...' : 'Next: Payment & Verification →'}
        </Button>
      </div>
    </form>
  );
};

export default Step2SchoolInfo;
