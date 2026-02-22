import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Building2,
  Users
} from 'lucide-react';

interface LevyPayment {
  _id: string;
  memberName: string;
  email: string;
  phone: string;
  chapter: string;
  schoolName: string;
  wards: string[];
  amount: number;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  receiptNumber: string;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

interface LevyPaymentStats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  successfulPayments: number;
  todayRevenue: number;
  todayCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface LevyPaymentsResponse {
  data: LevyPayment[];
  pagination: PaginationInfo;
}

interface LevyPaymentsPageProps {
  authToken: string | null;
}

export function LevyPaymentsPage({ authToken }: LevyPaymentsPageProps) {
  const [payments, setPayments] = useState<LevyPayment[]>([]);
  const [stats, setStats] = useState<LevyPaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';

  const fetchLevyPaymentsData = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Add filters if they exist
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      if (chapterFilter !== 'all') {
        queryParams.append('chapter', chapterFilter);
      }

      const headers = authToken ? { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/levy-payments?${queryParams}`, { headers }),
        fetch(`${API_BASE_URL}/levy-payments/stats`, { headers })
      ]);
      
      if (authToken && (paymentsRes.status === 401 || statsRes.status === 401)) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (paymentsRes.ok) {
        const paymentsData: LevyPaymentsResponse = await paymentsRes.json();
        setPayments(paymentsData.data || []);
        setPagination(paymentsData.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        });
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats({
          totalRevenue: 0,
          totalPayments: 0,
          pendingPayments: 0,
          successfulPayments: 0,
          todayRevenue: 0,
          todayCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch levy payments data:', error);
      toast.error('Failed to load levy payments');
      setPayments([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
      setStats({
        totalRevenue: 0,
        totalPayments: 0,
        pendingPayments: 0,
        successfulPayments: 0,
        todayRevenue: 0,
        todayCount: 0
      });
    } finally {
      setLoading(false);
    }
  }, [authToken, statusFilter, chapterFilter, API_BASE_URL]);

  useEffect(() => {
    fetchLevyPaymentsData(1, 10);
  }, [fetchLevyPaymentsData]);

  const handlePageChange = (newPage: number) => {
    fetchLevyPaymentsData(newPage, pagination.limit);
  };

  const handlePageSizeChange = (newLimit: number) => {
    fetchLevyPaymentsData(1, newLimit);
  };

  const handleRefresh = () => {
    fetchLevyPaymentsData(pagination.page, pagination.limit);
  };

  const handleExportPayments = async () => {
    setExporting(true);
    try {
      toast.info('Preparing export... This may take a moment.');

      const queryParams = new URLSearchParams({
        page: '1',
        limit: '10000',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      if (chapterFilter !== 'all') {
        queryParams.append('chapter', chapterFilter);
      }

      const headers = authToken ? { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_BASE_URL}/levy-payments?${queryParams}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch levy payments for export');
      }

      const data: LevyPaymentsResponse = await response.json();
      let allPayments = data.data || [];

      const dataToExport = allPayments.filter((payment) => {
        const matchesSearch = searchTerm === '' || 
          payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });

      if (dataToExport.length === 0) {
        toast.error('No levy payments to export with current filters');
        return;
      }

      const headers_csv = [
        'Receipt Number',
        'Payment Date',
        'Member Name',
        'Email',
        'Phone',
        'Chapter',
        'School Name',
        'Wards',
        'Amount (₦)',
        'Status',
        'Reference',
        'Payment Method'
      ];

      const rows = dataToExport.map(payment => [
        payment.receiptNumber || 'N/A',
        payment.paidAt 
          ? new Date(payment.paidAt).toLocaleDateString()
          : new Date(payment.createdAt).toLocaleDateString(),
        payment.memberName || 'N/A',
        payment.email || 'N/A',
        payment.phone || 'N/A',
        payment.chapter || 'N/A',
        payment.schoolName || 'N/A',
        payment.wards?.join('; ') || 'N/A',
        (payment.amount / 100).toFixed(2),
        payment.status,
        payment.reference,
        payment.paymentMethod || 'Paystack'
      ]);

      const csvContent = [
        headers_csv.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `levy_payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${dataToExport.length} levy payment records`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export levy payments. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = searchTerm === '' || 
      payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const statsConfig = [
    {
      title: 'Total Revenue',
      value: `₦${((stats?.totalRevenue || 0) / 100).toLocaleString()}`,
      count: `${stats?.totalPayments || 0} payments`,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Successful Payments',
      value: `${stats?.successfulPayments || 0}`,
      count: `₦${((stats?.totalRevenue || 0) / 100).toLocaleString()} paid`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Payments',
      value: `${stats?.pendingPayments || 0}`,
      count: 'Awaiting payment',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Today\'s Collection',
      value: `₦${((stats?.todayRevenue || 0) / 100).toLocaleString()}`,
      count: `${stats?.todayCount || 0} payments`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string; className: string }> = {
      success: { variant: 'default', label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' },
      pending: { variant: 'secondary', label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      failed: { variant: 'destructive', label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Secretariat Building Levy Payments
          </h1>
          <p className="text-gray-600 mt-1">Monitor NAPPS Nasarawa State Secretariat Building Levy payments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleExportPayments} 
            disabled={loading || exporting}
          >
            {exporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
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
                    <p className="text-sm text-gray-600">{stat.count}</p>
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

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Levy Payment Transactions</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `Showing ${Math.min(pagination.limit, filteredPayments.length)} of ${pagination.total} levy payments`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, school, email, or reference..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                <SelectItem value="Lafia">Lafia</SelectItem>
                <SelectItem value="Keffi">Keffi</SelectItem>
                <SelectItem value="Akwanga">Akwanga</SelectItem>
                <SelectItem value="Nasarawa">Nasarawa</SelectItem>
                <SelectItem value="Doma">Doma</SelectItem>
                <SelectItem value="Karu">Karu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Email/Phone</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">
                        {pagination.total === 0 ? 'No levy payment records found' : 'No payments match your filters'}
                      </p>
                      <p className="text-sm">
                        {pagination.total === 0 
                          ? 'Levy payments will appear here once proprietors complete their payments.'
                          : 'Try adjusting your search or filter criteria.'
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                      <TableCell className="font-medium">{payment.memberName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{payment.email}</div>
                          <div className="text-gray-500">{payment.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {payment.chapter}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{payment.schoolName}</TableCell>
                      <TableCell className="font-semibold">₦{(payment.amount / 100).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm">
                        {payment.paidAt 
                          ? new Date(payment.paidAt).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : new Date(payment.createdAt).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
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
                            <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                            <DropdownMenuItem>Resend Receipt Email</DropdownMenuItem>
                            {payment.status === 'pending' && (
                              <DropdownMenuItem>Verify Payment</DropdownMenuItem>
                            )}
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
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select 
                  value={pagination.limit.toString()} 
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">About Secretariat Building Levy</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="mb-2">
            The <strong>NAPPS Nasarawa State Secretariat Building Levy</strong> is a one-time payment of <strong>₦5,100</strong> 
            collected from all NAPPS members to support the construction of a permanent secretariat for the association.
          </p>
          <p className="text-sm">
            All payments are processed securely through Paystack and proprietors receive an official receipt upon successful payment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
