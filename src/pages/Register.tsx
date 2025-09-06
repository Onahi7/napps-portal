import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Building, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface RegistrationForm {
  firstName: string;
  middleName: string;
  lastName: string;
  sex: "Male" | "Female" | "";
  email: string;
  phone: string;
  schoolName: string;
  schoolName2: string;
  address: string;
  addressLine2: string;
  lga: string;
  aeqeo: string;
}

export default function Register() {
  const [form, setForm] = useState<RegistrationForm>({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    email: "",
    phone: "",
    schoolName: "",
    schoolName2: "",
    address: "",
    addressLine2: "",
    lga: "",
    aeqeo: ""
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.schoolName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      toast.success("Registration submitted successfully! You will be contacted for verification.");
      setLoading(false);
      // Reset form or redirect
    }, 2000);
  };

  return (
    <Layout>
      <div className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
                <UserPlus className="w-8 h-8 text-primary" />
                New Proprietor Registration
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Register your private school with NAPPS Nasarawa State. All fields marked with * are required.
              </p>
            </div>

            <Card className="elegant-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Proprietor Information Form
                </CardTitle>
                <CardDescription>
                  Please provide accurate information as this will be used for official records and communications.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Personal Information
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          value={form.middleName}
                          onChange={(e) => handleInputChange("middleName", e.target.value)}
                          placeholder="Enter middle name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium">Gender *</Label>
                      <RadioGroup
                        value={form.sex}
                        onValueChange={(value) => handleInputChange("sex", value)}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+234 XXX XXX XXXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* School Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      School Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">Primary School Name *</Label>
                        <Input
                          id="schoolName"
                          value={form.schoolName}
                          onChange={(e) => handleInputChange("schoolName", e.target.value)}
                          placeholder="Enter main school name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="schoolName2">Secondary School Name</Label>
                        <Input
                          id="schoolName2"
                          value={form.schoolName2}
                          onChange={(e) => handleInputChange("schoolName2", e.target.value)}
                          placeholder="Enter second school name (if any)"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address *
                        </Label>
                        <Input
                          id="address"
                          value={form.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                          id="addressLine2"
                          value={form.addressLine2}
                          onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                          placeholder="Enter additional address info"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lga">Local Government Area *</Label>
                        <Input
                          id="lga"
                          value={form.lga}
                          onChange={(e) => handleInputChange("lga", e.target.value)}
                          placeholder="Select or enter LGA"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="aeqeo">AEQEO Zone *</Label>
                        <Input
                          id="aeqeo"
                          value={form.aeqeo}
                          onChange={(e) => handleInputChange("aeqeo", e.target.value)}
                          placeholder="Enter AEQEO zone"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <Button 
                      type="submit" 
                      variant="government" 
                      size="lg"
                      loading={loading}
                      className="w-full md:w-auto min-w-[200px]"
                    >
                      <UserPlus className="w-5 h-5" />
                      Submit Registration
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}