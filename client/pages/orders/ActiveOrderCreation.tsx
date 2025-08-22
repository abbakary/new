import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import {
  Customer,
  User as UserType,
  UserRole,
  JobPriority,
  CreateServiceOrderRequest,
  CreateJobCardRequest,
  Asset,
} from "@shared/types";
import {
  Plus,
  Search,
  User,
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Edit,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Mock data - In real app, this would come from API
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St, City, State",
    customerType: "individual",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "ABC Company",
    email: "contact@abc.com",
    phone: "+1234567891",
    company: "ABC Corporation",
    customerType: "business",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Mary Johnson",
    email: "mary@example.com",
    phone: "+1234567894",
    customerType: "individual",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockAssets: Asset[] = [
  {
    id: "1",
    type: "vehicle",
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "ABC-123",
    vin: "1234567890",
    description: "Blue sedan",
    customerId: "1",
  },
  {
    id: "2",
    type: "vehicle",
    make: "Ford",
    model: "F-150",
    year: 2019,
    licensePlate: "XYZ-789",
    description: "Red pickup truck",
    customerId: "2",
  },
  {
    id: "3",
    type: "vehicle",
    make: "Honda",
    model: "Civic",
    year: 2021,
    licensePlate: "DEF-456",
    description: "White hatchback",
    customerId: "3",
  },
];

const mockTechnicians: UserType[] = [
  {
    id: "tech-1",
    name: "Mike Johnson",
    email: "mike@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+1234567892",
    isActive: true,
    createdAt: new Date(),
    permissions: [],
  },
  {
    id: "tech-2",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+1234567893",
    isActive: true,
    createdAt: new Date(),
    permissions: [],
  },
  {
    id: "tech-3",
    name: "Tom Brown",
    email: "tom@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+1234567894",
    isActive: false,
    createdAt: new Date(),
    permissions: [],
  },
];

const serviceTemplates = [
  {
    id: "oil-change",
    name: "Oil Change Service",
    description: "Complete oil change with filter replacement",
    estimatedDuration: 45,
    tasks: [
      "Drain old oil",
      "Replace oil filter",
      "Add new oil",
      "Check fluid levels",
    ],
    estimatedCost: { laborCost: 50, materialsCost: 30, additionalCosts: 5 },
  },
  {
    id: "brake-service",
    name: "Brake Inspection & Service",
    description: "Complete brake system inspection and service",
    estimatedDuration: 120,
    tasks: [
      "Inspect brake pads",
      "Check brake fluid",
      "Test brake performance",
      "Replace parts if needed",
    ],
    estimatedCost: { laborCost: 100, materialsCost: 150, additionalCosts: 15 },
  },
  {
    id: "tire-service",
    name: "Tire Service",
    description: "Tire rotation, balancing, and inspection",
    estimatedDuration: 60,
    tasks: [
      "Remove tires",
      "Inspect tire condition",
      "Rotate tires",
      "Check tire pressure",
      "Balance if needed",
    ],
    estimatedCost: { laborCost: 60, materialsCost: 80, additionalCosts: 10 },
  },
  {
    id: "custom",
    name: "Custom Service",
    description: "Custom service configuration",
    estimatedDuration: 60,
    tasks: [],
    estimatedCost: { laborCost: 0, materialsCost: 0, additionalCosts: 0 },
  },
];

export default function ActiveOrderCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [serviceTemplate, setServiceTemplate] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customTasks, setCustomTasks] = useState<string>("");
  const [priority, setPriority] = useState<JobPriority>(JobPriority.NORMAL);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [expectedCompletion, setExpectedCompletion] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState({
    laborCost: 0,
    materialsCost: 0,
    additionalCosts: 0,
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived data
  const selectedCustomer = mockCustomers.find(
    (c) => c.id === selectedCustomerId,
  );
  const customerAssets = mockAssets.filter(
    (a) => a.customerId === selectedCustomerId,
  );
  const selectedAsset = mockAssets.find((a) => a.id === selectedAssetId);
  const selectedTechnician = mockTechnicians.find(
    (t) => t.id === selectedTechnicianId,
  );
  const selectedTemplate = serviceTemplates.find(
    (s) => s.id === serviceTemplate,
  );

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return mockCustomers;
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email &&
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [searchTerm]);

  // Update estimated completion when scheduled date or template changes
  React.useEffect(() => {
    if (scheduledDate && selectedTemplate) {
      const scheduled = new Date(scheduledDate);
      const completion = new Date(
        scheduled.getTime() + selectedTemplate.estimatedDuration * 60000,
      );
      setExpectedCompletion(completion.toISOString().slice(0, 16));
    }
  }, [scheduledDate, selectedTemplate]);

  // Update cost estimation when template changes
  React.useEffect(() => {
    if (selectedTemplate && serviceTemplate !== "custom") {
      setEstimatedCost(selectedTemplate.estimatedCost);
    }
  }, [selectedTemplate, serviceTemplate]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setShowCustomerSearch(false);
    setSearchTerm("");
    // Reset asset selection when customer changes
    setSelectedAssetId("");
  };

  const handleServiceTemplateChange = (templateId: string) => {
    setServiceTemplate(templateId);
    const template = serviceTemplates.find((s) => s.id === templateId);

    if (template && templateId !== "custom") {
      setCustomTitle(template.name);
      setCustomDescription(template.description);
      setCustomTasks(template.tasks.join("\n"));
    } else if (templateId === "custom") {
      setCustomTitle("");
      setCustomDescription("");
      setCustomTasks("");
      setEstimatedCost({ laborCost: 0, materialsCost: 0, additionalCosts: 0 });
    }
  };

  const calculateTotal = () => {
    const subtotal =
      estimatedCost.laborCost +
      estimatedCost.materialsCost +
      estimatedCost.additionalCosts;
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer || !selectedTechnicianId || !customTitle) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create job card request
      const jobCardRequest: CreateJobCardRequest = {
        title: customTitle,
        description: customDescription,
        customerId: selectedCustomerId,
        assetId: selectedAssetId || undefined,
        assignedTechnicianId: selectedTechnicianId,
        scheduledStartDate: scheduledDate ? new Date(scheduledDate) : undefined,
        expectedCompletionDate: expectedCompletion
          ? new Date(expectedCompletion)
          : undefined,
        priority,
        tasks: customTasks.split("\n").filter((task) => task.trim()),
        estimatedCost: {
          ...estimatedCost,
          tax:
            calculateTotal() -
            (estimatedCost.laborCost +
              estimatedCost.materialsCost +
              estimatedCost.additionalCosts),
        },
      };

      // Create service order request
      const orderRequest: CreateServiceOrderRequest = {
        customerId: selectedCustomerId,
        serviceType: "custom",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        estimatedDuration: selectedTemplate?.estimatedDuration || 60,
        priority,
        customerNotes,
        jobCards: [jobCardRequest],
      };

      // In real app, this would be an API call
      console.log("Creating active order:", orderRequest);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      alert(
        `Active order created successfully!\nAssigned to: ${selectedTechnician?.name}\nCustomer: ${selectedCustomer.name}`,
      );

      // Navigate to active orders page
      navigate("/orders/active");
    } catch (error) {
      console.error("Failed to create active order:", error);
      alert("Failed to create active order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTechnicianStatusColor = (technician: UserType) => {
    return technician.isActive ? "text-green-600" : "text-gray-400";
  };

  const getTechnicianStatusIcon = (technician: UserType) => {
    return technician.isActive ? "🟢" : "🔴";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Active Order</h1>
          <p className="text-muted-foreground">
            Create a new active order from customer information and assign to
            technician
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/orders/active")}>
          View Active Orders
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Customer</Label>
                <Dialog
                  open={showCustomerSearch}
                  onOpenChange={setShowCustomerSearch}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      {selectedCustomer
                        ? selectedCustomer.name
                        : "Select Customer"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{customer.name}</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone}
                                  </div>
                                  {customer.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {customer.email}
                                    </div>
                                  )}
                                  {customer.address && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {customer.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {customer.customerType}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">{selectedCustomer.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedCustomer.phone}
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedCustomer.email}
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedCustomer.address}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Asset Selection */}
              {selectedCustomerId && customerAssets.length > 0 && (
                <div>
                  <Label>Vehicle/Asset (Optional)</Label>
                  <Select
                    value={selectedAssetId}
                    onValueChange={setSelectedAssetId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle/asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific asset</SelectItem>
                      {customerAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {asset.make} {asset.model} {asset.year} -{" "}
                            {asset.licensePlate}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedAsset && (
                <div className="p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedAsset.make} {selectedAsset.model}{" "}
                      {selectedAsset.year}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>License: {selectedAsset.licensePlate}</div>
                    {selectedAsset.vin && <div>VIN: {selectedAsset.vin}</div>}
                    <div>Description: {selectedAsset.description}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Configuration */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Service Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Template</Label>
                <Select
                  value={serviceTemplate}
                  onValueChange={handleServiceTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service template" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Title *</Label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter service title"
                  required
                />
              </div>

              <div>
                <Label>Service Description</Label>
                <Textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe the service to be performed"
                  rows={3}
                />
              </div>

              <div>
                <Label>Tasks (one per line)</Label>
                <Textarea
                  value={customTasks}
                  onChange={(e) => setCustomTasks(e.target.value)}
                  placeholder="List tasks to be performed&#10;One task per line"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value: JobPriority) => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={JobPriority.LOW}>Low</SelectItem>
                      <SelectItem value={JobPriority.NORMAL}>Normal</SelectItem>
                      <SelectItem value={JobPriority.HIGH}>High</SelectItem>
                      <SelectItem value={JobPriority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Duration</Label>
                  <Input
                    value={selectedTemplate?.estimatedDuration || 60}
                    disabled
                    placeholder="minutes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Scheduling */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Assignment & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Assign Technician *</Label>
                <Select
                  value={selectedTechnicianId}
                  onValueChange={setSelectedTechnicianId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTechnicians.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id}>
                        <div className="flex items-center gap-2">
                          <span>{getTechnicianStatusIcon(technician)}</span>
                          <span
                            className={getTechnicianStatusColor(technician)}
                          >
                            {technician.name}
                          </span>
                          {!technician.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTechnician && (
                <Alert>
                  <div className="flex items-center gap-2">
                    <span>{getTechnicianStatusIcon(selectedTechnician)}</span>
                    <AlertDescription>
                      <strong>{selectedTechnician.name}</strong> is currently{" "}
                      {selectedTechnician.isActive
                        ? "online and available"
                        : "offline"}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div>
                <Label>Scheduled Start Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Expected Completion</Label>
                <Input
                  type="datetime-local"
                  value={expectedCompletion}
                  onChange={(e) => setExpectedCompletion(e.target.value)}
                />
              </div>

              <div>
                <Label>Customer Notes</Label>
                <Textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Any special notes from the customer"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Estimation */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Estimation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Labor Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost.laborCost}
                  onChange={(e) =>
                    setEstimatedCost((prev) => ({
                      ...prev,
                      laborCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Materials Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost.materialsCost}
                  onChange={(e) =>
                    setEstimatedCost((prev) => ({
                      ...prev,
                      materialsCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Additional Costs ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost.additionalCosts}
                  onChange={(e) =>
                    setEstimatedCost((prev) => ({
                      ...prev,
                      additionalCosts: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Total Estimate ($)</Label>
                <Input
                  value={calculateTotal().toFixed(2)}
                  disabled
                  className="font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/orders/active")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !selectedCustomer ||
              !selectedTechnicianId ||
              !customTitle ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create & Send to Technician
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
