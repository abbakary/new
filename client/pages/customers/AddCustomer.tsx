import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  FileText,
  Wrench,
  Search as SearchIcon,
  Mail,
  MapPin,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import { useCustomerStore } from "@/context/CustomerStoreContext";
import { useFeedback } from "@/components/ui/status-popup";

// Types
interface CustomerFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  companyName: string;
  customerType: "Personal" | "Government" | "NGO" | "Private" | "";
  subType: string;

  // Contact Information
  phone: string;
  email: string;
  altPhone: string;
  address: string;
  city: string;
  district: string;
  country: string;

  // Business Information (for non-personal)
  businessRegNumber: string;
  taxId: string;
  contactPerson: string;

  // Personal Information (for personal customers)
  nationalId: string;
  isOwner: boolean;
  ownerName: string;
  relationship: string;

  // Visit context
  visitType: "Ask" | "Service" | "Sales" | "";
  arrivedAt: string; // ISO local (datetime-local input)
  leftAt: string; // ISO local (datetime-local input)

  // Desired initial service (replacing Vehicles step)
  desiredService: string;
  desiredServiceNotes: string;

  // Service Preferences
  preferredServices: string[];
  notes: string;

  // Sales-specific (visible when visitType = "Sales")
  salesItemType?: string;
  salesQuantity?: number;
  salesPricePerItem?: number;
  salesAmount?: number;
  salesPersonId?: string;
  salesPersonName?: string;
}

const customerSubTypes = {
  Personal: [
    "Car Owner",
    "Driver (Brings Client Car)",
    "Motorcycle Owner",
    "Other",
  ],
  Government: [
    "Fleet Management",
    "Individual Department",
    "Parastatal",
    "Local Government",
  ],
  NGO: [
    "International NGO",
    "Local NGO",
    "Humanitarian Organization",
    "Development Agency",
  ],
  Private: [
    "Company Fleet",
    "Taxi/Uber Company",
    "Transport Business",
    "Motorcycle (Bodaboda)",
    "Other Business",
  ],
};

const availableServices = [
  "Oil Change",
  "Tire Installation",
  "Tire Sales",
  "Engine Repair",
  "Brake Service",
  "Transmission Service",
  "AC Service",
  "Battery Service",
  "Consultation",
  "Fleet Maintenance",
];

// Mock existing customers for the "Use Existing" mode (aligns with search page)
const existingCustomers = [
  {
    id: "CUST-001",
    name: "John Doe",
    type: "Personal",
    subType: "Car Owner",
    phone: "+256 700 123 456",
    email: "john.doe@email.com",
    location: "Kampala, Uganda",
    status: "Active",
  },
  {
    id: "CUST-002",
    name: "Uganda Revenue Authority",
    type: "Government",
    subType: "Fleet Management",
    phone: "+256 414 123 456",
    email: "fleet@ura.go.ug",
    location: "Nakawa, Kampala",
    status: "Active",
  },
  {
    id: "CUST-003",
    name: "Express Taxi Services",
    type: "Private",
    subType: "Taxi Company",
    phone: "+256 702 987 654",
    email: "info@expresstaxi.ug",
    location: "Entebbe Road",
    status: "Active",
  },
  {
    id: "CUST-004",
    name: "World Vision Uganda",
    type: "NGO",
    subType: "Humanitarian",
    phone: "+256 414 567 890",
    email: "logistics@worldvision.ug",
    location: "Ntinda, Kampala",
    status: "Active",
  },
];

type SalesPerson = { id: string; name: string; phone?: string; role?: string };

const defaultSalesPeople: SalesPerson[] = [
{ id: "SP-001", name: "Sarah Wilson" },
{ id: "SP-002", name: "James Okello" },
{ id: "SP-003", name: "Peter Mukasa" },
];

