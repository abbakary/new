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
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TireProduct {
  id: string;
  brand: string;
  model: string;
  size: string;
  type: "Summer" | "Winter" | "All-Season" | "Performance" | "Off-Road";
  category: "Passenger" | "SUV" | "Truck" | "Motorcycle" | "Commercial";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  location: string;
  supplier: string;
  lastRestock: string;
  soldThisMonth: number;
  totalSold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Discontinued";
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string;
  date: string;
  user: string;
  reference?: string;
}

const mockTireInventory: TireProduct[] = [
  {
    id: "TIRE-001",
    brand: "Michelin",
    model: "Energy XM2",
    size: "185/65R15",
    type: "All-Season",
    category: "Passenger",
    currentStock: 24,
    minStock: 10,
    maxStock: 50,
    unitCost: 180000,
    sellingPrice: 220000,
    location: "A1-15",
    supplier: "Michelin Uganda",
    lastRestock: "2024-01-15",
    soldThisMonth: 8,
    totalSold: 45,
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
    minStock: 8,
    maxStock: 40,
    unitCost: 250000,
    sellingPrice: 310000,
    location: "B2-08",
    supplier: "Bridgestone East Africa",
    lastRestock: "2024-01-10",
    soldThisMonth: 12,
    totalSold: 68,
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
    minStock: 6,
    maxStock: 30,
    unitCost: 320000,
    sellingPrice: 400000,
    location: "C1-12",
    supplier: "Continental Africa",
    lastRestock: "2024-01-05",
    soldThisMonth: 6,
    totalSold: 23,
    status: "Out of Stock",
  },
  {
    id: "TIRE-004",
    brand: "Yokohama",
    model: "BluEarth AE-01",
    size: "195/65R15",
    type: "All-Season",
    category: "Passenger",
    currentStock: 35,
    minStock: 15,
    maxStock: 60,
    unitCost: 165000,
    sellingPrice: 205000,
    location: "A2-20",
    supplier: "Yokohama Uganda",
    lastRestock: "2024-01-18",
    soldThisMonth: 15,
    totalSold: 89,
    status: "In Stock",
  },
  {
    id: "TIRE-005",
    brand: "Pirelli",
    model: "Cinturato P7",
    size: "225/45R17",
    type: "Performance",
    category: "Passenger",
    currentStock: 18,
    minStock: 8,
    maxStock: 35,
    unitCost: 380000,
    sellingPrice: 470000,
    location: "D1-05",
    supplier: "Pirelli East Africa",
    lastRestock: "2024-01-12",
    soldThisMonth: 4,
    totalSold: 18,
    status: "In Stock",
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: "MOV-001",
    productId: "TIRE-001",
    productName: "Michelin Energy XM2 185/65R15",
    type: "OUT",
    quantity: -4,
    reason: "Sale to Customer",
    date: "2024-01-20",
    user: "John Doe",
    reference: "ORD-1234",
  },
  {
    id: "MOV-002",
    productId: "TIRE-002",
    productName: "Bridgestone Turanza T005 215/60R16",
    type: "OUT",
    quantity: -2,
    reason: "Sale to Customer",
    date: "2024-01-19",
    user: "Jane Smith",
    reference: "ORD-1235",
  },
  {
    id: "MOV-003",
    productId: "TIRE-001",
    productName: "Michelin Energy XM2 185/65R15",
    type: "IN",
    quantity: 20,
    reason: "Supplier Delivery",
    date: "2024-01-15",
    user: "Admin",
    reference: "PO-001",
  },
];

const getStockStatusColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-success text-success-foreground";
    case "Low Stock":
      return "bg-warning text-warning-foreground";
    case "Out of Stock":
      return "bg-destructive text-destructive-foreground";
    case "Discontinued":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStockLevel = (current: number, min: number, max: number) => {
  return Math.round((current / max) * 100);
};

