import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Search,
  Plus,
  Trash2,
  User,
  MapPin,
  ShoppingCart,
  Car,
  Settings,
  Save,
  ArrowLeft,
  Calculator,
  Package,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  customerType: string;
  preferredLocation: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
}

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isServiceRelated: boolean;
}

interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleInfo: string;
  status: string;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    phone: "+256 700 123 456",
    customerType: "Personal",
    preferredLocation: "Shop Front",
  },
  {
    id: "CUST-002",
    name: "Express Taxi Services",
    phone: "+256 702 456 789",
    customerType: "Private",
    preferredLocation: "Service Bay 1",
  },
  {
    id: "CUST-003",
    name: "Uganda Revenue Authority",
    phone: "+256 703 789 012",
    customerType: "Government",
    preferredLocation: "Service Bay 2",
  },
];

const mockProducts: Product[] = [
  {
    id: "TIRE-001",
    name: "Michelin Energy XM2 185/65R15",
    category: "Tire",
    price: 220000,
    stockQuantity: 24,
  },
  {
    id: "OIL-001",
    name: "Engine Oil 5W30 - 4L",
    category: "Oil",
    price: 70000,
    stockQuantity: 15,
  },
  {
    id: "BATTERY-001",
    name: "Car Battery 12V 70Ah",
    category: "Battery",
    price: 280000,
    stockQuantity: 8,
  },
  {
    id: "FILTER-001",
    name: "Oil Filter",
    category: "Parts",
    price: 25000,
    stockQuantity: 30,
  },
  {
    id: "SERVICE-001",
    name: "Oil Change Service",
    category: "Service",
    price: 80000,
    stockQuantity: 999,
  },
];

const mockActiveServiceOrders: ServiceOrder[] = [
  {
    id: "SRV-001",
    customerId: "CUST-001",
    vehicleInfo: "Toyota Camry 2020 - UAG 123A",
    status: "In Progress",
  },
  {
    id: "SRV-002",
    customerId: "CUST-002",
    vehicleInfo: "Honda Civic 2019 - UAG 456B",
    status: "Scheduled",
  },
];

const locations = [
  "Shop Front",
  "Service Bay 1",
  "Service Bay 2",
  "Service Bay 3",
  "Mobile Unit",
];

const paymentMethods = [
  "Cash",
  "Mobile Money",
  "Card",
  "Bank Transfer",
  "Credit",
];

interface SalesPerson {
  id: string;
  name: string;
  phone?: string;
  role?: string;
}

const defaultSalesPeople: SalesPerson[] = [
  { id: "SP-001", name: "Sarah Wilson", phone: "+256 700 111 222", role: "Sales Associate" },
  { id: "SP-002", name: "James Okello", phone: "+256 700 333 444", role: "Sales Associate" },
  { id: "SP-003", name: "Peter Mukasa", phone: "+256 700 555 666", role: "Senior Sales" },
];

