import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTechnicianStatus, TechnicianWorkStatus } from '@/context/TechnicianStatusContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@shared/types';
import {
  Circle,
  CheckCircle,
  Clock,
  Coffee,
  Power,
  User,
  Settings,
  MessageSquare,
} from 'lucide-react';

const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-500',
    icon: CheckCircle,
    description: 'Ready to take on new jobs',
  },
  busy: {
    label: 'Working',
    color: 'bg-yellow-500',
    icon: Clock,
    description: 'Currently working on a job',
  },
  break: {
    label: 'On Break',
    color: 'bg-blue-500',
    icon: Coffee,
    description: 'Taking a break',
  },
  offline: {
    label: 'Offline',
    color: 'bg-gray-400',
    icon: Power,
    description: 'Not available',
  },
};

export const TechnicianStatusToggle: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentUserStatus, 
    updateStatus, 
    markActive, 
    markOffline 
  } = useTechnicianStatus();
  
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TechnicianWorkStatus>('available');

  // Only show for technicians
  if (!user || user.role !== UserRole.TECHNICIAN || !currentUserStatus) {
    return null;
  }

  const currentConfig = statusConfig[currentUserStatus.currentStatus];
  const StatusIcon = currentConfig.icon;

  const handleStatusChange = (newStatus: TechnicianWorkStatus) => {
    if (newStatus === 'offline') {
      markOffline();
    } else {
      setSelectedStatus(newStatus);
      setShowStatusDialog(true);
    }
  };

  const confirmStatusChange = () => {
    updateStatus(selectedStatus, statusNotes.trim() || undefined);
    setShowStatusDialog(false);
    setStatusNotes('');
  };

  const toggleOnlineStatus = () => {
    if (currentUserStatus.isActive) {
      markOffline();
    } else {
      markActive();
    }
  };

  return (
    <>
      {/* Compact Status Display */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <div className="relative">
                <User className="h-4 w-4" />
                <div 
                  className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white ${currentConfig.color}`}
                />
              </div>
              <span className="hidden sm:inline">{currentConfig.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-2 w-2 rounded-full ${currentConfig.color}`} />
                <span className="text-xs">{currentConfig.description}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            
            {/* Status Options */}
            <div className="px-2 py-1">
              <p className="text-xs text-muted-foreground mb-2">Change Status:</p>
            </div>
            
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              const isCurrentStatus = status === currentUserStatus.currentStatus;
              
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status as TechnicianWorkStatus)}
                  disabled={isCurrentStatus}
                  className="gap-2"
                >
                  <div className={`h-3 w-3 rounded-full ${config.color}`} />
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                  {isCurrentStatus && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Current
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={toggleOnlineStatus} className="gap-2">
              <Power className="h-4 w-4" />
              <span>{currentUserStatus.isActive ? 'Go Offline' : 'Go Online'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Current Job Display */}
        {currentUserStatus.currentJobTitle && (
          <Badge variant="outline" className="text-xs">
            {currentUserStatus.currentJobTitle}
          </Badge>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`h-4 w-4 rounded-full ${statusConfig[selectedStatus].color}`} />
              <div>
                <p className="font-medium">{statusConfig[selectedStatus].label}</p>
                <p className="text-sm text-gray-600">{statusConfig[selectedStatus].description}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add a note about your status..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Full status card component for dashboard
export const TechnicianStatusCard: React.FC = () => {
  const { user } = useAuth();
  const { currentUserStatus } = useTechnicianStatus();

  // Only show for technicians
  if (!user || user.role !== UserRole.TECHNICIAN || !currentUserStatus) {
    return null;
  }

  const currentConfig = statusConfig[currentUserStatus.currentStatus];
  const StatusIcon = currentConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          My Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full ${currentConfig.color} flex items-center justify-center`}>
              <StatusIcon className="h-6 w-6 text-white" />
            </div>
            {currentUserStatus.isActive && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="font-semibold">{currentConfig.label}</p>
            <p className="text-sm text-gray-600">{currentConfig.description}</p>
            <p className="text-xs text-gray-500">
              {currentUserStatus.isActive ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {currentUserStatus.currentJobTitle && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">Current Assignment:</p>
            <p className="text-sm text-blue-700">{currentUserStatus.currentJobTitle}</p>
            {currentUserStatus.currentJobId && (
              <p className="text-xs text-gray-600">Job ID: {currentUserStatus.currentJobId}</p>
            )}
          </div>
        )}

        {currentUserStatus.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              {currentUserStatus.notes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold">{currentUserStatus.completedJobsToday}</p>
            <p className="text-xs text-gray-600">Jobs Today</p>
          </div>
          <div>
            <p className="text-lg font-bold">{currentUserStatus.hoursWorkedToday}h</p>
            <p className="text-xs text-gray-600">Hours Worked</p>
          </div>
          <div>
            <p className="text-lg font-bold">{currentUserStatus.efficiency}%</p>
            <p className="text-xs text-gray-600">Efficiency</p>
          </div>
        </div>

        <div className="pt-2">
          <TechnicianStatusToggle />
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianStatusToggle;
