import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Settings,
  Shield,
  BarChart3,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Car,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  // Mock data - In real app, this would come from API
  const systemStats = {
    totalUsers: 15,
    activeUsers: 12,
    totalCustomers: 245,
    activeJobs: 23,
    completedJobs: 156,
    monthlyRevenue: 45680,
    systemUptime: 99.8,
    pendingApprovals: 5,
  };

  const recentActivities = [
    { id: 1, action: 'New user registered', user: 'Mike Johnson', time: '2 hours ago', type: 'user' },
    { id: 2, action: 'System backup completed', user: 'System', time: '4 hours ago', type: 'system' },
    { id: 3, action: 'Job card approved', user: 'Sarah Manager', time: '6 hours ago', type: 'approval' },
    { id: 4, action: 'Invoice generated', user: 'System', time: '8 hours ago', type: 'financial' },
  ];

  const usersByRole = {
    admins: 2,
    managers: 5,
    technicians: 8,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and administration control</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/users">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.systemUptime}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500">{systemStats.activeUsers} active</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{systemStats.pendingApprovals}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Active users by role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Administrators</span>
                  <span className="text-sm text-gray-600">{usersByRole.admins}</span>
                </div>
                <Progress value={(usersByRole.admins / systemStats.totalUsers) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Office Managers</span>
                  <span className="text-sm text-gray-600">{usersByRole.managers}</span>
                </div>
                <Progress value={(usersByRole.managers / systemStats.totalUsers) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Technicians</span>
                  <span className="text-sm text-gray-600">{usersByRole.technicians}</span>
                </div>
                <Progress value={(usersByRole.technicians / systemStats.totalUsers) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Overview
            </CardTitle>
            <CardDescription>Current job status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{systemStats.activeJobs}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{systemStats.completedJobs}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
            <Button className="w-full" asChild>
              <Link to="/orders/job-cards">View All Job Cards</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'system' ? 'bg-gray-500' :
                    activity.type === 'approval' ? 'bg-green-500' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                User Management
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/reports/monthly">
                <BarChart3 className="h-6 w-6 mb-2" />
                Reports
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/admin/settings">
                <Settings className="h-6 w-6 mb-2" />
                System Settings
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/customers/search">
                <UserCheck className="h-6 w-6 mb-2" />
                Customer Data
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/services/car">
                <Car className="h-6 w-6 mb-2" />
                Service Config
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/inventory/tires">
                <Wrench className="h-6 w-6 mb-2" />
                Inventory
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
