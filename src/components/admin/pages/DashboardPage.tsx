import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, CreditCard, FileText, DollarSign, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'proprietors' | 'schools' | 'payments' | 'import' | 'settings') => void;
}

interface DashboardStats {
  totalProprietors: number;
  activeSchools: number;
  totalPayments: number;
  pendingApprovals: number;
  proprietorsChange?: string;
  schoolsChange?: string;
  paymentsChange?: string;
  approvalsChange?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: string;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/v1/admin/dashboard', {
        //   headers: { 'Authorization': `Bearer ${authToken}` }
        // });
        // const data = await response.json();
        // setStats(data.stats);
        // setActivities(data.activities);
        
        // Temporary: Set empty data until API is ready
        setStats({
          totalProprietors: 0,
          activeSchools: 0,
          totalPayments: 0,
          pendingApprovals: 0
        });
        setActivities([]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      title: 'Total Proprietors',
      value: stats?.totalProprietors || 0,
      change: stats?.proprietorsChange,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Schools',
      value: stats?.activeSchools || 0,
      change: stats?.schoolsChange,
      trend: 'up',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Payments',
      value: stats?.totalPayments ? `₦${(stats.totalPayments / 1000000).toFixed(1)}M` : '₦0',
      change: stats?.paymentsChange,
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      change: stats?.approvalsChange,
      trend: 'down',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
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
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent activities</p>
                  <p className="text-sm">Activity will appear here as users interact with the system</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                onClick={() => onNavigate('settings')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
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
