import React from "react";
import { cn } from "@/lib/utils";
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import { RoleSwitcher } from "@/components/ui/role-switcher";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}

export function Header({ onToggleSidebar, isCollapsed }: HeaderProps) {
  const { alerts, updateExpectedLeave, markLeft, activeVisits } = useVisitTracking();
  const { logout, user } = useAuth();
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, orders, services..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Quick Actions */}
       

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {alerts.length + activeVisits.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-2 p-2">
                  {alerts.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No active alerts.</div>
                  ) : (
                    alerts.map((a) => (
                      <div
                        key={a.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          a.severity === "danger"
                            ? "bg-destructive/10"
                            : a.severity === "warning"
                            ? "bg-warning/10"
                            : "bg-accent/50",
                        )}
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full mt-2",
                            a.severity === "danger"
                              ? "bg-destructive"
                              : a.severity === "warning"
                              ? "bg-warning"
                              : "bg-primary",
                          )}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{a.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.visitType}
                            {a.service ? ` • ${a.service}` : ""} — {a.message}
                          </p>
                          {a.expectedLeaveAt && (
                            <p className="text-xs text-muted-foreground">
                              Expected: {new Date(a.expectedLeaveAt).toLocaleTimeString()}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button size="xs" variant="outline" onClick={() => updateExpectedLeave(a.id, { addMinutes: 15 })}>
                              +15m
                            </Button>
                            <Button size="xs" variant="outline" onClick={() => updateExpectedLeave(a.id, { addMinutes: 30 })}>
                              +30m
                            </Button>
                            <Button size="xs" variant="destructive" onClick={() => markLeft(a.id)}>
                              Mark Left
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Active Visits ({activeVisits.length})</div>
                <div className="space-y-2 p-2 max-h-64 overflow-y-auto">
                  {activeVisits.length === 0 ? (
                    <div className="text-sm text-muted-foreground px-1">No active visits.</div>
                  ) : (
                    activeVisits.map((v) => (
                      <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                        <div className="h-2 w-2 rounded-full mt-2 bg-info" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{v.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.visitType}
                            {v.service ? ` • ${v.service}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expected: {v.expectedLeaveAt ? new Date(v.expectedLeaveAt).toLocaleTimeString() : "-"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="xs" variant="outline" onClick={() => updateExpectedLeave(v.id, { addMinutes: 15 })}>+15m</Button>
                            <Button size="xs" variant="outline" onClick={() => updateExpectedLeave(v.id, { addMinutes: 30 })}>+30m</Button>
                            <Button size="xs" variant="destructive" onClick={() => markLeft(v.id)}>Mark Left</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
