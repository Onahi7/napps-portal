import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, User, School, DollarSign, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Proprietor {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  sex: string;
  email: string;
  phone: string;
  schoolName: string;
  schoolName2?: string;
  schoolAddress?: string;
  yearOfEstablishment?: string;
  yearOfApproval?: string;
  typeOfSchool?: string;
  categoryOfSchool?: string;
  ownership?: string;
  registrationStatus: string;
  approvalStatus: string;
  nappsRegistered?: string;
  participationHistory?: string[];
  clearingStatus: string;
  totalAmountDue?: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrollmentData {
  kg1Male: number;
  kg1Female: number;
  kg2Male: number;
  kg2Female: number;
  nursery1Male: number;
  nursery1Female: number;
  nursery2Male: number;
  nursery2Female: number;
  nursery3Male: number;
  nursery3Female: number;
  primary1Male: number;
  primary1Female: number;
  primary2Male: number;
  primary2Female: number;
  primary3Male: number;
  primary3Female: number;
  primary4Male: number;
  primary4Female: number;
  primary5Male: number;
  primary5Female: number;
  primary6Male: number;
  primary6Female: number;
  jss1Male: number;
  jss1Female: number;
  jss2Male: number;
  jss2Female: number;
  jss3Male: number;
  jss3Female: number;
  ss1Male: number;
  ss1Female: number;
  ss2Male: number;
  ss2Female: number;
  ss3Male: number;
  ss3Female: number;
}

interface PaymentData {
  clearingStatus: 'pending' | 'cleared' | 'partially_cleared';
  totalAmountDue: number;
  paymentMethod: string;
  paymentNote?: string;
}

export default function ProprietorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proprietor, setProprietor] = useState<Proprietor | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    kg1Male: 0,
    kg1Female: 0,
    kg2Male: 0,
    kg2Female: 0,
    nursery1Male: 0,
    nursery1Female: 0,
    nursery2Male: 0,
    nursery2Female: 0,
    nursery3Male: 0,
    nursery3Female: 0,
    primary1Male: 0,
    primary1Female: 0,
    primary2Male: 0,
    primary2Female: 0,
    primary3Male: 0,
    primary3Female: 0,
    primary4Male: 0,
    primary4Female: 0,
    primary5Male: 0,
    primary5Female: 0,
    primary6Male: 0,
    primary6Female: 0,
    jss1Male: 0,
    jss1Female: 0,
    jss2Male: 0,
    jss2Female: 0,
    jss3Male: 0,
    jss3Female: 0,
    ss1Male: 0,
    ss1Female: 0,
    ss2Male: 0,
    ss2Female: 0,
    ss3Male: 0,
    ss3Female: 0,
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    clearingStatus: 'pending',
    totalAmountDue: 0,
    paymentMethod: 'Offline',
  });

  useEffect(() => {
    fetchProprietor();
  }, [id]);

  const fetchProprietor = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proprietor');
      }

      const data = await response.json();
      setProprietor(data);
      
      // Set payment data
      setPaymentData({
        clearingStatus: data.clearingStatus || 'pending',
        totalAmountDue: data.totalAmountDue || 0,
        paymentMethod: data.paymentMethod || 'Offline',
      });

    } catch (error) {
      console.error('Error fetching proprietor:', error);
      toast.error('Failed to load proprietor details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentChange = (field: keyof EnrollmentData, value: string) => {
    const numValue = parseInt(value) || 0;
    setEnrollmentData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handlePaymentChange = (field: keyof PaymentData, value: string | number) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEnrollment = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors/${id}/enrollment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(enrollmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update enrollment');
      }

      toast.success('Enrollment data updated successfully!');
      await fetchProprietor();
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment data');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors/${id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      toast.success('Payment status updated successfully!');
      await fetchProprietor();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    return Object.values(enrollmentData).reduce((sum, val) => sum + val, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proprietor) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Proprietor not found</p>
          <Button onClick={() => navigate('/admin/proprietors')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proprietors
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/proprietors')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {proprietor.firstName} {proprietor.middleName} {proprietor.lastName}
            </h1>
            <p className="text-muted-foreground">{proprietor.schoolName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={proprietor.registrationStatus === 'approved' ? 'default' : 'secondary'}>
            {proprietor.registrationStatus}
          </Badge>
          <Badge variant={proprietor.clearingStatus === 'cleared' ? 'default' : 'destructive'}>
            {proprietor.clearingStatus}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <User className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="school">
            <School className="mr-2 h-4 w-4" />
            School Info
          </TabsTrigger>
          <TabsTrigger value="enrollment">
            <GraduationCap className="mr-2 h-4 w-4" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="payment">
            <DollarSign className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-lg font-medium">
                  {proprietor.firstName} {proprietor.middleName} {proprietor.lastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sex</Label>
                <p className="text-lg font-medium">{proprietor.sex}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg font-medium">{proprietor.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="text-lg font-medium">{proprietor.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">NAPPS Registered</Label>
                <p className="text-lg font-medium">{proprietor.nappsRegistered || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Participation History</Label>
                <p className="text-lg font-medium">
                  {proprietor.participationHistory?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="school">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">School Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">School Name</Label>
                <p className="text-lg font-medium">{proprietor.schoolName}</p>
              </div>
              {proprietor.schoolName2 && (
                <div>
                  <Label className="text-muted-foreground">Alternate School Name</Label>
                  <p className="text-lg font-medium">{proprietor.schoolName2}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="text-lg font-medium">{proprietor.schoolAddress || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Year of Establishment</Label>
                <p className="text-lg font-medium">{proprietor.yearOfEstablishment || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Year of Approval</Label>
                <p className="text-lg font-medium">{proprietor.yearOfApproval || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type of School</Label>
                <p className="text-lg font-medium">{proprietor.typeOfSchool || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="text-lg font-medium">{proprietor.categoryOfSchool || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ownership</Label>
                <p className="text-lg font-medium">{proprietor.ownership || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Enrollment Data</h2>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Enrollment</p>
                <p className="text-3xl font-bold text-primary">{calculateTotal()}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* KG Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Kindergarten</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="kg1Male">KG1 Male</Label>
                    <Input
                      id="kg1Male"
                      type="number"
                      min="0"
                      value={enrollmentData.kg1Male}
                      onChange={(e) => handleEnrollmentChange('kg1Male', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kg1Female">KG1 Female</Label>
                    <Input
                      id="kg1Female"
                      type="number"
                      min="0"
                      value={enrollmentData.kg1Female}
                      onChange={(e) => handleEnrollmentChange('kg1Female', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kg2Male">KG2 Male</Label>
                    <Input
                      id="kg2Male"
                      type="number"
                      min="0"
                      value={enrollmentData.kg2Male}
                      onChange={(e) => handleEnrollmentChange('kg2Male', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kg2Female">KG2 Female</Label>
                    <Input
                      id="kg2Female"
                      type="number"
                      min="0"
                      value={enrollmentData.kg2Female}
                      onChange={(e) => handleEnrollmentChange('kg2Female', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Nursery Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Nursery</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nursery1Male">Nursery 1 Male</Label>
                    <Input
                      id="nursery1Male"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery1Male}
                      onChange={(e) => handleEnrollmentChange('nursery1Male', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nursery1Female">Nursery 1 Female</Label>
                    <Input
                      id="nursery1Female"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery1Female}
                      onChange={(e) => handleEnrollmentChange('nursery1Female', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nursery2Male">Nursery 2 Male</Label>
                    <Input
                      id="nursery2Male"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery2Male}
                      onChange={(e) => handleEnrollmentChange('nursery2Male', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nursery2Female">Nursery 2 Female</Label>
                    <Input
                      id="nursery2Female"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery2Female}
                      onChange={(e) => handleEnrollmentChange('nursery2Female', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nursery3Male">Nursery 3 Male</Label>
                    <Input
                      id="nursery3Male"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery3Male}
                      onChange={(e) => handleEnrollmentChange('nursery3Male', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nursery3Female">Nursery 3 Female</Label>
                    <Input
                      id="nursery3Female"
                      type="number"
                      min="0"
                      value={enrollmentData.nursery3Female}
                      onChange={(e) => handleEnrollmentChange('nursery3Female', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Primary</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <>
                      <div key={`primary${grade}Male`}>
                        <Label htmlFor={`primary${grade}Male`}>Primary {grade} Male</Label>
                        <Input
                          id={`primary${grade}Male`}
                          type="number"
                          min="0"
                          value={enrollmentData[`primary${grade}Male` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`primary${grade}Male` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                      <div key={`primary${grade}Female`}>
                        <Label htmlFor={`primary${grade}Female`}>Primary {grade} Female</Label>
                        <Input
                          id={`primary${grade}Female`}
                          type="number"
                          min="0"
                          value={enrollmentData[`primary${grade}Female` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`primary${grade}Female` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                    </>
                  ))}
                </div>
              </div>

              {/* JSS Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Junior Secondary (JSS)</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3].map((grade) => (
                    <>
                      <div key={`jss${grade}Male`}>
                        <Label htmlFor={`jss${grade}Male`}>JSS {grade} Male</Label>
                        <Input
                          id={`jss${grade}Male`}
                          type="number"
                          min="0"
                          value={enrollmentData[`jss${grade}Male` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`jss${grade}Male` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                      <div key={`jss${grade}Female`}>
                        <Label htmlFor={`jss${grade}Female`}>JSS {grade} Female</Label>
                        <Input
                          id={`jss${grade}Female`}
                          type="number"
                          min="0"
                          value={enrollmentData[`jss${grade}Female` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`jss${grade}Female` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                    </>
                  ))}
                </div>
              </div>

              {/* SS Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Senior Secondary (SS)</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3].map((grade) => (
                    <>
                      <div key={`ss${grade}Male`}>
                        <Label htmlFor={`ss${grade}Male`}>SS {grade} Male</Label>
                        <Input
                          id={`ss${grade}Male`}
                          type="number"
                          min="0"
                          value={enrollmentData[`ss${grade}Male` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`ss${grade}Male` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                      <div key={`ss${grade}Female`}>
                        <Label htmlFor={`ss${grade}Female`}>SS {grade} Female</Label>
                        <Input
                          id={`ss${grade}Female`}
                          type="number"
                          min="0"
                          value={enrollmentData[`ss${grade}Female` as keyof EnrollmentData]}
                          onChange={(e) => handleEnrollmentChange(`ss${grade}Female` as keyof EnrollmentData, e.target.value)}
                        />
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSaveEnrollment} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Enrollment Data
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
            <div className="space-y-6 max-w-xl">
              <div>
                <Label htmlFor="clearingStatus">Clearing Status</Label>
                <Select
                  value={paymentData.clearingStatus}
                  onValueChange={(value) => handlePaymentChange('clearingStatus', value)}
                >
                  <SelectTrigger id="clearingStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_cleared">Partially Cleared</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalAmountDue">Total Amount Due (₦)</Label>
                <Input
                  id="totalAmountDue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentData.totalAmountDue}
                  onChange={(e) => handlePaymentChange('totalAmountDue', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => handlePaymentChange('paymentMethod', value)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentNote">Payment Note (Optional)</Label>
                <Input
                  id="paymentNote"
                  placeholder="Add any payment notes..."
                  value={paymentData.paymentNote || ''}
                  onChange={(e) => handlePaymentChange('paymentNote', e.target.value)}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant={proprietor.clearingStatus === 'cleared' ? 'default' : 'destructive'}>
                    {proprietor.clearingStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Amount Due:</span>
                  <span className="text-xl font-bold">₦{proprietor.totalAmountDue?.toLocaleString() || 0}</span>
                </div>
              </div>

              <Button onClick={handleSavePayment} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Payment Status
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
