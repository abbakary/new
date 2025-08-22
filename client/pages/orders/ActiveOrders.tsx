import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  JobCard,
  JobStatus,
  JobPriority,
  UserRole,
} from '@shared/types';
import {
  Plus,
  Search,
  Clock,
  AlertTriangle,
  User,
  Car,
  Calendar,
  Timer,
  Phone,
  MapPin,
  Eye,
  Edit,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Mock data for active orders (incomplete job cards)
const mockActiveOrders: JobCard[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    title: 'Oil Change and Filter Replacement',
    description: 'Regular maintenance - change engine oil and oil filter',
    customerId: '1',
    customer: {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State',
      customerType: 'individual',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    assetId: '1',
    asset: {
      id: '1',
      type: 'vehicle',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: 'ABC-123',
      vin: '1234567890',
      description: 'Blue sedan',
      customerId: '1',
    },
    assignedTechnicianId: 'tech-1',
    assignedTechnician: {
      id: 'tech-1',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: UserRole.TECHNICIAN,
      phone: '+1234567892',
      isActive: true,
      createdAt: new Date(),
      permissions: [],
    },
    createdBy: 'manager-1',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    scheduledStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expectedCompletionDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    status: JobStatus.IN_PROGRESS,
    priority: JobPriority.NORMAL,
    tasks: ['Drain old oil', 'Replace oil filter', 'Add new oil', 'Check fluid levels'],
    laborEntries: [
      {
        id: '1',
        technicianId: 'tech-1',
        technicianName: 'Mike Johnson',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        hours: 1.5,
        hourlyRate: 50,
        description: 'Oil change work',
        isApproved: false,
      },
    ],
    materialsUsed: [
      {
        id: '1',
        name: 'Engine Oil 5W-30',
        partNumber: 'OIL-5W30-01',
        quantity: 5,
        unitPrice: 8.99,
        totalPrice: 44.95,
        category: 'fluids',
      },
    ],
    attachments: [],
    notes: ['Customer mentioned slight engine noise'],
    approvals: [],
    digitalSignatures: [],
    lastUpdatedBy: 'tech-1',
    lastUpdatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    estimatedCost: {
      laborCost: 75,
      materialsCost: 50,
      additionalCosts: 5,
      subtotal: 130,
      tax: 10.4,
      total: 140.4,
    },
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    title: 'Brake Inspection and Service',
    description: 'Customer reported squeaking noise when braking',
    customerId: '2',
    customer: {
      id: '2',
      name: 'ABC Company',
      email: 'contact@abc.com',
      phone: '+1234567891',
      company: 'ABC Corporation',
      customerType: 'business',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    assetId: '2',
    asset: {
      id: '2',
      type: 'vehicle',
      make: 'Ford',
      model: 'F-150',
      year: 2019,
      licensePlate: 'XYZ-789',
      description: 'Red pickup truck',
      customerId: '2',
    },
    assignedTechnicianId: 'tech-2',
    assignedTechnician: {
      id: 'tech-2',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: UserRole.TECHNICIAN,
      phone: '+1234567893',
      isActive: true,
      createdAt: new Date(),
      permissions: [],
    },
    createdBy: 'manager-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    scheduledStartDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    expectedCompletionDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    status: JobStatus.PENDING,
    priority: JobPriority.HIGH,
    tasks: ['Inspect brake pads', 'Check brake fluid', 'Test brake performance', 'Replace if needed'],
    laborEntries: [],
    materialsUsed: [],
    attachments: [],
    notes: ['Priority job - customer has important meeting'],
    approvals: [],
    digitalSignatures: [],
    lastUpdatedBy: 'manager-1',
    lastUpdatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    estimatedCost: {
      laborCost: 100,
      materialsCost: 200,
      additionalCosts: 15,
      subtotal: 315,
      tax: 25.2,
      total: 340.2,
    },
  },
  {
    id: '3',
    jobNumber: 'JOB-2024-003',
    title: 'Tire Rotation and Inspection',
    description: 'Routine tire maintenance and inspection',
    customerId: '3',
    customer: {
      id: '3',
      name: 'Mary Johnson',
      email: 'mary@example.com',
      phone: '+1234567894',
      customerType: 'individual',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    assetId: '3',
    asset: {
      id: '3',
      type: 'vehicle',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'DEF-456',
      description: 'White hatchback',
      customerId: '3',
    },
    assignedTechnicianId: 'tech-1',
    assignedTechnician: {
      id: 'tech-1',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: UserRole.TECHNICIAN,
      phone: '+1234567892',
      isActive: true,
      createdAt: new Date(),
      permissions: [],
    },
    createdBy: 'manager-1',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    scheduledStartDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    expectedCompletionDate: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
    status: JobStatus.WAITING_PARTS,
    priority: JobPriority.LOW,
    tasks: ['Remove tires', 'Inspect tire condition', 'Rotate tires', 'Check tire pressure'],
    laborEntries: [
      {
        id: '2',
        technicianId: 'tech-1',
        technicianName: 'Mike Johnson',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        hours: 0.5,
        hourlyRate: 50,
        description: 'Initial inspection',
        isApproved: false,
      },
    ],
    materialsUsed: [],
    attachments: [],
    notes: ['Waiting for new tire to replace damaged one'],
    approvals: [],
    digitalSignatures: [],
    lastUpdatedBy: 'tech-1',
    lastUpdatedAt: new Date(Date.now() - 15 * 60 * 1000),
    estimatedCost: {
      laborCost: 60,
      materialsCost: 120,
      additionalCosts: 10,
      subtotal: 190,
      tax: 15.2,
      total: 205.2,
    },
  },
];

export default function ActiveOrders() {
  const { hasPermission, user } = useAuth();
  const [orders, setOrders] = useState<JobCard[]>(mockActiveOrders);
  const [selectedOrder, setSelectedOrder] = useState<JobCard | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  const canCreateOrder = hasPermission('orders', 'create');
  const canUpdateOrder = hasPermission('orders', 'update');

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.asset?.licensePlate && order.asset.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    if (technicianFilter !== 'all') {
      filtered = filtered.filter(order => order.assignedTechnicianId === technicianFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by expected completion date
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      if (a.expectedCompletionDate && b.expectedCompletionDate) {
        return new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime();
      }
      
      return 0;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter, technicianFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === JobStatus.PENDING).length,
      in_progress: orders.filter(o => o.status === JobStatus.IN_PROGRESS).length,
      waiting_parts: orders.filter(o => o.status === JobStatus.WAITING_PARTS).length,
      waiting_approval: orders.filter(o => o.status === JobStatus.WAITING_APPROVAL).length,
    };
  }, [orders]);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return 'bg-gray-100 text-gray-800';
      case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case JobStatus.WAITING_PARTS: return 'bg-orange-100 text-orange-800';
      case JobStatus.WAITING_APPROVAL: return 'bg-yellow-100 text-yellow-800';
      case JobStatus.ON_HOLD: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case JobPriority.URGENT: return 'bg-red-100 text-red-800 border-red-200';
      case JobPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case JobPriority.NORMAL: return 'bg-blue-100 text-blue-800 border-blue-200';
      case JobPriority.LOW: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return Clock;
      case JobStatus.IN_PROGRESS: return Play;
      case JobStatus.WAITING_PARTS: return AlertTriangle;
      case JobStatus.WAITING_APPROVAL: return Pause;
      case JobStatus.ON_HOLD: return XCircle;
      default: return Clock;
    }
  };

  const calculateProgress = (order: JobCard) => {
    if (order.status === JobStatus.PENDING) return 0;
    if (order.status === JobStatus.IN_PROGRESS) return 60;
    if (order.status === JobStatus.WAITING_PARTS) return 40;
    if (order.status === JobStatus.WAITING_APPROVAL) return 90;
    return 0;
  };

  const isOverdue = (order: JobCard) => {
    if (!order.expectedCompletionDate) return false;
    return new Date() > new Date(order.expectedCompletionDate) && order.status !== JobStatus.COMPLETED;
  };

  const getUniqueAssignedTechnicians = () => {
    const technicians = orders.map(o => o.assignedTechnician).filter(Boolean);
    return Array.from(new Set(technicians.map(t => t!.id)))
      .map(id => technicians.find(t => t!.id === id)!);
  };

  const viewOrderDetails = (order: JobCard) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Orders</h1>
          <p className="text-muted-foreground">
            Monitor and manage ongoing service orders and job cards
          </p>
        </div>
        
        {canCreateOrder && (
          <Button asChild>
            <Link to="/orders/job-cards">
              <Plus className="h-4 w-4 mr-2" />
              New Job Card
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Active</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Waiting Parts</p>
                <p className="text-2xl font-bold">{statusCounts.waiting_parts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Pause className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Need Approval</p>
                <p className="text-2xl font-bold">{statusCounts.waiting_approval}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job number, customer, license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: JobStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={JobStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={JobStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={JobStatus.WAITING_PARTS}>Waiting Parts</SelectItem>
                <SelectItem value={JobStatus.WAITING_APPROVAL}>Need Approval</SelectItem>
                <SelectItem value={JobStatus.ON_HOLD}>On Hold</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={(value: JobPriority | 'all') => setPriorityFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value={JobPriority.URGENT}>Urgent</SelectItem>
                <SelectItem value={JobPriority.HIGH}>High</SelectItem>
                <SelectItem value={JobPriority.NORMAL}>Normal</SelectItem>
                <SelectItem value={JobPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {getUniqueAssignedTechnicians().map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || technicianFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'All orders are completed or no orders have been created yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const overdue = isOverdue(order);
            
            return (
              <Card 
                key={order.id} 
                className={`hover:shadow-md transition-shadow ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{order.jobNumber}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{order.title}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {order.customer.name}
                        </div>
                        {order.asset && (
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {order.asset.make} {order.asset.model} ({order.asset.licensePlate})
                          </div>
                        )}
                        {order.assignedTechnician && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.assignedTechnician.name}
                          </div>
                        )}
                        {order.expectedCompletionDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {format(new Date(order.expectedCompletionDate), 'MMM dd, HH:mm')}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{calculateProgress(order)}%</span>
                        </div>
                        <Progress value={calculateProgress(order)} className="h-2" />
                      </div>
                      
                      {order.notes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Note:</strong> {order.notes[order.notes.length - 1]}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {canUpdateOrder && (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/orders/job-cards?edit=${order.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.jobNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer and Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                    )}
                    {selectedOrder.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedOrder.customer.address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {selectedOrder.asset && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">
                          {selectedOrder.asset.make} {selectedOrder.asset.model} {selectedOrder.asset.year}
                        </span>
                      </div>
                      {selectedOrder.asset.licensePlate && (
                        <div>
                          <span className="font-medium">License:</span> {selectedOrder.asset.licensePlate}
                        </div>
                      )}
                      {selectedOrder.asset.vin && (
                        <div>
                          <span className="font-medium">VIN:</span> {selectedOrder.asset.vin}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600">{selectedOrder.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tasks</h4>
                    <ul className="space-y-1">
                      {selectedOrder.tasks.map((task, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedOrder.materialsUsed.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Materials Used</h4>
                      <div className="space-y-2">
                        {selectedOrder.materialsUsed.map((material) => (
                          <div key={material.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{material.name} (Qty: {material.quantity})</span>
                            <span className="font-medium">${material.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedOrder.laborEntries.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Time Tracking</h4>
                      <div className="space-y-2">
                        {selectedOrder.laborEntries.map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{entry.technicianName}</span>
                              <p className="text-sm text-gray-600">{entry.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Timer className="h-4 w-4" />
                                <span>{entry.hours}h</span>
                              </div>
                              <p className="text-sm text-gray-600">${(entry.hours * entry.hourlyRate).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedOrder.estimatedCost && (
                    <div>
                      <h4 className="font-medium mb-2">Cost Breakdown</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Labor:</span>
                          <span>${selectedOrder.estimatedCost.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Materials:</span>
                          <span>${selectedOrder.estimatedCost.materialsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Additional:</span>
                          <span>${selectedOrder.estimatedCost.additionalCosts.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${selectedOrder.estimatedCost.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${selectedOrder.estimatedCost.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>${selectedOrder.estimatedCost.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
