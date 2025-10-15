import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const enrollmentFieldSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  })
  .refine((val) => val === undefined || val >= 0, {
    message: "Cannot be negative",
  });

const editRecordSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  sex: z.enum(["Male", "Female"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  
  // NAPPS Information
  nappsRegistered: z.string().optional(),
  participationHistory: z.string().optional(),
  pupilsPresentedLastExam: z.number().min(0).optional(),
  awards: z.string().optional(),
  positionHeld: z.string().optional(),
  
  // School Information
  schoolName: z.string().min(3, "School name is required"),
  schoolName2: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  lga: z.string().optional(),
  aeqeoZone: z.string().optional(),
  gpsLongitude: z.union([z.string(), z.number()]).optional(),
  gpsLatitude: z.union([z.string(), z.number()]).optional(),
  typeOfSchool: z.string().optional(),
  categoryOfSchool: z.string().optional(),
  ownership: z.string().optional(),
  yearOfEstablishment: z.union([z.string(), z.number()]).optional(),
  yearOfApproval: z.union([z.string(), z.number()]).optional(),
  registrationStatus: z.string().optional(),
  approvalStatus: z.string().optional(),
  
  // Enrollment data
  kg1Male: enrollmentFieldSchema,
  kg1Female: enrollmentFieldSchema,
  kg2Male: enrollmentFieldSchema,
  kg2Female: enrollmentFieldSchema,
  eccdMale: enrollmentFieldSchema,
  eccdFemale: enrollmentFieldSchema,
  nursery1Male: enrollmentFieldSchema,
  nursery1Female: enrollmentFieldSchema,
  nursery2Male: enrollmentFieldSchema,
  nursery2Female: enrollmentFieldSchema,
  nursery3Male: enrollmentFieldSchema,
  nursery3Female: enrollmentFieldSchema,
  primary1Male: enrollmentFieldSchema,
  primary1Female: enrollmentFieldSchema,
  primary2Male: enrollmentFieldSchema,
  primary2Female: enrollmentFieldSchema,
  primary3Male: enrollmentFieldSchema,
  primary3Female: enrollmentFieldSchema,
  primary4Male: enrollmentFieldSchema,
  primary4Female: enrollmentFieldSchema,
  primary5Male: enrollmentFieldSchema,
  primary5Female: enrollmentFieldSchema,
  primary6Male: enrollmentFieldSchema,
  primary6Female: enrollmentFieldSchema,
  jss1Male: enrollmentFieldSchema,
  jss1Female: enrollmentFieldSchema,
  jss2Male: enrollmentFieldSchema,
  jss2Female: enrollmentFieldSchema,
  jss3Male: enrollmentFieldSchema,
  jss3Female: enrollmentFieldSchema,
  ss1Male: enrollmentFieldSchema,
  ss1Female: enrollmentFieldSchema,
  ss2Male: enrollmentFieldSchema,
  ss2Female: enrollmentFieldSchema,
  ss3Male: enrollmentFieldSchema,
  ss3Female: enrollmentFieldSchema,
});

type EditRecordFormData = z.infer<typeof editRecordSchema>;

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ProprietorRecord;
  onSuccess: () => void;
}

interface ProprietorRecord {
  name: string;
  sex: 'Male' | 'Female';
  email: string;
  phone: string;
  submissionId: string;
  nappsRegistered?: string;
  participationHistory?: string;
  pupilsPresented2023?: number;
  awards?: string;
  positionHeld?: string;
  schoolName: string;
  schoolName2?: string;
  address: string;
  gpsLongitude?: string;
  gpsLatitude?: string;
  typeOfSchool?: string;
  categoryOfSchool?: string;
  ownership?: string;
  yearOfEstablishment?: string;
  yearOfApproval?: string;
  registrationStatus?: string;
  approvalStatus?: string;
  enrollment?: Record<string, number>;
}

