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
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  User,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CustomerType {
  id: string;
  name: string;
  description: string;
  subTypes: string[];
  customerCount: number;
  color: string;
  icon: string;
}

const mockCustomerTypes: CustomerType[] = [
  {
    id: "personal",
    name: "Personal",
    description: "Individual customers with personal vehicles",
    subTypes: [
      "Car Owner",
      "Driver (Brings Client Car)",
      "Motorcycle Owner",
      "Other",
    ],
    customerCount: 2691,
    color: "orange",
    icon: "User",
  },
  {
    id: "government",
    name: "Government",
    description: "Government entities and departments",
    subTypes: [
      "Fleet Management",
      "Individual Department",
      "Parastatal",
      "Local Government",
    ],
    customerCount: 45,
    color: "blue",
    icon: "Building2",
  },
  {
    id: "ngo",
    name: "NGO",
    description: "Non-governmental organizations",
    subTypes: [
      "International NGO",
      "Local NGO",
      "Humanitarian Organization",
      "Development Agency",
    ],
    customerCount: 23,
    color: "green",
    icon: "Globe",
  },
  {
    id: "private",
    name: "Private",
    description: "Private companies and businesses",
    subTypes: [
      "Company Fleet",
      "Taxi/Uber Company",
      "Transport Business",
      "Motorcycle (Bodaboda)",
      "Other Business",
    ],
    customerCount: 88,
    color: "purple",
    icon: "Building2",
  },
];

const getColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "green":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "purple":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "orange":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "User":
      return User;
    case "Building2":
      return Building2;
    case "Globe":
      return Globe;
    default:
      return Users;
  }
};

export default function CustomerTypes() {
  const [customerTypes] = useState(mockCustomerTypes);
  const [selectedType, setSelectedType] = useState<CustomerType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
            <h1 className="text-3xl font-bold text-foreground">
              Customer Types Management
            </h1>
            <p className="text-muted-foreground">
              Manage customer categories and their sub-types for better
              organization
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer Type
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {customerTypes.map((type) => {
          const IconComponent = getIconComponent(type.icon);
          return (
            <Card key={type.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 ${
                      type.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : type.color === "green"
                          ? "bg-green-100 dark:bg-green-900"
                          : type.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-900"
                            : "bg-orange-100 dark:bg-orange-900"
                    } rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent
                      className={`h-5 w-5 ${
                        type.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : type.color === "green"
                            ? "text-green-600 dark:text-green-400"
                            : type.color === "purple"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-orange-600 dark:text-orange-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{type.name}</p>
                    <p className="text-2xl font-bold">{type.customerCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {type.subTypes.length} sub-types
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customer Types Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Customer Type Configuration
              </CardTitle>
              <CardDescription>
                Manage customer categories and their associated sub-types
              </CardDescription>
            </div>
            <Button variant="outline">Export Configuration</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sub-Types</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerTypes.map((type) => {
                  const IconComponent = getIconComponent(type.icon);
                  return (
                    <TableRow key={type.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 ${
                              type.color === "blue"
                                ? "bg-blue-100 dark:bg-blue-900"
                                : type.color === "green"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : type.color === "purple"
                                    ? "bg-purple-100 dark:bg-purple-900"
                                    : "bg-orange-100 dark:bg-orange-900"
                            } rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent
                              className={`h-4 w-4 ${
                                type.color === "blue"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : type.color === "green"
                                    ? "text-green-600 dark:text-green-400"
                                    : type.color === "purple"
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-orange-600 dark:text-orange-400"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{type.name}</p>
                            <Badge
                              variant="outline"
                              className={getColorClasses(type.color)}
                            >
                              {type.name}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm">{type.description}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {type.subTypes.length} sub-types
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {type.subTypes.slice(0, 2).map((subType) => (
                              <Badge
                                key={subType}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subType}
                              </Badge>
                            ))}
                            {type.subTypes.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{type.subTypes.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium text-lg">
                            {type.customerCount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            customers
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedType(type)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Edit Customer Type - {type.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Modify customer type configuration and
                                  sub-types
                                </DialogDescription>
                              </DialogHeader>
                              {selectedType && (
                                <div className="space-y-6">
                                  {/* Basic Information */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="typeName">
                                        Type Name
                                      </Label>
                                      <Input
                                        id="typeName"
                                        defaultValue={selectedType.name}
                                        placeholder="Enter type name"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="typeColor">
                                        Color Theme
                                      </Label>
                                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="blue">Blue</option>
                                        <option value="green">Green</option>
                                        <option value="purple">Purple</option>
                                        <option value="orange">Orange</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="typeDescription">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="typeDescription"
                                      defaultValue={selectedType.description}
                                      placeholder="Enter type description"
                                      rows={3}
                                    />
                                  </div>

                                  {/* Sub-Types */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label>Sub-Types</Label>
                                      <Button size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Sub-Type
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {selectedType.subTypes.map(
                                        (subType, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 border rounded-lg"
                                          >
                                            <Input
                                              defaultValue={subType}
                                              className="flex-1"
                                            />
                                            <Button variant="ghost" size="sm">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Statistics */}
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">
                                      Current Usage
                                    </h4>
                                    <div className="grid gap-2 md:grid-cols-3">
                                      <div className="text-center">
                                        <p className="text-2xl font-bold">
                                          {selectedType.customerCount}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Total Customers
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-2xl font-bold">
                                          {selectedType.subTypes.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Sub-Types
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-2xl font-bold">
                                          {Math.round(
                                            (selectedType.customerCount /
                                              customerTypes.reduce(
                                                (sum, t) =>
                                                  sum + t.customerCount,
                                                0,
                                              )) *
                                              100,
                                          )}
                                          %
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          of Total
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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

      {/* Configuration Guidelines */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Guidelines</CardTitle>
            <CardDescription>
              Best practices for customer type management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Keep types focused</p>
                  <p className="text-sm text-muted-foreground">
                    Each customer type should represent a distinct category with
                    specific needs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Use meaningful sub-types</p>
                  <p className="text-sm text-muted-foreground">
                    Sub-types help categorize customers within each main type
                    for better service
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Consider reporting needs</p>
                  <p className="text-sm text-muted-foreground">
                    Types should align with how you want to analyze and report
                    on your customer base
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Impact</CardTitle>
            <CardDescription>
              How customer types affect system functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-success rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Service differentiation</p>
                  <p className="text-sm text-muted-foreground">
                    Different types can have tailored service offerings and
                    pricing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-success rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Reporting and analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Customer types enable detailed business intelligence and
                    insights
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-success rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Process automation</p>
                  <p className="text-sm text-muted-foreground">
                    Automated workflows can be triggered based on customer type
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