export default function TireInventory() {
  const [inventory] = useState(mockTireInventory);
  const [movements] = useState(mockStockMovements);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<TireProduct | null>(
    null,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInventory = inventory.filter((product) => {
    const matchesSearch =
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.size.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate summary statistics
  const totalProducts = inventory.length;
  const totalValue = inventory.reduce(
    (sum, product) => sum + product.currentStock * product.unitCost,
    0,
  );
  const lowStockItems = inventory.filter(
    (product) => product.status === "Low Stock",
  ).length;
  const outOfStockItems = inventory.filter(
    (product) => product.status === "Out of Stock",
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tire Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Track tire stock levels, manage inventory, and monitor sales
            performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Stock
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Reorder</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Search & Filter Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by brand, model, or size..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Passenger">Passenger</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tire Inventory</CardTitle>
                  <CardDescription>
                    {filteredInventory.length} products found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Monthly Sales</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((product) => {
                      const stockLevel = getStockLevel(
                        product.currentStock,
                        product.minStock,
                        product.maxStock,
                      );
                      return (
                        <TableRow
                          key={product.id}
                          className="hover:bg-accent/50"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {product.brand} {product.model}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.size}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.type}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={stockLevel} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {stockLevel}% ({product.currentStock}/
                                {product.maxStock})
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium text-lg">
                                {product.currentStock}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Min: {product.minStock}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Location: {product.location}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(product.unitCost)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatCurrency(product.sellingPrice)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Margin:{" "}
                                {Math.round(
                                  ((product.sellingPrice - product.unitCost) /
                                    product.sellingPrice) *
                                    100,
                                )}
                                %
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">
                                {product.soldThisMonth}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total: {product.totalSold}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStockStatusColor(product.status)}
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Product Details - {product.brand}{" "}
                                      {product.model}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Complete product information and stock
                                      details
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <div className="space-y-4">
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Product Information
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <p>
                                              <strong>Brand:</strong>{" "}
                                              {selectedProduct.brand}
                                            </p>
                                            <p>
                                              <strong>Model:</strong>{" "}
                                              {selectedProduct.model}
                                            </p>
                                            <p>
                                              <strong>Size:</strong>{" "}
                                              {selectedProduct.size}
                                            </p>
                                            <p>
                                              <strong>Type:</strong>{" "}
                                              {selectedProduct.type}
                                            </p>
                                            <p>
                                              <strong>Category:</strong>{" "}
                                              {selectedProduct.category}
                                            </p>
                                            <p>
                                              <strong>Supplier:</strong>{" "}
                                              {selectedProduct.supplier}
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Stock Information
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <p>
                                              <strong>Current Stock:</strong>{" "}
                                              {selectedProduct.currentStock}
                                            </p>
                                            <p>
                                              <strong>Min Stock:</strong>{" "}
                                              {selectedProduct.minStock}
                                            </p>
                                            <p>
                                              <strong>Max Stock:</strong>{" "}
                                              {selectedProduct.maxStock}
                                            </p>
                                            <p>
                                              <strong>Location:</strong>{" "}
                                              {selectedProduct.location}
                                            </p>
                                            <p>
                                              <strong>Last Restock:</strong>{" "}
                                              {selectedProduct.lastRestock}
                                            </p>
                                            <p>
                                              <strong>Status:</strong>
                                              <Badge
                                                className={`ml-2 ${getStockStatusColor(selectedProduct.status)}`}
                                              >
                                                {selectedProduct.status}
                                              </Badge>
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Pricing
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <p>
                                              <strong>Unit Cost:</strong>{" "}
                                              {formatCurrency(
                                                selectedProduct.unitCost,
                                              )}
                                            </p>
                                            <p>
                                              <strong>Selling Price:</strong>{" "}
                                              {formatCurrency(
                                                selectedProduct.sellingPrice,
                                              )}
                                            </p>
                                            <p>
                                              <strong>Profit Margin:</strong>{" "}
                                              {Math.round(
                                                ((selectedProduct.sellingPrice -
                                                  selectedProduct.unitCost) /
                                                  selectedProduct.sellingPrice) *
                                                  100,
                                              )}
                                              %
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Sales Performance
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <p>
                                              <strong>Sold This Month:</strong>{" "}
                                              {selectedProduct.soldThisMonth}
                                            </p>
                                            <p>
                                              <strong>Total Sold:</strong>{" "}
                                              {selectedProduct.totalSold}
                                            </p>
                                            <p>
                                              <strong>Stock Turnover:</strong>{" "}
                                              {selectedProduct.totalSold > 0
                                                ? Math.round(
                                                    selectedProduct.currentStock /
                                                      (selectedProduct.totalSold /
                                                        12),
                                                  )
                                                : 0}{" "}
                                              months
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Product
                                    </Button>
                                    <Button>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Create Sale
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Truck className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
              <CardDescription>
                Track all inventory changes and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.date}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{movement.productName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "IN"
                                ? "default"
                                : movement.type === "OUT"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {movement.type === "IN" && (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            )}
                            {movement.type === "OUT" && (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              movement.quantity > 0
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.user}</TableCell>
                        <TableCell>{movement.reference || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>
                  Products that need to be restocked soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventory
                    .filter((product) => product.status === "Low Stock")
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-warning rounded-lg bg-warning/5"
                      >
                        <div>
                          <p className="font-medium">
                            {product.brand} {product.model} - {product.size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Current: {product.currentStock} | Minimum:{" "}
                            {product.minStock}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Truck className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Out of Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-destructive" />
                  Out of Stock
                </CardTitle>
                <CardDescription>
                  Products that are completely out of stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventory
                    .filter((product) => product.status === "Out of Stock")
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-destructive rounded-lg bg-destructive/5"
                      >
                        <div>
                          <p className="font-medium">
                            {product.brand} {product.model} - {product.size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last sold: {product.soldThisMonth} this month
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Truck className="h-4 w-4 mr-2" />
                            Emergency Order
                          </Button>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
