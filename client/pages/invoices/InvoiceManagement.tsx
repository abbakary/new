import React, { useMemo, useState } from "react";
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
import {
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Edit,
  Send,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { useVisitTracking } from "@/context/VisitTrackingContext";

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerType: string;
  orderId: string;
  date: string; // ISO or YYYY-MM-DD
  dueDate: string; // ISO or YYYY-MM-DD
  amount: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  paymentMethod?: string;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "Service" | "Product";
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-001234",
    customerId: "CUST-001",
    customerName: "John Doe",
    customerType: "Personal",
    orderId: "ORD-1234",
    date: "2024-01-20",
    dueDate: "2024-01-20",
    amount: 150000,
    tax: 27000,
    total: 177000,
    status: "Paid",
    paymentMethod: "Cash",
    items: [
      {
        id: "ITEM-001",
        description: "Oil Change Service",
        quantity: 1,
        unitPrice: 80000,
        total: 80000,
        type: "Service",
      },
      {
        id: "ITEM-002",
        description: "Engine Oil - 5W30",
        quantity: 4,
        unitPrice: 17500,
        total: 70000,
        type: "Product",
      },
    ],
    notes: "Regular maintenance service completed",
  },
  {
    id: "INV-001235",
    customerId: "CUST-002",
    customerName: "Uganda Revenue Authority",
    customerType: "Government",
    orderId: "ORD-1235",
    date: "2024-01-19",
    dueDate: "2024-02-19",
    amount: 2800000,
    tax: 504000,
    total: 3304000,
    status: "Sent",
    items: [
      {
        id: "ITEM-003",
        description: "Fleet Maintenance Service",
        quantity: 5,
        unitPrice: 200000,
        total: 1000000,
        type: "Service",
      },
      {
        id: "ITEM-004",
        description: "Tire Set - Michelin 215/65R16",
        quantity: 20,
        unitPrice: 90000,
        total: 1800000,
        type: "Product",
      },
    ],
    notes: "Monthly fleet maintenance contract",
  },
  {
    id: "INV-001236",
    customerId: "CUST-003",
    customerName: "Express Taxi Services",
    customerType: "Private",
    orderId: "ORD-1236",
    date: "2024-01-18",
    dueDate: "2024-02-18",
    amount: 450000,
    tax: 81000,
    total: 531000,
    status: "Overdue",
    items: [
      {
        id: "ITEM-005",
        description: "Brake Service",
        quantity: 3,
        unitPrice: 120000,
        total: 360000,
        type: "Service",
      },
      {
        id: "ITEM-006",
        description: "Brake Pads",
        quantity: 6,
        unitPrice: 15000,
        total: 90000,
        type: "Product",
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-success text-success-foreground";
    case "Sent":
      return "bg-info text-info-foreground";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Overdue":
      return "bg-destructive text-destructive-foreground";
    case "Cancelled":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getVisitStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-warning text-warning-foreground";
    case "Overdue":
      return "bg-destructive text-destructive-foreground";
    case "Completed":
      return "bg-success text-success-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Paid":
      return CheckCircle;
    case "Sent":
      return Send;
    case "Draft":
      return FileText;
    case "Overdue":
      return AlertCircle;
    case "Cancelled":
      return XCircle;
    default:
      return FileText;
  }
};

const fmtDateTime = (val?: string) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val; // fallback for YYYY-MM-DD
  return d.toLocaleString();
};

