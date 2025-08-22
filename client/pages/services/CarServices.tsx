import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Car,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings,
  Eye,
  Edit,
  Play,
  Pause,
  Square,
  Wrench,
  Users,
  Package,
  DollarSign,
  MapPin,
  Phone,
  Filter,
  RotateCcw,
  CheckCheck,
  XCircle,
  Timer,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceOrder {
  id: string;
  jobCardId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    plateNumber: string;
    color: string;
    mileage: number;
  };
  serviceType: string;
  servicePackage: string;
  services: ServiceItem[];
  assignedTechnician: string;
  status:
    | "Draft"
    | "Scheduled"
    | "In Progress"
    | "Quality Check"
    | "Completed"
    | "Cancelled"
    | "On Hold";
  priority: "Low" | "Normal" | "High" | "Urgent";
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: string;
  endTime?: string;
  createdDate: string;
  scheduledDate: string;
  completedDate?: string;
  totalCost: number;
  notes?: string;
  customerRequests?: string;
  qualityCheckPassed?: boolean;
  signedOff?: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: "Maintenance" | "Repair" | "Inspection" | "Diagnostic";
  estimatedTime: number; // in minutes
  cost: number;
  status: "Pending" | "In Progress" | "Completed" | "Skipped";
  technician?: string;
  notes?: string;
  partsRequired?: string[];
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  status: "Available" | "Busy" | "Off Duty";
  currentJobs: number;
  maxJobs: number;
  experience: string;
  rating: number;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: string[];
  estimatedDuration: number;
  price: number;
  category: string;
}

// Mock data
const mockServiceOrders: ServiceOrder[] = [
  {
    id: "SRV-001",
    jobCardId: "JOB-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    customerPhone: "+256 700 123 456",
    vehicleInfo: {
      make: "Toyota",
      model: "Camry",
      year: "2020",
      plateNumber: "UAG 123A",
      color: "Black",
      mileage: 45000,
    },
    serviceType: "Scheduled Maintenance",
    servicePackage: "Standard Service Package",
    services: [
      {
        id: "SRV-ITEM-001",
        name: "Oil Change",
        description: "Change engine oil and filter",
        category: "Maintenance",
        estimatedTime: 30,
        cost: 80000,
        status: "Completed",
        technician: "James Okello",
      },
      {
        id: "SRV-ITEM-002",
        name: "Brake Inspection",
        description: "Inspect brake pads and discs",
        category: "Inspection",
        estimatedTime: 45,
        cost: 50000,
        status: "In Progress",
        technician: "James Okello",
      },
    ],
    assignedTechnician: "James Okello",
    status: "In Progress",
    priority: "Normal",
    estimatedDuration: 120,
    actualDuration: 90,
    startTime: "10:30",
    createdDate: "2024-01-20",
    scheduledDate: "2024-01-20",
    totalCost: 130000,
    customerRequests: "Customer mentioned squeaking noise from brakes",
  },
  {
    id: "SRV-002",
    jobCardId: "JOB-002",
    customerId: "CUST-002",
    customerName: "Sarah Wilson",
    customerPhone: "+256 702 456 789",
    vehicleInfo: {
      make: "Honda",
      model: "Civic",
      year: "2019",
      plateNumber: "UAG 456B",
      color: "White",
      mileage: 32000,
    },
    serviceType: "Repair",
    servicePackage: "Engine Diagnostic",
    services: [
      {
        id: "SRV-ITEM-003",
        name: "Engine Diagnostic",
        description: "Computer diagnostic scan",
        category: "Diagnostic",
        estimatedTime: 60,
        cost: 100000,
        status: "Completed",
        technician: "Peter Mukasa",
      },
      {
        id: "SRV-ITEM-004",
        name: "Spark Plug Replacement",
        description: "Replace worn spark plugs",
        category: "Repair",
        estimatedTime: 90,
        cost: 150000,
        status: "Scheduled",
      },
    ],
    assignedTechnician: "Peter Mukasa",
    status: "Scheduled",
    priority: "High",
    estimatedDuration: 150,
    createdDate: "2024-01-19",
    scheduledDate: "2024-01-21",
    totalCost: 250000,
    customerRequests: "Engine misfiring at idle",
  },
];

