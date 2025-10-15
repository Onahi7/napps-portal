import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Phone, Mail, MapPin, Building, CreditCard, CheckCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { EditRecordDialog } from "./EditRecordDialog";

interface ProprietorRecord {
  name: string;
  sex: 'Male' | 'Female';
  email: string;
  schoolName: string;
  schoolName2?: string;
  address: string;
  phone: string;
  yearOfEstablishment: string;
  yearOfApproval: string;
  typeOfSchool: string;
  categoryOfSchool: string;
  ownership: string;
  registrationStatus: string;
  approvalStatus: string;
  gpsLongitude?: string;
  gpsLatitude?: string;
  nappsRegistered: string;
  participationHistory: string;
  pupilsPresented2023: number;
  awards?: string;
  positionHeld?: string;
  clearingStatus: string;
  paymentToBeMade: string;
  paymentMethod: string;
  submissionId: string;
  submissionDate: string;
  submissionStatus: string;
  // Enrollment data
  enrollment: {
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
    jss1Male?: number;
    jss1Female?: number;
    jss2Male?: number;
    jss2Female?: number;
    jss3Male?: number;
    jss3Female?: number;
    ss1Male?: number;
    ss1Female?: number;
    ss2Male?: number;
    ss2Female?: number;
    ss3Male?: number;
    ss3Female?: number;
  };
  amountDue: number;
}

const mockRecord: ProprietorRecord = {
  name: "HUSSAIN YAHAYA MUHAMMAD",
  sex: "Male",
  email: "hussain.muhammad@email.com",
  schoolName: "SUNNAH NURSERY AND PRIMARY SCHOOL",
  schoolName2: "",
  address: "ALH. KASIMU IDRIS STREET WAMBA ROAD AKWANGA",
  phone: "+2348069770126",
  yearOfEstablishment: "1999",
  yearOfApproval: "2004",
  typeOfSchool: "Faith Based",
  categoryOfSchool: "Private",
  ownership: "Individual(s)",
  registrationStatus: "Registered",
  approvalStatus: "Approval Evidence",
  nappsRegistered: "Registered with Certificate",
  participationHistory: "National: 2023/2024, 2024/2025 | State: 2023/2024, 2024/2025",
  pupilsPresented2023: 8,
  clearingStatus: "Cleared",
  paymentToBeMade: "DIGITAL CAPTURING",
  paymentMethod: "Offline",
  submissionId: "529",
  submissionDate: "14/11/2024 14:14",
  submissionStatus: "read",
  enrollment: {
    kg1Male: 3,
    kg1Female: 3,
    kg2Male: 6,
    kg2Female: 4,
    nursery1Male: 9,
    nursery1Female: 3,
    nursery2Male: 0,
    nursery2Female: 0,
    nursery3Male: 10,
    nursery3Female: 7,
    primary1Male: 8,
    primary1Female: 14,
    primary2Male: 12,
    primary2Female: 7,
    primary3Male: 12,
    primary3Female: 8,
    primary4Male: 8,
    primary4Female: 4,
    primary5Male: 0,
    primary5Female: 0,
    primary6Male: 0,
    primary6Female: 0,
  },
  amountDue: 25000
};

