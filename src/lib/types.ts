export type UserRole = 'ceo' | 'developer' | 'accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type ClientStatus = 'lead' | 'contacted' | 'interested' | 'negotiation' | 'won' | 'active' | 'lost';

export interface Client {
  id: string;
  businessName: string;
  category: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  googleMapsLink: string;
  websiteUrl: string;
  socialMedia: string;
  serviceRequested: string;
  quotedPrice: number;
  agreedPrice: number;
  leadSource: string;
  acquisitionDate: string;
  assignedTo: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'lead_received' | 'contacted' | 'quotation_sent' | 'confirmed' | 'in_progress' | 'internal_review' | 'client_review' | 'revisions' | 'ready_delivery' | 'delivered' | 'payment_completed' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  serviceType: string;
  description: string;
  createdAt: string;
  assignedDeveloper: string;
  assignedCoordinator: string;
  price: number;
  advancePayment: number;
  remainingBalance: number;
  startDate: string;
  internalDeadline: string;
  deliveryDate: string;
  priority: Priority;
  status: OrderStatus;
  previewUrl: string;
  liveUrl: string;
  repositoryUrl: string;
  notes: string;
  revisionHistory: string;
  createdAt_timestamp: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'review' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  orderId?: string;
  assignedTo: string;
  createdBy: string;
  priority: Priority;
  startDate: string;
  deadline: string;
  status: TaskStatus;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'other';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';

export interface Payment {
  id: string;
  orderId?: string;
  clientId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  notes: string;
  type: 'project_payment' | 'maintenance_payment' | 'other';
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  reference: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  orderId?: string;
  subscriptionId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'void';
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type MaintenancePlanType = 'value' | 'pro' | 'custom';
export type SubscriptionStatus = 'pending' | 'active' | 'payment_due' | 'overdue' | 'paused' | 'cancelled' | 'expired';

export interface MaintenancePlan {
  id: string;
  name: string;
  type: MaintenancePlanType;
  monthlyPrice: number;
  features: string[];
  maxUpdates: number;
  maxSupportTickets: number;
  isActive: boolean;
}

export interface MaintenanceSubscription {
  id: string;
  clientId: string;
  websiteDomain: string;
  websiteUrl: string;
  planId: string;
  planType: MaintenancePlanType;
  customPrice: number;
  startDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  paymentMethod: string;
  lastPaymentDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  assignedTo: string;
  contractNotes: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  subscriptionId: string;
  clientId: string;
  issueDescription: string;
  requestDate: string;
  priority: Priority;
  assignedTo: string;
  expectedCompletion: string;
  workPerformed: string;
  status: 'new' | 'in_progress' | 'waiting_client' | 'completed' | 'closed';
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'deadline' | 'payment';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface AppFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  clientId?: string;
  orderId?: string;
  taskId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface BusinessSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  timezone: string;
  taxRate: number;
  invoicePrefix: string;
  orderPrefix: string;
}