export default function AddCustomer() {
  const navigate = useNavigate();
  const { addVisit, markLeft, visits } = useVisitTracking();
  const { addCustomer, customers } = useCustomerStore();
  const { success, error } = useFeedback();

  type ActiveTab = "basic" | "contact" | "service" | "preferences";
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [existingSearch, setExistingSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  type CreatedCustomerSummary = {
    id: string;
    name: string;
    customerType: string;
    phone: string;
    createdAt: string;
    visitId?: string;
  };
  const [createdCustomers, setCreatedCustomers] = useState<CreatedCustomerSummary[]>(() => {
    try {
      const raw = localStorage.getItem("createdCustomers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("createdCustomers", JSON.stringify(createdCustomers));
    } catch {}
  }, [createdCustomers]);

  // Salespeople state
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>(() => {
    try {
      const raw = localStorage.getItem("salesPeople");
      return raw ? (JSON.parse(raw) as SalesPerson[]) : defaultSalesPeople;
    } catch {
      return defaultSalesPeople;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("salesPeople", JSON.stringify(salesPeople));
    } catch {}
  }, [salesPeople]);
  const [newSalesName, setNewSalesName] = useState("");
  const [newSalesPhone, setNewSalesPhone] = useState("");

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    customerType: "",
    subType: "",
    phone: "",
    email: "",
    altPhone: "",
    address: "",
    city: "",
    district: "",
    country: "Uganda",
    businessRegNumber: "",
    taxId: "",
    contactPerson: "",
    nationalId: "",
    isOwner: true,
    ownerName: "",
    relationship: "",
    visitType: "",
    arrivedAt: "",
    leftAt: "",
    desiredService: "",
    desiredServiceNotes: "",
    preferredServices: [],
    notes: "",
    salesItemType: "",
    salesQuantity: undefined,
    salesPricePerItem: undefined,
    salesAmount: undefined,
    salesPersonId: "",
    salesPersonName: "",
  });

  const isPersonal = formData.customerType === "Personal";
  const isBusiness = ["Government", "NGO", "Private"].includes(
    formData.customerType,
  );

  // Auto-advance logic: when basic info is valid and user is on basic tab, move to contact
  const basicComplete = useMemo(() => {
    if (!formData.customerType) return false;
    if (!formData.subType) return false;
    if (isPersonal) {
      if (!formData.firstName || !formData.lastName) return false;
    } else {
      if (!formData.companyName) return false;
    }
    return true;
  }, [formData.customerType, formData.subType, formData.firstName, formData.lastName, formData.companyName, isPersonal]);

  useEffect(() => {
    if (mode === "new" && activeTab === "basic" && basicComplete) {
      setActiveTab("contact");
    }
  }, [basicComplete, activeTab, mode]);

  const validateBasicAndContact = () => {
    if (!basicComplete) return false;
    if (!formData.phone) return false;
    if (!formData.address) return false;
    if (!formData.city) return false;
    if (!formData.district) return false;
    return true;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(service)
        ? prev.preferredServices.filter((s) => s !== service)
        : [...prev.preferredServices, service],
    }));
  };

  const handlePartialSave = () => {
    if (!validateBasicAndContact()) {
      error("Missing required information", "Complete Basic Info and Contact & Address before saving.");
      return;
    }
    // Sales-specific validation and preparation
    if (formData.visitType === "Sales") {
      if (!formData.salesItemType || !formData.salesQuantity || !formData.salesPricePerItem || !(formData.salesPersonId || formData.salesPersonName)) {
        error("Incomplete sales details", "Provide item type, quantity, price per item, and salesperson.");
        setActiveTab("service");
        return;
      }
      if (!formData.salesAmount && formData.salesQuantity && formData.salesPricePerItem) {
        handleInputChange("salesAmount", formData.salesQuantity * formData.salesPricePerItem);
      }
    }
    const customerName = formData.customerType === "Personal" && formData.firstName
      ? `${formData.firstName} ${formData.lastName}`.trim()
      : formData.companyName || "New Customer";
    const visit = addVisit({
      customerName,
      visitType: (formData.visitType as any) || "Ask",
      service: formData.desiredService || undefined,
      arrivedAt: formData.arrivedAt || new Date().toISOString(),
      notes: formData.desiredServiceNotes || formData.notes || undefined,
      salesDetails:
        formData.visitType === "Sales"
          ? {
              itemType: formData.salesItemType,
              quantity: formData.salesQuantity,
              pricePerItem: formData.salesPricePerItem,
              amount:
                formData.salesAmount ??
                (formData.salesQuantity && formData.salesPricePerItem
                  ? formData.salesQuantity * formData.salesPricePerItem
                  : undefined),
              salesperson: formData.salesPersonId || formData.salesPersonName
                ? { id: formData.salesPersonId, name: formData.salesPersonName }
                : undefined,
            }
          : undefined,
    });
    // Save summary locally and keep user on page
    const id = `CUST-${Date.now()}`;
    // Persist to global customer store so search can find it
    addCustomer({
      id,
      name: customerName,
      type: formData.customerType || "Personal",
      subType: formData.subType,
      phone: formData.phone,
      email: formData.email,
      location: [formData.address, formData.city, formData.district, formData.country]
        .filter(Boolean)
        .join(", "),
      registeredDate: (formData.arrivedAt && new Date(formData.arrivedAt).toISOString()) || new Date().toISOString(),
      lastVisit: (formData.arrivedAt && new Date(formData.arrivedAt).toISOString()) || new Date().toISOString(),
      totalOrders: 0,
      status: "Active",
    });
    setCreatedCustomers((prev) => [
      {
        id,
        name: customerName,
        customerType: formData.customerType || "Personal",
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        visitId: visit.id,
      },
      ...prev,
    ]);
    success("Customer saved", "Visit started and header notifications updated.");
    // Reset and collapse form
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      companyName: "",
      customerType: "",
      subType: "",
      phone: "",
      email: "",
      altPhone: "",
      address: "",
      city: "",
      district: "",
      country: "Uganda",
      businessRegNumber: "",
      taxId: "",
      contactPerson: "",
      nationalId: "",
      isOwner: true,
      ownerName: "",
      relationship: "",
      visitType: "",
      arrivedAt: "",
      leftAt: "",
      desiredService: "",
      desiredServiceNotes: "",
      preferredServices: [],
      notes: "",
      salesItemType: "",
      salesQuantity: undefined,
      salesPricePerItem: undefined,
      salesAmount: undefined,
      salesPersonId: "",
      salesPersonName: "",
    }));
    setActiveTab("basic");
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Minimal validation based on visit type
    if ((formData.visitType === "Service" || formData.visitType === "Sales") && !formData.desiredService) {
      error("Missing desired service", "Select the service for this visit.");
      setActiveTab("service");
      return;
    }
    console.log("Customer Data:", formData);
    // Register a visit for this creation if visitType provided
    if (formData.visitType) {
      if (formData.visitType === "Sales") {
        if (!formData.salesItemType || !formData.salesQuantity || !formData.salesPricePerItem || !(formData.salesPersonId || formData.salesPersonName)) {
          error("Incomplete sales details", "Provide item type, quantity, price per item, and salesperson.");
          setActiveTab("service");
          return;
        }
        if (!formData.salesAmount && formData.salesQuantity && formData.salesPricePerItem) {
          handleInputChange("salesAmount", formData.salesQuantity * formData.salesPricePerItem);
        }
      }
      const customerName = formData.customerType === "Personal" && formData.firstName
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : formData.companyName || "New Customer";
      addVisit({
        customerName,
        visitType: formData.visitType as any,
        service: formData.desiredService || undefined,
        arrivedAt: formData.arrivedAt || undefined,
        notes: formData.desiredServiceNotes || formData.notes || undefined,
        salesDetails:
          formData.visitType === "Sales"
            ? {
                itemType: formData.salesItemType,
                quantity: formData.salesQuantity,
                pricePerItem: formData.salesPricePerItem,
                amount:
                  formData.salesAmount ??
                  (formData.salesQuantity && formData.salesPricePerItem
                    ? formData.salesQuantity * formData.salesPricePerItem
                    : undefined),
                salesperson: formData.salesPersonId || formData.salesPersonName
                  ? { id: formData.salesPersonId, name: formData.salesPersonName }
                  : undefined,
              }
            : undefined,
      });
    }
    // Persist customer to global store for search
    {
      const id = `CUST-${Date.now()}`;
      const customerName = formData.customerType === "Personal" && formData.firstName
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : formData.companyName || "New Customer";
      addCustomer({
        id,
        name: customerName,
        type: formData.customerType || "Personal",
        subType: formData.subType,
        phone: formData.phone,
        email: formData.email,
        location: [formData.address, formData.city, formData.district, formData.country]
          .filter(Boolean)
          .join(", "),
        registeredDate: (formData.arrivedAt && new Date(formData.arrivedAt).toISOString()) || new Date().toISOString(),
        lastVisit: (formData.arrivedAt && new Date(formData.arrivedAt).toISOString()) || new Date().toISOString(),
        totalOrders: 0,
        status: "Active",
      });
    }
    success("Customer registered successfully!");
    navigate("/customers/search");
  };

  const filteredExisting = useMemo(() => {
    if (!existingSearch.trim()) return existingCustomers;
    const st = existingSearch.toLowerCase();
    return existingCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(st) ||
        c.id.toLowerCase().includes(st) ||
        c.email.toLowerCase().includes(st) ||
        c.phone.includes(existingSearch),
    );
  }, [existingSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/customers/search">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Customer</h1>
          <p className="text-muted-foreground">
            Choose to create a new customer or use an existing one. For new customers, fill basic info, contact, visit context, desired service, and preferences.
          </p>
        </div>
      </div>

      {/* Mode selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Mode</CardTitle>
          <CardDescription>Select whether to create a new customer or use an existing one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)} className="grid grid-cols-2 gap-4">
            <label className={`border rounded-lg p-4 cursor-pointer ${mode === "new" ? "bg-accent" : ""}`}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="mode-new" />
                <span className="font-medium">Create New Customer</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Start a new customer record</p>
            </label>
            <label className={`border rounded-lg p-4 cursor-pointer ${mode === "existing" ? "bg-accent" : ""}`}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="mode-existing" />
                <span className="font-medium">Use Existing Customer</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Search and select an existing customer</p>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Existing customer search mode */}
      {mode === "existing" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Existing Customer</CardTitle>
            <CardDescription>Search by name, ID, email, or phone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type to search..."
                className="pl-10"
                value={existingSearch}
                onChange={(e) => setExistingSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filteredExisting.length === 0 ? (
                <p className="text-sm text-muted-foreground">No customers match your search.</p>
              ) : (
                filteredExisting.map((c) => (
                  <div key={c.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.id}</p>
                        <p className="text-xs text-muted-foreground">{c.subType}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{c.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${c.id}`)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/customers/${c.id}`)}>
                          Use Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-xs text-muted-foreground">Tip: If you can’t find the customer, switch back to "Create New Customer" above.</div>
          </CardContent>
        </Card>
      ) : null}

      {/* New customer form flow */}
      {mode === "new" && !showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Customer</CardTitle>
            <CardDescription>Open the form to add a new customer</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowForm(true)}>Open New Customer Form</Button>
          </CardContent>
        </Card>
      ) : null}
      {mode === "new" && showForm ? (
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Address</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Basic Information
                  </CardTitle>
                  <CardDescription>Customer type and identification details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Type */}
                  <div className="space-y-3">
                    <Label>Customer Type *</Label>
                    <RadioGroup
                      value={formData.customerType}
                      onValueChange={(value) => handleInputChange("customerType", value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                        <RadioGroupItem value="Personal" id="personal" />
                        <Label htmlFor="personal" className="flex-1 cursor-pointer">
                          <div className="font-medium">Personal</div>
                          <div className="text-sm text-muted-foreground">Individual customers</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                        <RadioGroupItem value="Government" id="government" />
                        <Label htmlFor="government" className="flex-1 cursor-pointer">
                          <div className="font-medium">Government</div>
                          <div className="text-sm text-muted-foreground">Government entities</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                        <RadioGroupItem value="NGO" id="ngo" />
                        <Label htmlFor="ngo" className="flex-1 cursor-pointer">
                          <div className="font-medium">NGO</div>
                          <div className="text-sm text-muted-foreground">Non-profit organizations</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                        <RadioGroupItem value="Private" id="private" />
                        <Label htmlFor="private" className="flex-1 cursor-pointer">
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-muted-foreground">Private companies</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Sub Type */}
                  {formData.customerType && (
                    <div className="space-y-2">
                      <Label htmlFor="subType">Customer Sub-Type *</Label>
                      <Select value={formData.subType} onValueChange={(value) => handleInputChange("subType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-type" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerSubTypes[formData.customerType as keyof typeof customerSubTypes]?.map((subType) => (
                            <SelectItem key={subType} value={subType}>
                              {subType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {isPersonal ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="companyName">Organization/Company Name *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder="Enter organization or company name"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Personal Customer Specific Fields */}
                  {isPersonal && (
                    <>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isOwner"
                            checked={formData.isOwner}
                            onCheckedChange={(checked) => handleInputChange("isOwner", checked)}
                          />
                          <Label htmlFor="isOwner">I am the vehicle owner</Label>
                        </div>

                        {!formData.isOwner && (
                          <div className="grid gap-4 md:grid-cols-2 ml-6">
                            <div className="space-y-2">
                              <Label htmlFor="ownerName">Vehicle Owner Name</Label>
                              <Input
                                id="ownerName"
                                value={formData.ownerName}
                                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                                placeholder="Enter owner's name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="relationship">Relationship to Owner</Label>
                              <Select value={formData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="driver">Driver</SelectItem>
                                  <SelectItem value="family">Family Member</SelectItem>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="friend">Friend</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Business Customer Specific Fields */}
                  {isBusiness && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="businessRegNumber">Registration Number</Label>
                        <Input
                          id="businessRegNumber"
                          value={formData.businessRegNumber}
                          onChange={(e) => handleInputChange("businessRegNumber", e.target.value)}
                          placeholder="Business registration number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          value={formData.taxId}
                          onChange={(e) => handleInputChange("taxId", e.target.value)}
                          placeholder="Tax identification number"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="contactPerson">Primary Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                          placeholder="Name of primary contact person"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">When required fields are filled, this will automatically proceed to Contact & Address.</div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" /> Contact & Address Information
                  </CardTitle>
                  <CardDescription>Communication details and location information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Primary Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+256 700 123 456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altPhone">Alternative Phone</Label>
                      <Input
                        id="altPhone"
                        type="tel"
                        value={formData.altPhone}
                        onChange={(e) => handleInputChange("altPhone", e.target.value)}
                        placeholder="+256 700 123 456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter full street address"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="e.g., Kampala"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        placeholder="e.g., Kampala"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="Uganda"
                      />
                    </div>
                  </div>

                  {/* Proceed or Save controls after step 2 */}
                  <div className="flex items-center justify-between border-t pt-4 mt-2">
                    <div className="text-sm text-muted-foreground">
                      After completing Basic Info and Contact & Address, you can proceed to choose a Service or save the customer now.
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("service")}>
                        Proceed to Service
                      </Button>
                      <Button type="button" onClick={handlePartialSave}>Save Customer Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service (replaces Vehicles step) */}
            <TabsContent value="service">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" /> Service & Visit Context
                  </CardTitle>
                  <CardDescription>Capture visit purpose, timings, and desired service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visit context */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Visit Type</Label>
                      <RadioGroup
                        value={formData.visitType}
                        onValueChange={(value) => handleInputChange("visitType", value)}
                        className="grid grid-cols-3 gap-2"
                      >
                        <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                          <RadioGroupItem value="Ask" id="visit-ask" />
                          <span className="text-sm">Ask / Consultation</span>
                        </label>
                        <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                          <RadioGroupItem value="Service" id="visit-service" />
                          <span className="text-sm">Service</span>
                        </label>
                        <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                          <RadioGroupItem value="Sales" id="visit-sales" />
                          <span className="text-sm">Sales</span>
                        </label>
                      </RadioGroup>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="arrivedAt">Arrived At</Label>
                          <Input
                            id="arrivedAt"
                            type="datetime-local"
                            value={formData.arrivedAt}
                            onChange={(e) => handleInputChange("arrivedAt", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="leftAt">Left At</Label>
                          <Input
                            id="leftAt"
                            type="datetime-local"
                            value={formData.leftAt}
                            onChange={(e) => handleInputChange("leftAt", e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Capture arrival and departure times for tracking.</p>
                    </div>
                  </div>

                  {/* Desired service */}
                  <div className="space-y-2">
                    <Label htmlFor="desiredService">Desired Service {formData.visitType === "Service" || formData.visitType === "Sales" ? "*" : ""}</Label>
                    <Select value={formData.desiredService} onValueChange={(value) => handleInputChange("desiredService", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map((svc) => (
                          <SelectItem key={svc} value={svc}>
                            {svc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.visitType === "Ask" && (
                      <p className="text-xs text-muted-foreground">If this is a consultation, selecting a service is optional. Use notes below to add context.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desiredServiceNotes">Notes / Details</Label>
                    <Textarea
                      id="desiredServiceNotes"
                      value={formData.desiredServiceNotes}
                      onChange={(e) => handleInputChange("desiredServiceNotes", e.target.value)}
                      placeholder="Add details about this visit (e.g., vehicle info for car service, request details, urgency)"
                      rows={3}
                    />
                  </div>

                  {formData.visitType === "Sales" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="salesItemType">Item Type *</Label>
                          <Input
                            id="salesItemType"
                            value={formData.salesItemType || ""}
                            onChange={(e) => handleInputChange("salesItemType", e.target.value)}
                            placeholder="e.g., Tire, Battery, Oil"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salesPerson">Salesperson *</Label>
                          <Select
                            value={formData.salesPersonId || ""}
                            onValueChange={(value) => {
                              const sp = salesPeople.find((s) => s.id === value);
                              handleInputChange("salesPersonId", value);
                              handleInputChange("salesPersonName", sp?.name || "");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select salesperson" />
                            </SelectTrigger>
                            <SelectContent>
                              {salesPeople.map((sp) => (
                                <SelectItem key={sp.id} value={sp.id}>
                                  {sp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="New salesperson name"
                              value={newSalesName}
                              onChange={(e) => setNewSalesName(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (!newSalesName.trim()) {
                                  error("Enter salesperson name");
                                  return;
                                }
                                const id = `SP-${Date.now()}`;
                                const sp = { id, name: newSalesName.trim() };
                                setSalesPeople((prev) => [sp, ...prev]);
                                handleInputChange("salesPersonId", id);
                                handleInputChange("salesPersonName", sp.name);
                                setNewSalesName("");
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="salesQuantity">Quantity *</Label>
                          <Input
                            id="salesQuantity"
                            type="number"
                            min="1"
                            value={formData.salesQuantity ?? ""}
                            onChange={(e) => {
                              const q = e.target.value ? Number(e.target.value) : undefined;
                              handleInputChange("salesQuantity", q);
                              const p = formData.salesPricePerItem ?? 0;
                              if (q && p) handleInputChange("salesAmount", q * p);
                            }}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salesPricePerItem">Price per Item *</Label>
                          <Input
                            id="salesPricePerItem"
                            type="number"
                            min="0"
                            value={formData.salesPricePerItem ?? ""}
                            onChange={(e) => {
                              const p = e.target.value ? Number(e.target.value) : undefined;
                              handleInputChange("salesPricePerItem", p);
                              const q = formData.salesQuantity ?? 0;
                              if (q && p) handleInputChange("salesAmount", q * p);
                            }}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salesAmount">Amount</Label>
                          <Input
                            id="salesAmount"
                            type="number"
                            value={formData.salesAmount ?? ""}
                            onChange={(e) => {
                              const a = e.target.value ? Number(e.target.value) : undefined;
                              handleInputChange("salesAmount", a);
                            }}
                            placeholder="0"
                          />
                          <p className="text-xs text-muted-foreground">Auto-calculated as quantity × price, but you can override.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Service Preferences & Notes
                  </CardTitle>
                  <CardDescription>Preferred services and additional information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Preferred Services</Label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {availableServices.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={formData.preferredServices.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <Label htmlFor={service} className="text-sm cursor-pointer">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special requirements, preferences, or important notes about this customer..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" asChild>
              <Link to="/customers/search">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> Register Customer
            </Button>
          </div>
        </form>
      ) : null}

      {mode === "new" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Added Customers</CardTitle>
            <CardDescription>Quick overview of customers added from this page</CardDescription>
          </CardHeader>
          <CardContent>
            {createdCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers added yet.</p>
            ) : (
              <div className="space-y-3">
                {createdCustomers.map((c) => {
                  const visit = visits.find((v) => v.id === c.visitId);
                  const customerRec = customers.find((x) => x.id === c.id);
                  const loc = customerRec?.location || "-";
                  const email = customerRec?.email || "-";
                  const type = customerRec?.type || c.customerType;
                  const subType = customerRec?.subType || "";
                  const headerName = c.name;
                  const statusClass = visit
                    ? (visit.leftAt
                        ? "bg-success text-success-foreground"
                        : (visit.expectedLeaveAt && new Date().toISOString() > visit.expectedLeaveAt
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-warning text-warning-foreground"))
                    : "";
                  return (
                    <div key={c.id} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gradient-to-r from-indigo-600/10 to-sky-600/10 dark:from-indigo-900/20 dark:to-sky-900/20 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{headerName}</p>
                            <Badge variant="outline">{type}{subType ? ` • ${subType}` : ""}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Added {new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                        {visit ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{visit.visitType}{visit.service ? ` • ${visit.service}` : ""}</Badge>
                            <Badge className={statusClass}>
                              {visit.leftAt ? "Completed" : (visit.expectedLeaveAt && new Date().toISOString() > visit.expectedLeaveAt ? "Overdue" : "Active")}
                            </Badge>
                          </div>
                        ) : null}
                      </div>
                      <div className="p-3 grid gap-3 md:grid-cols-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><span>{customerRec?.phone || '-'}</span></div>
                          <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /><span>{email}</span></div>
                          <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3 w-3" /><span>{loc}</span></div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-muted-foreground">Registered:</span> <span className="font-medium">{customerRec?.registeredDate ? new Date(customerRec.registeredDate).toLocaleString() : '-'}</span></div>
                          <div><span className="text-muted-foreground">Last Visit:</span> <span className="font-medium">{customerRec?.lastVisit ? new Date(customerRec.lastVisit).toLocaleString() : '-'}</span></div>
                          <div><span className="text-muted-foreground">Customer ID:</span> <span className="font-medium">{c.id}</span></div>
                        </div>
                        <div className="space-y-1 text-sm">
                          {visit ? (
                            <>
                              <div><span className="text-muted-foreground">Arrived:</span> <span className="font-medium">{new Date(visit.arrivedAt).toLocaleString()}</span></div>
                              <div><span className="text-muted-foreground">Expected Leave:</span> <span className="font-medium">{visit.expectedLeaveAt ? new Date(visit.expectedLeaveAt).toLocaleString() : '-'}</span></div>
                              <div><span className="text-muted-foreground">Left:</span> <span className="font-medium">{visit.leftAt ? new Date(visit.leftAt).toLocaleString() : '-'}</span></div>
                            </>
                          ) : (
                            <div className="text-muted-foreground">No active visit</div>
                          )}
                        </div>
                      </div>
                      <div className="p-3 border-t flex items-center justify-end gap-2">
                        {visit && !visit.leftAt ? (
                          <Button size="sm" variant="outline" onClick={() => markLeft(visit.id)}>Mark Left</Button>
                        ) : null}
                        <Link to={`/customers/${c.id}`}><Button size="sm" variant="outline">Manage</Button></Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
