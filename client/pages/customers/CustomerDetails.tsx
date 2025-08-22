import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  FileText,
  DollarSign,
  Clock,
  User,
  Eye,
  Download,
  Plus,
  CheckCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
    case "Paid":
    case "Active":
      return "bg-success text-success-foreground";
    case "In Progress":
    case "Pending":
    case "Overdue":
      return "bg-warning text-warning-foreground";
    case "Cancelled":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);

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

const fmtDateTime = (val?: string) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString();
};

// Minimal fallback mock (kept for structure); in real app use API
const mockCustomer = {
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
  registeredDate: "2024-01-15", // date-only fallback
  lastVisit: "2024-01-20", // date-only fallback
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
  ],
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

export default function CustomerDetails() {
  const { customerId } = useParams();
  const { customers } = useCustomerStore();
  const { visits, addVisit, updateExpectedLeave, markLeft, estimateExpectedLeave, alerts } = useVisitTracking();

  // Synthesize details from store (if exists) or fallback to mock
  const details = useMemo(() => {
    const c = customers.find((x) => x.id === customerId);
    if (!c) return mockCustomer;
    const [firstName, lastName] = (c.name || "").split(" ");
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
      registeredDate: c.registeredDate, // may be date-only or ISO
      lastVisit: c.lastVisit,          // may be date-only or ISO
      totalOrders: c.totalOrders || 0,
      totalSpent: 0,
      status: c.status || "Active",
      vehicles: [],
      orderHistory: [],
      salesHistory: [],
      visitAnalytics: mockCustomer.visitAnalytics,
      invoices: [],
      notes: "",
      preferredServices: [],
    };
  }, [customers, customerId]);

  const displayName = useMemo(() => details.companyName || `${details.firstName} ${details.lastName}`.trim(), [details]);

  // Tracking UI state
  const [visitType, setVisitType] = useState<"Ask" | "Service" | "Sales">("Service");
  const [service, setService] = useState<string>(SERVICE_OPTIONS[0]);
  const [arrivedAtLocal, setArrivedAtLocal] = useState<string>(() => toLocalInput(new Date()));
  const [expectedLeaveLocal, setExpectedLeaveLocal] = useState<string>("");
  const [updateExpectedLocal, setUpdateExpectedLocal] = useState<string>("");

  // Derived tracking data for this customer
  const customerVisits = useMemo(
    () => visits.filter((v) => v.customerId === details.id || v.customerName === displayName),
    [visits, details.id, displayName],
  );
  const activeVisit = useMemo(() => customerVisits.find((v) => !v.leftAt), [customerVisits]);
  const activeAlert = useMemo(() => (activeVisit ? alerts.find((a) => a.id === activeVisit.id) : undefined), [alerts, activeVisit]);

  // Auto-estimate expected leave as inputs change
  React.useEffect(() => {
    const arrivedISO = new Date(arrivedAtLocal).toISOString();
    const expectedISO = estimateExpectedLeave(visitType, visitType === "Service" ? service : undefined, arrivedISO);
    setExpectedLeaveLocal(toLocalInput(expectedISO));
  }, [visitType, service, arrivedAtLocal, estimateExpectedLeave]);

  // Reset form when customer changes
  React.useEffect(() => {
    setVisitType("Service");
    setService(SERVICE_OPTIONS[0]);
    setArrivedAtLocal(toLocalInput(new Date()));
    setExpectedLeaveLocal("");
    setUpdateExpectedLocal("");
  }, [details.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/customers/search">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className={getCustomerTypeColor(details.customerType)}>
                {details.customerType}
              </Badge>
              <Badge className={getStatusColor(details.status)}>{details.status}</Badge>
              <span className="text-sm text-muted-foreground">ID: {details.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> New Order
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" /> Edit Customer
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
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
                <p className="text-2xl font-bold">{(details.vehicles || []).length}</p>
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
                <p className="text-2xl font-bold">{fmtDateTime(details.lastVisit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
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

        {/* Tracking Tab */}
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
                    <div className="text-sm text-muted-foreground">No active visit for this customer. Start tracking below.</div>
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

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer Type:</span>
                    <Badge variant="outline" className={getCustomerTypeColor(details.customerType)}>
                      {details.customerType} {details.subType ? `- ${details.subType}` : ""}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">National ID:</span>
                    <span className="text-sm font-medium">{/* none in store */}-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Owner Status:</span>
                    <span className="text-sm font-medium">Vehicle Owner</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Registered:</span>
                    <span className="text-sm font-medium">{fmtDateTime(details.registeredDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{details.phone || "-"}</p>
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
                      <p className="text-sm font-medium">{details.email || "-"}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{details.address || "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[details.city, details.district, details.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Service Preferences & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preferred Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {(details.preferredServices || []).length > 0 ? (
                      (details.preferredServices || []).map((service: string) => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes:</p>
                  <p className="text-sm">{details.notes || "-"}</p>
                </div>
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
                  <CardDescription>{(details.vehicles || []).length} vehicles registered</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!details.vehicles || details.vehicles.length === 0) ? (
                <p className="text-sm text-muted-foreground">No vehicles available.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {details.vehicles.map((vehicle: any) => (
                    <Card key={vehicle.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-lg">{vehicle.make} {vehicle.model}</h4>
                            <Badge variant="outline">{vehicle.year}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Plate:</span><span className="font-medium ml-1">{vehicle.plateNumber}</span></div>
                            <div><span className="text-muted-foreground">Color:</span><span className="font-medium ml-1">{vehicle.color}</span></div>
                            <div><span className="text-muted-foreground">Engine:</span><span className="font-medium ml-1">{vehicle.engineNumber}</span></div>
                            <div><span className="text-muted-foreground">Chassis:</span><span className="font-medium ml-1">{vehicle.chassisNumber}</span></div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> History</Button>
                            <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Service Order History</CardTitle>
                  <CardDescription>Complete history of all services and orders</CardDescription>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" /> New Order</Button>
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
                              <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{order.location}</div>
                            </div>
                          </TableCell>
                          <TableCell><div className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.duration}</div></TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                          <TableCell><Badge className={getStatusColor(order.status)}>{order.status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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
                  <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Sales-Only Transaction History</CardTitle>
                  <CardDescription>Transactions where customer came only for purchasing items</CardDescription>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" /> New Sale</Button>
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
                          <TableCell><div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sale.location}</div></TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sale.items.length} items</p>
                              <p className="text-sm text-muted-foreground">{sale.items.slice(0, 2).join(", ")}{sale.items.length > 2 && ` +${sale.items.length - 2} more`}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(sale.amount)}</TableCell>
                          <TableCell><Badge variant="outline">{sale.paymentMethod}</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-1"><User className="h-3 w-3" /><span className="text-sm">{sale.salesPerson}</span></div></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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
                      <p className="text-2xl font-bold">{details.visitAnalytics.totalVisits}</p>
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
                      <p className="text-2xl font-bold">{details.visitAnalytics.salesOnlyVisits}</p>
                      <p className="text-xs text-muted-foreground">
                        {details.visitAnalytics.totalVisits ? Math.round((details.visitAnalytics.salesOnlyVisits / details.visitAnalytics.totalVisits) * 100) : 0}% of visits
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
                      <p className="text-2xl font-bold">{details.visitAnalytics.serviceWithSalesVisits}</p>
                      <p className="text-xs text-muted-foreground">
                        {details.visitAnalytics.totalVisits ? Math.round((details.visitAnalytics.serviceWithSalesVisits / details.visitAnalytics.totalVisits) * 100) : 0}% of visits
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
                      <p className="text-2xl font-bold">{details.visitAnalytics.serviceOnlyVisits}</p>
                      <p className="text-xs text-muted-foreground">
                        {details.visitAnalytics.totalVisits ? Math.round((details.visitAnalytics.serviceOnlyVisits / details.visitAnalytics.totalVisits) * 100) : 0}% of visits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Customer Behavior Pattern</CardTitle>
                  <CardDescription>Analysis of visit types and purchasing behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Sales-Only Visits</span>
                      <span>{details.visitAnalytics.salesOnlyVisits}/{details.visitAnalytics.totalVisits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${details.visitAnalytics.totalVisits ? (details.visitAnalytics.salesOnlyVisits / details.visitAnalytics.totalVisits) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Service + Sales Visits</span>
                      <span>{details.visitAnalytics.serviceWithSalesVisits}/{details.visitAnalytics.totalVisits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${details.visitAnalytics.totalVisits ? (details.visitAnalytics.serviceWithSalesVisits / details.visitAnalytics.totalVisits) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Service-Only Visits</span>
                      <span>{details.visitAnalytics.serviceOnlyVisits}/{details.visitAnalytics.totalVisits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${details.visitAnalytics.totalVisits ? (details.visitAnalytics.serviceOnlyVisits / details.visitAnalytics.totalVisits) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Customer Insights</CardTitle>
                  <CardDescription>Key insights about preferences and value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Transaction:</p>
                      <p className="font-medium text-lg">{formatCurrency(details.visitAnalytics.averageTransactionValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loyalty Level:</p>
                      <Badge className="mt-1" variant={details.visitAnalytics.loyaltyLevel === "Gold" ? "default" : "secondary"}>{details.visitAnalytics.loyaltyLevel || "-"}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preferred Location:</p>
                      <p className="font-medium">{details.visitAnalytics.preferredLocation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Type:</p>
                      <p className="font-medium">{details.customerType}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Last Sales Visit:</span>
                      <span className="font-medium">{details.visitAnalytics.lastSalesOnlyVisit || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Service Visit:</span>
                      <span className="font-medium">{details.visitAnalytics.lastServiceVisit || "-"}</span>
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
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Invoice History</CardTitle>
                  <CardDescription>All invoices and payment records</CardDescription>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" /> Create Invoice</Button>
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
                          <TableCell><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></TableCell>
                          <TableCell>{invoice.paymentMethod}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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
    </div>
  );
}