export default function NewSaleTransaction() {
  const [transactionType, setTransactionType] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedServiceOrder, setSelectedServiceOrder] =
    useState<ServiceOrder | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);

  // Salesperson state
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>(() => {
    try {
      const raw = localStorage.getItem("salesPeople");
      return raw ? (JSON.parse(raw) as SalesPerson[]) : defaultSalesPeople;
    } catch {
      return defaultSalesPeople;
    }
  });
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string>("");
  const [showAddSalesForm, setShowAddSalesForm] = useState(false);
  const [newSalesName, setNewSalesName] = useState("");
  const [newSalesPhone, setNewSalesPhone] = useState("");

  useEffect(() => {
    try { localStorage.setItem("salesPeople", JSON.stringify(salesPeople)); } catch {}
  }, [salesPeople]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch),
  );

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const customerServiceOrders = selectedCustomer
    ? mockActiveServiceOrders.filter(
        (order) => order.customerId === selectedCustomer.id,
      )
    : [];

  const addSaleItem = (product: Product) => {
    const existingItem = saleItems.find(
      (item) => item.productId === product.id,
    );

    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        ),
      );
    } else {
      const newItem: SaleItem = {
        id: `ITEM-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        isServiceRelated: transactionType === "Service + Sales",
      };
      setSaleItems([...saleItems, newItem]);
    }
    setProductSearch("");
  };

  const updateSaleItem = (itemId: string, field: string, value: number) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const removeSaleItem = (itemId: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.18; // 18% VAT
    const total = taxableAmount + tax;

    return {
      subtotal,
      discountAmount,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = () => {
    if (
      !selectedCustomer ||
      !transactionType ||
      !selectedLocation ||
      !paymentMethod ||
      saleItems.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return;
    }

    const selectedSP = salesPeople.find((s) => s.id === selectedSalesPersonId);
    const transactionData = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      transactionType,
      location: selectedLocation,
      serviceOrderId: selectedServiceOrder?.id,
      items: saleItems,
      paymentMethod,
      notes,
      discount,
      salesPersonId: selectedSP?.id,
      salesPersonName: selectedSP?.name,
      ...totals,
    };

    console.log("Transaction Data:", transactionData);
    alert("Sale transaction created successfully!");
  };

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
              New Sale Transaction
            </h1>
            <p className="text-muted-foreground">
              Create a new sales transaction with comprehensive tracking
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Complete Sale
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Transaction Type
              </CardTitle>
              <CardDescription>
                Select the type of transaction to track properly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="Sales Only" id="sales-only" />
                    <div className="flex-1">
                      <Label htmlFor="sales-only" className="font-medium">
                        Sales Only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Customer came only to purchase items
                      </p>
                    </div>
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem
                      value="Service + Sales"
                      id="service-sales"
                    />
                    <div className="flex-1">
                      <Label htmlFor="service-sales" className="font-medium">
                        Service + Sales
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Sales during service appointment
                      </p>
                    </div>
                    <Car className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="Service Only" id="service-only" />
                    <div className="flex-1">
                      <Label htmlFor="service-only" className="font-medium">
                        Service Only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Service without additional sales
                      </p>
                    </div>
                    <Settings className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer-search">Search Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-search"
                    placeholder="Search by name or phone number..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {customerSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-accent border-b last:border-b-0",
                        selectedCustomer?.id === customer.id && "bg-accent",
                      )}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearch("");
                        setSelectedLocation(customer.preferredLocation);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone}
                          </p>
                        </div>
                        <Badge variant="outline">{customer.customerType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.customerType} •{" "}
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Order Selection (only for Service + Sales) */}
          {transactionType === "Service + Sales" &&
            customerServiceOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Related Service Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedServiceOrder?.id || ""}
                    onValueChange={(value) => {
                      const order = customerServiceOrders.find(
                        (o) => o.id === value,
                      );
                      setSelectedServiceOrder(order || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select related service order" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerServiceOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.id} - {order.vehicleInfo} ({order.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

          {/* Location and Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="location">Transaction Location</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salesperson */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Salesperson
              </CardTitle>
              <CardDescription>Assign the salesperson handling this sale or add a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Assign Salesperson</Label>
                  <Select value={selectedSalesPersonId} onValueChange={setSelectedSalesPersonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salesperson" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesPeople.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.name}{sp.phone ? ` • ${sp.phone}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddSalesForm((v) => !v)}>
                  <UserPlus className="h-4 w-4 mr-1" /> {showAddSalesForm ? "Close" : "Add new"}
                </Button>
              </div>

              {showAddSalesForm && (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <Label>Name</Label>
                    <Input value={newSalesName} onChange={(e) => setNewSalesName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="md:col-span-1">
                    <Label>Phone</Label>
                    <Input value={newSalesPhone} onChange={(e) => setNewSalesPhone(e.target.value)} placeholder="+256 ..." />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={() => {
                        if (!newSalesName.trim()) { alert("Enter salesperson name"); return; }
                        const id = `SP-${Date.now()}`;
                        const sp: SalesPerson = { id, name: newSalesName.trim(), phone: newSalesPhone.trim() || undefined };
                        setSalesPeople((prev) => [sp, ...prev]);
                        setSelectedSalesPersonId(id);
                        setNewSalesName("");
                        setNewSalesPhone("");
                        setShowAddSalesForm(false);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {selectedSalesPersonId && (
                <div className="p-3 bg-accent rounded-md text-sm">
                  {(() => { const sp = salesPeople.find((x) => x.id === selectedSalesPersonId); return sp ? (<>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sp.name}</p>
                        <p className="text-muted-foreground">{sp.phone || "-"}</p>
                      </div>
                      <Badge variant="outline">Assigned</Badge>
                    </div>
                  </>) : null; })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product-search">Search Products/Services</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-search"
                    placeholder="Search products or services..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {productSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 cursor-pointer hover:bg-accent border-b last:border-b-0"
                      onClick={() => addSaleItem(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <span>Stock: {product.stockQuantity}</span>
                          </div>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sale Items</CardTitle>
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
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.isServiceRelated && (
                              <Badge variant="secondary" className="text-xs">
                                Service Related
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateSaleItem(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateSaleItem(
                                item.id,
                                "unitPrice",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSaleItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes about this transaction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Transaction Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.customerType}
                  </p>
                </div>
              )}

              {transactionType && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Type:
                  </p>
                  <Badge variant="outline">{transactionType}</Badge>
                </div>
              )}

              {selectedLocation && (
                <div>
                  <p className="text-sm text-muted-foreground">Location:</p>
                  <p className="font-medium">{selectedLocation}</p>
                </div>
              )}

              {selectedSalesPersonId && (
                <div>
                  <p className="text-sm text-muted-foreground">Salesperson:</p>
                  <p className="font-medium">{(salesPeople.find((s) => s.id === selectedSalesPersonId)?.name) || "-"}</p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{saleItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="discount" className="text-sm">
                    Discount (%):
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-warning">
                    <span>Discount:</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              {paymentMethod && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Payment Method:
                  </p>
                  <Badge variant="outline">{paymentMethod}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
