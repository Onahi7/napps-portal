import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  BookOpen, 
  Save,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
  MapPin,
  UserCheck,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NAPPS_CHAPTERS } from '@/constants/napps-chapters';

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
  chapters?: string[];
  registrationStatus: string;
  createdAt: string;
}

interface ChaptersPageProps {
  authToken: string | null;
}

export function ChaptersPage({ authToken }: ChaptersPageProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [proprietors, setProprietors] = useState<Proprietor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [selectedProprietors, setSelectedProprietors] = useState<Set<string>>(new Set());
  const [bulkChapters, setBulkChapters] = useState<string[]>([]);

  // Fetch proprietors
  useEffect(() => {
    const fetchProprietors = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch proprietors');
        }

        const data = await response.json();
        const proprietorsArray = Array.isArray(data) ? data : (data.data || data.proprietors || []);
        setProprietors(proprietorsArray);
      } catch (error) {
        console.error('Failed to fetch proprietors:', error);
        toast({
          title: "Error",
          description: "Failed to fetch proprietors",
          variant: "destructive",
        });
        setProprietors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProprietors();
  }, [authToken, toast]);

  const filteredProprietors = (proprietors || []).filter((proprietor) => {
    const matchesSearch = 
      `${proprietor.firstName} ${proprietor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proprietor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proprietor.phone.includes(searchQuery) ||
      (proprietor.school?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proprietor.registrationStatus === statusFilter;
    
    const matchesChapter = chapterFilter === 'all' || 
      chapterFilter === 'unassigned' && (!proprietor.chapters || proprietor.chapters.length === 0) ||
      chapterFilter !== 'unassigned' && proprietor.chapters?.includes(chapterFilter);
    
    return matchesSearch && matchesStatus && matchesChapter;
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProprietors(new Set(filteredProprietors.map(p => p._id)));
    } else {
      setSelectedProprietors(new Set());
    }
  };

  const handleSelectProprietor = (proprietorId: string, checked: boolean) => {
    const newSelected = new Set(selectedProprietors);
    if (checked) {
      newSelected.add(proprietorId);
    } else {
      newSelected.delete(proprietorId);
    }
    setSelectedProprietors(newSelected);
  };

  const handleBulkChapterChange = (chapter: string, checked: boolean) => {
    if (checked) {
      setBulkChapters([...bulkChapters, chapter]);
    } else {
      setBulkChapters(bulkChapters.filter(c => c !== chapter));
    }
  };

  const handleBulkAssignChapters = async () => {
    if (selectedProprietors.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select proprietors to assign chapters to",
        variant: "destructive",
      });
      return;
    }

    if (bulkChapters.length === 0) {
      toast({
        title: "No Chapters Selected",
        description: "Please select chapters to assign",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors/bulk-assign-chapters`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proprietorIds: Array.from(selectedProprietors),
          chapters: bulkChapters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign chapters');
      }

      const result = await response.json();
      
      // Update local state
      setProprietors(proprietors.map(p => 
        selectedProprietors.has(p._id) 
          ? { ...p, chapters: [...new Set([...(p.chapters || []), ...bulkChapters])] }
          : p
      ));

      setSelectedProprietors(new Set());
      setBulkChapters([]);

      toast({
        title: "Success",
        description: `Chapters assigned to ${result.updated} proprietor(s)`,
      });
    } catch (error) {
      console.error('Failed to assign chapters:', error);
      toast({
        title: "Error",
        description: "Failed to assign chapters",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleIndividualChapterUpdate = async (proprietorId: string, chapters: string[]) => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proprietors/${proprietorId}/chapters`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapters }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chapters');
      }

      // Update local state
      setProprietors(proprietors.map(p => 
        p._id === proprietorId ? { ...p, chapters } : p
      ));

      toast({
        title: "Success",
        description: "Chapters updated successfully",
      });
    } catch (error) {
      console.error('Failed to update chapters:', error);
      toast({
        title: "Error",
        description: "Failed to update chapters",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const chaptersStats = {
    total: proprietors.length,
    assigned: proprietors.filter(p => p.chapters && p.chapters.length > 0).length,
    unassigned: proprietors.filter(p => !p.chapters || p.chapters.length === 0).length,
  };

  const chapterCounts = NAPPS_CHAPTERS.reduce((acc, chapter) => {
    acc[chapter] = proprietors.filter(p => p.chapters?.includes(chapter)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chapters Management</h1>
          <p className="text-gray-600 mt-1">Assign and manage NAPPS chapters for proprietors</p>
        </div>
        <Button disabled>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Proprietors</p>
                <p className="text-2xl font-bold">{chaptersStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">With Chapters</p>
                <p className="text-2xl font-bold">{chaptersStats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Unassigned</p>
                <p className="text-2xl font-bold">{chaptersStats.unassigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Total Chapters</p>
                <p className="text-2xl font-bold">{NAPPS_CHAPTERS.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Assignment Card */}
      {selectedProprietors.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Bulk Chapter Assignment ({selectedProprietors.size} selected)
            </CardTitle>
            <CardDescription>
              Select chapters to assign to all selected proprietors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Chapters to Assign</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-white rounded-lg border">
                {NAPPS_CHAPTERS.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bulk-${chapter}`}
                      checked={bulkChapters.includes(chapter)}
                      onCheckedChange={(checked) => handleBulkChapterChange(chapter, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`bulk-${chapter}`} 
                      className="text-sm cursor-pointer"
                    >
                      {chapter}
                      <span className="text-xs text-gray-500 ml-1">({chapterCounts[chapter]})</span>
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkAssignChapters}
                  disabled={saving || bulkChapters.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Assign Chapters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedProprietors(new Set());
                    setBulkChapters([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Proprietors</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredProprietors.length} proprietor${filteredProprietors.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or school..."
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
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {NAPPS_CHAPTERS.map((chapter) => (
                  <SelectItem key={chapter} value={chapter}>
                    {chapter} ({chapterCounts[chapter]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProprietors.size === filteredProprietors.length && filteredProprietors.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Proprietor</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Chapters</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProprietors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No proprietors found</p>
                      <p className="text-sm">
                        {searchQuery || statusFilter !== 'all' || chapterFilter !== 'all'
                          ? 'Try adjusting your search or filters.' 
                          : 'No proprietors available for chapter assignment.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProprietors.map((proprietor) => (
                    <ProprietorRow
                      key={proprietor._id}
                      proprietor={proprietor}
                      selected={selectedProprietors.has(proprietor._id)}
                      onSelect={(checked) => handleSelectProprietor(proprietor._id, checked)}
                      onUpdateChapters={(chapters) => handleIndividualChapterUpdate(proprietor._id, chapters)}
                      saving={saving}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProprietorRowProps {
  proprietor: Proprietor;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdateChapters: (chapters: string[]) => void;
  saving: boolean;
}

function ProprietorRow({ proprietor, selected, onSelect, onUpdateChapters, saving }: ProprietorRowProps) {
  const [editing, setEditing] = useState(false);
  const [localChapters, setLocalChapters] = useState<string[]>(proprietor.chapters || []);

  const handleSave = () => {
    onUpdateChapters(localChapters);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalChapters(proprietor.chapters || []);
    setEditing(false);
  };

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
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900">
            {proprietor.firstName} {proprietor.middleName || ''} {proprietor.lastName}
          </p>
          <p className="text-sm text-gray-500">{proprietor.email}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Building className="w-3 h-3 text-gray-400" />
          <span className="text-sm">{proprietor.school?.name || 'N/A'}</span>
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(proprietor.registrationStatus)}
      </TableCell>
      <TableCell>
        {editing ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {NAPPS_CHAPTERS.map((chapter) => (
                <div key={chapter} className="flex items-center space-x-1">
                  <Checkbox
                    id={`${proprietor._id}-${chapter}`}
                    checked={localChapters.includes(chapter)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setLocalChapters([...localChapters, chapter]);
                      } else {
                        setLocalChapters(localChapters.filter(c => c !== chapter));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`${proprietor._id}-${chapter}`}
                    className="text-xs cursor-pointer"
                  >
                    {chapter}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {(proprietor.chapters || []).length === 0 ? (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unassigned
              </Badge>
            ) : (
              proprietor.chapters?.map((chapter) => (
                <Badge key={chapter} variant="secondary" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {chapter}
                </Badge>
              ))
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {editing ? (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saving}
              className="text-xs"
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditing(true)}
            disabled={saving}
            className="text-xs"
          >
            Edit Chapters
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}