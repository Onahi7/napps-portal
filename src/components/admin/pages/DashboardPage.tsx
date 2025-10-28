import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, CreditCard, FileText, DollarSign, Activity, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'proprietors' | 'schools' | 'payments' | 'fees' | 'chapters' | 'import' | 'settings') => void;
}

interface ProprietorStats {
  total: number;
  byStatus: Record<string, number>;
  byNappsRegistration: Record<string, number>;
  byClearingStatus: Record<string, number>;
  byChapter: Record<string, number>;
  totalAmountDue: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: string;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<ProprietorStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nappsnasarawa.com/api/v1';
  const authToken = localStorage.getItem('admin_token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/proprietors/stats`, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats({
          total: 0,
          byStatus: {},
          byNappsRegistration: {},
          byClearingStatus: {},
          byChapter: {},
          totalAmountDue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken]);

  const statsConfig = [
    {
      title: 'Total Proprietors',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved',
      value: stats?.byStatus['approved'] || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending',
      value: stats?.byStatus['pending'] || 0,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Amount Due',
      value: stats?.totalAmountDue ? `₦${(stats.totalAmountDue / 1000000).toFixed(1)}M` : '₦0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your system</p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                    {stat.change && (
                      <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        {stat.change}
                      </p>
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

      {/* Recent Activity and Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chapter Analytics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Registrations by Chapter
            </CardTitle>
            <CardDescription>Distribution of proprietors across NAPPS chapters</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(stats?.byChapter || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([chapter, count]) => (
                    <div key={chapter} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          chapter === 'N/A' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <MapPin className={`w-5 h-5 ${
                            chapter === 'N/A' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {chapter === 'N/A' ? 'Unassigned' : chapter}
                          </p>
                          <p className="text-sm text-gray-500">
                            {((count as number / (stats?.total || 1)) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <Badge variant={chapter === 'N/A' ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
                        {count}
                      </Badge>
                    </div>
                  ))}
                {(!stats?.byChapter || Object.keys(stats.byChapter).length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No chapter data available</p>
                    <p className="text-sm">Chapter assignments will appear here</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('proprietors')}
              >
                <Users className="w-4 h-4 mr-2" />
                View Proprietors
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('chapters')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Manage Chapters
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('import')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('payments')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Payments
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('fees')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Fee Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Chart visualization</p>
                <p className="text-sm">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Chart visualization</p>
                <p className="text-sm">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
