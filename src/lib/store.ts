import { v4 as uuidv4 } from 'uuid';
import type {
  User, Client, Order, Task, Payment, Expense, Invoice,
  MaintenancePlan, MaintenanceSubscription, MaintenanceTicket,
  Notification, ActivityLog, AppFile, BusinessSettings,
  ClientStatus, OrderStatus, Priority, TaskStatus, PaymentStatus,
  PaymentMethod, SubscriptionStatus, MaintenancePlanType
} from './types';

const STORAGE_KEY = 'ags_webworks_data';

interface AppData {
  users: User[];
  clients: Client[];
  orders: Order[];
  tasks: Task[];
  payments: Payment[];
  expenses: Expense[];
  invoices: Invoice[];
  maintenancePlans: MaintenancePlan[];
  maintenanceSubscriptions: MaintenanceSubscription[];
  maintenanceTickets: MaintenanceTicket[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  files: AppFile[];
  settings: BusinessSettings;
  currentUser: string | null;
  sessionTokens: Record<string, string>;
}

const defaultUsers: User[] = [
  { id: 'usr_sharjeel', name: 'Sharjeel', email: 'sharjeel@agswebworks.com', role: 'ceo', createdAt: '2024-01-01' },
  { id: 'usr_gufran', name: 'Gufran', email: 'gufran@agswebworks.com', role: 'developer', createdAt: '2024-01-01' },
  { id: 'usr_addan', name: 'Addan', email: 'addan@agswebworks.com', role: 'accountant', createdAt: '2024-01-01' },
];

const defaultSettings: BusinessSettings = {
  companyName: 'AGS WEBWORKS',
  companyEmail: 'info@agswebworks.com',
  companyPhone: '+966 XX XXX XXXX',
  companyAddress: 'Dammam / Al Khobar, Saudi Arabia',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  taxRate: 15,
  invoicePrefix: 'INV',
  orderPrefix: 'ORD',
};

const defaultMaintenancePlans: MaintenancePlan[] = [
  {
    id: 'plan_value',
    name: 'Value Maintenance Plan',
    type: 'value',
    monthlyPrice: 0,
    features: [
      'Basic website maintenance and health checks',
      'Minor text and image updates',
      'Basic bug fixes',
      'Website uptime and functionality checks',
      'Basic technical support',
      'Monthly maintenance summary',
    ],
    maxUpdates: 5,
    maxSupportTickets: 3,
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro Maintenance Plan',
    type: 'pro',
    monthlyPrice: 0,
    features: [
      'Everything in Value plan',
      'Priority technical support',
      'More frequent website checks',
      'Minor design and layout improvements',
      'Content and image updates',
      'Performance and functionality checks',
      'Backup checks and recovery assistance',
      'Monthly maintenance report',
      'Priority handling of reported issues',
    ],
    maxUpdates: 15,
    maxSupportTickets: 10,
    isActive: true,
  },
];

function getDefaultData(): AppData {
  return {
    users: defaultUsers,
    clients: [],
    orders: [],
    tasks: [],
    payments: [],
    expenses: [],
    invoices: [],
    maintenancePlans: defaultMaintenancePlans,
    maintenanceSubscriptions: [],
    maintenanceTickets: [],
    notifications: [],
    activityLogs: [],
    files: [],
    settings: defaultSettings,
    currentUser: null,
    sessionTokens: {},
  };
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultData(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return getDefaultData();
}

function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

let appData: AppData = loadData();

// Passwords stored as hashes (demo: simple hash for demonstration)
const passwords: Record<string, string> = {
  'sharjeel@agswebworks.com': 'AGS@CEO2024!',
  'gufran@agswebworks.com': 'AGS@Dev2024!',
  'addan@agswebworks.com': 'AGS@Acc2024!',
};

// Auth
export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const user = appData.users.find(u => u.email === email);
  if (!user) return { success: false, error: 'Invalid credentials' };
  if (passwords[email] !== password) return { success: false, error: 'Invalid credentials' };
  appData.currentUser = user.id;
  saveData(appData);
  addActivityLog(user.id, 'login', 'auth', user.id, `${user.name} logged in`);
  return { success: true, user };
}

export function logout(): void {
  if (appData.currentUser) {
    addActivityLog(appData.currentUser, 'logout', 'auth', appData.currentUser, 'User logged out');
  }
  appData.currentUser = null;
  saveData(appData);
}

export function getCurrentUser(): User | null {
  if (!appData.currentUser) return null;
  return appData.users.find(u => u.id === appData.currentUser) || null;
}

export function isAuthenticated(): boolean {
  return appData.currentUser !== null;
}

// Activity Logging
function addActivityLog(userId: string, action: string, entity: string, entityId: string, details: string): void {
  appData.activityLogs.unshift({
    id: uuidv4(),
    userId,
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  });
  if (appData.activityLogs.length > 500) appData.activityLogs = appData.activityLogs.slice(0, 500);
  saveData(appData);
}

// Notifications
function addNotification(userId: string, title: string, message: string, type: Notification['type'], link?: string): void {
  appData.notifications.unshift({
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    read: false,
    link,
    createdAt: new Date().toISOString(),
  });
  saveData(appData);
}

// Role-based permission checks
export function canUser(user: User | null, action: string): boolean {
  if (!user) return false;
  const permissions: Record<string, string[]> = {
    ceo: ['all'],
    developer: ['view_assigned_orders', 'update_own_tasks', 'view_assigned_clients', 'add_project_links', 'upload_files', 'view_own_notifications', 'update_maintenance_tickets'],
    accountant: ['manage_orders', 'manage_payments', 'manage_invoices', 'manage_expenses_view', 'view_clients', 'view_reports', 'manage_maintenance_billing', 'view_own_notifications'],
  };
  const userPerms = permissions[user.role] || [];
  return userPerms.includes('all') || userPerms.includes(action);
}

// Clients CRUD
export function getClients(): Client[] {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.role === 'developer') {
    return appData.clients.filter(c => c.assignedTo === user.id);
  }
  return appData.clients;
}