export const EditRecordDialog = ({ open, onOpenChange, record, onSuccess }: EditRecordDialogProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
  const [loading, setLoading] = useState(false);

  // Parse existing participation history
  const parseParticipationHistory = (historyString?: string) => {
    const participation: Record<string, boolean> = {};
    if (!historyString) return participation;
    
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
    parseParticipationHistory(record.participationHistory)
  );

  // Split name into parts
  const nameParts = record.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";
  const middleName = nameParts.slice(1, -1).join(" ") || "";

  // Safely parse enrollment data - convert numbers to strings for form inputs
  const parseEnrollmentData = (enrollment?: Record<string, number>) => {
    const enrollmentFields = [
      'kg1Male', 'kg1Female', 'kg2Male', 'kg2Female', 'eccdMale', 'eccdFemale',
      'nursery1Male', 'nursery1Female', 'nursery2Male', 'nursery2Female',
      'nursery3Male', 'nursery3Female',
      'primary1Male', 'primary1Female', 'primary2Male', 'primary2Female',
      'primary3Male', 'primary3Female', 'primary4Male', 'primary4Female',
      'primary5Male', 'primary5Female', 'primary6Male', 'primary6Female',
      'jss1Male', 'jss1Female', 'jss2Male', 'jss2Female', 'jss3Male', 'jss3Female',
      'ss1Male', 'ss1Female', 'ss2Male', 'ss2Female', 'ss3Male', 'ss3Female',
    ];
    
    const parsed: Record<string, string> = {};
    enrollmentFields.forEach(field => {
      if (enrollment && enrollment[field] !== null && enrollment[field] !== undefined && !isNaN(Number(enrollment[field]))) {
        // Convert number to string for form input
        parsed[field] = String(enrollment[field]);
      } else {
        // Empty string for inputs without data
        parsed[field] = '';
      }
    });
    return parsed;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditRecordFormData>({
    resolver: zodResolver(editRecordSchema),
    defaultValues: {
      firstName,
      middleName,
      lastName,
      sex: record.sex,
      email: record.email,
      phone: record.phone,
      nappsRegistered: record.nappsRegistered,
      participationHistory: record.participationHistory,
      pupilsPresentedLastExam: record.pupilsPresented2023,
      awards: record.awards,
      positionHeld: record.positionHeld,
      schoolName: record.schoolName,
      schoolName2: record.schoolName2,
      address: record.address,
      gpsLongitude: record.gpsLongitude,
      gpsLatitude: record.gpsLatitude,
      typeOfSchool: record.typeOfSchool,
      categoryOfSchool: record.categoryOfSchool,
      ownership: record.ownership,
      yearOfEstablishment: record.yearOfEstablishment,
      yearOfApproval: record.yearOfApproval,
      registrationStatus: record.registrationStatus,
      approvalStatus: record.approvalStatus,
      // Enrollment data - safely parsed
      ...parseEnrollmentData(record.enrollment),
    },
  });

  // Log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  const onSubmit = async (data: EditRecordFormData) => {
    console.log('Form submitted with data:', data);
    setLoading(true);
    try {
      // Convert participation checkboxes to object format for backend DTO
      // Backend will transform this to string array for MongoDB
      const participationHistoryObj: Record<string, boolean> = {};
      Object.entries(participation).forEach(([key, isChecked]) => {
        if (isChecked) {
          participationHistoryObj[key] = true;
        }
      });

      console.log('Participation history object:', participationHistoryObj);

      // Separate enrollment fields from other fields
      const enrollmentFields = [
        'kg1Male', 'kg1Female', 'kg2Male', 'kg2Female', 'eccdMale', 'eccdFemale',
        'nursery1Male', 'nursery1Female', 'nursery2Male', 'nursery2Female',
        'nursery3Male', 'nursery3Female',
        'primary1Male', 'primary1Female', 'primary2Male', 'primary2Female',
        'primary3Male', 'primary3Female', 'primary4Male', 'primary4Female',
        'primary5Male', 'primary5Female', 'primary6Male', 'primary6Female',
        'jss1Male', 'jss1Female', 'jss2Male', 'jss2Female', 'jss3Male', 'jss3Female',
        'ss1Male', 'ss1Female', 'ss2Male', 'ss2Female', 'ss3Male', 'ss3Female',
      ];

      // School-related fields that should NOT be sent to proprietor update endpoint
      const schoolFields = [
        'schoolName', 'schoolName2', 'address', 'addressLine2', 'lga', 'aeqeoZone',
        'gpsLongitude', 'gpsLatitude', 'typeOfSchool', 'categoryOfSchool', 
        'ownership', 'yearOfEstablishment', 'yearOfApproval', 'registrationEvidence'
      ];

      // Extract enrollment data
      const enrollment: Record<string, number> = {};
      const proprietorData: Record<string, unknown> = {};

      Object.entries(data).forEach(([key, value]) => {
        if (enrollmentFields.includes(key)) {
          if (value !== undefined && value !== null && value !== '') {
            enrollment[key] = Number(value);
          }
        } else if (!schoolFields.includes(key) && key !== 'pupilsPresentedLastExam') {
          // Only include fields that belong to proprietor, not school or exam fields
          proprietorData[key] = value;
        }
      });

      const payload: Record<string, unknown> = {
        ...proprietorData,
        participationHistory: Object.keys(participationHistoryObj).length > 0 
          ? participationHistoryObj 
          : undefined,
      };

      // Don't send enrollment in this payload - it should be updated via separate endpoint
      // ...(Object.keys(enrollment).length > 0 && { enrollment }),

      console.log('Sending payload to API:', payload);
      console.log('API URL:', `${API_BASE_URL}/proprietors/self-update/${record.submissionId}`);

      const response = await fetch(
        `${API_BASE_URL}/proprietors/self-update/${record.submissionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to update record: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);

      toast.success("Record updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const EnrollmentInput = ({ level, label }: { level: string; label: string }) => (
    <div className="grid grid-cols-3 gap-2 items-center py-2 border-b last:border-b-0">
      <Label className="font-medium text-xs sm:text-sm truncate">{label}</Label>
      <Input
        type="number"
        {...register(`${level}Male` as keyof EditRecordFormData)}
        min="0"
        placeholder="0"
        className="text-center text-xs sm:text-sm h-9"
      />
      <Input
        type="number"
        {...register(`${level}Female` as keyof EditRecordFormData)}
        min="0"
        placeholder="0"
        className="text-center text-xs sm:text-sm h-9"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Proprietor Record</DialogTitle>
          <DialogDescription className="text-sm">
            Update proprietor information, school details, and enrollment data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="personal" className="text-xs sm:text-sm px-2 py-2">Personal Info</TabsTrigger>
              <TabsTrigger value="school" className="text-xs sm:text-sm px-2 py-2">School Info</TabsTrigger>
              <TabsTrigger value="enrollment" className="text-xs sm:text-sm px-2 py-2">Enrollment</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register("middleName")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <RadioGroup
                  onValueChange={(value) => setValue("sex", value as "Male" | "Female")}
                  defaultValue={record.sex}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="edit-male" />
                    <Label htmlFor="edit-male" className="font-normal cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="edit-female" />
                    <Label htmlFor="edit-female" className="font-normal cursor-pointer">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* NAPPS Information */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">NAPPS Participation</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="nappsRegistered">NAPPS Registration Status</Label>
                  <Select
                    onValueChange={(value) => setValue("nappsRegistered", value)}
                    defaultValue={record.nappsRegistered}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Registered">Not Registered</SelectItem>
                      <SelectItem value="Registered">Registered</SelectItem>
                      <SelectItem value="Registered with Certificate">
                        Registered with Certificate
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participationHistory">Participation History</Label>
                  <Card className="p-4">
                    <div className="space-y-4">
                      {['National', 'State', 'Zonal'].map((level) => (
                        <div key={level}>
                          <h5 className="font-medium mb-2">{level} Level</h5>
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
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pupilsPresentedLastExam">Pupils Presented (Last Exam)</Label>
                  <Input
                    id="pupilsPresentedLastExam"
                    type="number"
                    {...register("pupilsPresentedLastExam", { 
                      setValueAs: (v) => v === '' || v === null || v === undefined ? undefined : Number(v)
                    })}
                    min="0"
                    placeholder="0"
                  />
                </div>                  <div className="space-y-2">
                    <Label htmlFor="positionHeld">Position Held</Label>
                    <Input id="positionHeld" {...register("positionHeld")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awards">Awards from NAPPS</Label>
                  <Textarea id="awards" {...register("awards")} rows={2} />
                </div>
              </div>
            </TabsContent>

            {/* School Information Tab */}
            <TabsContent value="school" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    {...register("schoolName")}
                    className={errors.schoolName ? "border-red-500" : ""}
                  />
                  {errors.schoolName && (
                    <p className="text-xs text-red-500">{errors.schoolName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName2">Alternative School Name</Label>
                  <Input id="schoolName2" {...register("schoolName2")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">School Address *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeOfSchool">Type of School</Label>
                  <Select
                    onValueChange={(value) => setValue("typeOfSchool", value)}
                    defaultValue={record.typeOfSchool}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faith Based">Faith Based</SelectItem>
                      <SelectItem value="Conventional">Conventional</SelectItem>
                      <SelectItem value="Islamiyah Integrated">Islamiyah Integrated</SelectItem>
                      <SelectItem value="Secular">Secular</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership">Ownership</Label>
                  <Select
                    onValueChange={(value) => setValue("ownership", value)}
                    defaultValue={record.ownership}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearOfEstablishment">Year of Establishment</Label>
                  <Input
                    id="yearOfEstablishment"
                    {...register("yearOfEstablishment")}
                    placeholder="YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfApproval">Year of Approval</Label>
                  <Input
                    id="yearOfApproval"
                    {...register("yearOfApproval")}
                    placeholder="YYYY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpsLatitude">GPS Latitude</Label>
                  <Input id="gpsLatitude" {...register("gpsLatitude")} placeholder="9.4567890" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpsLongitude">GPS Longitude</Label>
                  <Input
                    id="gpsLongitude"
                    {...register("gpsLongitude")}
                    placeholder="8.5123456"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Enrollment Tab */}
            <TabsContent value="enrollment" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Student Enrollment by Grade and Gender</CardTitle>
                  <CardDescription className="text-sm">
                    Update the number of students in each grade level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  {/* Header Row */}
                  <div className="grid grid-cols-3 gap-2 items-center font-semibold text-sm pb-2 border-b-2">
                    <div className="text-left">Grade Level</div>
                    <div className="text-center">Male</div>
                    <div className="text-center">Female</div>
                  </div>

                  {/* Kindergarten */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Kindergarten
                    </h4>
                    <EnrollmentInput level="kg1" label="KG 1" />
                    <EnrollmentInput level="kg2" label="KG 2" />
                    <EnrollmentInput level="eccd" label="ECCD" />
                  </div>

                  {/* Nursery */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Nursery
                    </h4>
                    <EnrollmentInput level="nursery1" label="Nursery 1" />
                    <EnrollmentInput level="nursery2" label="Nursery 2" />
                    <EnrollmentInput level="nursery3" label="Nursery 3" />
                  </div>

                  {/* Primary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Primary
                    </h4>
                    <EnrollmentInput level="primary1" label="Primary 1" />
                    <EnrollmentInput level="primary2" label="Primary 2" />
                    <EnrollmentInput level="primary3" label="Primary 3" />
                    <EnrollmentInput level="primary4" label="Primary 4" />
                    <EnrollmentInput level="primary5" label="Primary 5" />
                    <EnrollmentInput level="primary6" label="Primary 6" />
                  </div>

                  {/* Junior Secondary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Junior Secondary (JSS)
                    </h4>
                    <EnrollmentInput level="jss1" label="JSS 1" />
                    <EnrollmentInput level="jss2" label="JSS 2" />
                    <EnrollmentInput level="jss3" label="JSS 3" />
                  </div>

                  {/* Senior Secondary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Senior Secondary (SS)
                    </h4>
                    <EnrollmentInput level="ss1" label="SS 1" />
                    <EnrollmentInput level="ss2" label="SS 2" />
                    <EnrollmentInput level="ss3" label="SS 3" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
