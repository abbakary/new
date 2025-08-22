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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  ShoppingCart,
  Package,
  User,
  Car,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TireProduct {
  id: string;
  brand: string;
  model: string;
  size: string;
  type: string;
  category: string;
  currentStock: number;
  sellingPrice: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: string;
}

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  installationFee?: number;
}

interface TireSale {
  id: string;
  customerId: string;
  customerName: string;
  vehicleInfo: string;
  items: SaleItem[];
  serviceType: "Sale Only" | "Sale + Installation" | "Installation Only";
  subtotal: number;
  tax: number;
  total: number;
  status: "Draft" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  estimatedTime?: string;
  actualTime?: string;
  notes?: string;
  jobCardId?: string;
}

// Mock data
const mockTireProducts: TireProduct[] = [
  {
    id: "TIRE-001",
    brand: "Michelin",
    model: "Energy XM2",
    size: "185/65R15",
    type: "All-Season",
    category: "Passenger",
    currentStock: 24,
    sellingPrice: 220000,
    status: "In Stock",
  },
  {
    id: "TIRE-002",
    brand: "Bridgestone",
    model: "Turanza T005",
    size: "215/60R16",
    type: "All-Season",
    category: "SUV",
    currentStock: 6,
    sellingPrice: 310000,
    status: "Low Stock",
  },
  {
    id: "TIRE-003",
    brand: "Continental",
    model: "CrossContact LX2",
    size: "265/70R16",
    type: "All-Season",
    category: "SUV",
    currentStock: 0,
    sellingPrice: 400000,
    status: "Out of Stock",
  },
];

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    phone: "+256 700 123 456",
    type: "Personal",
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    phone: "+256 702 456 789",
    type: "Personal",
  },
  {
    id: "CUST-003",
    name: "Express Taxi Services",
    phone: "+256 704 789 012",
    type: "Private",
  },
];

