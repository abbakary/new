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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobCardForm } from '@/components/job-cards/JobCardForm';
import { JobCardDisplay } from '@/components/job-cards/JobCardDisplay';
import { ProtectedComponent, useAuth } from '@/context/AuthContext';
import {
  JobCard,
  JobStatus,
  JobPriority,
  Customer,
  Asset,
  User as UserType,
  UserRole,
  CreateJobCardRequest,
} from '@shared/types';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  User,
} from 'lucide-react';

// Mock data - In real app, this would come from API
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    customerType: 'individual',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'ABC Company',
    email: 'contact@abc.com',
    phone: '+1234567891',
    company: 'ABC Corporation',
    customerType: 'business',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockAssets: Asset[] = [
  {
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
  {
    id: '2',
    type: 'vehicle',
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    licensePlate: 'XYZ-789',
    description: 'Red pickup truck',
    customerId: '2',
  },
];

const mockTechnicians: UserType[] = [
  {
    id: 'tech-1',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: UserRole.TECHNICIAN,
    phone: '+1234567892',
    isActive: true,
    createdAt: new Date(),
    permissions: [],
  },
  {
    id: 'tech-2',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: UserRole.TECHNICIAN,
    phone: '+1234567893',
    isActive: true,
    createdAt: new Date(),
    permissions: [],
  },
];

const mockJobCards: JobCard[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    title: 'Oil Change and Filter Replacement',
    description: 'Regular maintenance - change engine oil and oil filter',
    customerId: '1',
    customer: mockCustomers[0],
    assetId: '1',
    asset: mockAssets[0],
    assignedTechnicianId: 'tech-1',
    assignedTechnician: mockTechnicians[0],
    createdBy: 'manager-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    scheduledStartDate: new Date(),
    expectedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    status: JobStatus.IN_PROGRESS,
    priority: JobPriority.NORMAL,
    tasks: ['Drain old oil', 'Replace oil filter', 'Add new oil', 'Check fluid levels'],
    laborEntries: [],
    materialsUsed: [],
    attachments: [],
    notes: [],
    approvals: [],
    digitalSignatures: [],
    lastUpdatedBy: 'tech-1',
    lastUpdatedAt: new Date(),
    estimatedCost: {
      laborCost: 50,
      materialsCost: 30,
      additionalCosts: 5,
      subtotal: 85,
      tax: 6.8,
      total: 91.8,
    },
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    title: 'Brake Inspection',
    description: 'Customer reported squeaking noise when braking',
    customerId: '2',
    customer: mockCustomers[1],
    assetId: '2',
    asset: mockAssets[1],
    assignedTechnicianId: 'tech-2',
    assignedTechnician: mockTechnicians[1],
    createdBy: 'manager-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    scheduledStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    expectedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
    status: JobStatus.PENDING,
    priority: JobPriority.HIGH,
    tasks: ['Inspect brake pads', 'Check brake fluid', 'Test brake performance'],
    laborEntries: [],
    materialsUsed: [],
    attachments: [],
    notes: [],
    approvals: [],
    digitalSignatures: [],
    lastUpdatedBy: 'manager-1',
    lastUpdatedAt: new Date(),
    estimatedCost: {
      laborCost: 75,
      materialsCost: 120,
      additionalCosts: 10,
      subtotal: 205,
      tax: 16.4,
      total: 221.4,
    },
  },
];

