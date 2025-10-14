import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, DollarSign, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FeeConfiguration {
  _id: string;
  name: string;
  code: string;
  amount: number;
  description?: string;
  paystackSplitCode?: string;
  splitCodeDescription?: string;
  feeStructure: {
    platformFeePercentage: number;
    platformFeeFixed: number;
    processingFeePercentage: number;
    processingFeeCap: number;
    nappsSharePercentage: number;
    nappsShareFixed: number;
  };
  isActive: boolean;
  isRecurring: boolean;
  recurringInterval?: string;
  status: 'required' | 'optional';
  minimumAmount: number;
  maximumAmount?: number;
  allowPartialPayment: boolean;
}

interface FeeStats {
  totalConfigurations: number;
  activeConfigurations: number;
  inactiveConfigurations: number;
  recurringFees: number;
  requiredFees: number;
  optionalFees: number;
  averageAmount: number;
  totalConfiguredAmount: number;
}

const FEE_TYPES = [
  { value: 'membership_fee', label: 'Membership Fee' },
  { value: 'registration_fee', label: 'Registration Fee' },
  { value: 'conference_fee', label: 'Conference Fee' },
  { value: 'workshop_fee', label: 'Workshop Fee' },
  { value: 'certification_fee', label: 'Certification Fee' },
  { value: 'annual_dues', label: 'Annual Dues' },
  { value: 'napps_dues', label: 'NAPPS Dues' },
  { value: 'digital_capturing', label: 'Digital Capturing' },
  { value: 'other', label: 'Other' },
];

