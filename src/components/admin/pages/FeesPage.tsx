import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, MoreHorizontal, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Fee {
  _id: string;
  name: string;
  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeesPageProps {
  authToken: string | null;
}

export function FeesPage({ authToken }: FeesPageProps) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    isActive: true,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  useEffect(() => {
    fetchFees();
  }, [authToken]);

  const fetchFees = async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fees');
      }

      const data = await response.json();
      const feesArray = Array.isArray(data) ? data : (data.data || data.fees || []);
      setFees(feesArray);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
      toast.error('Failed to load fees');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fee?: Fee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        name: fee.name,
        amount: fee.amount.toString(),
        description: fee.description || '',
        isActive: fee.isActive,
      });
    } else {
      setEditingFee(null);
      setFormData({
        name: '',
        amount: '',
        description: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFee(null);
    setFormData({
      name: '',
      amount: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingFee 
        ? `${API_BASE_URL}/fees/${editingFee._id}`
        : `${API_BASE_URL}/fees`;
      
      const method = editingFee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          amount,
          description: formData.description.trim(),
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(editingFee ? 'Failed to update fee' : 'Failed to create fee');
      }

      toast.success(editingFee ? 'Fee updated successfully!' : 'Fee created successfully!');
      handleCloseDialog();
      fetchFees();
    } catch (error) {
      console.error('Failed to save fee:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save fee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (fee: Fee) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fees/${fee._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...fee,
          isActive: !fee.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fee status');
      }

      toast.success(`Fee ${!fee.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchFees();
    } catch (error) {
      console.error('Failed to toggle fee status:', error);
      toast.error('Failed to update fee status');
    }
  };

  const handleDelete = async (feeId: string) => {
    if (!confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/fees/${feeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete fee');
      }

      toast.success('Fee deleted successfully!');
      fetchFees();
    } catch (error) {
      console.error('Failed to delete fee:', error);
      toast.error('Failed to delete fee');
    }
  };

  const totalActiveFees = fees.filter(f => f.isActive).reduce((sum, f) => sum + f.amount, 0);
  const activeFeeCount = fees.filter(f => f.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Create and manage registration fees</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Fee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingFee ? 'Edit Fee' : 'Create New Fee'}</DialogTitle>
                <DialogDescription>
                  {editingFee 
                    ? 'Update the fee details below.' 
                    : 'Add a new fee that will be displayed during registration.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fee Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Registration Fee, Annual Membership"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional information about this fee..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-gray-500">
                      {formData.isActive ? 'Fee is visible to users' : 'Fee is hidden from users'}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingFee ? 'Update Fee' : 'Create Fee')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Active Fees</p>
                <p className="text-2xl font-bold text-gray-900">₦{totalActiveFees.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Active Fees</p>
                <p className="text-2xl font-bold text-gray-900">{activeFeeCount}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">{fees.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Fees</CardTitle>
          <CardDescription>
            Manage registration fees that will be displayed to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No fees created yet</p>
                      <p className="text-sm">Click "Add New Fee" to create your first fee</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  fees.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell className="font-semibold">₦{fee.amount.toLocaleString()}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {fee.description || <span className="text-gray-400 italic">No description</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fee.isActive ? 'default' : 'secondary'}>
                          {fee.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(fee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(fee)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(fee)}>
                              <Switch className="w-4 h-4 mr-2" />
                              {fee.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(fee._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">How fees work</p>
              <p className="text-sm text-blue-700">
                Only <strong>active fees</strong> will be displayed to users during registration. 
                The total of all active fees will be calculated automatically. 
                You can deactivate fees temporarily without deleting them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
