import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { JobCard, JobStatus, JobPriority, UserRole } from "@shared/types";
import {
  Clock,
  User,
  Car,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { JobCardWorkflow } from "./JobCardWorkflow";
import { TechnicianWorkflowEnhanced } from "./TechnicianWorkflowEnhanced";

interface JobCardDisplayProps {
  jobCard: JobCard;
  onEdit?: (jobCard: JobCard) => void;
  onDelete?: (jobCard: JobCard) => void;
  onStatusChange?: (jobCard: JobCard, newStatus: JobStatus) => void;
  onUpdateJobCard?: (jobCard: JobCard) => void;
  onViewDetails?: (jobCard: JobCard) => void;
  compact?: boolean;
  showWorkflow?: boolean;
}

const statusConfig = {
  [JobStatus.PENDING]: {
    label: "Pending",
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  },
  [JobStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Play,
  },
  [JobStatus.ON_HOLD]: {
    label: "On Hold",
    color: "bg-yellow-100 text-yellow-800",
    icon: Pause,
  },
  [JobStatus.WAITING_APPROVAL]: {
    label: "Waiting Approval",
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangle,
  },
  [JobStatus.WAITING_PARTS]: {
    label: "Waiting Parts",
    color: "bg-purple-100 text-purple-800",
    icon: AlertTriangle,
  },
  [JobStatus.COMPLETED]: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  [JobStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const priorityConfig = {
  [JobPriority.LOW]: {
    label: "Low",
    color: "bg-green-100 text-green-800",
  },
  [JobPriority.NORMAL]: {
    label: "Normal",
    color: "bg-blue-100 text-blue-800",
  },
  [JobPriority.HIGH]: {
    label: "High",
    color: "bg-orange-100 text-orange-800",
  },
  [JobPriority.URGENT]: {
    label: "Urgent",
    color: "bg-red-100 text-red-800",
  },
};

export const JobCardDisplay: React.FC<JobCardDisplayProps> = ({
  jobCard,
  onEdit,
  onDelete,
  onStatusChange,
  onUpdateJobCard,
  onViewDetails,
  compact = false,
  showWorkflow = false,
}) => {
  const { hasPermission, user } = useAuth();

  const status = statusConfig[jobCard.status];
  const priority = priorityConfig[jobCard.priority];
  const StatusIcon = status.icon;

  const canEdit =
    hasPermission("job_cards", "update") ||
    (user?.role === UserRole.TECHNICIAN &&
      jobCard.assignedTechnicianId === user.id);
  const canDelete = hasPermission("job_cards", "delete");
  const canChangeStatus =
    hasPermission("job_cards", "update") ||
    (user?.role === UserRole.TECHNICIAN &&
      jobCard.assignedTechnicianId === user.id);

  const calculateProgress = () => {
    if (jobCard.status === JobStatus.COMPLETED) return 100;
    if (jobCard.status === JobStatus.CANCELLED) return 0;
    if (jobCard.status === JobStatus.PENDING) return 0;
    if (jobCard.status === JobStatus.IN_PROGRESS) return 50;
    if (jobCard.status === JobStatus.ON_HOLD) return 25;
    if (jobCard.status === JobStatus.WAITING_APPROVAL) return 75;
    if (jobCard.status === JobStatus.WAITING_PARTS) return 60;
    return 0;
  };

  const getOverdueStatus = () => {
    if (
      !jobCard.expectedCompletionDate ||
      jobCard.status === JobStatus.COMPLETED
    )
      return false;
    return new Date() > new Date(jobCard.expectedCompletionDate);
  };

  const isOverdue = getOverdueStatus();

  if (compact) {
    return (
      <Card
        className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold truncate">{jobCard.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {jobCard.jobNumber}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Overdue
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {jobCard.customer.name}
                </div>
                {jobCard.assignedTechnician && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {jobCard.assignedTechnician.name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge className={priority.color}>{priority.label}</Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(jobCard)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(jobCard)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(jobCard)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${isOverdue ? "border-red-200" : ""}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{jobCard.title}</CardTitle>
              <Badge variant="outline">{jobCard.jobNumber}</Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800">Overdue</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Customer: {jobCard.customer.name}
              </div>
              {jobCard.assignedTechnician && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Technician: {jobCard.assignedTechnician.name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created: {format(new Date(jobCard.createdAt), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(jobCard)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(jobCard)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(jobCard)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Priority:</span>
            <Badge className={priority.color}>{priority.label}</Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{jobCard.description}</p>
        </div>

        {/* Asset Information */}
        {jobCard.asset && (
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
              <Car className="h-4 w-4" />
              Asset Details
            </h4>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Make/Model:</span>{" "}
                  {jobCard.asset.make} {jobCard.asset.model}
                </div>
                <div>
                  <span className="font-medium">Year:</span>{" "}
                  {jobCard.asset.year}
                </div>
                {jobCard.asset.licensePlate && (
                  <div>
                    <span className="font-medium">License:</span>{" "}
                    {jobCard.asset.licensePlate}
                  </div>
                )}
                {jobCard.asset.vin && (
                  <div>
                    <span className="font-medium">VIN:</span>{" "}
                    {jobCard.asset.vin}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {jobCard.tasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Tasks</h4>
            <ul className="space-y-1">
              {jobCard.tasks.map((task, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobCard.scheduledStartDate && (
            <div>
              <h4 className="text-sm font-medium mb-1">Scheduled Start</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(jobCard.scheduledStartDate), "MMM dd, yyyy")}
              </p>
            </div>
          )}
          {jobCard.expectedCompletionDate && (
            <div>
              <h4 className="text-sm font-medium mb-1">Expected Completion</h4>
              <p
                className={`text-sm ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
              >
                {format(
                  new Date(jobCard.expectedCompletionDate),
                  "MMM dd, yyyy",
                )}
                {isOverdue && " (Overdue)"}
              </p>
            </div>
          )}
        </div>

        {/* Cost Information */}
        {jobCard.estimatedCost && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Cost Estimate
            </h4>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-medium">Labor:</span> $
                  {jobCard.estimatedCost.laborCost.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Materials:</span> $
                  {jobCard.estimatedCost.materialsCost.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Additional:</span> $
                  {jobCard.estimatedCost.additionalCosts.toFixed(2)}
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-medium">
                <span>Total Estimate:</span>
                <span>${jobCard.estimatedCost.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Section */}
        {showWorkflow && onUpdateJobCard && onStatusChange && (
          <div className="mt-6 pt-6 border-t">
            {user?.role === UserRole.TECHNICIAN ? (
              <TechnicianWorkflowEnhanced
                jobCard={jobCard}
                onUpdateJobCard={onUpdateJobCard}
                onStatusChange={onStatusChange}
              />
            ) : (
              <JobCardWorkflow
                jobCard={jobCard}
                onUpdateJobCard={onUpdateJobCard}
                onStatusChange={onStatusChange}
              />
            )}
          </div>
        )}

        {/* Quick Actions (only show if workflow is not shown) */}
        {!showWorkflow && canChangeStatus && onStatusChange && (
          <div className="flex gap-2 pt-2">
            {jobCard.status === JobStatus.PENDING && (
              <Button
                size="sm"
                onClick={() => onStatusChange(jobCard, JobStatus.IN_PROGRESS)}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Work
              </Button>
            )}
            {jobCard.status === JobStatus.IN_PROGRESS && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(jobCard, JobStatus.ON_HOLD)}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Hold
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(jobCard, JobStatus.COMPLETED)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </>
            )}
            {jobCard.status === JobStatus.ON_HOLD && (
              <Button
                size="sm"
                onClick={() => onStatusChange(jobCard, JobStatus.IN_PROGRESS)}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