const mockTireSales: TireSale[] = [
  {
    id: "TSALE-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    vehicleInfo: "Toyota Camry 2020 - UAG 123A",
    items: [
      {
        id: "ITEM-001",
        productId: "TIRE-001",
        productName: "Michelin Energy XM2 185/65R15",
        quantity: 4,
        unitPrice: 220000,
        total: 880000,
        installationFee: 20000,
      },
    ],
    serviceType: "Sale + Installation",
    subtotal: 960000,
    tax: 172800,
    total: 1132800,
    status: "Completed",
    date: "2024-01-20",
    estimatedTime: "2 hours",
    actualTime: "1.5 hours",
    jobCardId: "JOB-001",
  },
  {
    id: "TSALE-002",
    customerId: "CUST-003",
    customerName: "Express Taxi Services",
    vehicleInfo: "Multiple vehicles",
    items: [
      {
        id: "ITEM-002",
        productId: "TIRE-002",
        productName: "Bridgestone Turanza T005 215/60R16",
        quantity: 8,
        unitPrice: 310000,
        total: 2480000,
      },
    ],
    serviceType: "Sale Only",
    subtotal: 2480000,
    tax: 446400,
    total: 2926400,
    status: "In Progress",
    date: "2024-01-19",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-success text-success-foreground";
    case "In Progress":
      return "bg-info text-info-foreground";
    case "Confirmed":
      return "bg-warning text-warning-foreground";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Cancelled":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStockStatusColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-success text-success-foreground";
    case "Low Stock":
      return "bg-warning text-warning-foreground";
    case "Out of Stock":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function TireServices() {
  const [activeTab, setActiveTab] = useState("sales");
  const [sales] = useState(mockTireSales);
  const [products] = useState(mockTireProducts);
  const [customers] = useState(mockCustomers);
  const [selectedSale, setSelectedSale] = useState<TireSale | null>(null);
  const [isCreatingSale, setIsCreatingSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // New sale state
  const [newSale, setNewSale] = useState<Partial<TireSale>>({
    customerId: "",
    customerName: "",
    vehicleInfo: "",
    items: [],
    serviceType: "Sale Only",
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "Draft",
    date: new Date().toISOString().split("T")[0],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotals = (items: SaleItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.total + (item.installationFee || 0),
      0,
    );
    const tax = subtotal * 0.18; // 18% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const addItemToSale = (
    product: TireProduct,
    quantity: number,
    includeInstallation: boolean,
  ) => {
    const installationFee = includeInstallation ? 25000 * quantity : 0;
    const newItem: SaleItem = {
      id: `ITEM-${Date.now()}`,
      productId: product.id,
      productName: `${product.brand} ${product.model} ${product.size}`,
      quantity,
      unitPrice: product.sellingPrice,
      total: product.sellingPrice * quantity,
      installationFee,
    };

    const updatedItems = [...(newSale.items || []), newItem];
    const { subtotal, tax, total } = calculateTotals(updatedItems);

    setNewSale((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      tax,
      total,
    }));
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats
  const totalSales = sales.length;
  const todaysSales = sales.filter(
    (sale) => sale.date === new Date().toISOString().split("T")[0],
  ).length;
  const totalRevenue = sales
    .filter((sale) => sale.status === "Completed")
    .reduce((sum, sale) => sum + sale.total, 0);
  const pendingSales = sales.filter((sale) =>
    ["Draft", "Confirmed", "In Progress"].includes(sale.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tire Services</h1>
          <p className="text-muted-foreground">
            Manage tire sales, installations, and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            View Inventory
          </Button>
          <Button variant="outline" asChild>
            <Link to="/orders/job-cards">
              <Plus className="h-4 w-4 mr-2" />
              New Service Order
            </Link>
          </Button>
          <Button onClick={() => setIsCreatingSale(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold">{todaysSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Sales</p>
                <p className="text-2xl font-bold">{pendingSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="sales">Sales Management</TabsTrigger>
          <TabsTrigger value="products">Product Catalog</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
        </TabsList>

        {/* Sales Management Tab */}
        <TabsContent value="sales">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or sale ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sales List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Sales</CardTitle>
                  <CardDescription>
                    {filteredSales.length} sales found
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingSale(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{sale.vehicleInfo}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.serviceType}</Badge>
                        </TableCell>
                        <TableCell>{sale.items.length} items</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedSale(sale)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Sale Details - {sale.id}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedSale && (
                                  <div className="space-y-6">
                                    {/* Sale Header */}
                                    <div className="grid gap-4 md:grid-cols-3">
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Customer
                                        </h4>
                                        <p className="text-sm">
                                          {selectedSale.customerName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedSale.vehicleInfo}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Service
                                        </h4>
                                        <Badge variant="outline">
                                          {selectedSale.serviceType}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Date: {selectedSale.date}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Status
                                        </h4>
                                        <Badge
                                          className={getStatusColor(
                                            selectedSale.status,
                                          )}
                                        >
                                          {selectedSale.status}
                                        </Badge>
                                        {selectedSale.actualTime && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            Time: {selectedSale.actualTime}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Items */}
                                    <div>
                                      <h4 className="font-medium mb-3">
                                        Items
                                      </h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Installation</TableHead>
                                            <TableHead>Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedSale.items.map((item) => (
                                            <TableRow key={item.id}>
                                              <TableCell>
                                                {item.productName}
                                              </TableCell>
                                              <TableCell>
                                                {item.quantity}
                                              </TableCell>
                                              <TableCell>
                                                {formatCurrency(item.unitPrice)}
                                              </TableCell>
                                              <TableCell>
                                                {item.installationFee
                                                  ? formatCurrency(
                                                      item.installationFee,
                                                    )
                                                  : "-"}
                                              </TableCell>
                                              <TableCell>
                                                {formatCurrency(
                                                  item.total +
                                                    (item.installationFee || 0),
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>

                                    {/* Totals */}
                                    <div className="border-t pt-4">
                                      <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                          <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>
                                              {formatCurrency(
                                                selectedSale.subtotal,
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Tax (18%):</span>
                                            <span>
                                              {formatCurrency(selectedSale.tax)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>
                                              {formatCurrency(
                                                selectedSale.total,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Invoice
                                  </Button>
                                  <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Sale
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

        {/* Product Catalog Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Available Tire Products
                  </CardTitle>
                  <CardDescription>
                    Current inventory and pricing information
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {product.brand}
                        </CardTitle>
                        <Badge className={getStockStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </div>
                      <CardDescription>{product.model}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Size:</span>
                          <span className="font-medium">{product.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <span className="font-medium">{product.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Category:</span>
                          <span className="font-medium">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Stock:</span>
                          <span className="font-medium">
                            {product.currentStock}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Price:</span>
                          <span className="font-medium text-lg">
                            {formatCurrency(product.sellingPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={product.currentStock === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Sale
                        </Button>
                        <Button variant="outline" size="sm">
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

        {/* Service Types Tab */}
        <TabsContent value="services">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tire Sale Services</CardTitle>
                <CardDescription>
                  Available service options for tire sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Tire Sale Only</h4>
                      <p className="text-sm text-muted-foreground">
                        Customer purchases tires without installation
                      </p>
                    </div>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sale + Installation</h4>
                      <p className="text-sm text-muted-foreground">
                        Tire purchase with professional installation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Installation fee: UGX 25,000 per tire
                      </p>
                    </div>
                    <Badge>Popular</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Installation Only</h4>
                      <p className="text-sm text-muted-foreground">
                        Installation of customer-provided tires
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Service fee: UGX 25,000 per tire
                      </p>
                    </div>
                    <Badge variant="outline">Service</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Services</CardTitle>
                <CardDescription>
                  Extra services available with tire installation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Wheel Balancing</h4>
                      <p className="text-sm text-muted-foreground">
                        UGX 15,000 per wheel
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Wheel Alignment</h4>
                      <p className="text-sm text-muted-foreground">
                        UGX 50,000 per vehicle
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Tire Pressure Check</h4>
                      <p className="text-sm text-muted-foreground">
                        Complimentary service
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Sale Dialog */}
      <Dialog open={isCreatingSale} onOpenChange={setIsCreatingSale}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tire Sale</DialogTitle>
            <DialogDescription>
              Add a new tire sale with customer and product information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setNewSale((prev) => ({
                      ...prev,
                      customerId: value,
                      customerName: customer?.name || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle Information</Label>
                <Input
                  id="vehicle"
                  placeholder="e.g., Toyota Camry 2020 - UAG 123A"
                  value={newSale.vehicleInfo}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      vehicleInfo: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select
                value={newSale.serviceType}
                onValueChange={(value) =>
                  setNewSale((prev) => ({ ...prev, serviceType: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale Only">Sale Only</SelectItem>
                  <SelectItem value="Sale + Installation">
                    Sale + Installation
                  </SelectItem>
                  <SelectItem value="Installation Only">
                    Installation Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sale Items</Label>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {newSale.items && newSale.items.length > 0 && (
                <div className="space-y-2">
                  {newSale.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice)}
                          {item.installationFee &&
                            ` + Installation: ${formatCurrency(item.installationFee)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(
                            item.total + (item.installationFee || 0),
                          )}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            {newSale.items && newSale.items.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(newSale.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>{formatCurrency(newSale.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(newSale.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingSale(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle save logic here
                setIsCreatingSale(false);
                // Reset form
                setNewSale({
                  customerId: "",
                  customerName: "",
                  vehicleInfo: "",
                  items: [],
                  serviceType: "Sale Only",
                  subtotal: 0,
                  tax: 0,
                  total: 0,
                  status: "Draft",
                  date: new Date().toISOString().split("T")[0],
                });
              }}
            >
              Create Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
