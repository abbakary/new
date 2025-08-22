import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  User,
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
  Bell,
  MessageSquare,
  Activity,
  Eye,
  Send,
  RefreshCw,
  MapPin,
  Timer,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  useTechnicianStatus,
  TechnicianStatusIndicator,
} from "@/context/TechnicianStatusContext";
import { CommunicationCenter } from "@/components/communication/CommunicationCenter";
import { JobCard, JobStatus, JobPriority } from "@shared/types";

// Mock data for active orders and technician activities
const mockActiveOrders = [
  {
    id: "ORD-2024-015",
    jobNumber: "JOB-2024-015",
    customer: "John Smith",
    vehicle: "Toyota Camry (ABC-123)",
    service: "Oil Change + Inspection",
    technician: "Mike Johnson",
    technicianId: "tech-1",
    status: "in_progress",
    priority: "normal",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    progress: 75,
    estimatedCost: 140.5,
    location: "Service Bay 1",
  },
  {
    id: "ORD-2024-016",
    customer: "ABC Company",
    jobNumber: "JOB-2024-016",
    vehicle: "Ford F-150 (XYZ-789)",
    service: "Tire Replacement",
    technician: "Sarah Wilson",
    technicianId: "tech-2",
    status: "waiting_approval",
    priority: "high",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    estimatedCompletion: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago (overdue)
    progress: 100,
    estimatedCost: 340.2,
    location: "Service Bay 2",
  },
  {
    id: "ORD-2024-017",
    customer: "Mary Johnson",
    jobNumber: "JOB-2024-017",
    vehicle: "Honda Civic (DEF-456)",
    service: "Brake Service",
    technician: "Tom Brown",
    technicianId: "tech-3",
    status: "pending",
    priority: "normal",
    startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    estimatedCompletion: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    progress: 0,
    estimatedCost: 220.75,
    location: "Service Bay 3",
  },
];

const mockPendingApprovals = [
  {
    id: "APP-001",
    jobNumber: "JOB-2024-016",
    customer: "ABC Company",
    technician: "Sarah Wilson",
    service: "Tire Replacement",
    completedAt: new Date(Date.now() - 30 * 60 * 1000),
    totalCost: 340.2,
    timeWorked: 3.5,
    priority: "high",
  },
  {
    id: "APP-002",
    jobNumber: "JOB-2024-014",
    customer: "Express Taxi",
    technician: "Mike Johnson",
    service: "Engine Diagnostic",
    completedAt: new Date(Date.now() - 45 * 60 * 1000),
    totalCost: 180.0,
    timeWorked: 2.0,
    priority: "normal",
  },
];

const mockTodaySchedule = [
  {
    time: "9:00 AM",
    customer: "David Wilson",
    service: "Oil Change",
    status: "completed",
    technician: "Mike Johnson",
  },
  {
    time: "10:30 AM",
    customer: "Lisa Chen",
    service: "Tire Rotation",
    status: "in_progress",
    technician: "Sarah Wilson",
  },
  {
    time: "2:00 PM",
    customer: "Robert Lee",
    service: "Brake Inspection",
    status: "pending",
    technician: "Tom Brown",
  },
  {
    time: "3:30 PM",
    customer: "Anna Garcia",
    service: "Full Service",
    status: "pending",
    technician: "Mike Johnson",
  },
];