export function getClient(id: string): Client | undefined {
  return appData.clients.find(c => c.id === id);
}

export function addClient(data: Partial<Client>): Client {
  const user = getCurrentUser()!;
  const client: Client = {
    id: uuidv4(),
    businessName: data.businessName || '',
    category: data.category || '',
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    whatsapp: data.whatsapp || '',
    email: data.email || '',
    location: data.location || '',
    googleMapsLink: data.googleMapsLink || '',
    websiteUrl: data.websiteUrl || '',
    socialMedia: data.socialMedia || '',
    serviceRequested: data.serviceRequested || '',
    quotedPrice: data.quotedPrice || 0,
    agreedPrice: data.agreedPrice || 0,
    leadSource: data.leadSource || '',
    acquisitionDate: data.acquisitionDate || new Date().toISOString().split('T')[0],
    assignedTo: data.assignedTo || user.id,
    status: data.status || 'lead',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  appData.clients.push(client);
  addActivityLog(user.id, 'create', 'client', client.id, `Created client: ${client.businessName}`);
  addNotification('usr_sharjeel', 'New Client Added', `${client.businessName} added to database`, 'info', '/clients');
  saveData(appData);
  return client;
}

export function updateClient(id: string, data: Partial<Client>): void {
  const user = getCurrentUser()!;
  const idx = appData.clients.findIndex(c => c.id === id);
  if (idx === -1) return;
  appData.clients[idx] = { ...appData.clients[idx], ...data, updatedAt: new Date().toISOString() };
  addActivityLog(user.id, 'update', 'client', id, `Updated client: ${appData.clients[idx].businessName}`);
  saveData(appData);
}

export function deleteClient(id: string): void {
  const user = getCurrentUser()!;
  const client = appData.clients.find(c => c.id === id);
  appData.clients = appData.clients.filter(c => c.id !== id);
  addActivityLog(user.id, 'delete', 'client', id, `Deleted client: ${client?.businessName}`);
  saveData(appData);
}

// Orders CRUD
export function getOrders(): Order[] {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.role === 'developer') {
    return appData.orders.filter(o => o.assignedDeveloper === user.id);
  }
  return appData.orders;
}

export function getOrder(id: string): Order | undefined {
  return appData.orders.find(o => o.id === id);
}

