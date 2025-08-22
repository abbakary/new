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
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import {
  JobCard,
  JobStatus,
  JobPriority,
  UserRole,
  Customer,
} from '@shared/types';
import {
  Search,
  CheckCircle,
  FileText,
  Download,
  Printer,
  Mail,
  User,
  Car,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Star,
  Phone,
  MapPin,
  Timer,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

// Invoice interface
interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paidDate?: Date;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'labor' | 'material' | 'service';
}

// Mock completed job cards with auto-generated invoices
const mockCompletedOrders: (JobCard & { invoice: Invoice, customerRating?: number })[] = [
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
      address: '123 Main St, City, State 12345',
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    scheduledStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expectedCompletionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    actualStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    actualCompletionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: JobStatus.COMPLETED,
    priority: JobPriority.NORMAL,
    tasks: ['Drain old oil', 'Replace oil filter', 'Add new oil', 'Check fluid levels'],
    laborEntries: [
      {
        id: '1',
        technicianId: 'tech-1',
        technicianName: 'Mike Johnson',
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
        hours: 1.5,
        hourlyRate: 50,
        description: 'Oil change service',
        isApproved: true,
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
      {
        id: '2',
        name: 'Oil Filter',
        partNumber: 'FILTER-001',
        quantity: 1,
        unitPrice: 12.99,
        totalPrice: 12.99,
        category: 'filters',
      },
    ],
    attachments: [],
    notes: ['Service completed successfully', 'Customer satisfied with service'],
    approvals: [
      {
        id: '1',
        type: 'completion',
        requestedBy: 'tech-1',
        approverRole: UserRole.OFFICE_MANAGER,
        approvedBy: 'manager-1',
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'approved',
        notes: 'Work completed as expected',
      },
    ],
    digitalSignatures: [
      {
        id: '1',
        signedBy: 'john@example.com',
        signedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        signatureData: 'base64signaturedata',
      },
    ],
    lastUpdatedBy: 'manager-1',
    lastUpdatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    estimatedCost: {
      laborCost: 75,
      materialsCost: 57.94,
      additionalCosts: 5,
      subtotal: 137.94,
      tax: 11.04,
      total: 148.98,
    },
    actualCost: {
      laborCost: 75,
      materialsCost: 57.94,
      additionalCosts: 5,
      subtotal: 137.94,
      tax: 11.04,
      total: 148.98,
      profitMargin: 35.5,
    },
    customerRating: 5,
    invoice: {
      id: 'INV-001',
      invoiceNumber: 'INV-2024-001',
      jobCardId: '1',
      customerId: '1',
      issueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000), // 30 days later
      status: 'paid',
      subtotal: 137.94,
      tax: 11.04,
      total: 148.98,
      paymentMethod: 'Credit Card',
      paidDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '1',
          description: 'Labor - Oil Change Service',
          quantity: 1.5,
          unitPrice: 50,
          total: 75,
          type: 'labor',
        },
        {
          id: '2',
          description: 'Engine Oil 5W-30 (5L)',
          quantity: 1,
          unitPrice: 44.95,
          total: 44.95,
          type: 'material',
        },
        {
          id: '3',
          description: 'Oil Filter',
          quantity: 1,
          unitPrice: 12.99,
          total: 12.99,
          type: 'material',
        },
        {
          id: '4',
          description: 'Environmental Fee',
          quantity: 1,
          unitPrice: 5,
          total: 5,
          type: 'service',
        },
      ],
    },
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    title: 'Brake Inspection and Pad Replacement',
    description: 'Customer reported squeaking noise - brake pads replaced',
    customerId: '2',
    customer: {
      id: '2',
      name: 'ABC Company',
      email: 'contact@abc.com',
      phone: '+1234567891',
      company: 'ABC Corporation',
      address: '456 Business Ave, City, State 12345',
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    scheduledStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expectedCompletionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    actualStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    actualCompletionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: JobStatus.COMPLETED,
    priority: JobPriority.HIGH,
    tasks: ['Inspect brake pads', 'Check brake fluid', 'Replace brake pads', 'Test brake performance'],
    laborEntries: [
      {
        id: '2',
        technicianId: 'tech-2',
        technicianName: 'Sarah Wilson',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
        hours: 2.5,
        hourlyRate: 55,
        description: 'Brake inspection and pad replacement',
        isApproved: true,
      },
    ],
    materialsUsed: [
      {
        id: '3',
        name: 'Brake Pads Set (Front)',
        partNumber: 'BRAKE-PAD-001',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99,
        category: 'brakes',
      },
      {
        id: '4',
        name: 'Brake Fluid DOT 4',
        partNumber: 'BRAKE-FLUID-001',
        quantity: 1,
        unitPrice: 14.99,
        totalPrice: 14.99,
        category: 'fluids',
      },
    ],
    attachments: [],
    notes: ['Brake pads were severely worn', 'Brake fluid topped up', 'Test drive completed successfully'],
    approvals: [
      {
        id: '2',
        type: 'completion',
        requestedBy: 'tech-2',
        approverRole: UserRole.OFFICE_MANAGER,
        approvedBy: 'manager-1',
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'approved',
        notes: 'Excellent work, customer very satisfied',
      },
    ],
    digitalSignatures: [
      {
        id: '2',
        signedBy: 'contact@abc.com',
        signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        signatureData: 'base64signaturedata',
      },
    ],
    lastUpdatedBy: 'manager-1',
    lastUpdatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    estimatedCost: {
      laborCost: 137.5,
      materialsCost: 104.98,
      additionalCosts: 10,
      subtotal: 252.48,
      tax: 20.2,
      total: 272.68,
    },
    actualCost: {
      laborCost: 137.5,
      materialsCost: 104.98,
      additionalCosts: 10,
      subtotal: 252.48,
      tax: 20.2,
      total: 272.68,
      profitMargin: 42.8,
    },
    customerRating: 4,
    invoice: {
      id: 'INV-002',
      invoiceNumber: 'INV-2024-002',
      jobCardId: '2',
      customerId: '2',
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      subtotal: 252.48,
      tax: 20.2,
      total: 272.68,
      items: [
        {
          id: '5',
          description: 'Labor - Brake Service',
          quantity: 2.5,
          unitPrice: 55,
          total: 137.5,
          type: 'labor',
        },
        {
          id: '6',
          description: 'Brake Pads Set (Front)',
          quantity: 1,
          unitPrice: 89.99,
          total: 89.99,
          type: 'material',
        },
        {
          id: '7',
          description: 'Brake Fluid DOT 4',
          quantity: 1,
          unitPrice: 14.99,
          total: 14.99,
          type: 'material',
        },
        {
          id: '8',
          description: 'Inspection Fee',
          quantity: 1,
          unitPrice: 10,
          total: 10,
          type: 'service',
        },
      ],
    },
  },
];

