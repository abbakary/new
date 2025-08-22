import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Car,
  ShoppingCart,
  UserPlus,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfficeManagerDashboard() {
  // Mock data - In real app, this would come from API
  const stats = {
    activeOrders: 15,
    completedToday: 8,
    pendingApprovals: 3,
    totalCustomers: 245,
    newCustomersThisWeek: 12,
    weeklyRevenue: 12580,
    avgServiceTime: 2.5, // hours
    customerSatisfaction: 4.7,
  };

  const recentOrders = [
    {
      id: 'ORD-2024-015',
      customer: 'John Smith',
      service: 'Oil Change + Inspection',
      technician: 'Mike Johnson',
      status: 'in_progress',
      estimatedCompletion: '2:30 PM',
      priority: 'normal',
    },
    {
      id: 'ORD-2024-016',
      customer: 'ABC Company',
      service: 'Tire Replacement',
      technician: 'Sarah Wilson',
      status: 'waiting_approval',
      estimatedCompletion: '3:00 PM',
      priority: 'high',
    },
    {
      id: 'ORD-2024-017',
      customer: 'Mary Johnson',
      service: 'Brake Service',
      technician: 'Tom Brown',
      status: 'completed',
      estimatedCompletion: 'Completed',
      priority: 'normal',
    },
  ];

  const todaySchedule = [
    { time: '9:00 AM', customer: 'David Wilson', service: 'Oil Change', status: 'completed' },
    { time: '10:30 AM', customer: 'Lisa Chen', service: 'Tire Rotation', status: 'in_progress' },
    { time: '2:00 PM', customer: 'Robert Lee', service: 'Brake Inspection', status: 'pending' },
    { time: '3:30 PM', customer: 'Anna Garcia', service: 'Full Service', status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting_approval': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Office Manager Dashboard</h1>
          <p className="text-gray-600">Order management and customer coordination</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/orders/job-cards">
              <Plus className="h-4 w-4 mr-2" />
              New Job Card
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/customers/add">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                <p className="text-xs text-gray-500">Jobs finished</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
                <p className="text-xs text-gray-500">Require approval</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.weeklyRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest job cards and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{order.id}</span>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer} • {order.service}</p>
                    <p className="text-xs text-gray-500">Technician: {order.technician}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{order.estimatedCompletion}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link to="/orders/active">View All Active Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((appointment, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <div className="text-sm font-medium text-gray-600 w-16">
                    {appointment.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{appointment.customer}</p>
                    <p className="text-xs text-gray-500">{appointment.service}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${
                    appointment.status === 'completed' ? 'bg-green-500' :
                    appointment.status === 'in_progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Growth
            </CardTitle>
            <CardDescription>Customer acquisition this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Customers</span>
              <span className="text-2xl font-bold">{stats.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New This Week</span>
              <span className="text-lg font-semibold text-green-600">+{stats.newCustomersThisWeek}</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-gray-500">On track to meet monthly goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Metrics</CardTitle>
            <CardDescription>Average performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.avgServiceTime}h</p>
                <p className="text-sm text-gray-600">Avg Service Time</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.customerSatisfaction}/5</p>
                <p className="text-sm text-gray-600">Customer Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common office management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/orders/job-cards">
                <Plus className="h-6 w-6 mb-2" />
                New Job Card
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/customers/search">
                <Search className="h-6 w-6 mb-2" />
                Find Customer
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/customers/add">
                <UserPlus className="h-6 w-6 mb-2" />
                Add Customer
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/services/car">
                <Car className="h-6 w-6 mb-2" />
                Car Services
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/services/tires">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Tire Services
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/invoices">
                <FileText className="h-6 w-6 mb-2" />
                Invoices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
