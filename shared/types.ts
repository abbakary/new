/**
 * Shared types for job card and order management system
 */

// User Types and Roles
export enum UserRole {
  ADMIN = 'admin',
  OFFICE_MANAGER = 'office_manager',
  TECHNICIAN = 'technician'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  permissions: Permission[];
}

export interface Permission {
  module: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company?: string;
  customerType: 'individual' | 'business';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asset/Item Types
export interface Asset {
  id: string;
  type: 'vehicle' | 'equipment' | 'machine' | 'product';
  make?: string;
  model?: string;
  year?: number;
  serialNumber?: string;
  licensePlate?: string;
  vin?: string;
  description: string;
  customerId: string;
}

// Job Priority and Status
export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  WAITING_APPROVAL = 'waiting_approval',
  WAITING_PARTS = 'waiting_parts',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Materials and Parts
export interface Material {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  category: string;
}

// Labor and Time Tracking
export interface LaborEntry {
  id: string;
  technicianId: string;
  technicianName: string;
  startTime: Date;
  endTime?: Date;
  hours: number;
  hourlyRate: number;
  description: string;
  isApproved: boolean;
}

// Checklist System
export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  isRequired: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  createdAt: Date;
}

// Attachments and Media
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  category: 'photo' | 'document' | 'manual' | 'report' | 'signature' | 'other';
}

// Approval Workflow
export interface Approval {
  id: string;
  type: 'start_work' | 'completion' | 'parts_request' | 'cost_override';
  requestedBy: string;
  approverRole: UserRole;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  digitalSignature?: string;
}

// Digital Signature
export interface DigitalSignature {
  id: string;
  signedBy: string;
  signedAt: Date;
  signatureData: string; // Base64 encoded signature
  ipAddress?: string;
  deviceInfo?: string;
}

// Cost and Billing
export interface CostEstimate {
  laborCost: number;
  materialsCost: number;
  additionalCosts: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface ActualCost {
  laborCost: number;
  materialsCost: number;
  additionalCosts: number;
  subtotal: number;
  tax: number;
  total: number;
  profitMargin: number;
}

// Main Job Card Interface
export interface JobCard {
  id: string;
  jobNumber: string; // Unique identifier like JOB-2024-001
  
  // Basic Information
  title: string;
  description: string;
  customerId: string;
  customer: Customer;
  assetId?: string;
  asset?: Asset;
  
  // Assignment and Scheduling
  assignedTechnicianId?: string;
  assignedTechnician?: User;
  createdBy: string;
  createdAt: Date;
  scheduledStartDate?: Date;
  expectedCompletionDate?: Date;
  actualStartDate?: Date;
  actualCompletionDate?: Date;
  
  // Status and Priority
  status: JobStatus;
  priority: JobPriority;
  
  // Work Details
  tasks: string[];
  checklist?: Checklist;
  laborEntries: LaborEntry[];
  materialsUsed: Material[];
  
  // Financial
  estimatedCost?: CostEstimate;
  actualCost?: ActualCost;
  
  // Documentation
  attachments: Attachment[];
  notes: string[];
  
  // Workflow
  approvals: Approval[];
  digitalSignatures: DigitalSignature[];
  
  // Tracking
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
  
  // Integration
  orderId?: string;
  invoiceId?: string;
}

// Service Order Types
export interface ServiceOrder {
  id: string;
  orderNumber: string; // Unique identifier like ORD-2024-001
  
  // Customer and Service Info
  customerId: string;
  customer: Customer;
  serviceType: 'car_service' | 'tire_service' | 'consultation' | 'custom';
  
  // Scheduling
  createdAt: Date;
  scheduledDate?: Date;
  estimatedDuration: number; // in minutes
  
  // Status
  status: OrderStatus;
  priority: JobPriority;
  
  // Associated Job Cards
  jobCards: JobCard[];
  
  // Financial
  totalEstimatedCost: number;
  totalActualCost: number;
  
  // Notes and Communication
  customerNotes?: string;
  internalNotes?: string;
  
  // Tracking
  createdBy: string;
  lastUpdatedAt: Date;
}

// Notification System
export interface Notification {
  id: string;
  type: 'reminder' | 'overdue' | 'approval_needed' | 'status_change' | 'assignment';
  title: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  relatedEntityType: 'job_card' | 'order' | 'customer';
  relatedEntityId: string;
}

// Dashboard Statistics
export interface DashboardStats {
  activeOrders: number;
  completedOrdersToday: number;
  pendingJobCards: number;
  overdueJobs: number;
  totalRevenue: number;
  averageCompletionTime: number;
}

// API Response Types
export interface JobCardResponse {
  jobCard: JobCard;
  message: string;
}

export interface JobCardsListResponse {
  jobCards: JobCard[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceOrderResponse {
  order: ServiceOrder;
  message: string;
}

export interface ServiceOrdersListResponse {
  orders: ServiceOrder[];
  total: number;
  page: number;
  limit: number;
}

// Form Types for Creating/Updating
export interface CreateJobCardRequest {
  title: string;
  description: string;
  customerId: string;
  assetId?: string;
  assignedTechnicianId?: string;
  scheduledStartDate?: Date;
  expectedCompletionDate?: Date;
  priority: JobPriority;
  tasks: string[];
  estimatedCost?: Omit<CostEstimate, 'subtotal' | 'total'>;
}

export interface UpdateJobCardRequest extends Partial<CreateJobCardRequest> {
  status?: JobStatus;
  notes?: string[];
  materialsUsed?: Material[];
  laborEntries?: LaborEntry[];
}

export interface CreateServiceOrderRequest {
  customerId: string;
  serviceType: ServiceOrder['serviceType'];
  scheduledDate?: Date;
  estimatedDuration: number;
  priority: JobPriority;
  customerNotes?: string;
  jobCards?: CreateJobCardRequest[];
}
