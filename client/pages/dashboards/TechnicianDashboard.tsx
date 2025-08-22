import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  User,
  Car,
  Wrench,
  Timer,
  Calendar,
  DollarSign,
  FileText,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CommunicationCenter } from "@/components/communication/CommunicationCenter";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [workingTime, setWorkingTime] = useState<Record<string, number>>({});

  // Mock data - In real app, this would come from API
  const assignedJobs = [
    {
      id: "JOB-2024-001",
      jobNumber: "JOB-2024-001",
      title: "Oil Change and Filter Replacement",
      customer: "John Smith",
      vehicle: "2020 Toyota Camry",
      licensePlate: "ABC-123",
      status: "in_progress",
      priority: "normal",
      estimatedTime: 2, // hours
      timeSpent: 1.5,
      tasks: [
        "Drain old oil",
        "Replace oil filter",
        "Add new oil",
        "Check fluid levels",
      ],
      customerArrival: "9:00 AM",
      estimatedCompletion: "11:00 AM",
      materials: [
        { name: "Engine Oil 5W-30", quantity: 5, unit: "liters" },
        { name: "Oil Filter", quantity: 1, unit: "piece" },
      ],
    },
    {
      id: "JOB-2024-002",
      jobNumber: "JOB-2024-002",
      title: "Brake Inspection",
      customer: "ABC Company",
      vehicle: "2019 Ford F-150",
      licensePlate: "XYZ-789",
      status: "pending",
      priority: "high",
      estimatedTime: 1.5,
      timeSpent: 0,
      tasks: [
        "Inspect brake pads",
        "Check brake fluid",
        "Test brake performance",
      ],
      customerArrival: "2:00 PM",
      estimatedCompletion: "3:30 PM",
      materials: [],
    },
    {
      id: "JOB-2024-003",
      jobNumber: "JOB-2024-003",
      title: "Tire Rotation and Balance",
      customer: "Mary Johnson",
      vehicle: "2021 Honda Civic",
      licensePlate: "DEF-456",
      status: "waiting_parts",
      priority: "low",
      estimatedTime: 1,
      timeSpent: 0.5,
      tasks: [
        "Remove all tires",
        "Rotate positions",
        "Balance wheels",
        "Reinstall",
      ],
      customerArrival: "10:30 AM",
      estimatedCompletion: "12:00 PM",
      materials: [{ name: "Wheel Weights", quantity: 4, unit: "sets" }],
    },
  ];

  const todayStats = {
    assignedJobs: assignedJobs.length,
    completedJobs: 3,
    hoursWorked: 6.5,
    onTimeCompletion: 95,
  };

  const recentSales = [
    { item: "Air Freshener", quantity: 2, price: 15.99, time: "10:30 AM" },
    {
      item: "Windshield Washer Fluid",
      quantity: 1,
      price: 8.5,
      time: "11:15 AM",
    },
    { item: "Car Charger", quantity: 1, price: 24.99, time: "2:45 PM" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "waiting_parts":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startTimer = (jobId: string) => {
    setActiveTimer(jobId);
    // In real app, this would start API timer
  };

  const stopTimer = (jobId: string) => {
    setActiveTimer(null);
    // In real app, this would stop API timer and update time spent
  };

  const updateJobStatus = (jobId: string, newStatus: string) => {
    // In real app, this would update via API
    console.log(`Updating job ${jobId} to ${newStatus}`);
  };

  const recordCustomerLeave = (jobId: string) => {
    const leaveTime = new Date().toLocaleTimeString();
    // In real app, this would update the job with customer leave time
    console.log(`Customer left at ${leaveTime} for job ${jobId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Technician Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here are your assigned jobs.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-2xl font-bold">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Assigned Jobs
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {todayStats.assignedJobs}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {todayStats.completedJobs}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Hours Worked
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {todayStats.hoursWorked}h
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Timer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  On-Time Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {todayStats.onTimeCompletion}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            My Assigned Jobs
          </CardTitle>
          <CardDescription>Work orders assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assignedJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace("_", " ")}
                        </Badge>
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Customer: {job.customer}
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          {job.vehicle} ({job.licensePlate})
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Arrival: {job.customerArrival}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Est. Completion: {job.estimatedCompletion}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{job.jobNumber}</p>
                      <p className="text-sm text-gray-500">
                        {job.timeSpent}/{job.estimatedTime}h
                      </p>
                      <Progress
                        value={(job.timeSpent / job.estimatedTime) * 100}
                        className="w-24 h-2 mt-1"
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Tasks:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {job.tasks.map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  {job.materials.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Materials:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {job.materials.map((material, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{material.name}</span>
                            <span className="text-sm font-medium">
                              {material.quantity} {material.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {job.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => updateJobStatus(job.id, "in_progress")}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Job
                      </Button>
                    )}

                    {job.status === "in_progress" && (
                      <>
                        {activeTimer === job.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => stopTimer(job.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Stop Timer
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startTimer(job.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Timer
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => updateJobStatus(job.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordCustomerLeave(job.id)}
                        >
                          Customer Left
                        </Button>
                      </>
                    )}

                    {job.status === "waiting_parts" && (
                      <Button
                        size="sm"
                        onClick={() => updateJobStatus(job.id, "in_progress")}
                      >
                        Parts Arrived
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Center */}
        <CommunicationCenter compact={true} />

        {/* Time Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Time Tracking
            </CardTitle>
            <CardDescription>Log additional work time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="overtime">Additional Time (hours)</Label>
              <Input
                id="overtime"
                type="number"
                step="0.5"
                placeholder="1.5"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Extra diagnostic time, cleanup, etc."
                className="w-full"
              />
            </div>
            <Button className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
