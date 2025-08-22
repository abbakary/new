import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  MapPin,
  Calendar,
  Package,
  ArrowLeft,
  Download,
  Filter,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SalesMetrics {
  period: string;
  totalSales: number;
  totalRevenue: number;
  salesOnlyTransactions: number;
  serviceWithSalesTransactions: number;
  averageTransactionValue: number;
  topSellingProduct: string;
  growthRate: number;
}

interface LocationPerformance {
  location: string;
  totalSales: number;
  revenue: number;
  salesOnlyRatio: number;
  serviceWithSalesRatio: number;
  topCategory: string;
  growthRate: number;
}

interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profitMargin: number;
  salesOnlyCount: number;
  serviceRelatedCount: number;
}

interface CustomerBehavior {
  customerType: string;
  totalCustomers: number;
  salesOnlyCustomers: number;
  serviceWithSalesCustomers: number;
  averageTransactionValue: number;
  totalRevenue: number;
  loyaltyDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

// Mock analytics data
const mockSalesMetrics: SalesMetrics[] = [
  {
    period: "This Month",
    totalSales: 156,
    totalRevenue: 45600000,
    salesOnlyTransactions: 89,
    serviceWithSalesTransactions: 67,
    averageTransactionValue: 292308,
    topSellingProduct: "Michelin Energy XM2",
    growthRate: 12.5,
  },
  {
    period: "Last Month",
    totalSales: 139,
    totalRevenue: 38900000,
    salesOnlyTransactions: 78,
    serviceWithSalesTransactions: 61,
    averageTransactionValue: 279856,
    topSellingProduct: "Engine Oil 5W30",
    growthRate: 8.3,
  },
  {
    period: "This Quarter",
    totalSales: 445,
    totalRevenue: 126800000,
    salesOnlyTransactions: 254,
    serviceWithSalesTransactions: 191,
    averageTransactionValue: 285056,
    topSellingProduct: "Michelin Energy XM2",
    growthRate: 15.2,
  },
];

const mockLocationPerformance: LocationPerformance[] = [
  {
    location: "Shop Front",
    totalSales: 89,
    revenue: 26700000,
    salesOnlyRatio: 78,
    serviceWithSalesRatio: 22,
    topCategory: "Tire",
    growthRate: 18.5,
  },
  {
    location: "Service Bay 1",
    totalSales: 34,
    revenue: 12400000,
    salesOnlyRatio: 15,
    serviceWithSalesRatio: 85,
    topCategory: "Service",
    growthRate: 8.2,
  },
  {
    location: "Service Bay 2",
    totalSales: 22,
    revenue: 4800000,
    salesOnlyRatio: 18,
    serviceWithSalesRatio: 82,
    topCategory: "Parts",
    growthRate: 5.1,
  },
  {
    location: "Service Bay 3",
    totalSales: 11,
    revenue: 1700000,
    salesOnlyRatio: 27,
    serviceWithSalesRatio: 73,
    topCategory: "Oil",
    growthRate: -2.3,
  },
];

const mockProductPerformance: ProductPerformance[] = [
  {
    productId: "TIRE-001",
    productName: "Michelin Energy XM2 185/65R15",
    category: "Tire",
    unitsSold: 124,
    revenue: 27280000,
    profitMargin: 18.2,
    salesOnlyCount: 98,
    serviceRelatedCount: 26,
  },
  {
    productId: "OIL-001",
    productName: "Engine Oil 5W30 - 4L",
    category: "Oil",
    unitsSold: 89,
    revenue: 6230000,
    profitMargin: 25.5,
    salesOnlyCount: 34,
    serviceRelatedCount: 55,
  },
  {
    productId: "SERVICE-001",
    productName: "Oil Change Service",
    category: "Service",
    unitsSold: 67,
    revenue: 5360000,
    profitMargin: 45.0,
    salesOnlyCount: 0,
    serviceRelatedCount: 67,
  },
  {
    productId: "BATTERY-001",
    productName: "Car Battery 12V 70Ah",
    category: "Battery",
    unitsSold: 23,
    revenue: 6440000,
    profitMargin: 22.8,
    salesOnlyCount: 21,
    serviceRelatedCount: 2,
  },
];

const mockCustomerBehavior: CustomerBehavior[] = [
  {
    customerType: "Personal",
    totalCustomers: 2691,
    salesOnlyCustomers: 1847,
    serviceWithSalesCustomers: 844,
    averageTransactionValue: 285000,
    totalRevenue: 34200000,
    loyaltyDistribution: {
      bronze: 1200,
      silver: 890,
      gold: 450,
      platinum: 151,
    },
  },
  {
    customerType: "Private",
    totalCustomers: 88,
    salesOnlyCustomers: 23,
    serviceWithSalesCustomers: 65,
    averageTransactionValue: 580000,
    totalRevenue: 8900000,
    loyaltyDistribution: {
      bronze: 15,
      silver: 28,
      gold: 32,
      platinum: 13,
    },
  },
  {
    customerType: "Government",
    totalCustomers: 45,
    salesOnlyCustomers: 8,
    serviceWithSalesCustomers: 37,
    averageTransactionValue: 1250000,
    totalRevenue: 2100000,
    loyaltyDistribution: {
      bronze: 5,
      silver: 12,
      gold: 18,
      platinum: 10,
    },
  },
  {
    customerType: "NGO",
    totalCustomers: 23,
    salesOnlyCustomers: 11,
    serviceWithSalesCustomers: 12,
    averageTransactionValue: 420000,
    totalRevenue: 400000,
    loyaltyDistribution: {
      bronze: 8,
      silver: 9,
      gold: 5,
      platinum: 1,
    },
  },
];

export default function SalesAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const currentMetrics =
    mockSalesMetrics.find((m) => m.period === selectedPeriod) ||
    mockSalesMetrics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sales">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sales Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive sales performance analysis and insights
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="Last Month">Last Month</SelectItem>
              <SelectItem value="This Quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">
                  {currentMetrics.totalSales}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">
                    {formatPercentage(currentMetrics.growthRate)}
                  </span>
                </div>
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
                  {formatCurrency(currentMetrics.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">
                    {formatPercentage(currentMetrics.growthRate)}
                  </span>
                </div>
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
                <p className="text-2xl font-bold">
                  {currentMetrics.salesOnlyTransactions}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (currentMetrics.salesOnlyTransactions /
                      currentMetrics.totalSales) *
                      100,
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
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(currentMetrics.averageTransactionValue)}
                </p>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Behavior</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of sales-only vs service+sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Sales Only Transactions</span>
                    <span>
                      {currentMetrics.salesOnlyTransactions}/
                      {currentMetrics.totalSales}
                    </span>
                  </div>
                  <Progress
                    value={
                      (currentMetrics.salesOnlyTransactions /
                        currentMetrics.totalSales) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      (currentMetrics.salesOnlyTransactions /
                        currentMetrics.totalSales) *
                        100,
                    )}
                    % of total sales
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Service + Sales Transactions</span>
                    <span>
                      {currentMetrics.serviceWithSalesTransactions}/
                      {currentMetrics.totalSales}
                    </span>
                  </div>
                  <Progress
                    value={
                      (currentMetrics.serviceWithSalesTransactions /
                        currentMetrics.totalSales) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      (currentMetrics.serviceWithSalesTransactions /
                        currentMetrics.totalSales) *
                        100,
                    )}
                    % of total sales
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key insights about sales performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Growth Rate:</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="font-medium text-success">
                        {formatPercentage(currentMetrics.growthRate)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Top Product:</p>
                    <p className="font-medium">
                      {currentMetrics.topSellingProduct}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Sales Pattern Analysis:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      {Math.round(
                        (currentMetrics.salesOnlyTransactions /
                          currentMetrics.totalSales) *
                          100,
                      )}
                      % of customers come specifically for purchases
                    </li>
                    <li>
                      • Service appointments generate additional sales{" "}
                      {Math.round(
                        (currentMetrics.serviceWithSalesTransactions /
                          currentMetrics.totalSales) *
                          100,
                      )}
                      % of the time
                    </li>
                    <li>
                      • Average transaction value:{" "}
                      {formatCurrency(currentMetrics.averageTransactionValue)}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Performance Tab */}
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Analysis</CardTitle>
              <CardDescription>
                Sales performance across different locations and service bays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Sales Pattern</TableHead>
                      <TableHead>Top Category</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLocationPerformance.map((location) => (
                      <TableRow key={location.location}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">
                              {location.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-lg">
                            {location.totalSales}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(location.revenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Sales Only:</span>
                              <span>{location.salesOnlyRatio}%</span>
                            </div>
                            <Progress
                              value={location.salesOnlyRatio}
                              className="h-1"
                            />
                            <div className="flex items-center justify-between text-sm">
                              <span>Service + Sales:</span>
                              <span>{location.serviceWithSalesRatio}%</span>
                            </div>
                            <Progress
                              value={location.serviceWithSalesRatio}
                              className="h-1"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {location.topCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {location.growthRate > 0 ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span
                              className={
                                location.growthRate > 0
                                  ? "text-success"
                                  : "text-destructive"
                              }
                            >
                              {formatPercentage(location.growthRate)}
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

        {/* Product Performance Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Analysis</CardTitle>
              <CardDescription>
                Sales performance by product and category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Sales Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProductPerformance.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <p className="font-medium">{product.productName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-lg">
                            {product.unitsSold}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(product.revenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {product.profitMargin}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Sales Only:</span>
                              <span>{product.salesOnlyCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Service Related:</span>
                              <span>{product.serviceRelatedCount}</span>
                            </div>
                            <Progress
                              value={
                                (product.salesOnlyCount / product.unitsSold) *
                                100
                              }
                              className="h-1"
                            />
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

        {/* Customer Behavior Tab */}
        <TabsContent value="customers">
          <div className="space-y-6">
            {mockCustomerBehavior.map((behavior) => (
              <Card key={behavior.customerType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {behavior.customerType} Customers
                  </CardTitle>
                  <CardDescription>
                    Sales behavior analysis for{" "}
                    {behavior.customerType.toLowerCase()} customer segment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Customers
                      </p>
                      <p className="text-2xl font-bold">
                        {behavior.totalCustomers}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sales Only
                      </p>
                      <p className="text-2xl font-bold">
                        {behavior.salesOnlyCustomers}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(
                          (behavior.salesOnlyCustomers /
                            behavior.totalCustomers) *
                            100,
                        )}
                        % of segment
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Service + Sales
                      </p>
                      <p className="text-2xl font-bold">
                        {behavior.serviceWithSalesCustomers}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(
                          (behavior.serviceWithSalesCustomers /
                            behavior.totalCustomers) *
                            100,
                        )}
                        % of segment
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Transaction
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(behavior.averageTransactionValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">
                      Loyalty Level Distribution:
                    </p>
                    <div className="grid gap-4 md:grid-cols-4">
                      {Object.entries(behavior.loyaltyDistribution).map(
                        ([level, count]) => (
                          <div
                            key={level}
                            className="text-center p-3 border rounded-lg"
                          >
                            <p className="font-medium capitalize">{level}</p>
                            <p className="text-xl font-bold">{count}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(
                                (count / behavior.totalCustomers) * 100,
                              )}
                              %
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
