import React, { useState, useMemo } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  useTechnicianStatus,
  TechnicianStatusIndicator,
} from "@/context/TechnicianStatusContext";
import { UserRole } from "@shared/types";
import {
  MessageSquare,
  Send,
  Phone,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users,
  Megaphone,
  MessageCircle,
  FileText,
  Calendar,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    role: UserRole;
  };
  to: {
    id: string;
    name: string;
    role: UserRole;
  } | null; // null for broadcast messages
  subject: string;
  content: string;
  type: "message" | "notification" | "alert" | "job_update" | "announcement";
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  createdAt: Date;
  relatedJobId?: string;
  attachments?: string[];
}

// Mock message data
const mockMessages: Message[] = [
  {
    id: "1",
    from: { id: "tech-1", name: "Mike Johnson", role: UserRole.TECHNICIAN },
    to: {
      id: "manager-1",
      name: "Office Manager",
      role: UserRole.OFFICE_MANAGER,
    },
    subject: "Job JOB-2024-015 - Material Issue",
    content:
      "Hi, I need approval to order additional brake pads for the Toyota Camry job. The customer wants to upgrade to premium pads which will add $50 to the cost.",
    type: "job_update",
    priority: "normal",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    relatedJobId: "JOB-2024-015",
  },
  {
    id: "2",
    from: {
      id: "manager-1",
      name: "Office Manager",
      role: UserRole.OFFICE_MANAGER,
    },
    to: { id: "tech-2", name: "Sarah Wilson", role: UserRole.TECHNICIAN },
    subject: "Customer Communication - ABC Company",
    content:
      "Please call the customer at +1234567891 to confirm the pickup time for their Ford F-150. They requested a call before 3 PM.",
    type: "notification",
    priority: "high",
    isRead: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    relatedJobId: "JOB-2024-016",
  },
  {
    id: "3",
    from: { id: "admin-1", name: "Admin User", role: UserRole.ADMIN },
    to: null, // Broadcast message
    subject: "System Maintenance Notice",
    content:
      "The inventory system will be updated tonight at 11 PM. Please complete all material entries before then.",
    type: "announcement",
    priority: "normal",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "4",
    from: { id: "tech-2", name: "Sarah Wilson", role: UserRole.TECHNICIAN },
    to: {
      id: "manager-1",
      name: "Office Manager",
      role: UserRole.OFFICE_MANAGER,
    },
    subject: "Job Completion - JOB-2024-016",
    content:
      "Tire replacement for ABC Company is complete. Total time: 3.5 hours. Ready for your approval. Customer was very satisfied with the service.",
    type: "job_update",
    priority: "normal",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    relatedJobId: "JOB-2024-016",
  },
];