export default function JobCards() {
  const { hasPermission, user } = useAuth();
  const [jobCards, setJobCards] = useState<JobCard[]>(mockJobCards);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const canCreate = hasPermission('job_cards', 'create');
  const canEdit = hasPermission('job_cards', 'update');
  const canDelete = hasPermission('job_cards', 'delete');

  // Filter job cards based on user role and permissions
  const filteredJobCards = useMemo(() => {
    let filtered = jobCards;

    // Filter by assigned technician for technician role
    if (user?.role === UserRole.TECHNICIAN) {
      filtered = filtered.filter(job => job.assignedTechnicianId === user.id);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(job => job.priority === priorityFilter);
    }

    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(job => job.assignedTechnicianId === assigneeFilter);
    }

    return filtered;
  }, [jobCards, searchTerm, statusFilter, priorityFilter, assigneeFilter, user]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: filteredJobCards.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
    };

    filteredJobCards.forEach(job => {
      if (job.status === JobStatus.PENDING) counts.pending++;
      if (job.status === JobStatus.IN_PROGRESS) counts.in_progress++;
      if (job.status === JobStatus.COMPLETED) counts.completed++;
      
      // Check if overdue
      if (job.expectedCompletionDate && 
          new Date() > new Date(job.expectedCompletionDate) && 
          job.status !== JobStatus.COMPLETED) {
        counts.overdue++;
      }
    });

    return counts;
  }, [filteredJobCards]);

  const handleCreateJobCard = async (data: CreateJobCardRequest) => {
    // Generate unique job number
    const jobNumber = `JOB-${new Date().getFullYear()}-${String(jobCards.length + 1).padStart(3, '0')}`;
    
    const customer = mockCustomers.find(c => c.id === data.customerId)!;
    const asset = data.assetId ? mockAssets.find(a => a.id === data.assetId) : undefined;
    const technician = data.assignedTechnicianId ? 
      mockTechnicians.find(t => t.id === data.assignedTechnicianId) : undefined;

    const newJobCard: JobCard = {
      id: Date.now().toString(),
      jobNumber,
      title: data.title,
      description: data.description,
      customerId: data.customerId,
      customer,
      assetId: data.assetId,
      asset,
      assignedTechnicianId: data.assignedTechnicianId,
      assignedTechnician: technician,
      createdBy: user?.id || 'unknown',
      createdAt: new Date(),
      scheduledStartDate: data.scheduledStartDate,
      expectedCompletionDate: data.expectedCompletionDate,
      status: JobStatus.PENDING,
      priority: data.priority,
      tasks: data.tasks,
      laborEntries: [],
      materialsUsed: [],
      attachments: [],
      notes: [],
      approvals: [],
      digitalSignatures: [],
      lastUpdatedBy: user?.id || 'unknown',
      lastUpdatedAt: new Date(),
      estimatedCost: data.estimatedCost ? {
        ...data.estimatedCost,
        subtotal: (data.estimatedCost.laborCost + data.estimatedCost.materialsCost + data.estimatedCost.additionalCosts),
        total: (data.estimatedCost.laborCost + data.estimatedCost.materialsCost + data.estimatedCost.additionalCosts + data.estimatedCost.tax),
      } : undefined,
    };

    setJobCards(prev => [newJobCard, ...prev]);
    setShowCreateDialog(false);
  };

  const handleStatusChange = (jobCard: JobCard, newStatus: JobStatus) => {
    setJobCards(prev => prev.map(job =>
      job.id === jobCard.id
        ? { ...job, status: newStatus, lastUpdatedAt: new Date(), lastUpdatedBy: user?.id || 'unknown' }
        : job
    ));
  };

  const handleUpdateJobCard = (updatedJobCard: JobCard) => {
    setJobCards(prev => prev.map(job =>
      job.id === updatedJobCard.id ? updatedJobCard : job
    ));
  };

  const handleDeleteJobCard = (jobCard: JobCard) => {
    if (confirm(`Are you sure you want to delete job card ${jobCard.jobNumber}?`)) {
      setJobCards(prev => prev.filter(job => job.id !== jobCard.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Cards</h1>
          <p className="text-muted-foreground">
            Manage work orders and job assignments
          </p>
        </div>
        
        <ProtectedComponent module="job_cards" action="create">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Job Card
          </Button>
        </ProtectedComponent>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{statusCounts.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job cards, customers..."
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
                <SelectItem value={JobStatus.ON_HOLD}>On Hold</SelectItem>
                <SelectItem value={JobStatus.COMPLETED}>Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={(value: JobPriority | 'all') => setPriorityFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value={JobPriority.LOW}>Low</SelectItem>
                <SelectItem value={JobPriority.NORMAL}>Normal</SelectItem>
                <SelectItem value={JobPriority.HIGH}>High</SelectItem>
                <SelectItem value={JobPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {mockTechnicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards List */}
      {filteredJobCards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No job cards found</h3>
            <p className="text-muted-foreground">
              {canCreate ? 'Create your first job card to get started.' : 'No job cards match your current filters.'}
            </p>
            {canCreate && (
              <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Job Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredJobCards.map(jobCard => (
            <JobCardDisplay
              key={jobCard.id}
              jobCard={jobCard}
              compact={viewMode === 'list'}
              showWorkflow={viewMode === 'grid'} // Show workflow in grid view for better space
              onEdit={canEdit ? (job) => {
                setSelectedJobCard(job);
                setShowEditDialog(true);
              } : undefined}
              onDelete={canDelete ? handleDeleteJobCard : undefined}
              onStatusChange={handleStatusChange}
              onUpdateJobCard={handleUpdateJobCard}
              onViewDetails={(job) => {
                setSelectedJobCard(job);
                // Navigate to detailed view
              }}
            />
          ))}
        </div>
      )}

      {/* Create Job Card Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
          </DialogHeader>
          <JobCardForm
            onSubmit={handleCreateJobCard}
            onCancel={() => setShowCreateDialog(false)}
            customers={mockCustomers}
            assets={mockAssets}
            technicians={mockTechnicians}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Job Card Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Card</DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <JobCardForm
              onSubmit={(data) => {
                // Handle edit submission
                setShowEditDialog(false);
                setSelectedJobCard(null);
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedJobCard(null);
              }}
              customers={mockCustomers}
              assets={mockAssets}
              technicians={mockTechnicians}
              initialData={{
                title: selectedJobCard.title,
                description: selectedJobCard.description,
                customerId: selectedJobCard.customerId,
                assetId: selectedJobCard.assetId,
                assignedTechnicianId: selectedJobCard.assignedTechnicianId,
                scheduledStartDate: selectedJobCard.scheduledStartDate,
                expectedCompletionDate: selectedJobCard.expectedCompletionDate,
                priority: selectedJobCard.priority,
                tasks: selectedJobCard.tasks,
                estimatedCost: selectedJobCard.estimatedCost,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