export default function EnhancedOfficeManagerDashboard() {
  const { technicians, getActiveTechnicians } = useTechnicianStatus();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const activeTechnicians = getActiveTechnicians();
    const activeOrders = mockActiveOrders.filter(
      (order) => order.status !== "completed",
    );
    const completedToday = 8; // Mock data
    const pendingApprovals = mockPendingApprovals.length;
    const overdueOrders = mockActiveOrders.filter(
      (order) =>
        new Date() > new Date(order.estimatedCompletion) &&
        order.status !== "completed",
    ).length;
    const totalRevenue = 12580; // Mock data

    return {
      activeTechnicians: activeTechnicians.length,
      totalTechnicians: technicians.length,
      activeOrders: activeOrders.length,
      completedToday,
      pendingApprovals,
      overdueOrders,
      totalRevenue,
      avgCompletionTime: 2.5,
    };
  }, [technicians, getActiveTechnicians]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "waiting_approval":
        return "bg-orange-100 text-orange-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (estimatedCompletion: Date, status: string) => {
    return new Date() > new Date(estimatedCompletion) && status !== "completed";
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleViewApproval = (approval: any) => {
    setSelectedApproval(approval);
    setShowApprovalDialog(true);
  };

  const handleApproveJob = (approval: any, approved: boolean) => {
    // In real app, this would make API call
    console.log(
      `${approved ? "Approved" : "Rejected"} job ${approval.jobNumber}`,
    );
    setShowApprovalDialog(false);
    setSelectedApproval(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Process Control Center
          </h1>
          <p className="text-gray-600">
            Centralized workflow management and team coordination
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              New Active Order
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/customers/search">
              <Search className="h-4 w-4 mr-2" />
              Find Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Technicians
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeTechnicians}/{stats.totalTechnicians}
                </p>
                <p className="text-xs text-gray-500">Online now</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.activeOrders}
                </p>
                <p className="text-xs text-gray-500">In progress</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingApprovals}
                </p>
                <p className="text-xs text-gray-500">Need review</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-orange-500"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Completed jobs</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {stats.overdueOrders > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Attention Required:</strong> {stats.overdueOrders} order(s)
            are overdue and need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Active Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Active Orders
              </div>
              <Badge variant="outline">{mockActiveOrders.length} total</Badge>
            </CardTitle>
            <CardDescription>
              Live tracking of all ongoing service orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveOrders.map((order) => {
                const overdue = isOverdue(
                  order.estimatedCompletion,
                  order.status,
                );

                return (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      overdue ? "border-red-200 bg-red-50/30" : ""
                    }`}
                    onClick={() => handleViewOrder(order)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{order.jobNumber}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          {overdue && (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer} • {order.service}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.technician}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due:{" "}
                            {format(
                              new Date(order.estimatedCompletion),
                              "HH:mm",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TechnicianStatusIndicator
                          technicianId={order.technicianId}
                          size="sm"
                        />
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${order.estimatedCost.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.progress}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/orders/active">View All Active Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technician Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Status
            </CardTitle>
            <CardDescription>
              Real-time technician availability and workload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicians.map((technician) => (
                <div
                  key={technician.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <TechnicianStatusIndicator
                      technicianId={technician.id}
                      showDetails={true}
                      size="md"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {technician.workloadCount} jobs
                    </div>
                    <div className="text-xs text-gray-500">
                      {technician.location || "No location"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Jobs Requiring Approval
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {mockPendingApprovals.length} pending
                </Badge>
              </CardTitle>
              <CardDescription>
                Review completed work and approve job cards for invoicing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockPendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-medium mb-2">All caught up!</h3>
                  <p>No jobs pending approval at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockPendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {approval.jobNumber}
                            </span>
                            <Badge
                              className={getPriorityColor(approval.priority)}
                            >
                              {approval.priority}
                            </Badge>
                            <Badge variant="outline">
                              Completed{" "}
                              {format(new Date(approval.completedAt), "HH:mm")}{" "}
                              ago
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {approval.customer} • {approval.service}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {approval.technician}
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {approval.timeWorked}h worked
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />$
                              {approval.totalCost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewApproval(approval)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Service Schedule
              </CardTitle>
              <CardDescription>
                Planned appointments and current progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTodaySchedule.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-gray-600 w-20">
                        {appointment.time}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{appointment.customer}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.service}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.technician}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace("_", " ")}
                      </Badge>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          appointment.status === "completed"
                            ? "bg-green-500"
                            : appointment.status === "in_progress"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication">
          <CommunicationCenter />
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.completedToday}
                    </p>
                    <p className="text-sm text-gray-600">Jobs Completed</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.avgCompletionTime}h
                    </p>
                    <p className="text-sm text-gray-600">Avg Time</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency Target</span>
                    <span>85%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-green-600">+7% above target</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Team Productivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {technicians.map((tech) => (
                  <div key={tech.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <TechnicianStatusIndicator
                          technicianId={tech.id}
                          size="sm"
                        />
                        {tech.name}
                      </span>
                      <span>{tech.workloadCount} jobs</span>
                    </div>
                    <Progress value={tech.workloadCount * 25} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common office management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/orders/create">
                <Plus className="h-6 w-6 mb-2" />
                New Order
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

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.jobNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customer}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.vehicle}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Service Details</h4>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.service}
                  </p>
                  <p className="text-sm text-gray-600">
                    Technician: {selectedOrder.technician}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Progress:</span>
                <span className="font-bold">{selectedOrder.progress}%</span>
              </div>
              <Progress value={selectedOrder.progress} />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDialog(false)}
                >
                  Close
                </Button>
                <Button asChild>
                  <Link to={`/orders/job-cards?edit=${selectedOrder.id}`}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Details Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Job Approval - {selectedApproval?.jobNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Job Information</h4>
                  <p className="text-sm text-gray-600">
                    {selectedApproval.customer}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedApproval.service}
                  </p>
                  <p className="text-sm text-gray-600">
                    Technician: {selectedApproval.technician}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Work Summary</h4>
                  <p className="text-sm text-gray-600">
                    Time worked: {selectedApproval.timeWorked} hours
                  </p>
                  <p className="text-sm text-gray-600">
                    Total cost: ${selectedApproval.totalCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed:{" "}
                    {format(
                      new Date(selectedApproval.completedAt),
                      "MMM dd, HH:mm",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproveJob(selectedApproval, false)}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveJob(selectedApproval, true)}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
