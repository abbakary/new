import React, { useState } from "react";
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
  Eye,
  Edit,
  ShoppingCart,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SalesTransaction {
  id: string;
  transactionType: "Sales Only" | "Service + Sales" | "Service Only";
  customerId: string;
  customerName: string;
  customerType: string;
  customerPhone: string;
  saleDate: string;
  location:
    | "Shop Front"
    | "Service Bay 1"
    | "Service Bay 2"
    | "Service Bay 3"
    | "Mobile Unit";
  serviceOrderId?: string; // Only if related to service
  items: SalesItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "Cash" | "Mobile Money" | "Card" | "Bank Transfer" | "Credit";
  paymentStatus: "Paid" | "Pending" | "Partial" | "Failed";
  salesPerson: string;
  notes?: string;
  invoiceId?: string;
}

interface SalesItem {
  id: string;
  productId: string;
  productName: string;
  category: "Tire" | "Oil" | "Battery" | "Parts" | "Accessories" | "Service";
  quantity: number;
  unitPrice: number;
  total: number;
  isServiceRelated: boolean; // True if sold during service
}

interface CustomerSalesHistory {
  customerId: string;
  customerName: string;
  customerType: string;
  totalTransactions: number;
  totalSpent: number;
  lastPurchase: string;
  preferredLocation: string;
  salesOnlyVisits: number;
  serviceWithSalesVisits: number;
  averageTransactionValue: number;
  loyaltyLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
}

interface LocationSalesData {
  location: string;
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  topSellingCategory: string;
  revenue: number;
}

// Mock data
const mockSalesTransactions: SalesTransaction[] = [
  {
    id: "SALE-001",
    transactionType: "Sales Only",
    customerId: "CUST-001",
    customerName: "John Doe",
    customerType: "Personal",
    customerPhone: "+256 700 123 456",
    saleDate: "2024-01-20",
    location: "Shop Front",
    items: [
      {
        id: "ITEM-001",
        productId: "TIRE-001",
        productName: "Michelin Energy XM2 185/65R15",
        category: "Tire",
        quantity: 4,
        unitPrice: 220000,
        total: 880000,
        isServiceRelated: false,
      },
      {
        id: "ITEM-002",
        productId: "OIL-001",
        productName: "Engine Oil 5W30 - 4L",
        category: "Oil",
        quantity: 1,
        unitPrice: 70000,
        total: 70000,
        isServiceRelated: false,
      },
    ],
    subtotal: 950000,
    tax: 171000,
    discount: 50000,
    total: 1071000,
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    salesPerson: "Sarah Wilson",
    notes: "Customer bought tires for self-installation",
    invoiceId: "INV-001234",
  },
  {
    id: "SALE-002",
    transactionType: "Service + Sales",
    customerId: "CUST-002",
    customerName: "Express Taxi Services",
    customerType: "Private",
    customerPhone: "+256 702 456 789",
    saleDate: "2024-01-19",
    location: "Service Bay 1",
    serviceOrderId: "SRV-001",
    items: [
      {
        id: "ITEM-003",
        productId: "SERVICE-001",
        productName: "Oil Change Service",
        category: "Service",
        quantity: 1,
        unitPrice: 80000,
        total: 80000,
        isServiceRelated: true,
      },
      {
        id: "ITEM-004",
        productId: "OIL-002",
        productName: "Engine Oil 10W40 - 4L",
        category: "Oil",
        quantity: 1,
        unitPrice: 65000,
        total: 65000,
        isServiceRelated: true,
      },
      {
        id: "ITEM-005",
        productId: "FILTER-001",
        productName: "Oil Filter",
        category: "Parts",
        quantity: 1,
        unitPrice: 25000,
        total: 25000,
        isServiceRelated: true,
      },
      {
        id: "ITEM-006",
        productId: "TIRE-002",
        productName: "Bridgestone Turanza T005 215/60R16",
        category: "Tire",
        quantity: 2,
        unitPrice: 310000,
        total: 620000,
        isServiceRelated: false,
      },
    ],
    subtotal: 790000,
    tax: 142200,
    discount: 0,
    total: 932200,
    paymentMethod: "Bank Transfer",
    paymentStatus: "Paid",
    salesPerson: "James Okello",
    notes: "Service completed + customer bought additional tires",
  },
  {
    id: "SALE-003",
    transactionType: "Sales Only",
    customerId: "CUST-003",
    customerName: "Mary Nakato",
    customerType: "Personal",
    customerPhone: "+256 703 789 012",
    saleDate: "2024-01-18",
    location: "Shop Front",
    items: [
      {
        id: "ITEM-007",
        productId: "BATTERY-001",
        productName: "Car Battery 12V 70Ah",
        category: "Battery",
        quantity: 1,
        unitPrice: 280000,
        total: 280000,
        isServiceRelated: false,
      },
      {
        id: "ITEM-008",
        productId: "ACC-001",
        productName: "Battery Terminal Cleaner",
        category: "Accessories",
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
        isServiceRelated: false,
      },
    ],
    subtotal: 295000,
    tax: 53100,
    discount: 15000,
    total: 333100,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    salesPerson: "Peter Mukasa",
    notes: "Customer needed battery replacement for old vehicle",
  },
];

