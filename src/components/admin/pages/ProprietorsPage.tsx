import { useState, useEffect } from 'react';
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
import { Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, Phone, Mail, Users } from 'lucide-react';

interface Proprietor {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  school?: {
    name: string;
    _id: string;
  };
  registrationStatus: string;
  createdAt: string;
}

interface ProprietorsPageProps {
  authToken: string | null;
}

export function ProprietorsPage({ authToken }: ProprietorsPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [proprietors, setProprietors] = useState<Proprietor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProprietors = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/v1/proprietors', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch proprietors');
        }

        const data = await response.json();
        // Ensure data is an array
        const proprietorsArray = Array.isArray(data) ? data : (data.data || data.proprietors || []);
        setProprietors(proprietorsArray);
      } catch (error) {
        console.error('Failed to fetch proprietors:', error);
        setProprietors([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProprietors();
  }, [authToken]);

  const filteredProprietors = (proprietors || []).filter((proprietor) => {
    const matchesSearch = 
      `${proprietor.firstName} ${proprietor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proprietor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proprietor.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || proprietor.registrationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      approved: { variant: 'default', label: 'Active' },
      pending: { variant: 'secondary', label: 'Pending' },
      rejected: { variant: 'destructive', label: 'Suspended' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proprietors Management</h1>
          <p className="text-gray-600 mt-1">View and manage all registered proprietors</p>
        </div>
        <Button onClick={() => window.location.href = '/register'}>
          <Users className="w-4 h-4 mr-2" />
          Add Proprietor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Proprietors</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredProprietors.length} proprietor${filteredProprietors.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                <SelectItem value="rejected">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProprietors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No proprietors found</p>
                      <p className="text-sm">
                        {searchQuery 
                          ? 'Try adjusting your search or filters.' 
                          : 'Import data or add proprietors to get started.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProprietors.map((proprietor) => (
                    <TableRow key={proprietor._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {proprietor.firstName} {proprietor.middleName || ''} {proprietor.lastName}
                          </p>
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
                        <span className="text-gray-900">
                          {proprietor.school?.name || 'N/A'}
                        </span>
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
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/admin/proprietors/${proprietor._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/proprietors/${proprietor._id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Information
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProprietors.length > 0 ? '1' : '0'} to {filteredProprietors.length} of {proprietors.length} total results
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
    </div>
  );
}
