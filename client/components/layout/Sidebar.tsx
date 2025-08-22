import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@shared/types";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  UserCheck,
  UserPlus,
  Search,
  Wrench,
  ShoppingCart,
  HelpCircle,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  Bell,
  LogOut,
  Building2,
  Package,
  Receipt,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: SidebarItem[];
  requiredRoles?: UserRole[];
  requiredPermission?: { module: string; action: string };
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    id: "customers",
    label: "Customer Management",
    icon: Users,
    requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
    children: [
      {
        id: "customer-search",
        label: "Search Customers",
        icon: Search,
        href: "/customers/search",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
      {
        id: "customer-add",
        label: "Add New Customer",
        icon: UserPlus,
        href: "/customers/add",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
      {
        id: "customer-types",
        label: "Customer Types",
        icon: Building2,
        href: "/customers/types",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
    ],
  },
  {
    id: "services",
    label: "Service Management",
    icon: Wrench,
    children: [
      {
        id: "car-services",
        label: "Car Services",
        icon: Car,
        href: "/services/car",
      },
      {
        id: "tire-services",
        label: "Tire Services",
        icon: ShoppingCart,
        href: "/services/tires",
      },
      {
        id: "consultations",
        label: "Consultations",
        icon: HelpCircle,
        href: "/services/consultations",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory Management",
    icon: Package,
    requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
    children: [
      {
        id: "tire-inventory",
        label: "Tire Inventory",
        icon: Package,
        href: "/inventory/tires",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
    ],
  },
  {
    id: "sales",
    label: "Sales Management",
    icon: ShoppingCart,
    href: "/sales",
  },
  {
    id: "invoices",
    label: "Invoice Management",
    icon: Receipt,
    href: "/invoices",
    requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
  },
  {
    id: "orders",
    label: "Order Management",
    icon: ClipboardList,
    children: [
      {
        id: "active-orders",
        label: "Active Orders",
        icon: Clock,
        href: "/orders/active",
      },
      {
        id: "completed-orders",
        label: "Completed Orders",
        icon: UserCheck,
        href: "/orders/completed",
      },
      {
        id: "job-cards",
        label: "Job Cards",
        icon: FileText,
        href: "/orders/job-cards",
      },
    ],
  },
  {
    id: "tracking",
    label: "Time Tracking",
    icon: Clock,
    children: [
      {
        id: "daily-tracking",
        label: "Daily Tracking",
        icon: Calendar,
        href: "/tracking/daily",
      },
      {
        id: "service-status",
        label: "Service Status",
        icon: TrendingUp,
        href: "/tracking/status",
      },
    ],
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: BarChart3,
    requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
    children: [
      {
        id: "daily-reports",
        label: "Daily Reports",
        icon: Calendar,
        href: "/reports/daily",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
      {
        id: "weekly-reports",
        label: "Weekly Reports",
        icon: TrendingUp,
        href: "/reports/weekly",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
      {
        id: "monthly-reports",
        label: "Monthly Reports",
        icon: BarChart3,
        href: "/reports/monthly",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
      {
        id: "yearly-reports",
        label: "Yearly Reports",
        icon: TrendingUp,
        href: "/reports/yearly",
        requiredRoles: [UserRole.ADMIN, UserRole.OFFICE_MANAGER],
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: Shield,
    requiredRoles: [UserRole.ADMIN],
    children: [
      {
        id: "user-access",
        label: "User Access Control",
        icon: Shield,
        href: "/admin/users",
        requiredRoles: [UserRole.ADMIN],
      },
      {
        id: "settings",
        label: "System Settings",
        icon: Settings,
        href: "/admin/settings",
        requiredRoles: [UserRole.ADMIN],
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
}

// Function to get role-specific sidebar items
const getRoleSpecificItems = (userRole: UserRole): SidebarItem[] => {
  const commonItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
  ];

  if (userRole === UserRole.ADMIN) {
    return [
      ...commonItems,
      ...sidebarItems.slice(1), // All items except dashboard
    ];
  }

  if (userRole === UserRole.OFFICE_MANAGER) {
    return [
      ...commonItems,
      {
        id: "customers",
        label: "Customer Management",
        icon: Users,
        children: [
          {
            id: "customer-search",
            label: "Search Customers",
            icon: Search,
            href: "/customers/search",
          },
          {
            id: "customer-add",
            label: "Add New Customer",
            icon: UserPlus,
            href: "/customers/add",
          },
          {
            id: "customer-types",
            label: "Customer Types",
            icon: Building2,
            href: "/customers/types",
          },
        ],
      },
      {
        id: "orders",
        label: "Order Management",
        icon: ClipboardList,
        children: [
          {
            id: "active-orders",
            label: "Active Orders",
            icon: Clock,
            href: "/orders/active",
          },
          {
            id: "completed-orders",
            label: "Completed Orders",
            icon: UserCheck,
            href: "/orders/completed",
          },
          {
            id: "job-cards",
            label: "Job Cards",
            icon: FileText,
            href: "/orders/job-cards",
          },
        ],
      },
      {
        id: "services",
        label: "Service Management",
        icon: Wrench,
        children: [
          {
            id: "car-services",
            label: "Car Services",
            icon: Car,
            href: "/services/car",
          },
          {
            id: "tire-services",
            label: "Tire Services",
            icon: ShoppingCart,
            href: "/services/tires",
          },
          {
            id: "consultations",
            label: "Consultations",
            icon: HelpCircle,
            href: "/services/consultations",
          },
        ],
      },
      {
        id: "invoices",
        label: "Invoice Management",
        icon: Receipt,
        href: "/invoices",
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: Package,
        href: "/inventory/tires",
      },
      {
        id: "reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          {
            id: "daily-reports",
            label: "Daily Reports",
            icon: Calendar,
            href: "/reports/daily",
          },
          {
            id: "weekly-reports",
            label: "Weekly Reports",
            icon: TrendingUp,
            href: "/reports/weekly",
          },
          {
            id: "monthly-reports",
            label: "Monthly Reports",
            icon: BarChart3,
            href: "/reports/monthly",
          },
        ],
      },
    ];
  }

  if (userRole === UserRole.TECHNICIAN) {
    return [
      ...commonItems,
      {
        id: "my-jobs",
        label: "My Job Cards",
        icon: FileText,
        href: "/orders/job-cards",
      },
      {
        id: "time-tracking",
        label: "Time Tracking",
        icon: Clock,
        href: "/tracking/daily",
      },
      {
        id: "sales",
        label: "Sales Items",
        icon: ShoppingCart,
        href: "/sales/new",
      },
    ];
  }

  return commonItems;
};

export function Sidebar({ isCollapsed }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["dashboard"]);
  const location = useLocation();
  const { user, canAccess, hasPermission } = useAuth();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      (href !== "/" && location.pathname.startsWith(href))
    );
  };

  const hasItemAccess = (item: SidebarItem): boolean => {
    // Check role-based access
    if (item.requiredRoles && !canAccess(item.requiredRoles)) {
      return false;
    }

    // Check permission-based access
    if (item.requiredPermission &&
        !hasPermission(item.requiredPermission.module, item.requiredPermission.action)) {
      return false;
    }

    return true;
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    // Check if user has access to this item
    if (!hasItemAccess(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const visibleChildren = hasChildren ? item.children!.filter(hasItemAccess) : [];
    const hasVisibleChildren = visibleChildren.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = item.href ? isActive(item.href) : false;

    if (hasVisibleChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "text-sidebar-foreground",
              level > 0 && "ml-4",
              isCollapsed && "justify-center px-3",
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="space-y-1 ml-4">
              {visibleChildren.map((child) =>
                renderSidebarItem(child, level + 1),
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.href || "#"}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isItemActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground",
          level > 0 && "ml-4",
          isCollapsed && "justify-center px-3",
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                TrackPro
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                POS Tracking System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {user && getRoleSpecificItems(user.role).map((item) => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <div className="h-8 w-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          {!isCollapsed && user && (
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
