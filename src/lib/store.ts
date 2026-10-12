import { v4 as uuidv4 } from 'uuid';
import type { User, Client, Order, Task, Payment, Expense, Invoice, MaintenancePlan, MaintenanceSubscription, MaintenanceTicket, Notification, ActivityLog, AppFile, BusinessSettings } from './types';

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

const defaultPlans: MaintenancePlan[] = [
  { id: 'plan_value', name: 'Value Maintenance Plan', type: 'value', monthlyPrice: 0, features: ['Basic website maintenance', 'Minor updates', 'Bug fixes', 'Uptime checks', 'Basic support'], maxUpdates: 5, maxSupportTickets: 3, isActive: true },
  { id: 'plan_pro', name: 'Pro Maintenance Plan', type: 'pro', monthlyPrice: 0, features: ['Everything in Value', 'Priority support', 'Frequent checks', 'Design improvements', 'Performance checks', 'Backup assistance', 'Monthly report'], maxUpdates: 15, maxSupportTickets: 10, isActive: true },
];

function getDefault(): AppData {
  return {
    users: defaultUsers,
    clients: [],
    orders: [],
    tasks: [],
    payments: [],
    expenses: [],
    invoices: [],
    maintenancePlans: defaultPlans,
    maintenanceSubscriptions: [],
    maintenanceTickets: [],
    notifications: [],
    activityLogs: [],
    files: [],
    settings: defaultSettings,
    currentUser: null,
  };
}

function load(): AppData {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...getDefault(), ...JSON.parse(s) };
  } catch {}
  return getDefault();
}

function save(d: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {}
}

let D: AppData = load();
const PW: Record<string, string> = {
  'sharjeel@agswebworks.com': 'AGS@CEO2024!',
  'gufran@agswebworks.com': 'AGS@Dev2024!',
  'addan@agswebworks.com': 'AGS@Acc2024!',
};

function log(userId: string, action: string, entity: string, entityId: string, details: string) {
  D.activityLogs.unshift({ id: uuidv4(), userId, action, entity, entityId, details, createdAt: new Date().toISOString() });
  if (D.activityLogs.length > 500) D.activityLogs = D.activityLogs.slice(0, 500);
  save(D);
}

function notify(userId: string, title: string, message: string, type: string, link?: string) {
  D.notifications.unshift({ id: uuidv4(), userId, title, message, type, read: false, link, createdAt: new Date().toISOString() });
  save(D);
}

// Auth
export function login(email: string, password: string) {
  const u = D.users.find(x => x.email === email);
  if (!u) return { success: false, error: 'Invalid credentials' };
  if (PW[email] !== password) return { success: false, error: 'Invalid credentials' };
  D.currentUser = u.id;
  save(D);
  log(u.id, 'login', 'auth', u.id, `${u.name} logged in`);
  return { success: true, user: u };
}

export function logout() {
  if (D.currentUser) log(D.currentUser, 'logout', 'auth', D.currentUser, 'Logged out');
  D.currentUser = null;
  save(D);
}

export function me(): User | null {
  return D.currentUser ? D.users.find(u => u.id === D.currentUser) || null : null;
}

// Clients
export function getClients() {
  const u = me();
  if (!u) return [];
  return u.role === 'developer' ? D.clients.filter(c => c.assignedTo === u.id) : D.clients;
}

export function getClient(id: string) {
  return D.clients.find(c => c.id === id);
}

