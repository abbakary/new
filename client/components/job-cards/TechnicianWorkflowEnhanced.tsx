import React, { useState, useEffect } from "react";
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
import { useTechnicianStatus } from "@/context/TechnicianStatusContext";
import {
  JobCard,
  JobStatus,
  UserRole,
  LaborEntry,
  Material,
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
  Plus,
  Minus,
  DollarSign,
  Package,
  Camera,
  MessageSquare,
  Send,
  RefreshCw,
  Wrench,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";

interface TechnicianWorkflowEnhancedProps {
  jobCard: JobCard;
  onUpdateJobCard: (updatedJobCard: JobCard) => void;
  onStatusChange: (jobCard: JobCard, newStatus: JobStatus) => void;
}

interface TimeEntry {
  startTime: Date;
  description: string;
  isActive: boolean;
}

interface MaterialEntry {
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export const TechnicianWorkflowEnhanced: React.FC<
  TechnicianWorkflowEnhancedProps
> = ({ jobCard, onUpdateJobCard, onStatusChange }) => {
  const { user } = useAuth();
  const { currentUserStatus, updateCurrentTask, updateLocation } =
    useTechnicianStatus();

  // Time tracking state
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(
    null,
  );
  const [timeDescription, setTimeDescription] = useState("");
  const [showTimeDialog, setShowTimeDialog] = useState(false);

  // Materials state
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [materialEntry, setMaterialEntry] = useState<MaterialEntry>({
    name: "",
    partNumber: "",
    quantity: 1,
    unitPrice: 0,
    category: "parts",
  });

  // Task management
  const [taskProgress, setTaskProgress] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Notes and communication
  const [progressNote, setProgressNote] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");

  // Status management
  const [isWorking, setIsWorking] = useState(false);

  const isTechnician = user?.role === UserRole.TECHNICIAN;
  const isAssignedTechnician =
    isTechnician && jobCard.assignedTechnicianId === user?.id;

  // Check permissions
  const canWork =
    isAssignedTechnician &&
    [JobStatus.PENDING, JobStatus.IN_PROGRESS].includes(jobCard.status);
  const canComplete =
    isAssignedTechnician && jobCard.status === JobStatus.IN_PROGRESS;

  // Initialize task progress
  useEffect(() => {
    const progress: { [key: number]: boolean } = {};
    jobCard.tasks.forEach((_, index) => {
      progress[index] = false; // In real app, this would come from saved state
    });
    setTaskProgress(progress);
  }, [jobCard.tasks]);

  // Update technician status when working on this job
  useEffect(() => {
    if (isWorking && isAssignedTechnician) {
      updateCurrentTask(`${jobCard.title} - ${jobCard.customer.name}`);
    } else if (
      !isWorking &&
      currentUserStatus?.currentTask?.includes(jobCard.title)
    ) {
      updateCurrentTask(undefined);
    }
  }, [
    isWorking,
    jobCard.title,
    jobCard.customer.name,
    isAssignedTechnician,
    updateCurrentTask,
    currentUserStatus,
  ]);

  const startWork = () => {
    if (!canWork) return;

    onStatusChange(jobCard, JobStatus.IN_PROGRESS);
    setIsWorking(true);
    startTimeTracking();
  };

  const startTimeTracking = () => {
    if (currentTimeEntry?.isActive) return;

    const newEntry: TimeEntry = {
      startTime: new Date(),
      description: timeDescription || `Work on ${jobCard.title}`,
      isActive: true,
    };

    setCurrentTimeEntry(newEntry);
    setTimeDescription("");
  };

  const stopTimeTracking = () => {
    if (!currentTimeEntry?.isActive) return;

    const endTime = new Date();
    const hours =
      (endTime.getTime() - currentTimeEntry.startTime.getTime()) /
      (1000 * 60 * 60);

    const laborEntry: LaborEntry = {
      id: Date.now().toString(),
      technicianId: user!.id,
      technicianName: user!.name,
      startTime: currentTimeEntry.startTime,
      endTime,
      hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
      hourlyRate: 50, // This would come from user profile
      description: currentTimeEntry.description,
      isApproved: false,
    };

    const updatedJobCard = {
      ...jobCard,
      laborEntries: [...jobCard.laborEntries, laborEntry],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
    setCurrentTimeEntry(null);
  };

  const addMaterial = () => {
    if (!materialEntry.name || materialEntry.quantity <= 0) {
      alert("Please fill in material name and valid quantity");
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      name: materialEntry.name,
      partNumber: materialEntry.partNumber,
      quantity: materialEntry.quantity,
      unitPrice: materialEntry.unitPrice,
      totalPrice: materialEntry.quantity * materialEntry.unitPrice,
      category: materialEntry.category,
    };

    const updatedJobCard = {
      ...jobCard,
      materialsUsed: [...jobCard.materialsUsed, material],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
    setMaterialEntry({
      name: "",
      partNumber: "",
      quantity: 1,
      unitPrice: 0,
      category: "parts",
    });
    setShowMaterialDialog(false);
  };

  const removeMaterial = (materialId: string) => {
    const updatedJobCard = {
      ...jobCard,
      materialsUsed: jobCard.materialsUsed.filter((m) => m.id !== materialId),
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };
    onUpdateJobCard(updatedJobCard);
  };

  const updateTaskProgress = (taskIndex: number, completed: boolean) => {
    setTaskProgress((prev) => ({ ...prev, [taskIndex]: completed }));

    // Add progress note
    const task = jobCard.tasks[taskIndex];
    const note = `Task ${completed ? "completed" : "marked incomplete"}: ${task}`;
    addProgressNote(note);
  };

  const addTask = () => {
    if (!newTaskDescription.trim()) return;

    const updatedJobCard = {
      ...jobCard,
      tasks: [...jobCard.tasks, newTaskDescription.trim()],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
    setNewTaskDescription("");
  };

  const addProgressNote = (note: string) => {
    const timestampedNote = `[${format(new Date(), "HH:mm")}] ${note}`;

    const updatedJobCard = {
      ...jobCard,
      notes: [...jobCard.notes, timestampedNote],
      lastUpdatedBy: user!.id,
      lastUpdatedAt: new Date(),
    };

    onUpdateJobCard(updatedJobCard);
  };

  const sendProgressUpdate = () => {
    if (!progressNote.trim()) return;

    addProgressNote(`Progress Update: ${progressNote.trim()}`);
    setProgressNote("");
  };

  const sendCustomerMessage = () => {
    if (!customerMessage.trim()) return;

    addProgressNote(`Message to customer: ${customerMessage.trim()}`);
    setCustomerMessage("");

    // In real app, this would send a notification to the office manager
    alert("Message sent to office manager for customer communication");
  };

  const requestApproval = () => {
    if (currentTimeEntry?.isActive) {
      stopTimeTracking();
    }

    setIsWorking(false);
    onStatusChange(jobCard, JobStatus.WAITING_APPROVAL);
    addProgressNote("Work completed - requesting approval from office manager");
  };

  const getTotalTimeWorked = () => {
    let total = jobCard.laborEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    // Add current active time if tracking
    if (currentTimeEntry?.isActive) {
      const currentHours =
        (new Date().getTime() - currentTimeEntry.startTime.getTime()) /
        (1000 * 60 * 60);
      total += currentHours;
    }

    return total;
  };

  const getCompletedTasksCount = () => {
    return Object.values(taskProgress).filter(Boolean).length;
  };

  const getProgressPercentage = () => {
    if (jobCard.tasks.length === 0) return 0;
    return Math.round((getCompletedTasksCount() / jobCard.tasks.length) * 100);
  };

  const getTotalMaterialsCost = () => {
    return jobCard.materialsUsed.reduce(
      (sum, material) => sum + material.totalPrice,
      0,
    );
  };

  if (!isAssignedTechnician) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This job card is not assigned to you. Only the assigned technician can
          work on it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Progress
            </div>
            <div className="flex items-center gap-2">
              {currentTimeEntry?.isActive && (
                <Badge className="bg-green-100 text-green-800 animate-pulse">
                  <Timer className="h-3 w-3 mr-1" />
                  Tracking Time
                </Badge>
              )}
              <Badge variant="outline">
                {getProgressPercentage()}% Complete
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getTotalTimeWorked().toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Time Worked</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getCompletedTasksCount()}/{jobCard.tasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ${getTotalMaterialsCost().toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Materials Used
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canWork && jobCard.status === JobStatus.PENDING && (
              <Button onClick={startWork}>
                <Play className="h-4 w-4 mr-2" />
                Start Work
              </Button>
            )}

            {canWork && jobCard.status === JobStatus.IN_PROGRESS && (
              <>
                {!currentTimeEntry?.isActive ? (
                  <Button onClick={startTimeTracking}>
                    <Timer className="h-4 w-4 mr-2" />
                    Start Timer
                  </Button>
                ) : (
                  <Button variant="outline" onClick={stopTimeTracking}>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Timer
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowMaterialDialog(true)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </>
            )}

            {canComplete && (
              <Button onClick={requestApproval}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobCard.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={taskProgress[index] || false}
                      onChange={(e) =>
                        updateTaskProgress(index, e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <span
                      className={`flex-1 ${taskProgress[index] ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task}
                    </span>
                    {taskProgress[index] && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}

                {/* Add new task */}
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                  />
                  <Button
                    onClick={addTask}
                    disabled={!newTaskDescription.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Materials Used
                <Button onClick={() => setShowMaterialDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobCard.materialsUsed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No materials added yet. Click "Add Material" to start
                  tracking.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobCard.materialsUsed.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Part #: {material.partNumber || "N/A"} | Qty:{" "}
                          {material.quantity} | Unit: $
                          {material.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          ${material.totalPrice.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(material.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Materials Cost:</span>
                    <span>${getTotalMaterialsCost().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {currentTimeEntry?.isActive && (
                <Alert className="mb-4">
                  <Timer className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Currently tracking:</strong>{" "}
                    {currentTimeEntry.description}
                    <br />
                    Started at: {format(currentTimeEntry.startTime, "HH:mm:ss")}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {jobCard.laborEntries.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{entry.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(entry.startTime), "MMM dd, HH:mm")} -
                          {entry.endTime
                            ? format(new Date(entry.endTime), "HH:mm")
                            : "In Progress"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {entry.hours.toFixed(2)}h
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(entry.hours * entry.hourlyRate).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {jobCard.laborEntries.length === 0 &&
                  !currentTimeEntry?.isActive && (
                    <div className="text-center py-8 text-muted-foreground">
                      No time entries yet. Start the timer to begin tracking
                      your work.
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a progress note for the office manager..."
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={sendProgressUpdate}
                    disabled={!progressNote.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Progress Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Message for the customer (will be sent via office manager)..."
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={sendCustomerMessage}
                    disabled={!customerMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to Customer (via Office Manager)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {jobCard.notes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No notes yet.
                    </div>
                  ) : (
                    jobCard.notes
                      .slice(-10)
                      .reverse()
                      .map((note, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted rounded text-sm"
                        >
                          {note}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Material Dialog */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material Name *</Label>
                <Input
                  value={materialEntry.name}
                  onChange={(e) =>
                    setMaterialEntry((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter material name"
                />
              </div>
              <div>
                <Label>Part Number</Label>
                <Input
                  value={materialEntry.partNumber}
                  onChange={(e) =>
                    setMaterialEntry((prev) => ({
                      ...prev,
                      partNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter part number"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={materialEntry.quantity}
                  onChange={(e) =>
                    setMaterialEntry((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={materialEntry.unitPrice}
                  onChange={(e) =>
                    setMaterialEntry((prev) => ({
                      ...prev,
                      unitPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>
                  Total: $
                  {(materialEntry.quantity * materialEntry.unitPrice).toFixed(
                    2,
                  )}
                </Label>
                <div className="text-sm text-muted-foreground pt-2">
                  Auto-calculated
                </div>
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={materialEntry.category}
                onValueChange={(value) =>
                  setMaterialEntry((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="fluids">Fluids</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaterialDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={addMaterial}>Add Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