export function addOrder(data: Partial<Order>): Order {
  const user = getCurrentUser()!;
  const orderNum = `${appData.settings.orderPrefix}-${String(appData.orders.length + 1).padStart(4, '0')}`;
  const order: Order = {
    id: uuidv4(),
    orderNumber: orderNum,
    clientId: data.clientId || '',
    serviceType: data.serviceType || '',
    description: data.description || '',
    createdAt: new Date().toISOString(),
    assignedDeveloper: data.assignedDeveloper || '',
    assignedCoordinator: data.assignedCoordinator || 'usr_addan',
    price: data.price || 0,
    advancePayment: data.advancePayment || 0,
    remainingBalance: (data.price || 0) - (data.advancePayment || 0),
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    internalDeadline: data.internalDeadline || '',
    deliveryDate: data.deliveryDate || '',
    priority: data.priority || 'medium',
    status: data.status || 'lead_received',
    previewUrl: '',
    liveUrl: '',
    repositoryUrl: '',
    notes: data.notes || '',
    revisionHistory: '',
    createdAt_timestamp: Date.now(),
  };
  appData.orders.push(order);
  addActivityLog(user.id, 'create', 'order', order.id, `Created order: ${order.orderNumber}`);
  if (order.assignedDeveloper) {
    addNotification(order.assignedDeveloper, 'New Project Assigned', `Order ${order.orderNumber} assigned to you`, 'assignment', '/orders');
  }
  saveData(appData);
  return order;
}

export function updateOrder(id: string, data: Partial<Order>): void {
  const user = getCurrentUser()!;
  const idx = appData.orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  const updated = { ...appData.orders[idx], ...data };
  updated.remainingBalance = updated.price - updated.advancePayment;
  appData.orders[idx] = updated;
  addActivityLog(user.id, 'update', 'order', id, `Updated order: ${updated.orderNumber}`);
  saveData(appData);
}

export function deleteOrder(id: string): void {
  const user = getCurrentUser()!;
  const order = appData.orders.find(o => o.id === id);
  appData.orders = appData.orders.filter(o => o.id !== id);
  addActivityLog(user.id, 'delete', 'order', id, `Deleted order: ${order?.orderNumber}`);
  saveData(appData);
}

// Tasks CRUD
export function getTasks(): Task[] {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.role === 'developer') {
    return appData.tasks.filter(t => t.assignedTo === user.id);
  }
  return appData.tasks;
}

