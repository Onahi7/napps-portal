import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface Payment {
  _id: string;
  proprietorId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
  };
  schoolId: {
    _id: string;
    schoolName: string;
  };
  amount: number; // in kobo
  paymentType: string;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  email: string;
  description?: string;
  metadata?: any;
  paystackTransactionId?: string;
  createdAt: string;
  paidAt?: string;
}

interface PaymentStats {
  totalRevenue: number;
  onlinePayments: number;
  onlineCount: number;
  pendingVerification: number;
  pendingCount: number;
  completedToday: number;
  completedCount: number;
  revenueChange?: string;
}

interface PaymentsPageProps {
  authToken: string | null;
}

export function PaymentsPage({ authToken }: PaymentsPageProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    const fetchPaymentsData = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const [paymentsRes, statsRes] = await Promise.all([
          fetch('http://localhost:3001/api/v1/payments', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch('http://localhost:3001/api/v1/payments/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);
        
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          // Backend returns { data: [], pagination: {} }
          setPayments(paymentsData.data || []);
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          // Set default stats if endpoint doesn't exist yet
          setStats({
            totalRevenue: 0,
            onlinePayments: 0,
            onlineCount: 0,
            pendingVerification: 0,
            pendingCount: 0,
            completedToday: 0,
            completedCount: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch payments data:', error);
        // Set empty data on error
        setPayments([]);
        setStats({
          totalRevenue: 0,
          onlinePayments: 0,
          onlineCount: 0,
          pendingVerification: 0,
          pendingCount: 0,
          completedToday: 0,
          completedCount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsData();
  }, [authToken]);

  const statsConfig = [
    {
      title: 'Total Revenue',
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: stats?.revenueChange,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Online Payments',
      value: `₦${(stats?.onlinePayments || 0).toLocaleString()}`,
      count: `${stats?.onlineCount || 0} transactions`,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Verification',
      value: `₦${(stats?.pendingVerification || 0).toLocaleString()}`,
      count: `${stats?.pendingCount || 0} pending`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Completed Today',
      value: `₦${(stats?.completedToday || 0).toLocaleString()}`,
      count: `${stats?.completedCount || 0} payments`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      success: { variant: 'default', label: 'Success' },
      pending: { variant: 'secondary', label: 'Pending' },
      failed: { variant: 'destructive', label: 'Failed' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMethodBadge = (reference: string) => {
    if (reference.startsWith('SIM_')) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Simulated
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Online
      </Badge>
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || (
      methodFilter === 'online' && payment.reference.startsWith('PAY_')
    ) || (
      methodFilter === 'online' && payment.reference.startsWith('SIM_')
    );
    return matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all payment transactions</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsConfig.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-green-600">{stat.change}</p>
                    )}
                    {'count' in stat && (
                      <p className="text-sm text-gray-600">{stat.count}</p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredPayments.length} transaction${filteredPayments.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by proprietor, school, or reference..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Payments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proprietor</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No payment records found</p>
                      <p className="text-sm">
                        Payments will appear here once proprietors complete registration and payment.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        {payment.proprietorId?.firstName || 'N/A'} {payment.proprietorId?.lastName || ''}
                      </TableCell>
                      <TableCell>{payment.schoolId?.schoolName || 'N/A'}</TableCell>
                      <TableCell>₦{(payment.amount / 100).toLocaleString()}</TableCell>
                      <TableCell>{getMethodBadge(payment.reference)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                      <TableCell>
                        {payment.paidAt 
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Receipt</DropdownMenuItem>
                            {payment.status === 'pending' && (
                              <>
                                <DropdownMenuItem>Verify Payment</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Reject Payment
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem>Send Notification</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredPayments.length > 0 ? '1' : '0'} to {filteredPayments.length} of {payments.length} total results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Configuration</CardTitle>
          <CardDescription>Current registration fee settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Base Registration Fee</p>
                <p className="text-sm text-gray-600">Standard registration fee for all proprietors</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₦50,000</p>
                <Badge variant="outline" className="mt-1">Active</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <p className="font-semibold text-gray-700">Platform Fee</p>
                <p className="text-sm text-gray-600">Additional processing fee (2%)</p>
              </div>
              <p className="text-xl font-semibold text-gray-700">₦1,000</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Edit Fee Configuration</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
