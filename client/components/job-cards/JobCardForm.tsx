import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X, User, Car, Clock, AlertTriangle } from 'lucide-react';
import {
  CreateJobCardRequest,
  JobPriority,
  Customer,
  Asset,
  User as UserType,
  UserRole,
} from '@shared/types';

interface JobCardFormProps {
  onSubmit: (data: CreateJobCardRequest) => void;
  onCancel: () => void;
  customers: Customer[];
  assets: Asset[];
  technicians: UserType[];
  isLoading?: boolean;
  initialData?: Partial<CreateJobCardRequest>;
}

const priorityOptions = [
  { value: JobPriority.LOW, label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: JobPriority.NORMAL, label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: JobPriority.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: JobPriority.URGENT, label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const JobCardForm: React.FC<JobCardFormProps> = ({
  onSubmit,
  onCancel,
  customers,
  assets,
  technicians,
  isLoading = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<CreateJobCardRequest>({
    title: '',
    description: '',
    customerId: '',
    assetId: '',
    assignedTechnicianId: '',
    scheduledStartDate: undefined,
    expectedCompletionDate: undefined,
    priority: JobPriority.NORMAL,
    tasks: [''],
    estimatedCost: {
      laborCost: 0,
      materialsCost: 0,
      additionalCosts: 0,
      tax: 0,
    },
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    if (formData.tasks.filter(task => task.trim()).length === 0) {
      newErrors.tasks = 'At least one task is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        tasks: formData.tasks.filter(task => task.trim()),
      };
      onSubmit(submitData);
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, ''],
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const updateTask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => (i === index ? value : task)),
    }));
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const customerAssets = assets.filter(a => a.customerId === formData.customerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Oil Change, Tire Replacement"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: JobPriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={option.color}>{option.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the work to be performed..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Customer and Asset Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Customer & Asset Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, customerId: value, assetId: '' }))
                }
              >
                <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>}
            </div>

            <div>
              <Label htmlFor="asset">Asset/Vehicle</Label>
              <Select
                value={formData.assetId || ''}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, assetId: value }))
                }
                disabled={!formData.customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.customerId ? "Select asset" : "Select customer first"} />
                </SelectTrigger>
                <SelectContent>
                  {customerAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div>
                        <div className="font-medium">
                          {asset.make} {asset.model} {asset.year}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {asset.licensePlate || asset.serialNumber || asset.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
                <div><span className="font-medium">Phone:</span> {selectedCustomer.phone}</div>
                {selectedCustomer.email && (
                  <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>
                )}
                {selectedCustomer.company && (
                  <div><span className="font-medium">Company:</span> {selectedCustomer.company}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment and Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Assignment & Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="technician">Assigned Technician</Label>
            <Select
              value={formData.assignedTechnicianId || ''}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, assignedTechnicianId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select technician (optional)" />
              </SelectTrigger>
              <SelectContent>
                {technicians.filter(t => t.role === UserRole.TECHNICIAN).map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Scheduled Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledStartDate ? (
                      format(formData.scheduledStartDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledStartDate}
                    onSelect={(date) => 
                      setFormData(prev => ({ ...prev, scheduledStartDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Expected Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expectedCompletionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expectedCompletionDate ? (
                      format(formData.expectedCompletionDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expectedCompletionDate}
                    onSelect={(date) => 
                      setFormData(prev => ({ ...prev, expectedCompletionDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tasks to Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  placeholder={`Task ${index + 1}`}
                  className="flex-1"
                />
                {formData.tasks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.tasks && <p className="text-sm text-red-500">{errors.tasks}</p>}
          </div>
          
          <Button type="button" variant="outline" onClick={addTask} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Estimation (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="laborCost">Labor Cost</Label>
              <Input
                id="laborCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost?.laborCost || 0}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    estimatedCost: {
                      ...prev.estimatedCost!,
                      laborCost: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="materialsCost">Materials Cost</Label>
              <Input
                id="materialsCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost?.materialsCost || 0}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    estimatedCost: {
                      ...prev.estimatedCost!,
                      materialsCost: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="additionalCosts">Additional Costs</Label>
              <Input
                id="additionalCosts"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost?.additionalCosts || 0}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    estimatedCost: {
                      ...prev.estimatedCost!,
                      additionalCosts: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating...' : 'Create Job Card'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
