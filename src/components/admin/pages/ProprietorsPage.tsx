import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, Phone, Mail, Users, FileSpreadsheet, FileText, RefreshCw, AlertCircle, School, Clock } from 'lucide-react';
import { exportToCSV, exportTableToPDF } from '@/lib/export-utils';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://napps-backend-5ty7.onrender.com/api/v1';

interface Proprietor {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  school?: {
    _id?: string;
    schoolName?: string;
    name?: string;
  };
  schoolName?: string;
  chapters?: string[];
  lga?: string;
  registrationStatus: string;
  submissionStatus?: string;
  isActive?: boolean;
  nappsMembershipId?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProprietorsPageProps {
  authToken: string | null;
}

export function ProprietorsPage({ authToken }: ProprietorsPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [proprietors, setProprietors] = useState<Proprietor[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState<string>('25');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Proprietor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProprietors = useCallback(async (page: number, opts?: { silent?: boolean }) => {
    if (!authToken) {
      setLoading(false);
      setError('You are not signed in. Please log in again to view proprietors.');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (opts?.silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('registrationStatus', statusFilter);

      const response = await fetch(`${API_BASE_URL}/proprietors?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        signal: controller.signal,
      });

      if (response.status === 401) {
        setError('Session expired. Please log out and log in again.');
        toast.error('Session expired', { description: 'Your admin token is no longer valid.' });
        setProprietors([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const rows: Proprietor[] = Array.isArray(data) ? data : (data.data || data.proprietors || []);
      const info: PaginationInfo = data.pagination || { page: 1, limit: rows.length || 25, total: rows.length, pages: 1 };
      setProprietors(rows);
      setPagination(info);
      if (opts?.silent) toast.success('List refreshed');
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Failed to fetch proprietors:', err);
      setProprietors([]);
      const message = 'Could not reach the server. Check your connection and try again.';
      setError(message);
      toast.error('Failed to load proprietors', { description: message });
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [authToken, debouncedSearch, statusFilter, pageSize]);

  // Refetch whenever filters change (back to page 1), or on refresh
  useEffect(() => {
    fetchProprietors(1);
  }, [fetchProprietors]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages || page === pagination.page) return;
    fetchProprietors(page);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !authToken) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proprietors/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      toast.success('Proprietor deleted');
      setDeleteTarget(null);
      fetchProprietors(pagination.page, { silent: true });
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Could not delete proprietor');
    } finally {
      setDeleting(false);
    }
  };

  const getSchoolName = (p: Proprietor): string =>
    p.school?.schoolName || p.school?.name || p.schoolName || 'N/A';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      approved: { variant: 'default', label: 'Active' },
      pending: { variant: 'secondary', label: 'Pending' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    const config = variants[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubmissionBadge = (status?: string) => {
    if (!status || status === 'submitted') return null;
    const labels: Record<string, string> = { step1: 'Step 1/3', step2: 'Step 2/3', step3: 'Step 3/3', draft: 'Draft' };
    return (
      <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300 bg-amber-50">
        <Clock className="w-2.5 h-2.5 mr-1" />
        {labels[status] || status}
      </Badge>
    );
  };

  const fullName = (p: Proprietor) =>
    `${p.firstName} ${p.middleName || ''} ${p.lastName}`.replace(/\s+/g, ' ').trim();
  const registeredDate = (p: Proprietor) =>
    p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-NG') : 'N/A';
  const chapterOf = (p: Proprietor) => p.chapters?.[0] || p.lga || 'Nasarawa';

  const exportHeaders = {
    name: 'Proprietor Name',
    phone: 'Phone Number',
    email: 'Email Address',
    schoolName: 'School Name',
    chapter: 'Chapter / LGA',
    status: 'Registration Status',
    progress: 'Form Progress',
    membershipId: 'Membership ID',
    registeredAt: 'Registered Date',
  };

  const toCsvRows = (records: Proprietor[]) =>
    records.map((p) => ({
      name: fullName(p),
      phone: p.phone || '',
      email: p.email || '',
      schoolName: getSchoolName(p),
      chapter: chapterOf(p),
      status: p.registrationStatus,
      progress: p.submissionStatus === 'submitted' ? 'Complete' : (p.submissionStatus || 'incomplete'),
      membershipId: p.nappsMembershipId || '',
      registeredAt: registeredDate(p),
    }));

  const toPdfRows = (records: Proprietor[], startSerial: number) =>
    records.map((p, idx) => [
      startSerial + idx,
      fullName(p),
      getSchoolName(p),
      chapterOf(p),
      p.phone || 'N/A',
      p.registrationStatus,
      registeredDate(p),
    ]);

  /**
   * Pages through the API so exports can cover the whole filtered registry
   * instead of just the visible page.
   */
  const fetchAllForExport = async (): Promise<Proprietor[]> => {
    if (!authToken) throw new Error('Session expired. Please sign in again.');

    const params = new URLSearchParams({
      limit: '200',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter !== 'all') params.set('registrationStatus', statusFilter);

    const all: Proprietor[] = [];
    let page = 1;
    let pages = 1;

    do {
      params.set('page', String(page));
      const res = await fetch(`${API_BASE_URL}/proprietors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) throw new Error('Session expired. Please sign in again.');
      if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);

      const json = await res.json();
      const batch: Proprietor[] = json.data || [];
      all.push(...batch);
      pages = json.pagination?.pages ?? page;
      page += 1;
    } while (page <= pages && all.length < 10000);

    return all;
  };

  const handleExportCSV = async (scope: 'page' | 'all') => {
    try {
      setExporting(true);
      let records = proprietors;
      if (scope === 'all') {
        toast.info('Fetching the full registry for export...');
        records = await fetchAllForExport();
      }
      if (records.length === 0) {
        toast.error('No proprietors to export');
        return;
      }
      exportToCSV(toCsvRows(records), 'NAPPS_Proprietors_Registry', exportHeaders);
      toast.success(
        scope === 'all'
          ? `Exported all ${records.length.toLocaleString()} matching records to CSV`
          : `Exported ${records.length} records (page ${pagination.page}) to CSV`
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async (scope: 'page' | 'all') => {
    try {
      setExporting(true);
      let records = proprietors;
      let subtitle: string;
      if (scope === 'all') {
        toast.info('Fetching the full registry for the PDF report...');
        records = await fetchAllForExport();
        subtitle = `Filtered registry | ${records.length.toLocaleString()} of ${pagination.total.toLocaleString()} records`;
      } else {
        subtitle = `Page ${pagination.page} of ${pagination.pages} | Showing ${proprietors.length} of ${pagination.total.toLocaleString()} records`;
      }
      if (records.length === 0) {
        toast.error('No proprietors to export');
        return;
      }
      const approved = records.filter((p) => p.registrationStatus === 'approved').length;
      const pending = records.filter((p) => p.registrationStatus === 'pending').length;
      exportTableToPDF({
        title: 'Accredited School Proprietors Master Registry',
        subtitle,
        headers: ['S/N', 'Proprietor Name', 'School Name', 'Chapter', 'Phone', 'Status', 'Registered Date'],
        rows: toPdfRows(records, scope === 'all' ? 1 : (pagination.page - 1) * pagination.limit + 1),
        totalsRow: ['', `TOTAL: ${records.length.toLocaleString()} proprietors`, '', '', '', `${approved} active / ${pending} pending`, ''],
        columnWidths: [34, 150, 170, 90, 95, 80, 80],
        filename: 'NAPPS_Proprietors_Master_List',
        orientation: 'landscape',
        footerNote: 'Confidential | NAPPS Nasarawa State Portal | Official Registry Extract',
      });
      toast.success('Executive PDF report generated');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'PDF generation failed');
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = debouncedSearch !== '' || statusFilter !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
  };

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  // Compact page number window
  const pageNumbers = (() => {
    const { page, pages } = pagination;
    const window: number[] = [];
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    const end = Math.min(pages, start + 4);
    for (let i = start; i <= end; i++) window.push(i);
    return window;
  })();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proprietors Management</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${pagination.total.toLocaleString()} registered proprietor${pagination.total !== 1 ? 's' : ''} in the registry`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchProprietors(pagination.page, { silent: true })} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/register')}>
            <Users className="w-4 h-4 mr-2" />
            Add Proprietor
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Proprietors</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading...'
              : `Showing ${startItem.toLocaleString()}–${endItem.toLocaleString()} of ${pagination.total.toLocaleString()}`}
            {hasFilters && !loading && ' (filtered)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or membership ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 font-semibold" disabled={exporting || loading}>
                  <Download className={`w-4 h-4 text-emerald-700 ${exporting ? 'animate-pulse' : ''}`} />
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Current page ({proprietors.length} records)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExportCSV('page')} disabled={exporting || proprietors.length === 0} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Export to Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF('page')} disabled={exporting || proprietors.length === 0} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-red-600" />
                  Export Executive PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  Whole registry ({pagination.total.toLocaleString()} matching)
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExportCSV('all')} disabled={exporting || pagination.total === 0} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Export all records (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF('all')} disabled={exporting || pagination.total === 0} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-red-600" />
                  Export all records (PDF)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 text-sm">Failed to load proprietors</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
              </div>
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => fetchProprietors(pagination.page)}>
                Retry
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: Math.min(Number(pageSize), 8) }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : proprietors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">{error ? 'Records unavailable' : 'No proprietors found'}</p>
                      <p className="text-sm mt-1">
                        {error
                          ? 'Use the retry button above to reload.'
                          : hasFilters
                            ? 'Try adjusting your search or filters.'
                            : 'Registration submissions will appear here.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  proprietors.map((proprietor) => (
                    <TableRow key={proprietor._id} className="group hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {proprietor.firstName} {proprietor.middleName || ''} {proprietor.lastName}
                          </p>
                          {getSubmissionBadge(proprietor.submissionStatus) && (
                            <div className="mt-1">{getSubmissionBadge(proprietor.submissionStatus)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{proprietor.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{proprietor.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <School className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{getSchoolName(proprietor)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {proprietor.chapters && proprietor.chapters.length > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {proprietor.chapters[0]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            N/A
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(proprietor.registrationStatus)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(proprietor.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-60 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/admin/proprietors/${proprietor._id}`)} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/proprietors/${proprietor._id}`)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Information
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setDeleteTarget(proprietor)}>
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

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {Math.max(pagination.pages, 1)}
              </p>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v)}>
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pagination.pages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToPage(pagination.page - 1)}
                      aria-disabled={pagination.page <= 1}
                      className={pagination.page <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {pageNumbers.map((n) => (
                    <PaginationItem key={n}>
                      <PaginationLink
                        isActive={n === pagination.page}
                        onClick={() => goToPage(n)}
                        className="cursor-pointer"
                      >
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => goToPage(pagination.page + 1)}
                      aria-disabled={pagination.page >= pagination.pages}
                      className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this proprietor?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>
                  {getSchoolName(deleteTarget) !== 'N/A' && <> of {getSchoolName(deleteTarget)}</>}
                  {' '}will be permanently removed from the registry. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