const mockTechnicians: Technician[] = [
  {
    id: "TECH-001",
    name: "James Okello",
    specialization: ["Engine Repair", "Maintenance", "Brake Systems"],
    status: "Busy",
    currentJobs: 2,
    maxJobs: 3,
    experience: "8 years",
    rating: 4.8,
  },
  {
    id: "TECH-002",
    name: "Peter Mukasa",
    specialization: ["Diagnostics", "Electrical", "Engine Repair"],
    status: "Available",
    currentJobs: 1,
    maxJobs: 3,
    experience: "12 years",
    rating: 4.9,
  },
  {
    id: "TECH-003",
    name: "Mary Nakato",
    specialization: ["Transmission", "AC Systems", "Maintenance"],
    status: "Available",
    currentJobs: 0,
    maxJobs: 2,
    experience: "5 years",
    rating: 4.7,
  },
  {
    id: "TECH-004",
    name: "David Ssali",
    specialization: ["Brake Systems", "Suspension", "Maintenance"],
    status: "Off Duty",
    currentJobs: 0,
    maxJobs: 3,
    experience: "6 years",
    rating: 4.6,
  },
];

const mockServicePackages: ServicePackage[] = [
  {
    id: "PKG-001",
    name: "Basic Service",
    description: "Essential maintenance package",
    services: ["Oil Change", "Filter Replacement", "Fluid Check"],
    estimatedDuration: 60,
    price: 120000,
    category: "Maintenance",
  },
  {
    id: "PKG-002",
    name: "Standard Service",
    description: "Comprehensive maintenance package",
    services: [
      "Oil Change",
      "Filter Replacement",
      "Brake Inspection",
      "Tire Check",
    ],
    estimatedDuration: 120,
    price: 200000,
    category: "Maintenance",
  },
  {
    id: "PKG-003",
    name: "Premium Service",
    description: "Complete vehicle inspection and maintenance",
    services: [
      "Oil Change",
      "Filter Replacement",
      "Brake Inspection",
      "Tire Check",
      "AC Service",
      "Engine Diagnostic",
    ],
    estimatedDuration: 180,
    price: 350000,
    category: "Maintenance",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-success text-success-foreground";
    case "In Progress":
      return "bg-info text-info-foreground";
    case "Scheduled":
      return "bg-warning text-warning-foreground";
    case "Quality Check":
      return "bg-purple-500 text-white";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Cancelled":
    case "On Hold":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-500 text-white";
    case "High":
      return "bg-orange-500 text-white";
    case "Normal":
      return "bg-blue-500 text-white";
    case "Low":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getTechnicianStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-success text-success-foreground";
    case "Busy":
      return "bg-warning text-warning-foreground";
    case "Off Duty":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function CarServices() {
  const [serviceOrders] = useState(mockServiceOrders);
  const [technicians] = useState(mockTechnicians);
  const [servicePackages] = useState(mockServicePackages);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const calculateProgress = (services: ServiceItem[]) => {
    const completed = services.filter((s) => s.status === "Completed").length;
    return Math.round((completed / services.length) * 100);
  };

  const filteredOrders = serviceOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleInfo.plateNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesTechnician =
      selectedTechnician === "all" ||
      order.assignedTechnician === selectedTechnician;

    return matchesSearch && matchesStatus && matchesTechnician;
  });

  // Calculate summary statistics
  const totalOrders = serviceOrders.length;
  const inProgressOrders = serviceOrders.filter(
    (order) => order.status === "In Progress",
  ).length;
  const scheduledOrders = serviceOrders.filter(
    (order) => order.status === "Scheduled",
  ).length;
  const completedToday = serviceOrders.filter(
    (order) =>
      order.status === "Completed" &&
      order.completedDate === new Date().toISOString().split("T")[0],
  ).length;
  const availableTechnicians = technicians.filter(
    (tech) => tech.status === "Available",
  ).length;
  const totalRevenue = serviceOrders
    .filter((order) => order.status === "Completed")
    .reduce((sum, order) => sum + order.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Car Service Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle services, track progress, and coordinate technician
            assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Service Calendar
          </Button>
          <Button asChild>
            <Link to="/orders/job-cards">
              <Plus className="h-4 w-4 mr-2" />
              New Service Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Techs</p>
                <p className="text-2xl font-bold">{availableTechnicians}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Service Orders</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="packages">Service Packages</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
        </TabsList>

        {/* Service Orders Tab */}
        <TabsContent value="orders">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer, order ID, or plate number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Quality Check">Quality Check</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTechnician}
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.name}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Orders List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Active Service Orders
                  </CardTitle>
                  <CardDescription>
                    {filteredOrders.length} orders found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Export Report
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Customer & Vehicle</TableHead>
                      <TableHead>Service Info</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const progress = calculateProgress(order.services);
                      return (
                        <TableRow key={order.id} className="hover:bg-accent/50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Job: {order.jobCardId}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge
                                  className={getPriorityColor(order.priority)}
                                  variant="secondary"
                                >
                                  {order.priority}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.customerName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.vehicleInfo.make}{" "}
                                {order.vehicleInfo.model} (
                                {order.vehicleInfo.year})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.vehicleInfo.plateNumber}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                <span className="text-xs">
                                  {order.customerPhone}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.serviceType}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.servicePackage}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.services.length} services
                              </p>
                              <p className="text-sm font-medium text-success">
                                {formatCurrency(order.totalCost)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Timer className="h-3 w-3" />
                                <span>
                                  {order.actualDuration
                                    ? formatDuration(order.actualDuration)
                                    : formatDuration(
                                        order.estimatedDuration,
                                      )}{" "}
                                  est.
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.assignedTechnician}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-2 w-2 bg-success rounded-full"></div>
                                <span className="text-xs text-muted-foreground">
                                  Available
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                <span>{order.scheduledDate}</span>
                              </div>
                              {order.startTime && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Started: {order.startTime}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                      Service Order Details - {order.id}
                                      <Badge
                                        className={getStatusColor(order.status)}
                                      >
                                        {order.status}
                                      </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                      Complete service order information and
                                      progress tracking
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      {/* Order Header */}
                                      <div className="grid gap-4 md:grid-cols-3">
                                        <Card>
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                              <User className="h-4 w-4" />
                                              Customer Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2">
                                            <p className="font-medium">
                                              {selectedOrder.customerName}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm">
                                              <Phone className="h-3 w-3" />
                                              {selectedOrder.customerPhone}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              ID: {selectedOrder.customerId}
                                            </p>
                                          </CardContent>
                                        </Card>

                                        <Card>
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                              <Car className="h-4 w-4" />
                                              Vehicle Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2">
                                            <p className="font-medium">
                                              {selectedOrder.vehicleInfo.make}{" "}
                                              {selectedOrder.vehicleInfo.model}
                                            </p>
                                            <p className="text-sm">
                                              Year:{" "}
                                              {selectedOrder.vehicleInfo.year}
                                            </p>
                                            <p className="text-sm">
                                              Plate:{" "}
                                              {
                                                selectedOrder.vehicleInfo
                                                  .plateNumber
                                              }
                                            </p>
                                            <p className="text-sm">
                                              Color:{" "}
                                              {selectedOrder.vehicleInfo.color}
                                            </p>
                                            <p className="text-sm">
                                              Mileage:{" "}
                                              {selectedOrder.vehicleInfo.mileage.toLocaleString()}{" "}
                                              km
                                            </p>
                                          </CardContent>
                                        </Card>

                                        <Card>
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                              <Settings className="h-4 w-4" />
                                              Service Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2">
                                            <p className="font-medium">
                                              {selectedOrder.serviceType}
                                            </p>
                                            <p className="text-sm">
                                              {selectedOrder.servicePackage}
                                            </p>
                                            <Badge
                                              className={getPriorityColor(
                                                selectedOrder.priority,
                                              )}
                                            >
                                              {selectedOrder.priority} Priority
                                            </Badge>
                                            <p className="text-sm font-medium text-success">
                                              Total:{" "}
                                              {formatCurrency(
                                                selectedOrder.totalCost,
                                              )}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Service Progress */}
                                      <Card>
                                        <CardHeader>
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                              Service Progress
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline">
                                                {calculateProgress(
                                                  selectedOrder.services,
                                                )}
                                                % Complete
                                              </Badge>
                                              {selectedOrder.status ===
                                                "In Progress" && (
                                                <div className="flex gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                  >
                                                    <Pause className="h-4 w-4 mr-1" />
                                                    Pause
                                                  </Button>
                                                  <Button size="sm">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Complete
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-4">
                                            <Progress
                                              value={calculateProgress(
                                                selectedOrder.services,
                                              )}
                                              className="h-3"
                                            />

                                            <div className="space-y-3">
                                              {selectedOrder.services.map(
                                                (service, index) => (
                                                  <div
                                                    key={service.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                  >
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-3">
                                                        <div
                                                          className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                            service.status ===
                                                              "Completed"
                                                              ? "bg-success text-success-foreground"
                                                              : service.status ===
                                                                  "In Progress"
                                                                ? "bg-info text-info-foreground"
                                                                : "bg-muted text-muted-foreground",
                                                          )}
                                                        >
                                                          {service.status ===
                                                          "Completed" ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                          ) : service.status ===
                                                            "In Progress" ? (
                                                            <Play className="h-4 w-4" />
                                                          ) : (
                                                            index + 1
                                                          )}
                                                        </div>
                                                        <div>
                                                          <p className="font-medium">
                                                            {service.name}
                                                          </p>
                                                          <p className="text-sm text-muted-foreground">
                                                            {
                                                              service.description
                                                            }
                                                          </p>
                                                          <div className="flex items-center gap-3 mt-1">
                                                            <Badge variant="outline">
                                                              {service.category}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                              Est.{" "}
                                                              {formatDuration(
                                                                service.estimatedTime,
                                                              )}
                                                            </span>
                                                            <span className="text-xs font-medium">
                                                              {formatCurrency(
                                                                service.cost,
                                                              )}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      {service.technician && (
                                                        <div className="flex items-center gap-1 mt-2 ml-11 text-sm text-muted-foreground">
                                                          <User className="h-3 w-3" />
                                                          {service.technician}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <Badge
                                                        className={getStatusColor(
                                                          service.status,
                                                        )}
                                                      >
                                                        {service.status}
                                                      </Badge>
                                                      {service.status ===
                                                        "Pending" && (
                                                        <Button
                                                          size="sm"
                                                          variant="outline"
                                                        >
                                                          <Play className="h-4 w-4 mr-1" />
                                                          Start
                                                        </Button>
                                                      )}
                                                      {service.status ===
                                                        "In Progress" && (
                                                        <Button size="sm">
                                                          <CheckCircle className="h-4 w-4 mr-1" />
                                                          Complete
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Timeline and Notes */}
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-base">
                                              Timeline
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="flex items-center gap-3">
                                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                                              <div>
                                                <p className="text-sm font-medium">
                                                  Order Created
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {selectedOrder.createdDate}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <div className="h-2 w-2 bg-warning rounded-full"></div>
                                              <div>
                                                <p className="text-sm font-medium">
                                                  Scheduled
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {selectedOrder.scheduledDate}
                                                </p>
                                              </div>
                                            </div>
                                            {selectedOrder.startTime && (
                                              <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 bg-info rounded-full"></div>
                                                <div>
                                                  <p className="text-sm font-medium">
                                                    Started
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {selectedOrder.startTime}
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                            {selectedOrder.completedDate && (
                                              <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 bg-success rounded-full"></div>
                                                <div>
                                                  <p className="text-sm font-medium">
                                                    Completed
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {
                                                      selectedOrder.completedDate
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>

                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-base">
                                              Notes & Requests
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            {selectedOrder.customerRequests && (
                                              <div>
                                                <p className="text-sm font-medium">
                                                  Customer Requests:
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {
                                                    selectedOrder.customerRequests
                                                  }
                                                </p>
                                              </div>
                                            )}
                                            {selectedOrder.notes && (
                                              <div>
                                                <p className="text-sm font-medium">
                                                  Service Notes:
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {selectedOrder.notes}
                                                </p>
                                              </div>
                                            )}
                                            <div>
                                              <p className="text-sm font-medium">
                                                Technician Assigned:
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {
                                                  selectedOrder.assignedTechnician
                                                }
                                              </p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Print Job Card
                                    </Button>
                                    <Button variant="outline">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Order
                                    </Button>
                                    <Button>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Update Status
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {order.status === "Scheduled" && (
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technicians Tab */}
        <TabsContent value="technicians">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Technician Management
                  </CardTitle>
                  <CardDescription>
                    Monitor technician availability, workload, and performance
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {technicians.map((technician) => (
                  <Card
                    key={technician.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {technician.name}
                        </CardTitle>
                        <Badge
                          className={getTechnicianStatusColor(
                            technician.status,
                          )}
                        >
                          {technician.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Workload:</span>
                          <span>
                            {technician.currentJobs}/{technician.maxJobs}
                          </span>
                        </div>
                        <Progress
                          value={
                            (technician.currentJobs / technician.maxJobs) * 100
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Specializations:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {technician.specialization.map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Experience:</p>
                          <p className="font-medium">{technician.experience}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating:</p>
                          <p className="font-medium">
                            {technician.rating}/5.0 ⭐
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Packages Tab */}
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Service Packages</CardTitle>
                  <CardDescription>
                    Manage predefined service packages and pricing
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {servicePackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <Badge variant="outline">{pkg.category}</Badge>
                      </div>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Included Services:
                        </p>
                        <div className="space-y-1">
                          {pkg.services.map((service) => (
                            <div
                              key={service}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-3 w-3 text-success" />
                              {service}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration:</p>
                          <p className="font-medium">
                            {formatDuration(pkg.estimatedDuration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price:</p>
                          <p className="font-medium text-success">
                            {formatCurrency(pkg.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Use Package
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Service Schedule</CardTitle>
              <CardDescription>
                Today's scheduled services and technician assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Today ({new Date().toLocaleDateString()})
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Morning Schedule */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Morning Schedule (8:00 - 12:00)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {serviceOrders
                        .filter(
                          (order) =>
                            order.status === "Scheduled" ||
                            order.status === "In Progress",
                        )
                        .slice(0, 3)
                        .map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {order.customerName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.vehicleInfo.make}{" "}
                                {order.vehicleInfo.model} - {order.serviceType}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {order.assignedTechnician}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(order.estimatedDuration)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {order.startTime || "10:00"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Afternoon Schedule */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Afternoon Schedule (13:00 - 17:00)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {serviceOrders
                        .filter((order) => order.status === "Scheduled")
                        .slice(0, 2)
                        .map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {order.customerName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.vehicleInfo.make}{" "}
                                {order.vehicleInfo.model} - {order.serviceType}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {order.assignedTechnician}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(order.estimatedDuration)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                14:00
                              </p>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