export default function CompletedOrders() {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState(mockCompletedOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockCompletedOrders[0] | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  const canViewInvoices = hasPermission('invoices', 'read');

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.asset?.licensePlate && order.asset.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.actualCompletionDate!) >= cutoffDate);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.invoice.status === statusFilter);
    }

    if (technicianFilter !== 'all') {
      filtered = filtered.filter(order => order.assignedTechnicianId === technicianFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.actualCompletionDate!).getTime() - new Date(a.actualCompletionDate!).getTime()
    );
  }, [orders, searchTerm, dateFilter, statusFilter, technicianFilter]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.invoice.total, 0);
    const paidInvoices = orders.filter(order => order.invoice.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, order) => sum + order.invoice.total, 0);
    const avgRating = orders.reduce((sum, order) => sum + (order.customerRating || 0), 0) / orders.length;
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      paidRevenue,
      pendingInvoices: orders.filter(order => order.invoice.status === 'pending').length,
      avgCustomerRating: avgRating,
    };
  }, [orders]);

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueAssignedTechnicians = () => {
    const technicians = orders.map(o => o.assignedTechnician).filter(Boolean);
    return Array.from(new Set(technicians.map(t => t!.id)))
      .map(id => technicians.find(t => t!.id === id)!);
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Simulate invoice download
    console.log(`Downloading invoice ${invoice.invoiceNumber}`);
    // In real app, this would generate and download a PDF
  };

  const printInvoice = (invoice: Invoice) => {
    // Simulate invoice printing
    console.log(`Printing invoice ${invoice.invoiceNumber}`);
    // In real app, this would open a print dialog
  };

  const emailInvoice = (invoice: Invoice) => {
    // Simulate invoice email
    console.log(`Emailing invoice ${invoice.invoiceNumber}`);
    // In real app, this would send an email with the invoice
  };

  const viewOrderDetails = (order: typeof mockCompletedOrders[0]) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const viewInvoice = (order: typeof mockCompletedOrders[0]) => {
    setSelectedOrder(order);
    setShowInvoiceDialog(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Completed Orders</h1>
          <p className="text-muted-foreground">
            Review finished jobs with auto-generated invoices and customer information
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Paid Revenue</p>
                <p className="text-2xl font-bold">${stats.paidRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgCustomerRating.toFixed(1)}</p>
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
                  placeholder="Search by job number, customer, invoice number, license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No completed orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || dateFilter !== 'all' || statusFilter !== 'all' || technicianFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No orders have been completed yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{order.jobNumber}</h3>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                      <Badge className={getInvoiceStatusColor(order.invoice.status)}>
                        {order.invoice.invoiceNumber} - {order.invoice.status}
                      </Badge>
                      {order.customerRating && (
                        <div className="flex items-center gap-1">
                          {renderStars(order.customerRating)}
                        </div>
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
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed: {format(new Date(order.actualCompletionDate!), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Total: ${order.invoice.total.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Technician: {order.assignedTechnician?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        Time: {order.laborEntries.reduce((sum, entry) => sum + entry.hours, 0)}h
                      </div>
                    </div>
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
                    
                    {canViewInvoices && (
                      <Button
                        size="sm"
                        onClick={() => viewInvoice(order)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
                        <Mail className="h-4 w-4" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                    )}
                    {selectedOrder.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedOrder.customer.address}</span>
                      </div>
                    )}
                    {selectedOrder.customerRating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <div className="flex items-center gap-1">
                          {renderStars(selectedOrder.customerRating)}
                          <span className="ml-1">({selectedOrder.customerRating}/5)</span>
                        </div>
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
              
              {/* Service Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Work Performed</h4>
                    <p className="text-gray-600">{selectedOrder.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tasks Completed</h4>
                    <ul className="space-y-1">
                      {selectedOrder.tasks.map((task, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Service Dates</h4>
                      <div className="space-y-1 text-sm">
                        <div>Started: {format(new Date(selectedOrder.actualStartDate!), 'MMM dd, yyyy HH:mm')}</div>
                        <div>Completed: {format(new Date(selectedOrder.actualCompletionDate!), 'MMM dd, yyyy HH:mm')}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Technician</h4>
                      <div className="text-sm">
                        <div className="font-medium">{selectedOrder.assignedTechnician?.name}</div>
                        <div className="text-gray-600">{selectedOrder.assignedTechnician?.email}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Materials and Labor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOrder.materialsUsed.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Materials Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedOrder.materialsUsed.map((material) => (
                          <div key={material.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{material.name}</span>
                              <p className="text-sm text-gray-600">Qty: {material.quantity}</p>
                            </div>
                            <span className="font-medium">${material.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      Labor Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedOrder.laborEntries.map((entry) => (
                        <div key={entry.id} className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{entry.technicianName}</span>
                            <span className="font-medium">{entry.hours}h</span>
                          </div>
                          <p className="text-sm text-gray-600">{entry.description}</p>
                          <p className="text-sm text-gray-600">Rate: ${entry.hourlyRate}/hr</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice - {selectedOrder?.invoice.invoiceNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">TrackPro Auto Service</h2>
                  <p className="text-gray-600">123 Service Street</p>
                  <p className="text-gray-600">City, State 12345</p>
                  <p className="text-gray-600">Phone: (555) 123-4567</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold">{selectedOrder.invoice.invoiceNumber}</h3>
                  <p className="text-gray-600">Issue Date: {format(new Date(selectedOrder.invoice.issueDate), 'MMM dd, yyyy')}</p>
                  <p className="text-gray-600">Due Date: {format(new Date(selectedOrder.invoice.dueDate), 'MMM dd, yyyy')}</p>
                  <Badge className={getInvoiceStatusColor(selectedOrder.invoice.status)}>
                    {selectedOrder.invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Bill To */}
              <div>
                <h4 className="font-bold mb-2">Bill To:</h4>
                <div>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  {selectedOrder.customer.company && (
                    <p className="text-gray-600">{selectedOrder.customer.company}</p>
                  )}
                  {selectedOrder.customer.address && (
                    <p className="text-gray-600">{selectedOrder.customer.address}</p>
                  )}
                  <p className="text-gray-600">{selectedOrder.customer.phone}</p>
                  {selectedOrder.customer.email && (
                    <p className="text-gray-600">{selectedOrder.customer.email}</p>
                  )}
                </div>
              </div>
              
              {/* Service Details */}
              <div>
                <h4 className="font-bold mb-2">Service Details:</h4>
                <p><strong>Job:</strong> {selectedOrder.jobNumber} - {selectedOrder.title}</p>
                {selectedOrder.asset && (
                  <p><strong>Vehicle:</strong> {selectedOrder.asset.make} {selectedOrder.asset.model} {selectedOrder.asset.year} ({selectedOrder.asset.licensePlate})</p>
                )}
                <p><strong>Service Date:</strong> {format(new Date(selectedOrder.actualCompletionDate!), 'MMM dd, yyyy')}</p>
                <p><strong>Technician:</strong> {selectedOrder.assignedTechnician?.name}</p>
              </div>
              
              <Separator />
              
              {/* Invoice Items */}
              <div>
                <h4 className="font-bold mb-4">Items & Services:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Description</th>
                        <th className="text-center p-2">Qty</th>
                        <th className="text-right p-2">Unit Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.invoice.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.description}</td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2">${item.unitPrice.toFixed(2)}</td>
                          <td className="text-right p-2">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Invoice Total */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedOrder.invoice.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${selectedOrder.invoice.total.toFixed(2)}</span>
                    </div>
                    {selectedOrder.invoice.status === 'paid' && selectedOrder.invoice.paidDate && (
                      <div className="text-green-600 text-sm">
                        Paid on {format(new Date(selectedOrder.invoice.paidDate), 'MMM dd, yyyy')}
                        {selectedOrder.invoice.paymentMethod && (
                          <span> via {selectedOrder.invoice.paymentMethod}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Invoice Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => downloadInvoice(selectedOrder.invoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => printInvoice(selectedOrder.invoice)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => emailInvoice(selectedOrder.invoice)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
