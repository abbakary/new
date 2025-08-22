import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import {
  JobCard,
  JobStatus,
  UserRole,
  LaborEntry,
  Approval,
} from "@shared/types";
import {
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  User,
  Timer,
  FileCheck,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import {
  generateInvoiceFromJobCard,
  validateJobCardForInvoicing,
} from "@/services/invoiceService";
import { JobCardGeneration } from "./JobCardGeneration";

interface JobCardWorkflowProps {
  jobCard: JobCard;
  onUpdateJobCard: (updatedJobCard: JobCard) => void;
  onStatusChange: (jobCard: JobCard, newStatus: JobStatus) => void;
}

export const JobCardWorkflow: React.FC<JobCardWorkflowProps> = ({
  jobCard,
  onUpdateJobCard,
  onStatusChange,
}) => {
  const { user, hasPermission } = useAuth();
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showCustomerLeaveDialog, setShowCustomerLeaveDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [timeEntry, setTimeEntry] = useState({
    hours: "",
    description: "",
  });
  const [customerLeaveTime, setCustomerLeaveTime] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isWorkingTimer, setIsWorkingTimer] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(
    null,
  );

  const isTechnician = user?.role === UserRole.TECHNICIAN;
  const isOfficeManager =
    user?.role === UserRole.OFFICE_MANAGER || user?.role === UserRole.ADMIN;
  const isAssignedTechnician =
    isTechnician && jobCard.assignedTechnicianId === user?.id;

  // Check if current user can perform actions
  const canStartWork =
    isAssignedTechnician && jobCard.status === JobStatus.PENDING;
  const canUpdateTime =
    isAssignedTechnician &&
    [JobStatus.IN_PROGRESS, JobStatus.WAITING_APPROVAL].includes(
      jobCard.status,
    );
  const canMarkComplete =
    isAssignedTechnician && jobCard.status === JobStatus.IN_PROGRESS;
  const canApprove =
    isOfficeManager && jobCard.status === JobStatus.WAITING_APPROVAL;
  const canRecordCustomerLeave = isAssignedTechnician;

  // Calculate total time worked
  const totalTimeWorked = jobCard.laborEntries.reduce(
    (total, entry) => total + entry.hours,
    0,
  );

  // Get pending approvals
  const pendingApprovals = jobCard.approvals.filter(
    (approval) => approval.status === "pending",
  );

  const startWork = () => {
    if (!canStartWork) return;

    onStatusChange(jobCard, JobStatus.IN_PROGRESS);
    setCurrentSessionStart(new Date());
    setIsWorkingTimer(true);
  };

  const recordTimeEntry = () => {
    if (!timeEntry.hours || !timeEntry.description) {
      alert("Please fill in all time entry fields");
      return;
    }

    const newLaborEntry: LaborEntry = {
      id: Date.now().toString(),
      technicianId: user!.id,
      technicianName: user!.name,
      startTime: currentSessionStart || new Date(),
      endTime: new Date(),
      hours: parseFloat(timeEntry.hours),
      hourlyRate: 50, // This would come from user profile or system config
      description: timeEntry.description,
      isApproved: false,
    };

    const updatedJobCard = {
      ...jobCard,
      laborEntries: [...jobCard.laborEntries, newLaborEntry],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
    setShowTimeDialog(false);
    setTimeEntry({ hours: "", description: "" });
    setIsWorkingTimer(false);
    setCurrentSessionStart(null);
  };

  const recordCustomerLeave = () => {
    if (!customerLeaveTime) {
      alert("Please enter the customer leave time");
      return;
    }

    const updatedJobCard = {
      ...jobCard,
      notes: [...jobCard.notes, `Customer left at ${customerLeaveTime}`],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
    setShowCustomerLeaveDialog(false);
    setCustomerLeaveTime("");
  };

  const requestApproval = () => {
    const newApproval: Approval = {
      id: Date.now().toString(),
      type: "completion",
      requestedBy: user!.id,
      approverRole: UserRole.OFFICE_MANAGER,
      status: "pending",
      notes: "Work completed, ready for approval",
    };

    const updatedJobCard = {
      ...jobCard,
      status: JobStatus.WAITING_APPROVAL,
      approvals: [...jobCard.approvals, newApproval],
      notes: [
        ...jobCard.notes,
        "Work completed by technician, pending approval",
      ],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
  };

  const approveJob = (approved: boolean) => {
    if (!approvalNotes && !approved) {
      alert("Please provide notes for rejection");
      return;
    }

    // Validate job card for invoicing if being approved
    if (approved) {
      const validationErrors = validateJobCardForInvoicing(jobCard);
      if (validationErrors.length > 0) {
        alert(
          `Cannot complete job due to validation errors:\n${validationErrors.join("\n")}`,
        );
        return;
      }
    }

    const updatedApprovals = jobCard.approvals.map((approval) =>
      approval.status === "pending" && approval.type === "completion"
        ? {
            ...approval,
            status: approved ? "approved" : "rejected",
            approvedBy: user!.id,
            approvedAt: new Date(),
            notes: approvalNotes || approval.notes,
          }
        : approval,
    );

    const newStatus = approved ? JobStatus.COMPLETED : JobStatus.IN_PROGRESS;
    const statusNote = approved
      ? "Job approved and completed by office manager"
      : `Job rejected by office manager: ${approvalNotes}`;

    const updatedJobCard = {
      ...jobCard,
      status: newStatus,
      approvals: updatedApprovals,
      notes: [...jobCard.notes, statusNote],
      actualCompletionDate: approved
        ? new Date()
        : jobCard.actualCompletionDate,
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    // Auto-generate invoice if job is being completed
    if (approved) {
      try {
        const invoice = generateInvoiceFromJobCard(updatedJobCard);
        const invoiceNote = `Invoice ${invoice.invoiceNumber} automatically generated`;
        updatedJobCard.notes = [...updatedJobCard.notes, invoiceNote];
        updatedJobCard.invoiceId = invoice.id;

        // Show success message
        alert(
          `Job completed successfully!\nInvoice ${invoice.invoiceNumber} has been automatically generated and sent to the customer.`,
        );
      } catch (error) {
        console.error("Failed to generate invoice:", error);
        alert(
          "Job completed but invoice generation failed. Please generate invoice manually.",
        );
      }
    }

    onUpdateJobCard(updatedJobCard);
    setShowApprovalDialog(false);
    setApprovalNotes("");
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return Clock;
      case JobStatus.IN_PROGRESS:
        return Play;
      case JobStatus.WAITING_APPROVAL:
        return AlertTriangle;
      case JobStatus.COMPLETED:
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return "bg-gray-100 text-gray-800";
      case JobStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case JobStatus.WAITING_APPROVAL:
        return "bg-yellow-100 text-yellow-800";
      case JobStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const StatusIcon = getStatusIcon(jobCard.status);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getStatusColor(jobCard.status)}>
              {jobCard.status.replace("_", " ")}
            </Badge>
            <span className="text-sm text-gray-600">
              Last updated:{" "}
              {format(new Date(jobCard.lastUpdatedAt), "MMM dd, yyyy HH:mm")}
            </span>
          </div>

          {/* Status-specific messages */}
          {jobCard.status === JobStatus.PENDING && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Job is pending. Technician can start work when ready.
              </AlertDescription>
            </Alert>
          )}

          {jobCard.status === JobStatus.WAITING_APPROVAL && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Work completed by technician. Waiting for office manager
                approval.
              </AlertDescription>
            </Alert>
          )}

          {jobCard.status === JobStatus.COMPLETED && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Job completed and approved. Invoice can be generated.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Job Card Generation - Show when waiting for approval or completed */}
      {[JobStatus.WAITING_APPROVAL, JobStatus.COMPLETED].includes(
        jobCard.status,
      ) && (
        <JobCardGeneration
          jobCard={jobCard}
          onApprove={approveJob}
          onUpdateJobCard={onUpdateJobCard}
          isReadOnly={jobCard.status === JobStatus.COMPLETED}
        />
      )}

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Time Worked:</span>
              <span className="font-bold">
                {totalTimeWorked.toFixed(1)} hours
              </span>
            </div>

            {jobCard.laborEntries.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Time Entries:</h4>
                {jobCard.laborEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {entry.technicianName}
                      </span>
                      <p className="text-sm text-gray-600">
                        {entry.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(entry.startTime), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{entry.hours}h</span>
                      <p className="text-sm text-gray-600">
                        ${(entry.hours * entry.hourlyRate).toFixed(2)}
                      </p>
                      {entry.isApproved ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isWorkingTimer && (
              <Alert>
                <Timer className="h-4 w-4" />
                <AlertDescription>
                  Timer started at{" "}
                  {currentSessionStart
                    ? format(currentSessionStart, "HH:mm")
                    : "unknown"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canStartWork && (
              <Button onClick={startWork}>
                <Play className="h-4 w-4 mr-2" />
                Start Work
              </Button>
            )}

            {canUpdateTime && (
              <Button variant="outline" onClick={() => setShowTimeDialog(true)}>
                <Timer className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            )}

            {canRecordCustomerLeave && (
              <Button
                variant="outline"
                onClick={() => setShowCustomerLeaveDialog(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Customer Left
              </Button>
            )}

            {canMarkComplete && (
              <Button onClick={requestApproval}>
                <FileCheck className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            )}

            {canApprove && (
              <Button onClick={() => setShowApprovalDialog(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Review & Approve
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals (for Office Managers) */}
      {pendingApprovals.length > 0 && isOfficeManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {approval.type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600">{approval.notes}</p>
                      <p className="text-xs text-gray-500">
                        Requested by technician
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notes */}
      {jobCard.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobCard.notes.slice(-3).map((note, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Entry Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={timeEntry.hours}
                onChange={(e) =>
                  setTimeEntry((prev) => ({ ...prev, hours: e.target.value }))
                }
                placeholder="2.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Work Description</Label>
              <Textarea
                id="description"
                value={timeEntry.description}
                onChange={(e) =>
                  setTimeEntry((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the work performed..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={recordTimeEntry}>Log Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Leave Dialog */}
      <Dialog
        open={showCustomerLeaveDialog}
        onOpenChange={setShowCustomerLeaveDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Customer Leave Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="leaveTime">Customer Leave Time</Label>
              <Input
                id="leaveTime"
                type="time"
                value={customerLeaveTime}
                onChange={(e) => setCustomerLeaveTime(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600">
              This will be recorded in the job notes for office manager review.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomerLeaveDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={recordCustomerLeave}>Record Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Job Completion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Job Summary:</h4>
              <p className="text-sm text-gray-600">{jobCard.title}</p>
              <p className="text-sm text-gray-600">
                Total time: {totalTimeWorked.toFixed(1)} hours
              </p>
              <p className="text-sm text-gray-600">
                Technician: {jobCard.assignedTechnician?.name}
              </p>
            </div>

            <div>
              <Label htmlFor="approvalNotes">
                Notes (required for rejection)
              </Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about the work quality, customer satisfaction, etc..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => approveJob(false)}
              disabled={!approvalNotes}
            >
              Reject
            </Button>
            <Button onClick={() => approveJob(true)}>Approve & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