export default function InvoiceManagement() {
  const [invoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [updateExpectedLocal, setUpdateExpectedLocal] = useState<string>("");

  const { visits, updateExpectedLeave, markLeft } = useVisitTracking();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", minimumFractionDigits: 0 }).format(amount);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const findCandidateVisits = (invoice: Invoice) => {
    const invDate = new Date(invoice.date);
    return visits
      .filter(
        (v) => v.customerId === invoice.customerId || v.customerName === invoice.customerName,
      )
      .map((v) => ({ v, diff: Math.abs(new Date(v.arrivedAt).getTime() - invDate.getTime()) }))
      .sort((a, b) => a.diff - b.diff)
      .map((x) => x.v);
  };

  const linkedVisitForRow = (invoice: Invoice) => {
    const candidates = findCandidateVisits(invoice);
    return candidates[0] || null;
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid").length;
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue").length;
  const totalRevenue = invoices.filter((inv) => inv.status === "Paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter((inv) => inv.status === "Sent").reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = invoices.filter((inv) => inv.status === "Overdue").reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl overflow-hidden border">
        <div className="bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 dark:from-emerald-900/20 dark:to-cyan-900/20 p-6">
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">Generate, track, and manage customer invoices and payments. Linked with visit tracking context.</p>
        </div>
        <div className="p-4 bg-background flex items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice ID, customer, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
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
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <p className="text-2xl font-bold">{paidInvoices}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueInvoices}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(overdueAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Invoice List</CardTitle>
              <CardDescription>{filteredInvoices.length} invoices found</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
              <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> Print</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  const linked = linkedVisitForRow(invoice);
                  return (
                    <TableRow key={invoice.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customerType}</p>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.orderId}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDateTime(invoice.date)}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDateTime(invoice.dueDate)}</div></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(invoice.total)}</p>
                          <p className="text-sm text-muted-foreground">+{formatCurrency(invoice.tax)} tax</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />{invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {linked ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <Badge className={getVisitStatusColor(linked.status)}>
                              {linked.status}
                            </Badge>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" /> Arr: {new Date(linked.arrivedAt).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" /> Exp: {linked.expectedLeaveAt ? new Date(linked.expectedLeaveAt).toLocaleTimeString() : "-"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No linked visit</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedInvoice(invoice);
                                const cands = findCandidateVisits(invoice);
                                setSelectedVisitId(cands[0]?.id ?? null);
                                setUpdateExpectedLocal("");
                              }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Invoice Details - {invoice.id}</DialogTitle>
                                <DialogDescription>Complete invoice information, items, and related visit timing</DialogDescription>
                              </DialogHeader>
                              {selectedInvoice && (
                                <div className="space-y-6">
                                  {/* Header sections */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                      <CardHeader className="pb-2"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
                                      <CardContent className="pt-0 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedInvoice.customerName}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{selectedInvoice.customerType}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-medium">{selectedInvoice.orderId}</span></div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader className="pb-2"><CardTitle className="text-base">Invoice</CardTitle></CardHeader>
                                      <CardContent className="pt-0 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{fmtDateTime(selectedInvoice.date)}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium">{fmtDateTime(selectedInvoice.dueDate)}</span></div>
                                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge></div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Visit timing context */}
                                  <Card className="border-l-4 border-l-primary">
                                    <CardHeader>
                                      <CardTitle className="text-base flex items-center gap-2"><Clock className="h-5 w-5" /> Related Visit Timing</CardTitle>
                                      <CardDescription>Auto-linked by customer and date. Adjust expected leave or mark left.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      {(() => {
                                        const candidates = findCandidateVisits(selectedInvoice);
                                        const selected = candidates.find((v) => v.id === selectedVisitId) || candidates[0];
                                        return candidates.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">No visits found for this customer around the invoice date.</p>
                                        ) : (
                                          <div className="space-y-4">
                                            {candidates.length > 1 && (
                                              <div className="grid gap-1 md:grid-cols-2">
                                                <div>
                                                  <Label className="text-xs">Choose Visit</Label>
                                                  <Select value={selected?.id} onValueChange={(v) => setSelectedVisitId(v)}>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select visit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {candidates.map((v) => (
                                                        <SelectItem key={v.id} value={v.id}>
                                                          {new Date(v.arrivedAt).toLocaleString()} • {v.visitType}{v.service ? ` • ${v.service}` : ""}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>
                                            )}

                                            {selected && (
                                              <div className="space-y-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                  <Badge className={getVisitStatusColor(selected.status)}>{selected.status}</Badge>
                                                  <Badge variant="outline">{selected.visitType}{selected.service ? ` • ${selected.service}` : ""}</Badge>
                                                </div>
                                                <div className="grid gap-2 md:grid-cols-3">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Arrived</span>
                                                    <span className="font-medium">{new Date(selected.arrivedAt).toLocaleString()}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Expected Leave</span>
                                                    <span className="font-medium">{selected.expectedLeaveAt ? new Date(selected.expectedLeaveAt).toLocaleString() : "-"}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Left</span>
                                                    <span className="font-medium">{selected.leftAt ? new Date(selected.leftAt).toLocaleString() : "-"}</span>
                                                  </div>
                                                </div>

                                                {!selected.leftAt && (
                                                  <div className="grid gap-2 md:grid-cols-3 items-end">
                                                    <div className="md:col-span-2">
                                                      <Label className="text-xs">Update Expected Leave</Label>
                                                      <Input
                                                        type="datetime-local"
                                                        value={updateExpectedLocal || (selected.expectedLeaveAt ? (() => { const d = new Date(selected.expectedLeaveAt); const pad = (n: number) => `${n}`.padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;})() : "")}
                                                        onChange={(e) => setUpdateExpectedLocal(e.target.value)}
                                                      />
                                                    </div>
                                                    <div className="flex gap-2">
                                                      <Button variant="outline" onClick={() => { const next = updateExpectedLocal || selected.expectedLeaveAt; if (!next) return; const iso = new Date(next).toISOString(); updateExpectedLeave(selected.id, iso); }}>Update</Button>
                                                      <Button onClick={() => markLeft(selected.id)}>Mark Left</Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </CardContent>
                                  </Card>

                                  {/* Items */}
                                  <div>
                                    <h4 className="font-medium mb-3">Invoice Items</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Description</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Qty</TableHead>
                                          <TableHead>Unit Price</TableHead>
                                          <TableHead>Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedInvoice.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell>{formatCurrency(item.total)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {/* Totals */}
                                  <div className="border-t pt-4">
                                    <div className="flex justify-end">
                                      <div className="w-64 space-y-2">
                                        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(selectedInvoice.amount)}</span></div>
                                        <div className="flex justify-between"><span>Tax (18%):</span><span>{formatCurrency(selectedInvoice.tax)}</span></div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>{formatCurrency(selectedInvoice.total)}</span></div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  {selectedInvoice.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Notes</h4>
                                      <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                                <Button variant="outline"><Send className="h-4 w-4 mr-2" /> Send to Customer</Button>
                                <Button><Edit className="h-4 w-4 mr-2" /> Edit Invoice</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
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
    </div>
  );
}
