import React, { useMemo, useState } from "react";
import { useCustomerStore } from "@/context/CustomerStoreContext";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Car,
  FileText,
  DollarSign,
  Clock,
  User,
  Eye,
  Download,
  CheckCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useFeedback } from "@/components/ui/status-popup";

// Lightweight directory for search results
const initialCustomers = [
  {
    id: "CUST-001",
    name: "John Doe",
    type: "Personal",
    subType: "Car Owner",
    phone: "+256 700 123 456",
    email: "john.doe@email.com",
    location: "Kampala, Uganda",
    registeredDate: "2024-01-15",
    lastVisit: "2024-01-20",
    totalOrders: 5,
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
    registeredDate: "2023-12-01",
    lastVisit: "2024-01-19",
    totalOrders: 23,
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
    registeredDate: "2023-11-20",
    lastVisit: "2024-01-18",
    totalOrders: 15,
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
    registeredDate: "2023-10-10",
    lastVisit: "2024-01-17",
    totalOrders: 8,
    status: "Active",
  },
  {
    id: "CUST-005",
    name: "Michael Okello",
    type: "Personal",
    subType: "Driver",
    phone: "+256 703 456 789",
    email: "mike.okello@email.com",
    location: "Nansana",
    registeredDate: "2024-01-05",
    lastVisit: "2024-01-16",
    totalOrders: 2,
    status: "Active",
  },
];