export default function FeeConfigurationManager() {
  const [fees, setFees] = useState<FeeConfiguration[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeConfiguration | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: 'membership_fee',
    amount: 0,
    description: '',
    paystackSplitCode: '',
    splitCodeDescription: '',
    platformFeePercentage: 0,
    platformFeeFixed: 0,
    processingFeePercentage: 1.5,
    processingFeeCap: 200000,
    nappsSharePercentage: 0,
    nappsShareFixed: 0,
    isActive: true,
    isRecurring: false,
    recurringInterval: 'annually',
    status: 'required' as 'required' | 'optional',
    minimumAmount: 0,
    maximumAmount: undefined as number | undefined,
    allowPartialPayment: false,
  });

  useEffect(() => {
    fetchFees();
    fetchStats();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await fetch(`${API_URL}/fees/configuration`);
      const data = await response.json();
      setFees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/fees/configuration/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        code: formData.code,
        amount: formData.amount,
        description: formData.description,
        paystackSplitCode: formData.paystackSplitCode || undefined,
        splitCodeDescription: formData.splitCodeDescription || undefined,
        feeStructure: {
          platformFeePercentage: formData.platformFeePercentage,
          platformFeeFixed: formData.platformFeeFixed,
          processingFeePercentage: formData.processingFeePercentage,
          processingFeeCap: formData.processingFeeCap,
          nappsSharePercentage: formData.nappsSharePercentage,
          nappsShareFixed: formData.nappsShareFixed,
        },
        isActive: formData.isActive,
        isRecurring: formData.isRecurring,
        recurringInterval: formData.isRecurring ? formData.recurringInterval : undefined,
        status: formData.status,
        minimumAmount: formData.minimumAmount,
        maximumAmount: formData.maximumAmount,
        allowPartialPayment: formData.allowPartialPayment,
      };

      const url = editingFee
        ? `${API_URL}/fees/configuration/${editingFee._id}`
        : `${API_URL}/fees/configuration`;

      const response = await fetch(url, {
        method: editingFee ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save fee');

      await fetchFees();
      await fetchStats();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee: FeeConfiguration) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      code: fee.code,
      amount: fee.amount,
      description: fee.description || '',
      paystackSplitCode: fee.paystackSplitCode || '',
      splitCodeDescription: fee.splitCodeDescription || '',
      platformFeePercentage: fee.feeStructure.platformFeePercentage,
      platformFeeFixed: fee.feeStructure.platformFeeFixed,
      processingFeePercentage: fee.feeStructure.processingFeePercentage,
      processingFeeCap: fee.feeStructure.processingFeeCap,
      nappsSharePercentage: fee.feeStructure.nappsSharePercentage,
      nappsShareFixed: fee.feeStructure.nappsShareFixed,
      isActive: fee.isActive,
      isRecurring: fee.isRecurring,
      recurringInterval: fee.recurringInterval || 'annually',
      status: fee.status,
      minimumAmount: fee.minimumAmount,
      maximumAmount: fee.maximumAmount,
      allowPartialPayment: fee.allowPartialPayment,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee configuration?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/fees/configuration/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete fee');

      await fetchFees();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fee');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/fees/configuration/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      await fetchFees();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: 'membership_fee',
      amount: 0,
      description: '',
      paystackSplitCode: '',
      splitCodeDescription: '',
      platformFeePercentage: 0,
      platformFeeFixed: 0,
      processingFeePercentage: 1.5,
      processingFeeCap: 200000,
      nappsSharePercentage: 0,
      nappsShareFixed: 0,
      isActive: true,
      isRecurring: false,
      recurringInterval: 'annually',
      status: 'required',
      minimumAmount: 0,
      maximumAmount: undefined,
      allowPartialPayment: false,
    });
    setEditingFee(null);
  };

  if (loading && fees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Configuration Manager</h1>
          <p className="text-gray-500">Manage payment fees and structures</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Fee'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConfigurations}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeConfigurations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{stats.totalConfiguredAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Configured fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{stats.averageAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per configuration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recurringFees}</div>
              <p className="text-xs text-gray-500 mt-1">Recurring fees</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFee ? 'Edit' : 'Create'} Fee Configuration</CardTitle>
            <CardDescription>Configure fee details and structure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="structure">Fee Structure</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Fee Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="code">Fee Type *</Label>
                      <Select
                        value={formData.code}
                        onValueChange={(value) => setFormData({ ...formData, code: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount (₦) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: parseFloat(e.target.value) })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'required' | 'optional') =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paystackSplitCode">Paystack Split Code</Label>
                      <Input
                        id="paystackSplitCode"
                        placeholder="SPL_xxxxxxxxxx"
                        value={formData.paystackSplitCode}
                        onChange={(e) => setFormData({ ...formData, paystackSplitCode: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Configure in Paystack Dashboard → Subaccounts → Split Payment
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="splitCodeDescription">Split Code Description</Label>
                      <Input
                        id="splitCodeDescription"
                        placeholder="e.g., 80/20 split with NAPPS"
                        value={formData.splitCodeDescription}
                        onChange={(e) => setFormData({ ...formData, splitCodeDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                      <Input
                        id="platformFeePercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.platformFeePercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            platformFeePercentage: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="platformFeeFixed">Platform Fixed Fee (kobo)</Label>
                      <Input
                        id="platformFeeFixed"
                        type="number"
                        min="0"
                        value={formData.platformFeeFixed}
                        onChange={(e) =>
                          setFormData({ ...formData, platformFeeFixed: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="processingFeePercentage">Processing Fee (%)</Label>
                      <Input
                        id="processingFeePercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.processingFeePercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            processingFeePercentage: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="processingFeeCap">Processing Fee Cap (kobo)</Label>
                      <Input
                        id="processingFeeCap"
                        type="number"
                        min="0"
                        value={formData.processingFeeCap}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            processingFeeCap: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="nappsSharePercentage">NAPPS Share (%)</Label>
                      <Input
                        id="nappsSharePercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.nappsSharePercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nappsSharePercentage: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="nappsShareFixed">NAPPS Fixed Share (kobo)</Label>
                      <Input
                        id="nappsShareFixed"
                        type="number"
                        min="0"
                        value={formData.nappsShareFixed}
                        onChange={(e) =>
                          setFormData({ ...formData, nappsShareFixed: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minimumAmount">Minimum Amount (₦)</Label>
                      <Input
                        id="minimumAmount"
                        type="number"
                        min="0"
                        value={formData.minimumAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, minimumAmount: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="maximumAmount">Maximum Amount (₦)</Label>
                      <Input
                        id="maximumAmount"
                        type="number"
                        min="0"
                        value={formData.maximumAmount || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maximumAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isActive">Active</Label>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="isRecurring">Recurring Fee</Label>
                      <Switch
                        id="isRecurring"
                        checked={formData.isRecurring}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isRecurring: checked })
                        }
                      />
                    </div>

                    {formData.isRecurring && (
                      <div>
                        <Label htmlFor="recurringInterval">Recurring Interval</Label>
                        <Select
                          value={formData.recurringInterval}
                          onValueChange={(value) =>
                            setFormData({ ...formData, recurringInterval: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowPartialPayment">Allow Partial Payment</Label>
                      <Switch
                        id="allowPartialPayment"
                        checked={formData.allowPartialPayment}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, allowPartialPayment: checked })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingFee ? 'Update' : 'Create'} Fee
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Fees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fees.map((fee) => (
          <Card key={fee._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{fee.name}</CardTitle>
                  <CardDescription>{fee.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant={fee.isActive ? 'default' : 'secondary'}>
                    {fee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {fee.isRecurring && <Badge variant="outline">Recurring</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">₦{fee.amount.toLocaleString()}</div>
                <p className="text-sm text-gray-500">{fee.status === 'required' ? 'Required' : 'Optional'}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee:</span>
                  <span>{fee.feeStructure.platformFeePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing Fee:</span>
                  <span>{fee.feeStructure.processingFeePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NAPPS Share:</span>
                  <span>{fee.feeStructure.nappsSharePercentage}%</span>
                </div>
                {fee.paystackSplitCode && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Split Code:</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {fee.paystackSplitCode}
                      </Badge>
                    </div>
                    {fee.splitCodeDescription && (
                      <p className="text-xs text-gray-400 mt-1">{fee.splitCodeDescription}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(fee)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(fee._id)}
                  className="flex-1"
                >
                  {fee.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(fee._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