export function addTask(data: Partial<Task>): Task {
  const user = getCurrentUser()!;
  const task: Task = {
    id: uuidv4(),
    title: data.title || '',
    description: data.description || '',
    clientId: data.clientId,
    orderId: data.orderId,
    assignedTo: data.assignedTo || '',
    createdBy: user.id,
    priority: data.priority || 'medium',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    deadline: data.deadline || '',
    status: data.status || 'todo',
    comments: data.comments || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  appData.tasks.push(task);
  addActivityLog(user.id, 'create', 'task', task.id, `Created task: ${task.title}`);
  if (task.assignedTo && task.assignedTo !== user.id) {
    addNotification(task.assignedTo, 'New Task Assigned', `Task "${task.title}" assigned to you`, 'assignment', '/tasks');
  }
  saveData(appData);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): void {
  const user = getCurrentUser()!;
  const idx = appData.tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  appData.tasks[idx] = { ...appData.tasks[idx], ...data, updatedAt: new Date().toISOString() };
  addActivityLog(user.id, 'update', 'task', id, `Updated task: ${appData.tasks[idx].title}`);
  saveData(appData);
}

export function deleteTask(id: string): void {
  const user = getCurrentUser()!;
  appData.tasks = appData.tasks.filter(t => t.id !== id);
  addActivityLog(user.id, 'delete', 'task', id, 'Deleted task');
  saveData(appData);
}

// Payments CRUD
export function getPayments(): Payment[] {
  return appData.payments;
}

export function addPayment(data: Partial<Payment>): Payment {
  const user = getCurrentUser()!;
  const payment: Payment = {
    id: uuidv4(),
    orderId: data.orderId,
    clientId: data.clientId || '',
    amount: data.amount || 0,
    date: data.date || new Date().toISOString().split('T')[0],
    method: data.method || 'bank_transfer',
    status: data.status || 'paid',
    reference: data.reference || '',
    notes: data.notes || '',
    type: data.type || 'project_payment',
    createdAt: new Date().toISOString(),
  };
  appData.payments.push(payment);
  // Update order balance if linked
  if (data.orderId) {
    const order = appData.orders.find(o => o.id === data.orderId);
    if (order) {
      const totalPaid = appData.payments.filter(p => p.orderId === data.orderId && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
      order.advancePayment = totalPaid;
      order.remainingBalance = order.price - totalPaid;
    }
  }
  addActivityLog(user.id, 'create', 'payment', payment.id, `Recorded payment: ${payment.amount} SAR`);
  addNotification('usr_sharjeel', 'Payment Received', `${payment.amount} SAR payment recorded`, 'payment', '/payments');
  saveData(appData);
  return payment;
}

// Expenses CRUD
export function getExpenses(): Expense[] {
  return appData.expenses;
}

export function addExpense(data: Partial<Expense>): Expense {
  const user = getCurrentUser()!;
  const expense: Expense = {
    id: uuidv4(),
    category: data.category || '',
    amount: data.amount || 0,
    date: data.date || new Date().toISOString().split('T')[0],
    description: data.description || '',
    paymentMethod: data.paymentMethod || 'bank_transfer',
    reference: data.reference || '',
    approvedBy: data.approvedBy || '',
    status: data.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  appData.expenses.push(expense);
  addActivityLog(user.id, 'create', 'expense', expense.id, `Recorded expense: ${expense.amount} SAR`);
  saveData(appData);
  return expense;
}

export function updateExpense(id: string, data: Partial<Expense>): void {
  const user = getCurrentUser()!;
  const idx = appData.expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  appData.expenses[idx] = { ...appData.expenses[idx], ...data };
  addActivityLog(user.id, 'update', 'expense', id, `Updated expense`);
  saveData(appData);
}

// Invoices CRUD
export function getInvoices(): Invoice[] {
  return appData.invoices;
}

export function addInvoice(data: Partial<Invoice>): Invoice {
  const user = getCurrentUser()!;
  const invoiceNum = `${appData.settings.invoicePrefix}-${String(appData.invoices.length + 1).padStart(4, '0')}`;
  const subtotal = data.items?.reduce((s, i) => s + i.total, 0) || 0;
  const tax = subtotal * (appData.settings.taxRate / 100);
  const invoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: invoiceNum,
    clientId: data.clientId || '',
    orderId: data.orderId,
    subscriptionId: data.subscriptionId,
    items: data.items || [],
    subtotal,
    tax,
    total: subtotal + tax,
    status: data.status || 'draft',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };
  appData.invoices.push(invoice);
  addActivityLog(user.id, 'create', 'invoice', invoice.id, `Created invoice: ${invoice.invoiceNumber}`);
  addNotification('usr_addan', 'New Invoice Created', `Invoice ${invoice.invoiceNumber} created`, 'info', '/payments');
  saveData(appData);
  return invoice;
}

export function updateInvoice(id: string, data: Partial<Invoice>): void {
  const user = getCurrentUser()!;
  const idx = appData.invoices.findIndex(i => i.id === id);
  if (idx === -1) return;
  appData.invoices[idx] = { ...appData.invoices[idx], ...data };
  addActivityLog(user.id, 'update', 'invoice', id, `Updated invoice: ${appData.invoices[idx].invoiceNumber}`);
  saveData(appData);
}

// Maintenance Plans
export function getMaintenancePlans(): MaintenancePlan[] {
  return appData.maintenancePlans;
}

export function updateMaintenancePlan(id: string, data: Partial<MaintenancePlan>): void {
  const user = getCurrentUser()!;
  const idx = appData.maintenancePlans.findIndex(p => p.id === id);
  if (idx === -1) return;
  appData.maintenancePlans[idx] = { ...appData.maintenancePlans[idx], ...data };
  addActivityLog(user.id, 'update', 'maintenance_plan', id, `Updated plan: ${appData.maintenancePlans[idx].name}`);
  saveData(appData);
}

// Maintenance Subscriptions
export function getMaintenanceSubscriptions(): MaintenanceSubscription[] {
  return appData.maintenanceSubscriptions;
}

export function addMaintenanceSubscription(data: Partial<MaintenanceSubscription>): MaintenanceSubscription {
  const user = getCurrentUser()!;
  const sub: MaintenanceSubscription = {
    id: uuidv4(),
    clientId: data.clientId || '',
    websiteDomain: data.websiteDomain || '',
    websiteUrl: data.websiteUrl || '',
    planId: data.planId || '',
    planType: data.planType || 'value',
    customPrice: data.customPrice || 0,
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    nextBillingDate: data.nextBillingDate || '',
    status: data.status || 'active',
    paymentMethod: data.paymentMethod || 'bank_transfer',
    lastPaymentDate: data.lastPaymentDate || '',
    lastMaintenanceDate: data.lastMaintenanceDate || '',
    nextMaintenanceDate: data.nextMaintenanceDate || '',
    assignedTo: data.assignedTo || '',
    contractNotes: data.contractNotes || '',
    createdAt: new Date().toISOString(),
  };
  appData.maintenanceSubscriptions.push(sub);
  addActivityLog(user.id, 'create', 'maintenance_subscription', sub.id, `Created maintenance subscription for ${sub.websiteDomain}`);
  saveData(appData);
  return sub;
}

export function updateMaintenanceSubscription(id: string, data: Partial<MaintenanceSubscription>): void {
  const user = getCurrentUser()!;
  const idx = appData.maintenanceSubscriptions.findIndex(s => s.id === id);
  if (idx === -1) return;
  appData.maintenanceSubscriptions[idx] = { ...appData.maintenanceSubscriptions[idx], ...data };
  addActivityLog(user.id, 'update', 'maintenance_subscription', id, `Updated subscription`);
  saveData(appData);
}

// Maintenance Tickets
export function getMaintenanceTickets(): MaintenanceTicket[] {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.role === 'developer') {
    return appData.maintenanceTickets.filter(t => t.assignedTo === user.id);
  }
  return appData.maintenanceTickets;
}

export function addMaintenanceTicket(data: Partial<MaintenanceTicket>): MaintenanceTicket {
  const user = getCurrentUser()!;
  const ticket: MaintenanceTicket = {
    id: uuidv4(),
    subscriptionId: data.subscriptionId || '',
    clientId: data.clientId || '',
    issueDescription: data.issueDescription || '',
    requestDate: data.requestDate || new Date().toISOString().split('T')[0],
    priority: data.priority || 'medium',
    assignedTo: data.assignedTo || '',
    expectedCompletion: data.expectedCompletion || '',
    workPerformed: data.workPerformed || '',
    status: data.status || 'new',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };
  appData.maintenanceTickets.push(ticket);
  addActivityLog(user.id, 'create', 'maintenance_ticket', ticket.id, `Created maintenance ticket`);
  if (ticket.assignedTo && ticket.assignedTo !== user.id) {
    addNotification(ticket.assignedTo, 'New Maintenance Task', `Maintenance ticket assigned to you`, 'assignment', '/maintenance');
  }
  saveData(appData);
  return ticket;
}

export function updateMaintenanceTicket(id: string, data: Partial<MaintenanceTicket>): void {
  const user = getCurrentUser()!;
  const idx = appData.maintenanceTickets.findIndex(t => t.id === id);
  if (idx === -1) return;
  appData.maintenanceTickets[idx] = { ...appData.maintenanceTickets[idx], ...data };
  addActivityLog(user.id, 'update', 'maintenance_ticket', id, `Updated maintenance ticket`);
  saveData(appData);
}

// Notifications
export function getNotifications(): Notification[] {
  const user = getCurrentUser();
  if (!user) return [];
  return appData.notifications.filter(n => n.userId === user.id);
}

export function markNotificationRead(id: string): void {
  const idx = appData.notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    appData.notifications[idx].read = true;
    saveData(appData);
  }
}