const getCustomerTypeColor = (type: string) => {
  switch (type) {
    case "Government":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "NGO":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Private":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "Personal":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
    case "Paid":
    case "Completed":
      return "bg-success text-success-foreground";
    case "Inactive":
    case "Pending":
    case "In Progress":
      return "bg-warning text-warning-foreground";
    case "Suspended":
    case "Cancelled":
    case "Overdue":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

// For tracking form service options — aligned with tracking SLAs
const SERVICE_OPTIONS = [
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

const toLocalInput = (isoOrDate?: string | Date) => {
  if (!isoOrDate) return "";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${dd}T${h}:${min}`;
};

// Detailed customer records pulled when a customer is selected (mocked)
const detailedCustomers: Record<string, any> = {
  "CUST-001": {
    id: "CUST-001",
    firstName: "John",
    lastName: "Doe",
    companyName: "",
    customerType: "Personal",
    subType: "Car Owner",
    phone: "+256 700 123 456",
    email: "john.doe@email.com",
    altPhone: "+256 702 456 789",
    address: "123 Main Street, Kololo",
    city: "Kampala",
    district: "Kampala",
    country: "Uganda",
    nationalId: "CM1234567890",
    isOwner: true,
    registeredDate: "2024-01-15",
    lastVisit: "2024-01-20",
    totalOrders: 5,
    totalSpent: 1250000,
    status: "Active",
    vehicles: [
      {
        id: "VEH-001",
        make: "Toyota",
        model: "Camry",
        year: "2020",
        plateNumber: "UAG 123A",
        color: "Black",
        engineNumber: "ENG123456",
        chassisNumber: "CHS789012",
      },
      {
        id: "VEH-002",
        make: "Honda",
        model: "Civic",
        year: "2019",
        plateNumber: "UAG 456B",
        color: "White",
        engineNumber: "ENG654321",
        chassisNumber: "CHS210987",
      },
    ],
    orderHistory: [
      {
        id: "ORD-1234",
        date: "2024-01-20",
        service: "Oil Change",
        vehicle: "Toyota Camry",
        amount: 150000,
        status: "Completed",
        invoice: "INV-001234",
        duration: "45 minutes",
        transactionType: "Service + Sales",
        location: "Service Bay 1",
      },
      {
        id: "ORD-1230",
        date: "2024-01-15",
        service: "Tire Replacement",
        vehicle: "Honda Civic",
        amount: 800000,
        status: "Completed",
        invoice: "INV-001230",
        duration: "2 hours",
        transactionType: "Service + Sales",
        location: "Service Bay 2",
      },
    ],
    salesHistory: [
      {
        id: "SALE-001",
        date: "2024-01-18",
        transactionType: "Sales Only",
        location: "Shop Front",
        items: ["Michelin Tires x4", "Engine Oil", "Air Freshener"],
        amount: 920000,
        paymentMethod: "Mobile Money",
        salesPerson: "Sarah Wilson",
      },
    ],
    visitAnalytics: {
      totalVisits: 12,
      salesOnlyVisits: 6,
      serviceOnlyVisits: 3,
      serviceWithSalesVisits: 3,
      preferredLocation: "Shop Front",
      averageTransactionValue: 350000,
      loyaltyLevel: "Gold",
      lastSalesOnlyVisit: "2024-01-18",
      lastServiceVisit: "2024-01-20",
    },
    invoices: [
      {
        id: "INV-001234",
        orderId: "ORD-1234",
        date: "2024-01-20",
        amount: 150000,
        status: "Paid",
        dueDate: "2024-01-20",
        paymentMethod: "Cash",
      },
      {
        id: "INV-001230",
        orderId: "ORD-1230",
        date: "2024-01-15",
        amount: 800000,
        status: "Paid",
        dueDate: "2024-01-15",
        paymentMethod: "Mobile Money",
      },
    ],
    notes:
      "Regular customer, prefers morning appointments. Very particular about service quality.",
    preferredServices: ["Oil Change", "Tire Installation", "Engine Repair"],
  },
};

function synthesizeDetailsFromDirectory(c: any) {
  // Fallback details if no rich record exists
  const [firstName, lastName] = c.name.split(" ");
  return {
    id: c.id,
    firstName: firstName || c.name,
    lastName: lastName || "",
    companyName: lastName ? "" : c.name,
    customerType: c.type,
    subType: c.subType,
    phone: c.phone,
    email: c.email,
    altPhone: "",
    address: c.location,
    city: "",
    district: "",
    country: "",
    nationalId: "",
    isOwner: true,
    registeredDate: c.registeredDate,
    lastVisit: c.lastVisit,
    totalOrders: c.totalOrders,
    totalSpent: 0,
    status: c.status,
    vehicles: [],
    orderHistory: [],
    salesHistory: [],
    visitAnalytics: {
      totalVisits: 0,
      salesOnlyVisits: 0,
      serviceOnlyVisits: 0,
      serviceWithSalesVisits: 0,
      preferredLocation: "",
      averageTransactionValue: 0,
      loyaltyLevel: "",
      lastSalesOnlyVisit: "",
      lastServiceVisit: "",
    },
    invoices: [],
    notes: "",
    preferredServices: [],
  };
}

export default function SearchCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers: storedCustomers } = useCustomerStore();
  const { visits } = useVisitTracking();
  const { success } = useFeedback();
  const [customers, setCustomers] = useState([...storedCustomers, ...initialCustomers]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Tracking integration
  const { visits, addVisit, updateExpectedLeave, markLeft, estimateExpectedLeave, alerts } = useVisitTracking();

  // Helper functions for customer analytics
  const getCustomerVisits = useCallback((customerId: string) => {
    return visits.filter(visit =>
      visit.customerId === customerId ||
      customers.find(c => c.id === customerId && c.name === visit.customerName)
    );
  }, [visits, customers]);

  const getCustomerStats = useCallback((customerId: string) => {
    const customerVisits = getCustomerVisits(customerId);
    const serviceVisits = customerVisits.filter(v => v.visitType === 'Service');
    const salesVisits = customerVisits.filter(v => v.visitType === 'Sales');
    const inquiryVisits = customerVisits.filter(v => v.visitType === 'Ask');
    const completedVisits = customerVisits.filter(v => v.status === 'Completed');
    const activeVisits = customerVisits.filter(v => v.status === 'Active');
    const overdueVisits = customerVisits.filter(v => v.status === 'Overdue');

    const totalSalesAmount = salesVisits.reduce((sum, visit) => {
      return sum + (visit.salesDetails?.amount || 0);
    }, 0);

    const lastVisit = customerVisits.length > 0
      ? customerVisits.sort((a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime())[0]
      : null;

    return {
      totalVisits: customerVisits.length,
      serviceVisits: serviceVisits.length,
      salesVisits: salesVisits.length,
      inquiryVisits: inquiryVisits.length,
      completedVisits: completedVisits.length,
      activeVisits: activeVisits.length,
      overdueVisits: overdueVisits.length,
      totalSalesAmount,
      lastVisit,
      recentVisits: customerVisits.slice(0, 3)
    };
  }, [getCustomerVisits]);

  const [visitType, setVisitType] = useState<"Ask" | "Service" | "Sales">("Service");
  const [service, setService] = useState<string>(SERVICE_OPTIONS[0]);
  const [arrivedAtLocal, setArrivedAtLocal] = useState<string>(() => toLocalInput(new Date()));
  const [expectedLeaveLocal, setExpectedLeaveLocal] = useState<string>("");
  const [updateExpectedLocal, setUpdateExpectedLocal] = useState<string>("");

  const displayName = useMemo(() => {
    if (!details) return "";
    return details.companyName || `${details.firstName} ${details.lastName}`;
  }, [details]);

  // Keep customers in sync when store changes
  React.useEffect(() => {
    setCustomers((prev) => {
      const byId = new Map<string, any>();
      [...storedCustomers, ...initialCustomers].forEach((c) => byId.set(c.id, c));
      return Array.from(byId.values());
    });
  }, [storedCustomers]);

  // Only show results when a search term exists
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return [] as typeof customers;
    const list = customers;
    return list.filter((customer) => {
      const st = searchTerm.toLowerCase();
      const name = (customer.name || "").toLowerCase();
      const id = (customer.id || "").toLowerCase();
      const email = (customer.email || "").toLowerCase();
      const phone = customer.phone || "";
      return (
        name.includes(st) || id.includes(st) || email.includes(st) || phone.includes(searchTerm)
      );
    });
  }, [customers, searchTerm]);

  // Load details when a customer is selected
  const selectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const fromDir = customers.find((c) => c.id === id);
    const rich = detailedCustomers[id];
    const det = rich || (fromDir ? synthesizeDetailsFromDirectory(fromDir) : null);
    setDetails(det);
    setIsEditing(false);
  };

  // Save basic edits (mocked local update only)
  const saveEdits = () => {
    if (!details) return;
    // Reflect changes into search directory (phone/email/location where applicable)
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === details.id
          ? {
              ...c,
              phone: details.phone || c.phone,
              email: details.email || c.email,
              location: details.address || c.location,
            }
          : c,
      ),
    );
    setIsEditing(false);
    success("Customer updated", `${details.companyName || details.firstName + ' ' + details.lastName} changes saved.`);
  };

  // Tracking derived
  const customerVisits = useMemo(
    () => (details ? visits.filter((v) => v.customerId === details.id || v.customerName === displayName) : []),
    [visits, details, displayName],
  );
  const activeVisit = useMemo(() => customerVisits.find((v) => !v.leftAt), [customerVisits]);
  const activeAlert = useMemo(() => (activeVisit ? alerts.find((a) => a.id === activeVisit.id) : undefined), [alerts, activeVisit]);

  // Compute expected leave for form when inputs change
  React.useEffect(() => {
    const arrivedISO = new Date(arrivedAtLocal).toISOString();
    const expectedISO = estimateExpectedLeave(visitType, visitType === "Service" ? service : undefined, arrivedISO);
    setExpectedLeaveLocal(toLocalInput(expectedISO));
  }, [visitType, service, arrivedAtLocal, estimateExpectedLeave]);

  // Reset tracking form when switching customers
  React.useEffect(() => {
    setVisitType("Service");
    setService(SERVICE_OPTIONS[0]);
    const now = new Date();
    setArrivedAtLocal(toLocalInput(now));
  }, [selectedCustomerId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl overflow-hidden border">
        <div className="bg-gradient-to-r from-violet-600/10 to-blue-600/10 dark:from-violet-900/20 dark:to-blue-900/20 p-6">
          <h1 className="text-3xl font-bold text-foreground">Customer Search & Tracking Center</h1>
          <p className="text-muted-foreground">
            Search for a customer to view all information and manage visit timing (arrival and leave). Nothing is shown until you search.
          </p>
        </div>
        <div className="p-4 bg-background">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, phone, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Results list */}
        <Card className="lg:col-span-1 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <CardDescription>
              {searchTerm.trim() ? (
                <>
                  {filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"} found
                </>
              ) : (
                "Start typing to search"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!searchTerm.trim() && (
              <div className="text-sm text-muted-foreground">
                Use the search box above to find a customer by name, ID, phone, or email.
              </div>
            )}
            {searchTerm.trim() && filteredCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">No customers match your search.</p>
            )}
            {searchTerm.trim() && filteredCustomers.map((c) => {
              const stats = getCustomerStats(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => selectCustomer(c.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    selectedCustomerId === c.id
                      ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getCustomerTypeColor(c.type)} font-medium`}>
                        {c.type}
                      </Badge>
                      <Badge className={`${getStatusColor(c.status)} font-medium`}>{c.status}</Badge>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span>{c.phone || 'No phone'}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-green-500" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="truncate">{c.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Visit Statistics */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Visit Summary</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{stats.totalVisits}</div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{stats.completedVisits}</div>
                        <div className="text-gray-500">Done</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-amber-600">{stats.activeVisits}</div>
                        <div className="text-gray-500">Active</div>
                      </div>
                    </div>
                  </div>

                  {/* Service breakdown */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>{stats.serviceVisits} Service</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>{stats.salesVisits} Sales</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>{stats.inquiryVisits} Ask</span>
                      </div>
                    </div>
                    {stats.totalSalesAmount > 0 && (
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="h-3 w-3" />
                        ${stats.totalSalesAmount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Last visit indicator */}
                  {stats.lastVisit && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Last visit: {new Date(stats.lastVisit.arrivedAt).toLocaleDateString()}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            stats.lastVisit.visitType === 'Service' ? 'border-blue-300 text-blue-700' :
                            stats.lastVisit.visitType === 'Sales' ? 'border-green-300 text-green-700' :
                            'border-purple-300 text-purple-700'
                          }`}
                        >
                          {stats.lastVisit.visitType}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Overdue warning */}
                  {stats.overdueVisits > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">{stats.overdueVisits} overdue visit{stats.overdueVisits > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Details panel */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCustomerId || !details ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                {!searchTerm.trim() ? (
                  <>
                    Start a search to view customer information and tracking controls.
                  </>
                ) : (
                  <>Select a customer on the left to view details.</>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header for selected customer */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {details.companyName || `${details.firstName} ${details.lastName}`}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getCustomerTypeColor(details.customerType)}>
                      {details.customerType}
                    </Badge>
                    <Badge className={getStatusColor(details.status)}>{details.status}</Badge>
                    <span className="text-sm text-muted-foreground">ID: {details.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing((v) => !v)}>
                    <Edit className="h-4 w-4 mr-2" /> {isEditing ? "Cancel" : "Edit Customer"}
                  </Button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{details.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(details.totalSpent || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicles</p>
                        <p className="text-2xl font-bold">{details.vehicles?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Visit</p>
                        <p className="text-2xl font-bold">{details.lastVisit || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="tracking" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="sales">Sales History</TabsTrigger>
                  <TabsTrigger value="analytics">Visit Analytics</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                {/* Tracking Center */}
                <TabsContent value="tracking">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" /> Visit Timing & Status
                        </CardTitle>
                        <CardDescription>
                          Manage arrival, expected leave, and completion for this customer.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activeVisit ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(activeVisit.status)}>{activeVisit.status}</Badge>
                                  <Badge variant="outline">{activeVisit.visitType}{activeVisit.service ? ` • ${activeVisit.service}` : ""}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">Location: {activeVisit.location || "-"}</div>
                              </div>
                              {activeAlert ? (
                                <div className={`flex items-center gap-2 text-sm ${
                                  activeAlert.severity === "danger" ? "text-destructive" : activeAlert.severity === "warning" ? "text-orange-600" : "text-muted-foreground"
                                }`}>
                                  <AlertTriangle className="h-4 w-4" /> {activeAlert.message}
                                </div>
                              ) : null}
                            </div>

                            <div className="grid gap-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Arrived</span>
                                <span className="font-medium">{new Date(activeVisit.arrivedAt).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Expected Leave</span>
                                <span className="font-medium">{activeVisit.expectedLeaveAt ? new Date(activeVisit.expectedLeaveAt).toLocaleString() : "-"}</span>
                              </div>
                              {activeVisit.leftAt && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Left</span>
                                  <span className="font-medium">{new Date(activeVisit.leftAt).toLocaleString()}</span>
                                </div>
                              )}
                            </div>

                            {!activeVisit.leftAt && (
                              <div className="space-y-3 pt-2">
                                <div className="grid gap-2">
                                  <Label className="text-xs">Update Expected Leave</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="datetime-local"
                                      value={updateExpectedLocal || toLocalInput(activeVisit.expectedLeaveAt)}
                                      onChange={(e) => setUpdateExpectedLocal(e.target.value)}
                                    />
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        const next = updateExpectedLocal || toLocalInput(activeVisit.expectedLeaveAt);
                                        if (!next) return;
                                        updateExpectedLeave(activeVisit.id, new Date(next).toISOString());
                                      }}
                                    >
                                      Update
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="default" onClick={() => markLeft(activeVisit.id)}>Mark Left Now</Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      const custom = prompt("Enter leave date/time (YYYY-MM-DD HH:mm)");
                                      if (!custom) return;
                                      const iso = new Date(custom.replace(" ", "T")).toISOString();
                                      markLeft(activeVisit.id, iso);
                                    }}
                                  >
                                    Set Custom Leave Time
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              No active visit for this customer. Start tracking below.
                            </div>
                            <div className="grid gap-3">
                              <div className="grid gap-1">
                                <Label className="text-xs">Visit Type</Label>
                                <Select value={visitType} onValueChange={(v: any) => setVisitType(v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select visit type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ask">Ask</SelectItem>
                                    <SelectItem value="Service">Service</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {visitType === "Service" && (
                                <div className="grid gap-1">
                                  <Label className="text-xs">Service</Label>
                                  <Select value={service} onValueChange={(v) => setService(v)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SERVICE_OPTIONS.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="grid gap-1">
                                <Label className="text-xs">Arrived At</Label>
                                <Input type="datetime-local" value={arrivedAtLocal} onChange={(e) => setArrivedAtLocal(e.target.value)} />
                              </div>
                              <div className="grid gap-1">
                                <Label className="text-xs">Expected Leave (auto-estimated)</Label>
                                <Input type="datetime-local" value={expectedLeaveLocal} readOnly />
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => {
                                    if (!details) return;
                                    addVisit({
                                      customerId: details.id,
                                      customerName: displayName,
                                      visitType,
                                      service: visitType === "Service" ? service : undefined,
                                      arrivedAt: arrivedAtLocal,
                                      expectedLeaveAt: expectedLeaveLocal,
                                    });
                                  }}
                                >
                                  Start Tracking
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" /> Visit History
                        </CardTitle>
                        <CardDescription>All visits recorded for this customer</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {customerVisits.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No visits recorded.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Service</TableHead>
                                  <TableHead>Arrived</TableHead>
                                  <TableHead>Expected Leave</TableHead>
                                  <TableHead>Left</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {customerVisits.map((v) => (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.visitType}</TableCell>
                                    <TableCell>{v.service || "-"}</TableCell>
                                    <TableCell>{new Date(v.arrivedAt).toLocaleString()}</TableCell>
                                    <TableCell>{v.expectedLeaveAt ? new Date(v.expectedLeaveAt).toLocaleString() : "-"}</TableCell>
                                    <TableCell>{v.leftAt ? new Date(v.leftAt).toLocaleString() : "-"}</TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(v.status)}>{v.status}</Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Profile */}
                <TabsContent value="profile">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" /> Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditing ? (
                          <div className="grid gap-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Customer Type:</span>
                              <Badge variant="outline" className={getCustomerTypeColor(details.customerType)}>
                                {details.customerType} {details.subType ? `- ${details.subType}` : ""}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">National ID:</span>
                              <span className="text-sm font-medium">{details.nationalId || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Owner Status:</span>
                              <span className="text-sm font-medium">{details.isOwner ? "Vehicle Owner" : "Driver/Representative"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Registered:</span>
                              <span className="text-sm font-medium">{details.registeredDate || "-"}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">National ID</label>
                              <Input
                                value={details.nationalId || ""}
                                onChange={(e) => setDetails({ ...details, nationalId: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Owner Status</label>
                              <Input
                                value={details.isOwner ? "Vehicle Owner" : "Driver/Representative"}
                                onChange={(e) =>
                                  setDetails({ ...details, isOwner: e.target.value.toLowerCase().includes("owner") })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Registered</label>
                              <Input
                                value={details.registeredDate || ""}
                                onChange={(e) => setDetails({ ...details, registeredDate: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Phone className="h-5 w-5" /> Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditing ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{details.phone}</p>
                                <p className="text-xs text-muted-foreground">Primary</p>
                              </div>
                            </div>
                            {details.altPhone ? (
                              <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{details.altPhone}</p>
                                  <p className="text-xs text-muted-foreground">Alternative</p>
                                </div>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{details.email}</p>
                                <p className="text-xs text-muted-foreground">Email</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">{details.address || "-"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[details.city, details.district, details.country].filter(Boolean).join(", ") || ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Phone</label>
                              <Input
                                value={details.phone || ""}
                                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Alt Phone</label>
                              <Input
                                value={details.altPhone || ""}
                                onChange={(e) => setDetails({ ...details, altPhone: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Email</label>
                              <Input
                                value={details.email || ""}
                                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Address</label>
                              <Input
                                value={details.address || ""}
                                onChange={(e) => setDetails({ ...details, address: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">City</label>
                                <Input
                                  value={details.city || ""}
                                  onChange={(e) => setDetails({ ...details, city: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">District</label>
                                <Input
                                  value={details.district || ""}
                                  onChange={(e) => setDetails({ ...details, district: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Country</label>
                                <Input
                                  value={details.country || ""}
                                  onChange={(e) => setDetails({ ...details, country: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                              <Button onClick={saveEdits}>Save Changes</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                      <CardHeader>
                        <CardTitle>Service Preferences & Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditing ? (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Preferred Services:</p>
                              <div className="flex flex-wrap gap-2">
                                {(details.preferredServices || []).map((service: string) => (
                                  <Badge key={service} variant="secondary">
                                    {service}
                                  </Badge>
                                ))}
                                {(!details.preferredServices || details.preferredServices.length === 0) && (
                                  <p className="text-sm text-muted-foreground">None</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Notes:</p>
                              <p className="text-sm">{details.notes || "-"}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="text-xs text-muted-foreground">Preferred Services (comma separated)</label>
                              <Input
                                value={(details.preferredServices || []).join(", ")}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    preferredServices: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Notes</label>
                              <Input
                                value={details.notes || ""}
                                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Vehicles */}
                <TabsContent value="vehicles">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" /> Registered Vehicles
                          </CardTitle>
                          <CardDescription>
                            {details.vehicles?.length || 0} vehicles registered
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(!details.vehicles || details.vehicles.length === 0) && (
                        <p className="text-sm text-muted-foreground">No vehicles available.</p>
                      )}
                      <div className="grid gap-4 md:grid-cols-2">
                        {(details.vehicles || []).map((vehicle: any) => (
                          <Card key={vehicle.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-lg">
                                    {vehicle.make} {vehicle.model}
                                  </h4>
                                  <Badge variant="outline">{vehicle.year}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Plate:</span>
                                    <span className="font-medium ml-1">{vehicle.plateNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Color:</span>
                                    <span className="font-medium ml-1">{vehicle.color}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Engine:</span>
                                    <span className="font-medium ml-1">{vehicle.engineNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Chassis:</span>
                                    <span className="font-medium ml-1">{vehicle.chassisNumber}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" /> History
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Orders */}
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Service Order History
                          </CardTitle>
                          <CardDescription>Complete history of all services and orders</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(!details.orderHistory || details.orderHistory.length === 0) ? (
                        <p className="text-sm text-muted-foreground">No order history available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Type & Location</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {details.orderHistory.map((order: any) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">{order.id}</TableCell>
                                  <TableCell>{order.date}</TableCell>
                                  <TableCell>{order.service}</TableCell>
                                  <TableCell>{order.vehicle}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <Badge variant="outline" className="text-xs">{order.transactionType}</Badge>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> {order.location}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {order.duration}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sales */}
                <TabsContent value="sales">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" /> Sales-Only Transaction History
                          </CardTitle>
                          <CardDescription>Transactions where customer came only for purchasing items</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(!details.salesHistory || details.salesHistory.length === 0) ? (
                        <p className="text-sm text-muted-foreground">No sales history available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Salesperson</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {details.salesHistory.map((sale: any) => (
                                <TableRow key={sale.id}>
                                  <TableCell className="font-medium">{sale.id}</TableCell>
                                  <TableCell>{sale.date}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {sale.location}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{sale.items.length} items</p>
                                      <p className="text-sm text-muted-foreground">
                                        {sale.items.slice(0, 2).join(", ")}
                                        {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatCurrency(sale.amount)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{sale.paymentMethod}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span className="text-sm">{sale.salesPerson}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics */}
                <TabsContent value="analytics">
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Visits</p>
                              <p className="text-2xl font-bold">{details.visitAnalytics?.totalVisits || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Sales Only</p>
                              <p className="text-2xl font-bold">{details.visitAnalytics?.salesOnlyVisits || 0}</p>
                              <p className="text-xs text-muted-foreground">
                                {details.visitAnalytics?.totalVisits
                                  ? Math.round(
                                      ((details.visitAnalytics.salesOnlyVisits || 0) /
                                        (details.visitAnalytics.totalVisits || 1)) *
                                        100,
                                    )
                                  : 0}
                                % of visits
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Service + Sales</p>
                              <p className="text-2xl font-bold">{details.visitAnalytics?.serviceWithSalesVisits || 0}</p>
                              <p className="text-xs text-muted-foreground">
                                {details.visitAnalytics?.totalVisits
                                  ? Math.round(
                                      ((details.visitAnalytics.serviceWithSalesVisits || 0) /
                                        (details.visitAnalytics.totalVisits || 1)) *
                                        100,
                                    )
                                  : 0}
                                % of visits
                              </p>
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
                              <p className="text-sm text-muted-foreground">Service Only</p>
                              <p className="text-2xl font-bold">{details.visitAnalytics?.serviceOnlyVisits || 0}</p>
                              <p className="text-xs text-muted-foreground">
                                {details.visitAnalytics?.totalVisits
                                  ? Math.round(
                                      ((details.visitAnalytics.serviceOnlyVisits || 0) /
                                        (details.visitAnalytics.totalVisits || 1)) *
                                        100,
                                    )
                                  : 0}
                                % of visits
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" /> Customer Behavior Pattern
                          </CardTitle>
                          <CardDescription>Analysis of visit types and purchasing behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Sales-Only Visits</span>
                              <span>
                                {details.visitAnalytics?.salesOnlyVisits || 0}/{details.visitAnalytics?.totalVisits || 0}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (details.visitAnalytics?.totalVisits
                                      ? ((details.visitAnalytics.salesOnlyVisits || 0) /
                                          (details.visitAnalytics.totalVisits || 1)) * 100
                                      : 0
                                    ).toFixed(2)
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Service + Sales Visits</span>
                              <span>
                                {details.visitAnalytics?.serviceWithSalesVisits || 0}/{details.visitAnalytics?.totalVisits || 0}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (details.visitAnalytics?.totalVisits
                                      ? ((details.visitAnalytics.serviceWithSalesVisits || 0) /
                                          (details.visitAnalytics.totalVisits || 1)) * 100
                                      : 0
                                    ).toFixed(2)
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Service-Only Visits</span>
                              <span>
                                {details.visitAnalytics?.serviceOnlyVisits || 0}/{details.visitAnalytics?.totalVisits || 0}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (details.visitAnalytics?.totalVisits
                                      ? ((details.visitAnalytics.serviceOnlyVisits || 0) /
                                          (details.visitAnalytics.totalVisits || 1)) * 100
                                      : 0
                                    ).toFixed(2)
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" /> Customer Insights
                          </CardTitle>
                          <CardDescription>Key insights about preferences and value</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Avg Transaction:</p>
                              <p className="font-medium text-lg">
                                {formatCurrency(details.visitAnalytics?.averageTransactionValue || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Loyalty Level:</p>
                              <Badge className="mt-1" variant={details.visitAnalytics?.loyaltyLevel === "Gold" ? "default" : "secondary"}>
                                {details.visitAnalytics?.loyaltyLevel || "-"}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Preferred Location:</p>
                              <p className="font-medium">{details.visitAnalytics?.preferredLocation || "-"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Customer Type:</p>
                              <p className="font-medium">{details.customerType}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Last Sales Visit:</span>
                              <span className="font-medium">{details.visitAnalytics?.lastSalesOnlyVisit || "-"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Last Service Visit:</span>
                              <span className="font-medium">{details.visitAnalytics?.lastServiceVisit || "-"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Invoices */}
                <TabsContent value="invoices">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Invoice History
                          </CardTitle>
                          <CardDescription>All invoices and payment records</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(!details.invoices || details.invoices.length === 0) ? (
                        <p className="text-sm text-muted-foreground">No invoices available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {details.invoices.map((invoice: any) => (
                                <TableRow key={invoice.id}>
                                  <TableCell className="font-medium">{invoice.id}</TableCell>
                                  <TableCell>{invoice.orderId}</TableCell>
                                  <TableCell>{invoice.date}</TableCell>
                                  <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                                  </TableCell>
                                  <TableCell>{invoice.paymentMethod}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
