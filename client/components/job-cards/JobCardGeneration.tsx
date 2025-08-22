import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { JobCard, JobStatus, UserRole, Approval } from "@shared/types";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  DollarSign,
  Timer,
  Package,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Download,
  Send,
  Edit,
  Eye,
  Printer,
} from "lucide-react";
import { format } from "date-fns";

interface JobCardGenerationProps {
  jobCard: JobCard;
  onApprove: (jobCard: JobCard, approved: boolean, notes?: string) => void;
  onUpdateJobCard?: (jobCard: JobCard) => void;
  isReadOnly?: boolean;
}

export const JobCardGeneration: React.FC<JobCardGenerationProps> = ({
  jobCard,
  onApprove,
  onUpdateJobCard,
  isReadOnly = false,
}) => {
  const { user } = useAuth();

  // State for approval process
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [customerSatisfactionRating, setCustomerSatisfactionRating] =
    useState<number>(5);
  const [qualityCheckNotes, setQualityCheckNotes] = useState("");
  const [finalAdjustments, setFinalAdjustments] = useState({
    laborCost: jobCard.estimatedCost?.laborCost || 0,
    materialsCost: jobCard.estimatedCost?.materialsCost || 0,
    additionalCosts: jobCard.estimatedCost?.additionalCosts || 0,
  });

  const isOfficeManager =
    user?.role === UserRole.OFFICE_MANAGER || user?.role === UserRole.ADMIN;
  const canApprove =
    isOfficeManager &&
    jobCard.status === JobStatus.WAITING_APPROVAL &&
    !isReadOnly;

  // Calculate totals
  const actualLaborCost = jobCard.laborEntries.reduce(
    (sum, entry) => sum + entry.hours * entry.hourlyRate,
    0,
  );
  const actualMaterialsCost = jobCard.materialsUsed.reduce(
    (sum, material) => sum + material.totalPrice,
    0,
  );
  const totalTimeWorked = jobCard.laborEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );

  const estimatedTotal = jobCard.estimatedCost
    ? jobCard.estimatedCost.laborCost +
      jobCard.estimatedCost.materialsCost +
      jobCard.estimatedCost.additionalCosts
    : 0;
  const actualTotal =
    actualLaborCost +
    actualMaterialsCost +
    (jobCard.estimatedCost?.additionalCosts || 0);
  const variance = actualTotal - estimatedTotal;
  const variancePercentage =
    estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0;

  const getFinalTotal = () => {
    const subtotal =
      finalAdjustments.laborCost +
      finalAdjustments.materialsCost +
      finalAdjustments.additionalCosts;
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + tax;
  };

  const handleApproval = (approved: boolean) => {
    if (approved) {
      // Update job card with final costs
      const updatedJobCard = {
        ...jobCard,
        actualCost: {
          laborCost: finalAdjustments.laborCost,
          materialsCost: finalAdjustments.materialsCost,
          additionalCosts: finalAdjustments.additionalCosts,
          subtotal:
            finalAdjustments.laborCost +
            finalAdjustments.materialsCost +
            finalAdjustments.additionalCosts,
          tax:
            (finalAdjustments.laborCost +
              finalAdjustments.materialsCost +
              finalAdjustments.additionalCosts) *
            0.08,
          total: getFinalTotal(),
          profitMargin: 0, // This would be calculated based on business logic
        },
        notes: [
          ...jobCard.notes,
          `Quality check rating: ${customerSatisfactionRating}/5`,
          qualityCheckNotes ? `Quality notes: ${qualityCheckNotes}` : "",
          approvalNotes ? `Approval notes: ${approvalNotes}` : "",
        ].filter(Boolean),
      };

      if (onUpdateJobCard) {
        onUpdateJobCard(updatedJobCard);
      }
    }

    onApprove(jobCard, approved, approvalNotes);
    setShowApprovalDialog(false);
    setApprovalNotes("");
    setQualityCheckNotes("");
  };

  const getStatusIcon = () => {
    switch (jobCard.status) {
      case JobStatus.WAITING_APPROVAL:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case JobStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVarianceColor = () => {
    if (Math.abs(variancePercentage) <= 5) return "text-green-600";
    if (Math.abs(variancePercentage) <= 15) return "text-orange-600";
    return "text-red-600";
  };

  const generateJobCardSummary = () => {
    return {
      jobNumber: jobCard.jobNumber,
      customer: jobCard.customer.name,
      vehicle: jobCard.asset
        ? `${jobCard.asset.make} ${jobCard.asset.model} (${jobCard.asset.licensePlate})`
        : "N/A",
      technician: jobCard.assignedTechnician?.name || "Unassigned",
      workPerformed: jobCard.tasks.join(", "),
      timeWorked: `${totalTimeWorked.toFixed(1)} hours`,
      materialsUsed: jobCard.materialsUsed.length,
      totalCost: `$${actualTotal.toFixed(2)}`,
      completedAt: new Date().toISOString(),
      status: jobCard.status,
      approvedBy: user?.name,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>Job Card Generation</CardTitle>
                <p className="text-muted-foreground">
                  Transform completed work into finalized job card
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  jobCard.status === JobStatus.COMPLETED
                    ? "default"
                    : "secondary"
                }
              >
                {jobCard.status.replace("_", " ")}
              </Badge>
              {jobCard.status === JobStatus.WAITING_APPROVAL && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Approval
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Work Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Customer:</span>
                <span>{jobCard.customer.name}</span>
              </div>
              {jobCard.asset && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vehicle:</span>
                  <span>
                    {jobCard.asset.make} {jobCard.asset.model} (
                    {jobCard.asset.licensePlate})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Technician:</span>
                <span>{jobCard.assignedTechnician?.name}</span>
              </div>
            </div>

            <Separator />

            {/* Tasks Completed */}
            <div>
              <h4 className="font-medium mb-2">Tasks Completed:</h4>
              <ul className="space-y-1">
                {jobCard.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            {/* Time Tracking */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                Time Tracking:
              </h4>
              <div className="space-y-2">
                {jobCard.laborEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {entry.description}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.startTime), "MMM dd, HH:mm")} -
                        {entry.endTime
                          ? format(new Date(entry.endTime), "HH:mm")
                          : "In Progress"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">
                        {entry.hours.toFixed(1)}h
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ${(entry.hours * entry.hourlyRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Time:</span>
                  <span>{totalTimeWorked.toFixed(1)} hours</span>
                </div>
              </div>
            </div>

            {/* Materials Used */}
            {jobCard.materialsUsed.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Materials Used:
                </h4>
                <div className="space-y-2">
                  {jobCard.materialsUsed.map((material) => (
                    <div
                      key={material.id}
                      className="flex justify-between items-center p-2 bg-muted/50 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {material.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Qty: {material.quantity} × $
                          {material.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold">
                        ${material.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estimated vs Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-1">Estimated</h4>
                <p className="text-2xl font-bold text-blue-700">
                  ${estimatedTotal.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-700 mb-1">Actual</h4>
                <p className="text-2xl font-bold text-green-700">
                  ${actualTotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Variance Analysis */}
            <div
              className={`p-3 rounded-lg ${variance >= 0 ? "bg-orange-50" : "bg-green-50"}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Variance:</span>
                <div className="text-right">
                  <span className={`font-bold ${getVarianceColor()}`}>
                    {variance >= 0 ? "+" : ""}${variance.toFixed(2)}
                  </span>
                  <p className={`text-sm ${getVarianceColor()}`}>
                    ({variancePercentage >= 0 ? "+" : ""}
                    {variancePercentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Cost Breakdown:</h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Labor ({totalTimeWorked.toFixed(1)}h):</span>
                  <span>${actualLaborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materials ({jobCard.materialsUsed.length} items):</span>
                  <span>${actualMaterialsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Costs:</span>
                  <span>
                    ${(jobCard.estimatedCost?.additionalCosts || 0).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${actualTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${(actualTotal * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${(actualTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Final Adjustments (for office manager) */}
            {canApprove && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Final Cost Adjustments:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Labor Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={finalAdjustments.laborCost}
                      onChange={(e) =>
                        setFinalAdjustments((prev) => ({
                          ...prev,
                          laborCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Materials Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={finalAdjustments.materialsCost}
                      onChange={(e) =>
                        setFinalAdjustments((prev) => ({
                          ...prev,
                          materialsCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Additional Costs</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={finalAdjustments.additionalCosts}
                      onChange={(e) =>
                        setFinalAdjustments((prev) => ({
                          ...prev,
                          additionalCosts: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Final Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Notes */}
      {jobCard.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Work Notes & Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {jobCard.notes
                .slice(-10)
                .reverse()
                .map((note, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {note}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Job Card
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {canApprove && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Review & Approve
            </Button>
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review & Approve Job Card</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Work Summary:</strong> {jobCard.title}
                <br />
                <strong>Technician:</strong> {jobCard.assignedTechnician?.name}
                <br />
                <strong>Time Worked:</strong> {totalTimeWorked.toFixed(1)} hours
                <br />
                <strong>Final Cost:</strong> ${getFinalTotal().toFixed(2)}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Satisfaction Rating (1-5)</Label>
                <Select
                  value={customerSatisfactionRating.toString()}
                  onValueChange={(value) =>
                    setCustomerSatisfactionRating(parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Quality Check Notes</Label>
              <Textarea
                value={qualityCheckNotes}
                onChange={(e) => setQualityCheckNotes(e.target.value)}
                placeholder="Notes about work quality, customer satisfaction, any issues..."
                rows={3}
              />
            </div>

            <div>
              <Label>Approval Notes</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Final approval notes or feedback for the technician..."
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
              onClick={() => handleApproval(false)}
              disabled={!approvalNotes}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => handleApproval(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