interface CommunicationCenterProps {
  compact?: boolean;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  compact = false,
}) => {
  const { user } = useAuth();
  const { technicians } = useTechnicianStatus();

  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    type: "message" as Message["type"],
    priority: "normal" as Message["priority"],
  });
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [showComposeDialog, setShowComposeDialog] = useState(false);

  // Filter messages based on current user
  const userMessages = useMemo(() => {
    return messages.filter(
      (msg) =>
        msg.to === null || // Broadcast messages
        msg.to.id === user?.id || // Messages to current user
        msg.from.id === user?.id, // Messages from current user
    );
  }, [messages, user?.id]);

  const unreadCount = useMemo(() => {
    return userMessages.filter((msg) => !msg.isRead && msg.from.id !== user?.id)
      .length;
  }, [userMessages, user?.id]);

  const inboxMessages = useMemo(() => {
    return userMessages.filter(
      (msg) => msg.to === null || msg.to.id === user?.id,
    );
  }, [userMessages, user?.id]);

  const sentMessages = useMemo(() => {
    return userMessages.filter((msg) => msg.from.id === user?.id);
  }, [userMessages, user?.id]);

  const getMessageTypeIcon = (type: Message["type"]) => {
    switch (type) {
      case "message":
        return MessageCircle;
      case "notification":
        return Bell;
      case "alert":
        return AlertTriangle;
      case "job_update":
        return FileText;
      case "announcement":
        return Megaphone;
      default:
        return MessageSquare;
    }
  };

  const getMessageTypeColor = (type: Message["type"]) => {
    switch (type) {
      case "message":
        return "text-blue-600";
      case "notification":
        return "text-orange-600";
      case "alert":
        return "text-red-600";
      case "job_update":
        return "text-green-600";
      case "announcement":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: Message["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendMessage = () => {
    if (
      !newMessage.content.trim() ||
      (!newMessage.to && newMessage.type !== "announcement")
    ) {
      return;
    }

    const recipient = newMessage.to
      ? [
          ...technicians,
          {
            id: "manager-1",
            name: "Office Manager",
            role: UserRole.OFFICE_MANAGER,
          },
        ].find((u) => u.id === newMessage.to)
      : null;

    const message: Message = {
      id: Date.now().toString(),
      from: {
        id: user!.id,
        name: user!.name,
        role: user!.role,
      },
      to: recipient
        ? {
            id: recipient.id,
            name: recipient.name,
            role: recipient.role,
          }
        : null,
      subject: newMessage.subject || "No Subject",
      content: newMessage.content,
      type: newMessage.type,
      priority: newMessage.priority,
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [message, ...prev]);
    setNewMessage({
      to: "",
      subject: "",
      content: "",
      type: "message",
      priority: "normal",
    });
    setShowComposeDialog(false);
  };

  const markAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg,
      ),
    );
  };

  const getAvailableRecipients = () => {
    const recipients = [...technicians];

    if (user?.role === UserRole.TECHNICIAN) {
      recipients.push({
        id: "manager-1",
        name: "Office Manager",
        role: UserRole.OFFICE_MANAGER,
        isActive: true,
        createdAt: new Date(),
        permissions: [],
        email: "manager@company.com",
      });
    }

    return recipients.filter((r) => r.id !== user?.id);
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inboxMessages.slice(0, 5).map((message) => {
              const MessageIcon = getMessageTypeIcon(message.type);
              return (
                <div
                  key={message.id}
                  className={`p-2 border rounded cursor-pointer hover:bg-accent ${
                    !message.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => markAsRead(message.id)}
                >
                  <div className="flex items-start gap-2">
                    <MessageIcon
                      className={`h-4 w-4 mt-0.5 ${getMessageTypeColor(message.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm ${!message.isRead ? "font-medium" : ""}`}
                        >
                          {message.from.name}
                        </span>
                        <Badge
                          className={getPriorityColor(message.priority)}
                          size="sm"
                        >
                          {message.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(message.createdAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => setShowComposeDialog(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication Center</h1>
          <p className="text-gray-600">
            Team communication and coordination hub
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowComposeDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-xl font-bold">{userMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Job Updates</p>
                <p className="text-xl font-bold">
                  {userMessages.filter((m) => m.type === "job_update").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-xl font-bold">
                  {
                    userMessages.filter((m) =>
                      ["high", "urgent"].includes(m.priority),
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">
                Inbox {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="space-y-4">
              {inboxMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No messages</h3>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inboxMessages.map((message) => {
                    const MessageIcon = getMessageTypeIcon(message.type);
                    return (
                      <div
                        key={message.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          !message.isRead ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => markAsRead(message.id)}
                      >
                        <div className="flex items-start gap-3">
                          <MessageIcon
                            className={`h-5 w-5 mt-1 ${getMessageTypeColor(message.type)}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${!message.isRead ? "text-blue-900" : ""}`}
                                >
                                  {message.to === null
                                    ? "Announcement"
                                    : message.from.name}
                                </span>
                                <Badge
                                  className={getPriorityColor(message.priority)}
                                >
                                  {message.priority}
                                </Badge>
                                {message.relatedJobId && (
                                  <Badge variant="outline">
                                    {message.relatedJobId}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {format(
                                  new Date(message.createdAt),
                                  "MMM dd, HH:mm",
                                )}
                              </span>
                            </div>
                            <h4
                              className={`font-medium mb-2 ${!message.isRead ? "text-blue-900" : ""}`}
                            >
                              {message.subject}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No sent messages</h3>
                  <p>Start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentMessages.map((message) => {
                    const MessageIcon = getMessageTypeIcon(message.type);
                    return (
                      <div key={message.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <MessageIcon
                            className={`h-5 w-5 mt-1 ${getMessageTypeColor(message.type)}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  To:{" "}
                                  {message.to ? message.to.name : "All Users"}
                                </span>
                                <Badge
                                  className={getPriorityColor(message.priority)}
                                >
                                  {message.priority}
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500">
                                {format(
                                  new Date(message.createdAt),
                                  "MMM dd, HH:mm",
                                )}
                              </span>
                            </div>
                            <h4 className="font-medium mb-2">
                              {message.subject}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="announcements" className="space-y-4">
              {userMessages.filter((m) => m.type === "announcement").length ===
              0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No announcements</h3>
                  <p>No company announcements at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userMessages
                    .filter((m) => m.type === "announcement")
                    .map((message) => (
                      <div
                        key={message.id}
                        className="p-4 border rounded-lg bg-purple-50"
                      >
                        <div className="flex items-start gap-3">
                          <Megaphone className="h-5 w-5 mt-1 text-purple-600" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {message.from.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(
                                  new Date(message.createdAt),
                                  "MMM dd, HH:mm",
                                )}
                              </span>
                            </div>
                            <h4 className="font-medium mb-2">
                              {message.subject}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Message Type</Label>
                <Select
                  value={newMessage.type}
                  onValueChange={(value: Message["type"]) =>
                    setNewMessage((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">General Message</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="job_update">Job Update</SelectItem>
                    {user?.role === UserRole.ADMIN && (
                      <SelectItem value="announcement">Announcement</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={newMessage.priority}
                  onValueChange={(value: Message["priority"]) =>
                    setNewMessage((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newMessage.type !== "announcement" && (
              <div>
                <Label>To</Label>
                <Select
                  value={newMessage.to}
                  onValueChange={(value) =>
                    setNewMessage((prev) => ({ ...prev, to: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRecipients().map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        <div className="flex items-center gap-2">
                          <TechnicianStatusIndicator
                            technicianId={recipient.id}
                            size="sm"
                          />
                          {recipient.name} ({recipient.role.replace("_", " ")})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Subject</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Type your message here..."
                rows={5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowComposeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={
                !newMessage.content.trim() ||
                (!newMessage.to && newMessage.type !== "announcement")
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
