import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Phone, Mail, MapPin, Building, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<ProprietorRecord | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter your phone number or email address");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (searchTerm.includes("ahmed") || searchTerm.includes("803")) {
        setRecord(mockRecord);
        toast.success("Record found successfully!");
      } else {
        setRecord(null);
        toast.error("No record found. Please check your details or register as a new user.");
      }
      setLoading(false);
    }, 1500);
  };

  const handlePayment = () => {
    toast.info("Redirecting to Paystack for secure payment...");
    // Payment integration will be implemented here
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
                Enter your registered phone number or email address to access your proprietor record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Phone number or email address"
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
            <Card className="elegant-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {record.name}
                    </CardTitle>
                    <CardDescription>Submission ID: {record.submissionId}</CardDescription>
                  </div>
                  <Badge 
                    variant={record.registrationStatus === 'Registered' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {record.registrationStatus}
                  </Badge>
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

                      <div className="text-sm">
                        <span className="text-muted-foreground">Participation:</span>
                        <span className="font-medium ml-2">{record.participationHistory}</span>
                      </div>
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
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now with Paystack
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};