export function markAllNotificationsRead(): void {
  const user = getCurrentUser();
  if (!user) return;
  appData.notifications.forEach(n => {
    if (n.userId === user.id) n.read = true;
  });
  saveData(appData);
}

export function getUnreadCount(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  return appData.notifications.filter(n => n.userId === user.id && !n.read).length;
}

// Activity Logs
export function getActivityLogs(): ActivityLog[] {
  return appData.activityLogs;
}

// Files
export function getFiles(): AppFile[] {
  return appData.files;
}

export function addFile(data: Partial<AppFile>): AppFile {
  const user = getCurrentUser()!;
  const file: AppFile = {
    id: uuidv4(),
    name: data.name || '',
    type: data.type || '',
    size: data.size || 0,
    url: data.url || '',
    clientId: data.clientId,
    orderId: data.orderId,
    taskId: data.taskId,
    uploadedBy: user.id,
    createdAt: new Date().toISOString(),
  };
  appData.files.push(file);
  addActivityLog(user.id, 'upload', 'file', file.id, `Uploaded file: ${file.name}`);
  saveData(appData);
  return file;
}

// Settings
export function getSettings(): BusinessSettings {
  return appData.settings;
}

export function updateSettings(data: Partial<BusinessSettings>): void {
  const user = getCurrentUser()!;
  appData.settings = { ...appData.settings, ...data };
  addActivityLog(user.id, 'update', 'settings', 'settings', 'Updated business settings');
  saveData(appData);
}