export const RecordLookup = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<ProprietorRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter search criteria (email, phone, school name, or proprietor name)");
      return;
    }

    setLoading(true);
    
    try {
      // Determine search type and build query
      let queryParam = '';
      const trimmedTerm = searchTerm.trim();
      
      if (trimmedTerm.includes('@')) {
        // Email search
        queryParam = `email=${encodeURIComponent(trimmedTerm)}`;
      } else if (/^[\d\s\-()\+]+$/.test(trimmedTerm)) {
        // Phone number (contains only digits, spaces, dashes, parentheses, or + for country code)
        queryParam = `phone=${encodeURIComponent(trimmedTerm)}`;
      } else {
        // Text search - could be school name or proprietor name
        // Try as general search term - backend will handle multiple fields
        queryParam = `schoolName=${encodeURIComponent(trimmedTerm)}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/proprietors/lookup?${queryParam}`);
      
      if (!response.ok) {
        throw new Error('Lookup failed');
      }

      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      if (data && data.length > 0) {
        // Map API response to our interface
        const proprietorData = data[0];
        console.log('Proprietor Data:', proprietorData); // Debug log
        
        const mappedRecord: ProprietorRecord = {
          name: `${proprietorData.firstName} ${proprietorData.middleName || ''} ${proprietorData.lastName}`.trim(),
          sex: proprietorData.sex || 'Male',
          email: proprietorData.email,
          schoolName: proprietorData.schoolName ?? 'N/A',
          schoolName2: proprietorData.schoolName2 ?? '',
          address: proprietorData.schoolAddress ?? 'N/A',
          phone: proprietorData.phone,
          yearOfEstablishment: proprietorData.yearOfEstablishment?.toString() ?? 'N/A',
          yearOfApproval: proprietorData.yearOfApproval?.toString() ?? 'N/A',
          typeOfSchool: proprietorData.typeOfSchool ?? 'N/A',
          categoryOfSchool: proprietorData.categoryOfSchool ?? 'N/A',
          ownership: proprietorData.ownership ?? 'N/A',
          registrationStatus: proprietorData.registrationStatus ?? 'pending',
          approvalStatus: proprietorData.approvalStatus ?? 'pending',
          gpsLongitude: proprietorData.gpsLongitude,
          gpsLatitude: proprietorData.gpsLatitude,
          nappsRegistered: proprietorData.nappsRegistered ?? 'Not Registered',
          participationHistory: (proprietorData.participationHistory || []).join(' | '),
          pupilsPresented2023: proprietorData.pupilsPresentedLastExam ?? 0,
          awards: proprietorData.awards,
          positionHeld: proprietorData.positionHeld,
          clearingStatus: proprietorData.clearingStatus ?? 'pending',
          paymentToBeMade: proprietorData.paymentMethod ?? 'DIGITAL CAPTURING',
          paymentMethod: proprietorData.paymentMethod ?? 'Offline',
          submissionId: proprietorData.submissionId ?? proprietorData._id,
          submissionDate: new Date(proprietorData.createdAt).toLocaleString(),
          submissionStatus: proprietorData.submissionStatus ?? 'submitted',
          enrollment: {
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
          },
          amountDue: proprietorData.totalAmountDue || 0,
        };
        
        setRecord(mappedRecord);
        toast.success("Record found successfully!");
      } else {
        setRecord(null);
        toast.error("No record found. Please check your details or register as a new user.");
      }
    } catch (error) {
      console.error('Search error:', error);
      setRecord(null);
      toast.error("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!record) {
      toast.error("No record found. Please search first.");
      return;
    }

    if (record.clearingStatus === 'Cleared' || record.clearingStatus === 'cleared') {
      toast.info("Your payment has already been cleared.");
      return;
    }

    setPaymentLoading(true);
    
    try {
      // Create payment for the proprietor
      const response = await fetch(`${API_BASE_URL}/payments/initiate-lookup-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: record.submissionId,
          email: record.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const result = await response.json();

      // Check if simulation mode
      if (result.simulationMode || result.payment?.simulationMode) {
        toast.success('Redirecting to payment...', {
          description: 'Complete your payment to clear dues',
          duration: 2000
        });
        
        setTimeout(() => {
          window.location.href = result.paymentUrl || result.payment?.paymentUrl;
        }, 500);
      }
      // Redirect to Paystack payment page
      else if (result.paymentUrl) {
        toast.success('Redirecting to payment gateway...', {
          description: 'Complete your payment securely',
          duration: 2000
        });
        
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 500);
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleEditSuccess = () => {
    // Refresh the record after successful edit
    handleSearch();
  };

  return (
    <section id="lookup" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <Card className="mb-8 elegant-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="w-6 h-6" />
                Find Your Record
              </CardTitle>
              <CardDescription>
                Enter your phone number, email, school name, or proprietor name to access your record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Phone, email, school name, or proprietor name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  loading={loading}
                  variant="government"
                  size="lg"
                  className="sm:w-auto"
                >
                  <Search className="w-4 h-4" />
                  Search Record
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Record Display */}
          {record && (
            <>
              <Card className="elegant-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {record.name}
                      </CardTitle>
                      <CardDescription>Submission ID: {record.submissionId}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={record.registrationStatus === 'Registered' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {record.registrationStatus}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </Button>
                    </div>
                  </div>
                </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Personal Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{record.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{record.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">{record.sex}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.address}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">NAPPS Status:</span>
                        <span className="font-medium ml-2">{record.nappsRegistered}</span>
                      </div>

                      {record.participationHistory && record.participationHistory.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Participation History:</span>
                          <div className="text-sm bg-muted/50 rounded-md p-3 space-y-1">
                            {record.participationHistory.split('|').map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="font-medium">{entry.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* School Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">School Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.schoolName}</p>
                          {record.schoolName2 && (
                            <p className="text-muted-foreground">{record.schoolName2}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Established:</span>
                          <span className="font-medium ml-1">{record.yearOfEstablishment}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="font-medium ml-1">{record.yearOfApproval}</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium ml-2">{record.typeOfSchool} ({record.categoryOfSchool})</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Ownership:</span>
                        <span className="font-medium ml-2">{record.ownership}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Section */}
                    <div className="bg-accent/10 rounded-lg p-4">
                      <h4 className="font-semibold text-accent-foreground mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Information
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Clearing Status:</span>
                          <span className="font-medium ml-2">{record.clearingStatus}</span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Amount Due:</span>
                          <span className="font-bold text-lg ml-2 text-accent-foreground">
                            ₦{record.amountDue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={handlePayment}
                        variant="action"
                        size="lg"
                        className="w-full mt-4"
                        disabled={paymentLoading || record.clearingStatus === 'Cleared' || record.clearingStatus === 'cleared'}
                      >
                        <CreditCard className="w-4 h-4" />
                        {paymentLoading ? 'Processing...' : record.clearingStatus === 'Cleared' || record.clearingStatus === 'cleared' ? 'Payment Cleared' : 'Pay Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <EditRecordDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              record={record}
              onSuccess={handleEditSuccess}
            />
          </>
          )}
        </div>
      </div>
    </section>
  );
};