export function addClient(d: Partial<Client>) {
  const u = me()!;
  const c: Client = {
    id: uuidv4(),
    businessName: d.businessName || '',
    category: d.category || '',
    contactPerson: d.contactPerson || '',
    phone: d.phone || '',
    whatsapp: d.whatsapp || '',
    email: d.email || '',
    location: d.location || '',
    googleMapsLink: d.googleMapsLink || '',
    websiteUrl: d.websiteUrl || '',
    socialMedia: d.socialMedia || '',
    serviceRequested: d.serviceRequested || '',
    quotedPrice: d.quotedPrice || 0,
    agreedPrice: d.agreedPrice || 0,
    leadSource: d.leadSource || '',
    acquisitionDate: d.acquisitionDate || new Date().toISOString().split('T')[0],
    assignedTo: d.assignedTo || u.id,
    status: d.status || 'lead',
    notes: d.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  D.clients.push(c);
  log(u.id, 'create', 'client', c.id, `Created client: ${c.businessName}`);
  save(D);
  return c;
}

export function updateClient(id: string, d: Partial<Client>) {
  const u = me()!;
  const i = D.clients.findIndex(c => c.id === id);
  if (i < 0) return;
  D.clients[i] = { ...D.clients[i], ...d, updatedAt: new Date().toISOString() };
  log(u.id, 'update', 'client', id, 'Updated client');
  save(D);
}

export function deleteClient(id: string) {
  const u = me()!;
  D.clients = D.clients.filter(c => c.id !== id);
  log(u.id, 'delete', 'client', id, 'Deleted client');
  save(D);
}

// Orders
export function getOrders() {
  const u = me();
  if (!u) return [];
  return u.role === 'developer' ? D.orders.filter(o => o.assignedDeveloper === u.id) : D.orders;
}

export function addOrder(d: Partial<Order>) {
  const u = me()!;
  const n = `${D.settings.orderPrefix}-${String(D.orders.length + 1).padStart(4, '0')}`;
  const o: Order = {
    id: uuidv4(),
    orderNumber: n,
    clientId: d.clientId || '',
    serviceType: d.serviceType || '',
    description: d.description || '',
    createdAt: new Date().toISOString(),
    assignedDeveloper: d.assignedDeveloper || '',
    assignedCoordinator: d.assignedCoordinator || 'usr_addan',
    price: d.price || 0,
    advancePayment: d.advancePayment || 0,
    remainingBalance: (d.price || 0) - (d.advancePayment || 0),
    startDate: d.startDate || new Date().toISOString().split('T')[0],
    internalDeadline: d.internalDeadline || '',
    deliveryDate: d.deliveryDate || '',
    priority: d.priority || 'medium',
    status: d.status || 'lead_received',
    previewUrl: '',
    liveUrl: '',
    repositoryUrl: '',
    notes: d.notes || '',
    revisionHistory: '',
    createdAt_timestamp: Date.now(),
  };
  D.orders.push(o);
  log(u.id, 'create', 'order', o.id, `Created order: ${n}`);
  if (o.assignedDeveloper) notify(o.assignedDeveloper, 'New Project', `Order ${n} assigned`, 'assignment', '/orders');
  save(D);
  return o;
}

export function updateOrder(id: string, d: Partial<Order>) {
  const u = me()!;
  const i = D.orders.findIndex(o => o.id === id);
  if (i < 0) return;
  const up = { ...D.orders[i], ...d };
  up.remainingBalance = up.price - up.advancePayment;
  D.orders[i] = up;
  log(u.id, 'update', 'order', id, 'Updated order');
  save(D);
}

// Tasks
export function getTasks() {
  const u = me();
  if (!u) return [];
  return u.role === 'developer' ? D.tasks.filter(t => t.assignedTo === u.id) : D.tasks;
}

export function addTask(d: Partial<Task>) {
  const u = me()!;
  const t: Task = {
    id: uuidv4(),
    title: d.title || '',
    description: d.description || '',
    clientId: d.clientId,
    orderId: d.orderId,
    assignedTo: d.assignedTo || '',
    createdBy: u.id,
    priority: d.priority || 'medium',
    startDate: d.startDate || new Date().toISOString().split('T')[0],
    deadline: d.deadline || '',
    status: d.status || 'todo',
    comments: d.comments || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  D.tasks.push(t);
  log(u.id, 'create', 'task', t.id, `Created task: ${t.title}`);
  if (t.assignedTo && t.assignedTo !== u.id) notify(t.assignedTo, 'New Task', `Task "${t.title}" assigned`, 'assignment', '/tasks');
  save(D);
  return t;
}

export function updateTask(id: string, d: Partial<Task>) {
  const u = me()!;
  const i = D.tasks.findIndex(t => t.id === id);
  if (i < 0) return;
  D.tasks[i] = { ...D.tasks[i], ...d, updatedAt: new Date().toISOString() };
  log(u.id, 'update', 'task', id, 'Updated task');
  save(D);
}

export function deleteTask(id: string) {
  const u = me()!;
  D.tasks = D.tasks.filter(t => t.id !== id);
  log(u.id, 'delete', 'task', id, 'Deleted task');
  save(D);
}

// Payments
export function getPayments() {
  return D.payments;
}

export function addPayment(d: Partial<Payment>) {
  const u = me()!;
  const p: Payment = {
    id: uuidv4(),
    orderId: d.orderId,
    clientId: d.clientId || '',
    amount: d.amount || 0,
    date: d.date || new Date().toISOString().split('T')[0],
    method: d.method || 'bank_transfer',
    status: d.status || 'paid',
    reference: d.reference || '',
    notes: d.notes || '',
    type: d.type || 'project_payment',
    createdAt: new Date().toISOString(),
  };
  D.payments.push(p);
  if (d.orderId) {
    const o = D.orders.find(x => x.id === d.orderId);
    if (o) {
      const tot = D.payments.filter(x => x.orderId === d.orderId && x.status === 'paid').reduce((s, x) => s + x.amount, 0);
      o.advancePayment = tot;
      o.remainingBalance = o.price - tot;
    }
  }
  log(u.id, 'create', 'payment', p.id, `Payment: ${p.amount} SAR`);
  save(D);
  return p;
}

export function updatePayment(id: string, d: Partial<Payment>) {
  const u = me()!;
  const i = D.payments.findIndex(p => p.id === id);
  if (i < 0) return;
  const oldStatus = D.payments[i].status;
  D.payments[i] = { ...D.payments[i], ...d };
  if (D.payments[i].orderId) {
    const o = D.orders.find(x => x.id === D.payments[i].orderId);
    if (o) {
      const tot = D.payments.filter(x => x.orderId === o.id && x.status === 'paid').reduce((s, x) => s + x.amount, 0);
      o.advancePayment = tot;
      o.remainingBalance = o.price - tot;
    }
  }
  log(u.id, 'update', 'payment', id, `Payment status: ${oldStatus} → ${d.status}`);
  save(D);
}

// Expenses
export function getExpenses() {
  return D.expenses;
}

export function addExpense(d: Partial<Expense>) {
  const u = me()!;
  const e: Expense = {
    id: uuidv4(),
    category: d.category || '',
    amount: d.amount || 0,
    date: d.date || new Date().toISOString().split('T')[0],
    description: d.description || '',
    paymentMethod: d.paymentMethod || 'bank_transfer',
    reference: d.reference || '',
    approvedBy: d.approvedBy || '',
    status: d.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  D.expenses.push(e);
  log(u.id, 'create', 'expense', e.id, 'Recorded expense');
  save(D);
  return e;
}

export function updateExpense(id: string, d: Partial<Expense>) {
  const u = me()!;
  const i = D.expenses.findIndex(e => e.id === id);
  if (i < 0) return;
  D.expenses[i] = { ...D.expenses[i], ...d };
  log(u.id, 'update', 'expense', id, 'Updated expense');
  save(D);
}

// Invoices
export function getInvoices() {
  return D.invoices;
}

export function addInvoice(d: Partial<Invoice>) {
  const u = me()!;
  const n = `${D.settings.invoicePrefix}-${String(D.invoices.length + 1).padStart(4, '0')}`;
  const sub = d.items?.reduce((s, i) => s + i.total, 0) || 0;
  const tax = sub * (D.settings.taxRate / 100);
  const inv: Invoice = {
    id: uuidv4(),
    invoiceNumber: n,
    clientId: d.clientId || '',
    orderId: d.orderId,
    subscriptionId: d.subscriptionId,
    items: d.items || [],
    subtotal: sub,
    tax,
    total: sub + tax,
    status: d.status || 'draft',
    issueDate: d.issueDate || new Date().toISOString().split('T')[0],
    dueDate: d.dueDate || '',
    notes: d.notes || '',
    createdAt: new Date().toISOString(),
  };
  D.invoices.push(inv);
  log(u.id, 'create', 'invoice', inv.id, `Invoice: ${n}`);
  save(D);
  return inv;
}

// Maintenance
export function getPlans() {
  return D.maintenancePlans;
}

export function updatePlan(id: string, d: Partial<MaintenancePlan>) {
  const u = me()!;
  const i = D.maintenancePlans.findIndex(p => p.id === id);
  if (i < 0) return;
  D.maintenancePlans[i] = { ...D.maintenancePlans[i], ...d };
  log(u.id, 'update', 'plan', id, 'Updated plan');
  save(D);
}

export function getSubs() {
  return D.maintenanceSubscriptions;
}

export function addSub(d: Partial<MaintenanceSubscription>) {
  const u = me()!;
  const s: MaintenanceSubscription = {
    id: uuidv4(),
    clientId: d.clientId || '',
    websiteDomain: d.websiteDomain || '',
    websiteUrl: d.websiteUrl || '',
    planId: d.planId || '',
    planType: d.planType || 'value',
    customPrice: d.customPrice || 0,
    startDate: d.startDate || new Date().toISOString().split('T')[0],
    nextBillingDate: d.nextBillingDate || '',
    status: d.status || 'active',
    paymentMethod: d.paymentMethod || 'bank_transfer',
    lastPaymentDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    assignedTo: d.assignedTo || '',
    contractNotes: d.contractNotes || '',
    createdAt: new Date().toISOString(),
  };
  D.maintenanceSubscriptions.push(s);
  log(u.id, 'create', 'sub', s.id, 'Created subscription');
  save(D);
  return s;
}

export function getTickets() {
  const u = me();
  if (!u) return [];
  return u.role === 'developer' ? D.maintenanceTickets.filter(t => t.assignedTo === u.id) : D.maintenanceTickets;
}

export function addTicket(d: Partial<MaintenanceTicket>) {
  const u = me()!;
  const t: MaintenanceTicket = {
    id: uuidv4(),
    subscriptionId: d.subscriptionId || '',
    clientId: d.clientId || '',
    issueDescription: d.issueDescription || '',
    requestDate: d.requestDate || new Date().toISOString().split('T')[0],
    priority: d.priority || 'medium',
    assignedTo: d.assignedTo || '',
    expectedCompletion: d.expectedCompletion || '',
    workPerformed: '',
    status: d.status || 'new',
    notes: d.notes || '',
    createdAt: new Date().toISOString(),
  };
  D.maintenanceTickets.push(t);
  log(u.id, 'create', 'ticket', t.id, 'Created ticket');
  save(D);
  return t;
}

export function updateTicket(id: string, d: Partial<MaintenanceTicket>) {
  const u = me()!;
  const i = D.maintenanceTickets.findIndex(t => t.id === id);
  if (i < 0) return;
  D.maintenanceTickets[i] = { ...D.maintenanceTickets[i], ...d };
  log(u.id, 'update', 'ticket', id, 'Updated ticket');
  save(D);
}

// Notifications
export function getNotifs() {
  const u = me();
  return u ? D.notifications.filter(n => n.userId === u.id) : [];
}

export function markRead(id: string) {
  const i = D.notifications.findIndex(n => n.id === id);
  if (i >= 0) {
    D.notifications[i].read = true;
    save(D);
  }
}

export function markAllRead() {
  const u = me();
  if (!u) return;
  D.notifications.forEach(n => {
    if (n.userId === u.id) n.read = true;
  });
  save(D);
}

export function unread() {
  const u = me();
  return u ? D.notifications.filter(n => n.userId === u.id && !n.read).length : 0;
}

export function getLogs() {
  return D.activityLogs;
}

export function getFiles() {
  return D.files;
}

export function addFile(d: Partial<AppFile>) {
  const u = me()!;
  const f: AppFile = {
    id: uuidv4(),
    name: d.name || '',
    type: d.type || '',
    size: d.size || 0,
    url: d.url || '',
    clientId: d.clientId,
    orderId: d.orderId,
    taskId: d.taskId,
    uploadedBy: u.id,
    createdAt: new Date().toISOString(),
  };
  D.files.push(f);
  log(u.id, 'upload', 'file', f.id, 'Uploaded file');
  save(D);
  return f;
}

export function getSettings() {
  return D.settings;
}

export function updateSettings(d: Partial<BusinessSettings>) {
  const u = me()!;
  D.settings = { ...D.settings, ...d };
  log(u.id, 'update', 'settings', 'settings', 'Updated settings');
  save(D);
}

export function getUsers() {
  return D.users;
}

export function getUser(id: string) {
  return D.users.find(u => u.id === id);
}

export function stats() {
  const u = me();
  if (!u) return null;
  const m = new Date().toISOString().slice(0, 7);
  const tc = D.clients.length;
  const nl = D.clients.filter(c => c.status === 'lead').length;
  const ap = D.orders.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).length;
  const cp = D.orders.filter(o => ['delivered', 'payment_completed', 'closed'].includes(o.status)).length;
  const mp = D.payments.filter(p => p.date.startsWith(m) && p.status === 'paid');
  const tpm = mp.reduce((s, p) => s + p.amount, 0);
  const ob = D.orders.reduce((s, o) => s + o.remainingBalance, 0);
  const te = D.expenses.filter(e => e.status === 'approved' || e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
  const tr = D.payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const np = tr - te;
  const ud = D.orders
    .filter(o => o.internalDeadline && !['closed', 'delivered', 'payment_completed'].includes(o.status))
    .sort((a, b) => a.internalDeadline.localeCompare(b.internalDeadline))
    .slice(0, 5);
  const ot = D.tasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline < new Date().toISOString().split('T')[0]);
  const as = D.maintenanceSubscriptions.filter(s => s.status === 'active');
  const mrr = as.reduce((s, sub) => {
    const p = D.maintenancePlans.find(x => x.id === sub.planId);
    return s + (sub.customPrice || p?.monthlyPrice || 0);
  }, 0);
  return { tc, nl, ap, cp, tpm, ob, te, np, tr, ud, ot, as: as.length, mrr, ra: D.activityLogs.slice(0, 10) };
}

export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const h = Object.keys(data[0]);
  const csv = [h.join(','), ...data.map(r => h.map(k => {
    const v = r[k];
    return typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v ?? '');
  }).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