// Users
export function getUsers(): User[] {
  return appData.users;
}

export function getUser(id: string): User | undefined {
  return appData.users.find(u => u.id === id);
}

// Analytics helpers
export function getDashboardStats() {
  const user = getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);

  const totalClients = appData.clients.length;
  const newLeads = appData.clients.filter(c => c.status === 'lead').length;
  const activeProjects = appData.orders.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).length;
  const completedProjects = appData.orders.filter(o => ['delivered', 'payment_completed', 'closed'].includes(o.status)).length;

  const monthPayments = appData.payments.filter(p => p.date.startsWith(thisMonth) && p.status === 'paid');
  const totalPaymentsMonth = monthPayments.reduce((s, p) => s + p.amount, 0);

  const outstandingBalances = appData.orders.reduce((s, o) => s + o.remainingBalance, 0);
  const totalExpenses = appData.expenses.filter(e => e.status === 'approved' || e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const totalRevenue = appData.payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const upcomingDeadlines = appData.orders
    .filter(o => o.internalDeadline && !['closed', 'delivered', 'payment_completed'].includes(o.status))
    .sort((a, b) => a.internalDeadline.localeCompare(b.internalDeadline))
    .slice(0, 5);

  const overdueTasks = appData.tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.deadline) return false;
    return t.deadline < new Date().toISOString().split('T')[0];
  });

  // Maintenance stats
  const activeSubscriptions = appData.maintenanceSubscriptions.filter(s => s.status === 'active');
  const mrr = activeSubscriptions.reduce((s, sub) => {
    const plan = appData.maintenancePlans.find(p => p.id === sub.planId);
    return s + (sub.customPrice || plan?.monthlyPrice || 0);
  }, 0);

  const overdueSubscriptions = appData.maintenanceSubscriptions.filter(s => s.status === 'overdue');

  return {
    totalClients,
    newLeads,
    activeProjects,
    completedProjects,
    totalPaymentsMonth,
    outstandingBalances,
    totalExpenses,
    netProfit,
    totalRevenue,
    upcomingDeadlines,
    overdueTasks,
    activeSubscriptions: activeSubscriptions.length,
    mrr,
    overdueSubscriptions: overdueSubscriptions.length,
    recentActivity: appData.activityLogs.slice(0, 10),
  };
}

// Export data as CSV
export function exportCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Check for overdue items and generate notifications
export function checkDeadlines(): void {
  const today = new Date().toISOString().split('T')[0];
  
  appData.orders.forEach(order => {
    if (order.internalDeadline && order.internalDeadline <= today && !['closed', 'delivered', 'payment_completed'].includes(order.status)) {
      const existing = appData.notifications.find(n => 
        n.title.includes(order.orderNumber) && n.type === 'deadline' && n.createdAt.startsWith(today)
      );
      if (!existing) {
        addNotification('usr_sharjeel', 'Overdue Project', `Order ${order.orderNumber} has passed its deadline`, 'deadline', '/orders');
        if (order.assignedDeveloper) {
          addNotification(order.assignedDeveloper, 'Overdue Project', `Order ${order.orderNumber} deadline has passed`, 'deadline', '/orders');
        }
      }
    }
  });

  appData.tasks.forEach(task => {
    if (task.deadline && task.deadline <= today && task.status !== 'completed') {
      const existing = appData.notifications.find(n =>
        n.title.includes(task.title) && n.type === 'deadline' && n.createdAt.startsWith(today)
      );
      if (!existing) {
        addNotification(task.assignedTo, 'Overdue Task', `Task "${task.title}" is overdue`, 'deadline', '/tasks');
      }
    }
  });

  saveData(appData);
}
