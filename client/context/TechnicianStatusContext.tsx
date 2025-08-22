import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@shared/types";

interface TechnicianStatus {
  id: string;
  name: string;
  isOnline: boolean;
  currentTask?: string;
  location?: string;
  lastActivity: Date;
  workloadCount: number;
  statusMessage?: string;
}

interface TechnicianStatusContextType {
  technicians: TechnicianStatus[];
  currentUserStatus: TechnicianStatus | null;
  updateStatus: (status: Partial<TechnicianStatus>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateCurrentTask: (task: string | undefined) => void;
  updateLocation: (location: string) => void;
  updateStatusMessage: (message: string) => void;
  getActiveTechnicians: () => TechnicianStatus[];
  getTechnicianById: (id: string) => TechnicianStatus | undefined;
}

const TechnicianStatusContext = createContext<
  TechnicianStatusContextType | undefined
>(undefined);

// Mock initial technician data
const initialTechnicians: TechnicianStatus[] = [
  {
    id: "tech-1",
    name: "Mike Johnson",
    isOnline: true,
    currentTask: "Oil Change - Toyota Camry",
    location: "Service Bay 1",
    lastActivity: new Date(),
    workloadCount: 3,
    statusMessage: "Working on priority tasks",
  },
  {
    id: "tech-2",
    name: "Sarah Wilson",
    isOnline: true,
    currentTask: undefined,
    location: "Service Bay 2",
    lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    workloadCount: 1,
    statusMessage: "Available for new assignments",
  },
  {
    id: "tech-3",
    name: "Tom Brown",
    isOnline: false,
    currentTask: undefined,
    location: "Off-site",
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    workloadCount: 0,
    statusMessage: "On break",
  },
];

export const TechnicianStatusProvider: React.FC<{
  children: ReactNode;
  currentUser?: User;
}> = ({ children, currentUser }) => {
  const [technicians, setTechnicians] =
    useState<TechnicianStatus[]>(initialTechnicians);

  // Get current user's status if they are a technician
  const currentUserStatus =
    currentUser?.role === UserRole.TECHNICIAN
      ? technicians.find((t) => t.id === currentUser.id) || null
      : null;

  // Auto-update last activity for current user
  useEffect(() => {
    if (currentUser?.role === UserRole.TECHNICIAN) {
      const interval = setInterval(() => {
        setTechnicians((prev) =>
          prev.map((tech) =>
            tech.id === currentUser.id
              ? { ...tech, lastActivity: new Date() }
              : tech,
          ),
        );
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Mark technicians as offline if they haven't been active for more than 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTechnicians((prev) =>
        prev.map((tech) => {
          const timeSinceActivity = now.getTime() - tech.lastActivity.getTime();
          const tenMinutes = 10 * 60 * 1000;

          // Don't auto-set offline if it's the current user
          if (tech.id === currentUser?.id) return tech;

          if (timeSinceActivity > tenMinutes && tech.isOnline) {
            return {
              ...tech,
              isOnline: false,
              statusMessage: "Away (auto-timeout)",
            };
          }
          return tech;
        }),
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentUser]);

  const updateStatus = (statusUpdate: Partial<TechnicianStatus>) => {
    if (!currentUser?.role === UserRole.TECHNICIAN) return;

    setTechnicians((prev) =>
      prev.map((tech) =>
        tech.id === currentUser?.id
          ? { ...tech, ...statusUpdate, lastActivity: new Date() }
          : tech,
      ),
    );
  };

  const setOnlineStatus = (isOnline: boolean) => {
    updateStatus({
      isOnline,
      statusMessage: isOnline ? "Available" : "Offline",
      ...(isOnline ? {} : { currentTask: undefined }),
    });
  };

  const updateCurrentTask = (task: string | undefined) => {
    updateStatus({
      currentTask: task,
      statusMessage: task ? "Working on task" : "Available for new assignments",
    });
  };

  const updateLocation = (location: string) => {
    updateStatus({ location });
  };

  const updateStatusMessage = (message: string) => {
    updateStatus({ statusMessage: message });
  };

  const getActiveTechnicians = () => {
    return technicians.filter((tech) => tech.isOnline);
  };

  const getTechnicianById = (id: string) => {
    return technicians.find((tech) => tech.id === id);
  };

  const value: TechnicianStatusContextType = {
    technicians,
    currentUserStatus,
    updateStatus,
    setOnlineStatus,
    updateCurrentTask,
    updateLocation,
    updateStatusMessage,
    getActiveTechnicians,
    getTechnicianById,
  };

  return (
    <TechnicianStatusContext.Provider value={value}>
      {children}
    </TechnicianStatusContext.Provider>
  );
};

export const useTechnicianStatus = (): TechnicianStatusContextType => {
  const context = useContext(TechnicianStatusContext);
  if (context === undefined) {
    throw new Error(
      "useTechnicianStatus must be used within a TechnicianStatusProvider",
    );
  }
  return context;
};

// Component for displaying technician status indicator
export const TechnicianStatusIndicator: React.FC<{
  technicianId: string;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ technicianId, showDetails = false, size = "md" }) => {
  const { getTechnicianById } = useTechnicianStatus();
  const technician = getTechnicianById(technicianId);

  if (!technician) return null;

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const getStatusColor = () => {
    if (!technician.isOnline) return "bg-gray-400";
    if (technician.currentTask) return "bg-orange-500"; // Busy
    return "bg-green-500"; // Available
  };

  const getStatusText = () => {
    if (!technician.isOnline) return "Offline";
    if (technician.currentTask) return "Busy";
    return "Available";
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${getStatusColor()} animate-pulse`}
        title={`${technician.name} - ${getStatusText()}`}
      />
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{technician.name}</span>
          <span className="text-xs text-muted-foreground">
            {technician.statusMessage || getStatusText()}
          </span>
          {technician.currentTask && (
            <span className="text-xs text-blue-600">
              {technician.currentTask}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Component for technician to control their own status
export const TechnicianStatusControl: React.FC = () => {
  const {
    currentUserStatus,
    setOnlineStatus,
    updateStatusMessage,
    updateLocation,
  } = useTechnicianStatus();

  const [customMessage, setCustomMessage] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (currentUserStatus) {
      setCustomMessage(currentUserStatus.statusMessage || "");
      setLocation(currentUserStatus.location || "");
    }
  }, [currentUserStatus]);

  if (!currentUserStatus) return null;

  const handleStatusToggle = () => {
    setOnlineStatus(!currentUserStatus.isOnline);
  };

  const handleMessageUpdate = () => {
    if (customMessage.trim()) {
      updateStatusMessage(customMessage.trim());
    }
  };

  const handleLocationUpdate = () => {
    if (location.trim()) {
      updateLocation(location.trim());
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-medium mb-3">Your Status</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Online Status:</span>
          <button
            onClick={handleStatusToggle}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentUserStatus.isOnline
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                currentUserStatus.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {currentUserStatus.isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status Message:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter status message"
              className="flex-1 px-3 py-1 border rounded text-sm"
              onKeyPress={(e) => e.key === "Enter" && handleMessageUpdate()}
            />
            <button
              onClick={handleMessageUpdate}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter current location"
              className="flex-1 px-3 py-1 border rounded text-sm"
              onKeyPress={(e) => e.key === "Enter" && handleLocationUpdate()}
            />
            <button
              onClick={handleLocationUpdate}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>

        {currentUserStatus.currentTask && (
          <div className="p-2 bg-blue-50 rounded">
            <span className="text-sm font-medium">Current Task:</span>
            <p className="text-sm text-blue-700">
              {currentUserStatus.currentTask}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