const mockCustomerSalesHistory: CustomerSalesHistory[] = [
  {
    customerId: "CUST-001",
    customerName: "John Doe",
    customerType: "Personal",
    totalTransactions: 8,
    totalSpent: 2850000,
    lastPurchase: "2024-01-20",
    preferredLocation: "Shop Front",
    salesOnlyVisits: 6,
    serviceWithSalesVisits: 2,
    averageTransactionValue: 356250,
    loyaltyLevel: "Gold",
  },
  {
    customerId: "CUST-002",
    customerName: "Express Taxi Services",
    customerType: "Private",
    totalTransactions: 15,
    totalSpent: 8750000,
    lastPurchase: "2024-01-19",
    preferredLocation: "Service Bay 1",
    salesOnlyVisits: 3,
    serviceWithSalesVisits: 12,
    averageTransactionValue: 583333,
    loyaltyLevel: "Platinum",
  },
  {
    customerId: "CUST-003",
    customerName: "Mary Nakato",
    customerType: "Personal",
    totalTransactions: 4,
    totalSpent: 980000,
    lastPurchase: "2024-01-18",
    preferredLocation: "Shop Front",
    salesOnlyVisits: 4,
    serviceWithSalesVisits: 0,
    averageTransactionValue: 245000,
    loyaltyLevel: "Silver",
  },
];

const mockLocationSalesData: LocationSalesData[] = [
  {
    location: "Shop Front",
    totalSales: 45,
    transactionCount: 32,
    averageTransactionValue: 425000,
    topSellingCategory: "Tire",
    revenue: 13600000,
  },
  {
    location: "Service Bay 1",
    totalSales: 28,
    transactionCount: 24,
    averageTransactionValue: 580000,
    topSellingCategory: "Service",
    revenue: 13920000,
  },
  {
    location: "Service Bay 2",
    totalSales: 22,
    transactionCount: 18,
    averageTransactionValue: 490000,
    topSellingCategory: "Parts",
    revenue: 8820000,
  },
  {
    location: "Service Bay 3",
    totalSales: 18,
    transactionCount: 15,
    averageTransactionValue: 520000,
    topSellingCategory: "Oil",
    revenue: 7800000,
  },
];

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case "Sales Only":
      return "bg-blue-500 text-white";
    case "Service + Sales":
      return "bg-purple-500 text-white";
    case "Service Only":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-success text-success-foreground";
    case "Pending":
      return "bg-warning text-warning-foreground";
    case "Partial":
      return "bg-info text-info-foreground";
    case "Failed":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getLoyaltyLevelColor = (level: string) => {
  switch (level) {
    case "Platinum":
      return "bg-purple-500 text-white";
    case "Gold":
      return "bg-yellow-500 text-black";
    case "Silver":
      return "bg-gray-400 text-black";
    case "Bronze":
      return "bg-orange-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export default function SalesManagement() {
  const [transactions] = useState(mockSalesTransactions);
  const [customerHistory] = useState(mockCustomerSalesHistory);
  const [locationData] = useState(mockLocationSalesData);
  const [selectedTransaction, setSelectedTransaction] =
    useState<SalesTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactionType, setSelectedTransactionType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.salesPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTransactionType === "all" ||
      transaction.transactionType === selectedTransactionType;
    const matchesLocation =
      selectedLocation === "all" || transaction.location === selectedLocation;
    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      transaction.paymentStatus === selectedPaymentStatus;

    return (
      matchesSearch && matchesType && matchesLocation && matchesPaymentStatus
    );
  });

  // Calculate summary statistics
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const salesOnlyTransactions = transactions.filter(
    (t) => t.transactionType === "Sales Only",
  ).length;
  const serviceWithSalesTransactions = transactions.filter(
    (t) => t.transactionType === "Service + Sales",
  ).length;
  const averageTransactionValue = totalRevenue / totalTransactions;
  const totalItemsSold = transactions.reduce(
    (sum, t) =>
      sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Sales Management
          </h1>
          <p className="text-muted-foreground">
            Track sales transactions, customer purchase behavior, and location
            performance
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/sales/analytics">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Sales Analytics
            </Button>
          </Link>
          <Link to="/sales/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
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
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales Only</p>
                <p className="text-2xl font-bold">{salesOnlyTransactions}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (salesOnlyTransactions / totalTransactions) * 100,
                  )}
                  % of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service + Sales</p>
                <p className="text-2xl font-bold">
                  {serviceWithSalesTransactions}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (serviceWithSalesTransactions / totalTransactions) * 100,
                  )}
                  % of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(averageTransactionValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">{totalItemsSold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Sales Transactions</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
          <TabsTrigger value="reports">Sales Reports</TabsTrigger>
        </TabsList>

        {/* Sales Transactions Tab */}
        <TabsContent value="transactions">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Search & Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by transaction ID, customer, or salesperson..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedTransactionType}
                  onValueChange={setSelectedTransactionType}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Sales Only">Sales Only</SelectItem>
                    <SelectItem value="Service + Sales">
                      Service + Sales
                    </SelectItem>
                    <SelectItem value="Service Only">Service Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Shop Front">Shop Front</SelectItem>
                    <SelectItem value="Service Bay 1">Service Bay 1</SelectItem>
                    <SelectItem value="Service Bay 2">Service Bay 2</SelectItem>
                    <SelectItem value="Service Bay 3">Service Bay 3</SelectItem>
                    <SelectItem value="Mobile Unit">Mobile Unit</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={setSelectedPaymentStatus}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sales Transactions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sales Transactions</CardTitle>
                  <CardDescription>
                    {filteredTransactions.length} transactions found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type & Location</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-accent/50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.id}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {transaction.saleDate}
                            </div>
                            {transaction.serviceOrderId && (
                              <p className="text-xs text-muted-foreground">
                                Service: {transaction.serviceOrderId}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {transaction.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.customerType}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {transaction.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              className={getTransactionTypeColor(
                                transaction.transactionType,
                              )}
                            >
                              {transaction.transactionType}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {transaction.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {transaction.items.length} items
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0,
                              )}{" "}
                              qty
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.from(
                                new Set(
                                  transaction.items.map(
                                    (item) => item.category,
                                  ),
                                ),
                              )
                                .slice(0, 2)
                                .map((category) => (
                                  <Badge
                                    key={category}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              {Array.from(
                                new Set(
                                  transaction.items.map(
                                    (item) => item.category,
                                  ),
                                ),
                              ).length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +
                                  {Array.from(
                                    new Set(
                                      transaction.items.map(
                                        (item) => item.category,
                                      ),
                                    ),
                                  ).length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-lg">
                              {formatCurrency(transaction.total)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Subtotal: {formatCurrency(transaction.subtotal)}
                            </p>
                            {transaction.discount > 0 && (
                              <p className="text-sm text-warning">
                                Discount: -
                                {formatCurrency(transaction.discount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              className={getPaymentStatusColor(
                                transaction.paymentStatus,
                              )}
                            >
                              {transaction.paymentStatus}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {transaction.paymentMethod}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm">
                              {transaction.salesPerson}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedTransaction(transaction)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Sales Transaction Details - {transaction.id}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete transaction information and line
                                    items
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-6">
                                    {/* Transaction Header */}
                                    <div className="grid gap-4 md:grid-cols-3">
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base">
                                            Transaction Info
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <p className="text-sm">
                                            <strong>ID:</strong>{" "}
                                            {selectedTransaction.id}
                                          </p>
                                          <p className="text-sm">
                                            <strong>Date:</strong>{" "}
                                            {selectedTransaction.saleDate}
                                          </p>
                                          <Badge
                                            className={getTransactionTypeColor(
                                              selectedTransaction.transactionType,
                                            )}
                                          >
                                            {
                                              selectedTransaction.transactionType
                                            }
                                          </Badge>
                                          <div className="flex items-center gap-1 text-sm">
                                            <MapPin className="h-3 w-3" />
                                            {selectedTransaction.location}
                                          </div>
                                          {selectedTransaction.serviceOrderId && (
                                            <p className="text-sm">
                                              <strong>Service Order:</strong>{" "}
                                              {
                                                selectedTransaction.serviceOrderId
                                              }
                                            </p>
                                          )}
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base">
                                            Customer Info
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <p className="font-medium">
                                            {selectedTransaction.customerName}
                                          </p>
                                          <p className="text-sm">
                                            {selectedTransaction.customerType}
                                          </p>
                                          <div className="flex items-center gap-1 text-sm">
                                            <Phone className="h-3 w-3" />
                                            {selectedTransaction.customerPhone}
                                          </div>
                                          <p className="text-sm">
                                            <strong>ID:</strong>{" "}
                                            {selectedTransaction.customerId}
                                          </p>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base">
                                            Payment Info
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <Badge
                                            className={getPaymentStatusColor(
                                              selectedTransaction.paymentStatus,
                                            )}
                                          >
                                            {selectedTransaction.paymentStatus}
                                          </Badge>
                                          <p className="text-sm">
                                            <strong>Method:</strong>{" "}
                                            {selectedTransaction.paymentMethod}
                                          </p>
                                          <p className="text-sm">
                                            <strong>Salesperson:</strong>{" "}
                                            {selectedTransaction.salesPerson}
                                          </p>
                                          {selectedTransaction.invoiceId && (
                                            <p className="text-sm">
                                              <strong>Invoice:</strong>{" "}
                                              {selectedTransaction.invoiceId}
                                            </p>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Transaction Items */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-base">
                                          Transaction Items
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Product</TableHead>
                                              <TableHead>Category</TableHead>
                                              <TableHead>Qty</TableHead>
                                              <TableHead>Unit Price</TableHead>
                                              <TableHead>Total</TableHead>
                                              <TableHead>Type</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedTransaction.items.map(
                                              (item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>
                                                    {item.productName}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge variant="outline">
                                                      {item.category}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.quantity}
                                                  </TableCell>
                                                  <TableCell>
                                                    {formatCurrency(
                                                      item.unitPrice,
                                                    )}
                                                  </TableCell>
                                                  <TableCell>
                                                    {formatCurrency(item.total)}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge
                                                      variant={
                                                        item.isServiceRelated
                                                          ? "default"
                                                          : "secondary"
                                                      }
                                                    >
                                                      {item.isServiceRelated
                                                        ? "Service Related"
                                                        : "Sales Only"}
                                                    </Badge>
                                                  </TableCell>
                                                </TableRow>
                                              ),
                                            )}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>

                                    {/* Transaction Totals */}
                                    <Card>
                                      <CardContent className="p-6">
                                        <div className="flex justify-end">
                                          <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                              <span>Subtotal:</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.subtotal,
                                                )}
                                              </span>
                                            </div>
                                            {selectedTransaction.discount >
                                              0 && (
                                              <div className="flex justify-between text-warning">
                                                <span>Discount:</span>
                                                <span>
                                                  -
                                                  {formatCurrency(
                                                    selectedTransaction.discount,
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            <div className="flex justify-between">
                                              <span>Tax (18%):</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.tax,
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                              <span>Total:</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.total,
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Notes */}
                                    {selectedTransaction.notes && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-base">
                                            Notes
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-sm">
                                            {selectedTransaction.notes}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Print Receipt
                                  </Button>
                                  <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Transaction
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Customer Sales Analytics
              </CardTitle>
              <CardDescription>
                Analyze customer purchase behavior and loyalty patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Transactions</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Visit Type Analysis</TableHead>
                      <TableHead>Avg Transaction</TableHead>
                      <TableHead>Preferred Location</TableHead>
                      <TableHead>Loyalty Level</TableHead>
                      <TableHead>Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerHistory.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {customer.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.customerType}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-medium text-lg">
                            {customer.totalTransactions}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Sales Only:</span>
                              <span className="font-medium">
                                {customer.salesOnlyVisits}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Service + Sales:</span>
                              <span className="font-medium">
                                {customer.serviceWithSalesVisits}
                              </span>
                            </div>
                            <Progress
                              value={
                                (customer.salesOnlyVisits /
                                  customer.totalTransactions) *
                                100
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {Math.round(
                                (customer.salesOnlyVisits /
                                  customer.totalTransactions) *
                                  100,
                              )}
                              % sales only
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(customer.averageTransactionValue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">
                              {customer.preferredLocation}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getLoyaltyLevelColor(
                              customer.loyaltyLevel,
                            )}
                          >
                            {customer.loyaltyLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">
                              {customer.lastPurchase}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Performance Tab */}
        <TabsContent value="locations">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {locationData.map((location) => (
                <Card
                  key={location.location}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {location.location}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Sales:</p>
                        <p className="font-medium text-lg">
                          {location.totalSales}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Transactions:</p>
                        <p className="font-medium text-lg">
                          {location.transactionCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Value:</p>
                        <p className="font-medium">
                          {formatCurrency(location.averageTransactionValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue:</p>
                        <p className="font-medium">
                          {formatCurrency(location.revenue)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Top Category:
                      </p>
                      <Badge variant="outline">
                        {location.topSellingCategory}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Sales Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales Reports</CardTitle>
                <CardDescription>
                  Generate detailed sales reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-medium mb-2">Daily Sales Report</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Detailed breakdown of today's sales activities
                      </p>
                      <Button size="sm">Generate Report</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-medium mb-2">Customer Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Customer purchase patterns and behavior
                      </p>
                      <Button size="sm">Generate Report</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      <h3 className="font-medium mb-2">Location Performance</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sales performance by location and service bay
                      </p>
                      <Button size="sm">Generate Report</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
