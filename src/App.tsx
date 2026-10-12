import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import {
  LayoutDashboard, Users, ShoppingCart, CheckSquare, CreditCard,
  TrendingDown, UserCog, FolderOpen, BarChart3, Bell, Settings as SettingsIcon,
  Wrench, LogOut, Menu, X, Moon, Sun, Search, Lock, Mail, Eye, EyeOff,
  AlertCircle, Plus, Edit2, Trash2, Phone, MapPin,
  LayoutGrid, List, Calendar, FileText, Download, Printer,
  Shield, Code, Calculator, Upload, Image, Film, File as FileIcon,
  TrendingUp, DollarSign, CheckCircle, Clock, AlertTriangle,
  Activity, ArrowUpRight, ArrowDownRight, Save, Building2, Globe,
  Check, CheckCheck, Info
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type UserRole = 'ceo' | 'developer' | 'accountant';
type ClientStatus = 'lead' | 'contacted' | 'interested' | 'negotiation' | 'won' | 'active' | 'lost';
type OrderStatus = 'lead_received' | 'contacted' | 'quotation_sent' | 'confirmed' | 'in_progress' | 'internal_review' | 'client_review' | 'revisions' | 'ready_delivery' | 'delivered' | 'payment_completed' | 'closed';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'review' | 'completed';
type PaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'other';

interface User { id: string; name: string; email: string; role: UserRole; createdAt: string; }
interface Client { id: string; businessName: string; category: string; contactPerson: string; phone: string; whatsapp: string; email: string; location: string; googleMapsLink: string; websiteUrl: string; socialMedia: string; serviceRequested: string; quotedPrice: number; agreedPrice: number; leadSource: string; acquisitionDate: string; assignedTo: string; status: ClientStatus; notes: string; createdAt: string; updatedAt: string; }
interface Order { id: string; orderNumber: string; clientId: string; serviceType: string; description: string; createdAt: string; assignedDeveloper: string; assignedCoordinator: string; price: number; advancePayment: number; remainingBalance: number; startDate: string; internalDeadline: string; deliveryDate: string; priority: Priority; status: OrderStatus; previewUrl: string; liveUrl: string; repositoryUrl: string; notes: string; revisionHistory: string; createdAt_timestamp: number; }
interface Task { id: string; title: string; description: string; clientId?: string; orderId?: string; assignedTo: string; createdBy: string; priority: Priority; startDate: string; deadline: string; status: TaskStatus; comments: string; createdAt: string; updatedAt: string; }
interface Payment { id: string; orderId?: string; clientId: string; amount: number; date: string; method: PaymentMethod; status: string; reference: string; notes: string; type: string; createdAt: string; }
interface Expense { id: string; category: string; amount: number; date: string; description: string; paymentMethod: string; reference: string; approvedBy: string; status: string; createdAt: string; }
interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number; }
interface Invoice { id: string; invoiceNumber: string; clientId: string; orderId?: string; subscriptionId?: string; items: InvoiceItem[]; subtotal: number; tax: number; total: number; status: string; issueDate: string; dueDate: string; notes: string; createdAt: string; }
interface MaintenancePlan { id: string; name: string; type: string; monthlyPrice: number; features: string[]; maxUpdates: number; maxSupportTickets: number; isActive: boolean; }
interface MaintenanceSubscription { id: string; clientId: string; websiteDomain: string; websiteUrl: string; planId: string; planType: string; customPrice: number; startDate: string; nextBillingDate: string; status: string; paymentMethod: string; lastPaymentDate: string; lastMaintenanceDate: string; nextMaintenanceDate: string; assignedTo: string; contractNotes: string; createdAt: string; }
interface MaintenanceTicket { id: string; subscriptionId: string; clientId: string; issueDescription: string; requestDate: string; priority: Priority; assignedTo: string; expectedCompletion: string; workPerformed: string; status: string; notes: string; createdAt: string; }
interface Notification { id: string; userId: string; title: string; message: string; type: string; read: boolean; link?: string; createdAt: string; }
interface ActivityLog { id: string; userId: string; action: string; entity: string; entityId: string; details: string; createdAt: string; }
interface AppFile { id: string; name: string; type: string; size: number; url: string; clientId?: string; orderId?: string; taskId?: string; uploadedBy: string; createdAt: string; }
interface BusinessSettings { companyName: string; companyEmail: string; companyPhone: string; companyAddress: string; currency: string; timezone: string; taxRate: number; invoicePrefix: string; orderPrefix: string; }

// ============================================================================
// STORE
// ============================================================================
const STORAGE_KEY = 'ags_webworks_data';
interface AppData { users: User[]; clients: Client[]; orders: Order[]; tasks: Task[]; payments: Payment[]; expenses: Expense[]; invoices: Invoice[]; maintenancePlans: MaintenancePlan[]; maintenanceSubscriptions: MaintenanceSubscription[]; maintenanceTickets: MaintenanceTicket[]; notifications: Notification[]; activityLogs: ActivityLog[]; files: AppFile[]; settings: BusinessSettings; currentUser: string | null; }

const defaultUsers: User[] = [
  { id: 'usr_sharjeel', name: 'Sharjeel', email: 'sharjeel@agswebworks.com', role: 'ceo', createdAt: '2024-01-01' },
  { id: 'usr_gufran', name: 'Gufran', email: 'gufran@agswebworks.com', role: 'developer', createdAt: '2024-01-01' },
  { id: 'usr_addan', name: 'Addan', email: 'addan@agswebworks.com', role: 'accountant', createdAt: '2024-01-01' },
];

const defaultSettings: BusinessSettings = { companyName: 'AGS WEBWORKS', companyEmail: 'info@agswebworks.com', companyPhone: '+966 XX XXX XXXX', companyAddress: 'Dammam / Al Khobar, Saudi Arabia', currency: 'SAR', timezone: 'Asia/Riyadh', taxRate: 15, invoicePrefix: 'INV', orderPrefix: 'ORD' };

const defaultPlans: MaintenancePlan[] = [
  { id: 'plan_value', name: 'Value Maintenance Plan', type: 'value', monthlyPrice: 0, features: ['Basic website maintenance', 'Minor updates', 'Bug fixes', 'Uptime checks', 'Basic support'], maxUpdates: 5, maxSupportTickets: 3, isActive: true },
  { id: 'plan_pro', name: 'Pro Maintenance Plan', type: 'pro', monthlyPrice: 0, features: ['Everything in Value', 'Priority support', 'Frequent checks', 'Design improvements', 'Performance checks', 'Backup assistance', 'Monthly report'], maxUpdates: 15, maxSupportTickets: 10, isActive: true },
];

function getDefault(): AppData { return { users: defaultUsers, clients: [], orders: [], tasks: [], payments: [], expenses: [], invoices: [], maintenancePlans: defaultPlans, maintenanceSubscriptions: [], maintenanceTickets: [], notifications: [], activityLogs: [], files: [], settings: defaultSettings, currentUser: null }; }
function load(): AppData { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return { ...getDefault(), ...JSON.parse(s) }; } catch {} return getDefault(); }
function save(d: AppData) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

let D: AppData = load();
const PW: Record<string, string> = { 'sharjeel@agswebworks.com': 'AGS@CEO2024!', 'gufran@agswebworks.com': 'AGS@Dev2024!', 'addan@agswebworks.com': 'AGS@Acc2024!' };

function log(userId: string, action: string, entity: string, entityId: string, details: string) { D.activityLogs.unshift({ id: uuidv4(), userId, action, entity, entityId, details, createdAt: new Date().toISOString() }); if (D.activityLogs.length > 500) D.activityLogs = D.activityLogs.slice(0, 500); save(D); }
function notify(userId: string, title: string, message: string, type: string, link?: string) { D.notifications.unshift({ id: uuidv4(), userId, title, message, type, read: false, link, createdAt: new Date().toISOString() }); save(D); }

function login(email: string, password: string) { const u = D.users.find(x => x.email === email); if (!u) return { success: false, error: 'Invalid credentials' }; if (PW[email] !== password) return { success: false, error: 'Invalid credentials' }; D.currentUser = u.id; save(D); log(u.id, 'login', 'auth', u.id, `${u.name} logged in`); return { success: true, user: u }; }
function logout() { if (D.currentUser) log(D.currentUser, 'logout', 'auth', D.currentUser, 'Logged out'); D.currentUser = null; save(D); }
function me(): User | null { return D.currentUser ? D.users.find(u => u.id === D.currentUser) || null : null; }

function getClients() { const u = me(); if (!u) return []; return u.role === 'developer' ? D.clients.filter(c => c.assignedTo === u.id) : D.clients; }
function getClient(id: string) { return D.clients.find(c => c.id === id); }
function addClient(d: Partial<Client>) { const u = me()!; const c: Client = { id: uuidv4(), businessName: d.businessName || '', category: d.category || '', contactPerson: d.contactPerson || '', phone: d.phone || '', whatsapp: d.whatsapp || '', email: d.email || '', location: d.location || '', googleMapsLink: d.googleMapsLink || '', websiteUrl: d.websiteUrl || '', socialMedia: d.socialMedia || '', serviceRequested: d.serviceRequested || '', quotedPrice: d.quotedPrice || 0, agreedPrice: d.agreedPrice || 0, leadSource: d.leadSource || '', acquisitionDate: d.acquisitionDate || new Date().toISOString().split('T')[0], assignedTo: d.assignedTo || u.id, status: d.status || 'lead', notes: d.notes || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; D.clients.push(c); log(u.id, 'create', 'client', c.id, `Created client: ${c.businessName}`); save(D); return c; }
function updateClient(id: string, d: Partial<Client>) { const u = me()!; const i = D.clients.findIndex(c => c.id === id); if (i < 0) return; D.clients[i] = { ...D.clients[i], ...d, updatedAt: new Date().toISOString() }; log(u.id, 'update', 'client', id, 'Updated client'); save(D); }
function deleteClient(id: string) { const u = me()!; D.clients = D.clients.filter(c => c.id !== id); log(u.id, 'delete', 'client', id, 'Deleted client'); save(D); }

function getOrders() { const u = me(); if (!u) return []; return u.role === 'developer' ? D.orders.filter(o => o.assignedDeveloper === u.id) : D.orders; }
function addOrder(d: Partial<Order>) { const u = me()!; const n = `${D.settings.orderPrefix}-${String(D.orders.length + 1).padStart(4, '0')}`; const o: Order = { id: uuidv4(), orderNumber: n, clientId: d.clientId || '', serviceType: d.serviceType || '', description: d.description || '', createdAt: new Date().toISOString(), assignedDeveloper: d.assignedDeveloper || '', assignedCoordinator: d.assignedCoordinator || 'usr_addan', price: d.price || 0, advancePayment: d.advancePayment || 0, remainingBalance: (d.price || 0) - (d.advancePayment || 0), startDate: d.startDate || new Date().toISOString().split('T')[0], internalDeadline: d.internalDeadline || '', deliveryDate: d.deliveryDate || '', priority: d.priority || 'medium', status: d.status || 'lead_received', previewUrl: '', liveUrl: '', repositoryUrl: '', notes: d.notes || '', revisionHistory: '', createdAt_timestamp: Date.now() }; D.orders.push(o); log(u.id, 'create', 'order', o.id, `Created order: ${n}`); if (o.assignedDeveloper) notify(o.assignedDeveloper, 'New Project', `Order ${n} assigned`, 'assignment', '/orders'); save(D); return o; }
function updateOrder(id: string, d: Partial<Order>) { const u = me()!; const i = D.orders.findIndex(o => o.id === id); if (i < 0) return; const up = { ...D.orders[i], ...d }; up.remainingBalance = up.price - up.advancePayment; D.orders[i] = up; log(u.id, 'update', 'order', id, 'Updated order'); save(D); }

function getTasks() { const u = me(); if (!u) return []; return u.role === 'developer' ? D.tasks.filter(t => t.assignedTo === u.id) : D.tasks; }
function addTask(d: Partial<Task>) { const u = me()!; const t: Task = { id: uuidv4(), title: d.title || '', description: d.description || '', clientId: d.clientId, orderId: d.orderId, assignedTo: d.assignedTo || '', createdBy: u.id, priority: d.priority || 'medium', startDate: d.startDate || new Date().toISOString().split('T')[0], deadline: d.deadline || '', status: d.status || 'todo', comments: d.comments || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; D.tasks.push(t); log(u.id, 'create', 'task', t.id, `Created task: ${t.title}`); if (t.assignedTo && t.assignedTo !== u.id) notify(t.assignedTo, 'New Task', `Task "${t.title}" assigned`, 'assignment', '/tasks'); save(D); return t; }
function updateTask(id: string, d: Partial<Task>) { const u = me()!; const i = D.tasks.findIndex(t => t.id === id); if (i < 0) return; D.tasks[i] = { ...D.tasks[i], ...d, updatedAt: new Date().toISOString() }; log(u.id, 'update', 'task', id, 'Updated task'); save(D); }
function deleteTask(id: string) { const u = me()!; D.tasks = D.tasks.filter(t => t.id !== id); log(u.id, 'delete', 'task', id, 'Deleted task'); save(D); }

function getPayments() { return D.payments; }
function addPayment(d: Partial<Payment>) { const u = me()!; const p: Payment = { id: uuidv4(), orderId: d.orderId, clientId: d.clientId || '', amount: d.amount || 0, date: d.date || new Date().toISOString().split('T')[0], method: d.method || 'bank_transfer', status: d.status || 'paid', reference: d.reference || '', notes: d.notes || '', type: d.type || 'project_payment', createdAt: new Date().toISOString() }; D.payments.push(p); if (d.orderId) { const o = D.orders.find(x => x.id === d.orderId); if (o) { const tot = D.payments.filter(x => x.orderId === d.orderId && x.status === 'paid').reduce((s, x) => s + x.amount, 0); o.advancePayment = tot; o.remainingBalance = o.price - tot; } } log(u.id, 'create', 'payment', p.id, `Payment: ${p.amount} SAR`); save(D); return p; }

function getExpenses() { return D.expenses; }
function addExpense(d: Partial<Expense>) { const u = me()!; const e: Expense = { id: uuidv4(), category: d.category || '', amount: d.amount || 0, date: d.date || new Date().toISOString().split('T')[0], description: d.description || '', paymentMethod: d.paymentMethod || 'bank_transfer', reference: d.reference || '', approvedBy: d.approvedBy || '', status: d.status || 'pending', createdAt: new Date().toISOString() }; D.expenses.push(e); log(u.id, 'create', 'expense', e.id, 'Recorded expense'); save(D); return e; }
function updateExpense(id: string, d: Partial<Expense>) { const u = me()!; const i = D.expenses.findIndex(e => e.id === id); if (i < 0) return; D.expenses[i] = { ...D.expenses[i], ...d }; log(u.id, 'update', 'expense', id, 'Updated expense'); save(D); }

function getInvoices() { return D.invoices; }
function addInvoice(d: Partial<Invoice>) { const u = me()!; const n = `${D.settings.invoicePrefix}-${String(D.invoices.length + 1).padStart(4, '0')}`; const sub = d.items?.reduce((s, i) => s + i.total, 0) || 0; const tax = sub * (D.settings.taxRate / 100); const inv: Invoice = { id: uuidv4(), invoiceNumber: n, clientId: d.clientId || '', orderId: d.orderId, subscriptionId: d.subscriptionId, items: d.items || [], subtotal: sub, tax, total: sub + tax, status: d.status || 'draft', issueDate: d.issueDate || new Date().toISOString().split('T')[0], dueDate: d.dueDate || '', notes: d.notes || '', createdAt: new Date().toISOString() }; D.invoices.push(inv); log(u.id, 'create', 'invoice', inv.id, `Invoice: ${n}`); save(D); return inv; }

function getPlans() { return D.maintenancePlans; }
function updatePlan(id: string, d: Partial<MaintenancePlan>) { const u = me()!; const i = D.maintenancePlans.findIndex(p => p.id === id); if (i < 0) return; D.maintenancePlans[i] = { ...D.maintenancePlans[i], ...d }; log(u.id, 'update', 'plan', id, 'Updated plan'); save(D); }
function getSubs() { return D.maintenanceSubscriptions; }
function addSub(d: Partial<MaintenanceSubscription>) { const u = me()!; const s: MaintenanceSubscription = { id: uuidv4(), clientId: d.clientId || '', websiteDomain: d.websiteDomain || '', websiteUrl: d.websiteUrl || '', planId: d.planId || '', planType: d.planType || 'value', customPrice: d.customPrice || 0, startDate: d.startDate || new Date().toISOString().split('T')[0], nextBillingDate: d.nextBillingDate || '', status: d.status || 'active', paymentMethod: d.paymentMethod || 'bank_transfer', lastPaymentDate: '', lastMaintenanceDate: '', nextMaintenanceDate: '', assignedTo: d.assignedTo || '', contractNotes: d.contractNotes || '', createdAt: new Date().toISOString() }; D.maintenanceSubscriptions.push(s); log(u.id, 'create', 'sub', s.id, 'Created subscription'); save(D); return s; }
function getTickets() { const u = me(); if (!u) return []; return u.role === 'developer' ? D.maintenanceTickets.filter(t => t.assignedTo === u.id) : D.maintenanceTickets; }
function addTicket(d: Partial<MaintenanceTicket>) { const u = me()!; const t: MaintenanceTicket = { id: uuidv4(), subscriptionId: d.subscriptionId || '', clientId: d.clientId || '', issueDescription: d.issueDescription || '', requestDate: d.requestDate || new Date().toISOString().split('T')[0], priority: d.priority || 'medium', assignedTo: d.assignedTo || '', expectedCompletion: d.expectedCompletion || '', workPerformed: '', status: d.status || 'new', notes: d.notes || '', createdAt: new Date().toISOString() }; D.maintenanceTickets.push(t); log(u.id, 'create', 'ticket', t.id, 'Created ticket'); save(D); return t; }
function updateTicket(id: string, d: Partial<MaintenanceTicket>) { const u = me()!; const i = D.maintenanceTickets.findIndex(t => t.id === id); if (i < 0) return; D.maintenanceTickets[i] = { ...D.maintenanceTickets[i], ...d }; log(u.id, 'update', 'ticket', id, 'Updated ticket'); save(D); }

function getNotifs() { const u = me(); return u ? D.notifications.filter(n => n.userId === u.id) : []; }
function markRead(id: string) { const i = D.notifications.findIndex(n => n.id === id); if (i >= 0) { D.notifications[i].read = true; save(D); } }
function markAllRead() { const u = me(); if (!u) return; D.notifications.forEach(n => { if (n.userId === u.id) n.read = true; }); save(D); }
function unread() { const u = me(); return u ? D.notifications.filter(n => n.userId === u.id && !n.read).length : 0; }
function getLogs() { return D.activityLogs; }
function getFiles() { return D.files; }
function addFile(d: Partial<AppFile>) { const u = me()!; const f: AppFile = { id: uuidv4(), name: d.name || '', type: d.type || '', size: d.size || 0, url: d.url || '', clientId: d.clientId, orderId: d.orderId, taskId: d.taskId, uploadedBy: u.id, createdAt: new Date().toISOString() }; D.files.push(f); log(u.id, 'upload', 'file', f.id, 'Uploaded file'); save(D); return f; }
function getSettings() { return D.settings; }
function updateSettings(d: Partial<BusinessSettings>) { const u = me()!; D.settings = { ...D.settings, ...d }; log(u.id, 'update', 'settings', 'settings', 'Updated settings'); save(D); }
function getUsers() { return D.users; }
function getUser(id: string) { return D.users.find(u => u.id === id); }

function stats() {
  const u = me(); if (!u) return null;
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
  const ud = D.orders.filter(o => o.internalDeadline && !['closed', 'delivered', 'payment_completed'].includes(o.status)).sort((a, b) => a.internalDeadline.localeCompare(b.internalDeadline)).slice(0, 5);
  const ot = D.tasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline < new Date().toISOString().split('T')[0]);
  const as = D.maintenanceSubscriptions.filter(s => s.status === 'active');
  const mrr = as.reduce((s, sub) => { const p = D.maintenancePlans.find(x => x.id === sub.planId); return s + (sub.customPrice || p?.monthlyPrice || 0); }, 0);
  return { tc, nl, ap, cp, tpm, ob, te, np, tr, ud, ot, as: as.length, mrr, ra: D.activityLogs.slice(0, 10) };
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const h = Object.keys(data[0]);
  const csv = [h.join(','), ...data.map(r => h.map(k => { const v = r[k]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v ?? ''); }).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================
const AuthCtx = createContext<{ user: User | null; login: (e: string, p: string) => { success: boolean; error?: string }; logout: () => void; isLoading: boolean }>({ user: null, login: () => ({ success: false }), logout: () => {}, isLoading: true });
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { setUser(me()); setIsLoading(false); }, []);
  return <AuthCtx.Provider value={{ user, login, logout: () => { logout(); setUser(null); }, isLoading }}>{children}</AuthCtx.Provider>;
}
function useAuth() { return useContext(AuthCtx); }

// ============================================================================
// LOGO
// ============================================================================
function Logo({ size = 40, variant = 'default' }: { size?: number; variant?: 'default' | 'white' }) {
  const c = variant === 'white' ? { p: '#ffffff', s: '#e0e7ff', t: '#2563eb', bg: '#ffffff' } : { p: '#2563eb', s: '#7c3aed', t: '#ffffff', bg: 'url(#lg)' };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c.p} /><stop offset="100%" stopColor={c.s} /></linearGradient></defs>
      <circle cx="50" cy="50" r="48" fill={c.bg} />
      <text x="50" y="45" textAnchor="middle" fill={c.t} fontSize="28" fontWeight="bold" fontFamily="Arial">AGS</text>
      <text x="50" y="65" textAnchor="middle" fill={c.t} fontSize="10" fontWeight="600" fontFamily="Arial" letterSpacing="1">WEBWORKS</text>
      <path d="M 20 50 L 15 55 L 20 60" stroke={c.t} strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 80 50 L 85 55 L 80 60" stroke={c.t} strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}

// ============================================================================
// PDF
// ============================================================================
function genPDF(invId: string) {
  const inv = D.invoices.find(i => i.id === invId);
  if (!inv) return;
  const cl = D.clients.find(c => c.id === inv.clientId);
  if (!cl) return;
  const s = D.settings;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  const cw = pw - m * 2;

  doc.setFillColor(37, 99, 235); doc.rect(0, 0, pw, 45, 'F');
  doc.setFillColor(124, 58, 237); doc.setGState(new (doc as any).GState({ opacity: 0.3 })); doc.rect(pw / 2, 0, pw / 2, 45, 'F'); doc.setGState(new (doc as any).GState({ opacity: 1 }));
  doc.setFillColor(255, 255, 255); doc.circle(m + 12, 22, 10, 'F');
  doc.setTextColor(37, 99, 235); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text('AGS', m + 12, 21, { align: 'center' });
  doc.setFontSize(4); doc.text('WEBWORKS', m + 12, 25, { align: 'center' });
  doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text(s.companyName, m + 28, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.text('Web Development & Digital Services', m + 28, 24);
  doc.setFontSize(7); doc.text(s.companyAddress, m + 28, 30); doc.text(`${s.companyEmail} | ${s.companyPhone}`, m + 28, 35);
  doc.setFillColor(255, 255, 255); doc.roundedRect(pw - m - 50, 10, 50, 25, 3, 3, 'F');
  doc.setTextColor(37, 99, 235); doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('INVOICE', pw - m - 25, 20, { align: 'center' });
  doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text(inv.invoiceNumber, pw - m - 25, 28, { align: 'center' });

  let y = 58;
  doc.setFillColor(248, 250, 252); doc.roundedRect(m, y, cw / 2 - 5, 35, 2, 2, 'F');
  doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.text('BILL TO', m + 5, y + 7);
  doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.text(cl.businessName, m + 5, y + 14);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
  let cy = y + 20;
  if (cl.contactPerson) { doc.text(`Attn: ${cl.contactPerson}`, m + 5, cy); cy += 5; }
  if (cl.email) { doc.text(cl.email, m + 5, cy); cy += 5; }
  if (cl.phone) { doc.text(cl.phone, m + 5, cy); cy += 5; }
  if (cl.location) doc.text(cl.location, m + 5, cy);

  const rx = m + cw / 2 + 5;
  doc.setFillColor(248, 250, 252); doc.roundedRect(rx, y, cw / 2 - 5, 35, 2, 2, 'F');
  doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.text('DETAILS', rx + 5, y + 7);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  let dy = y + 14;
  doc.text('Issue:', rx + 5, dy); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42); doc.text(inv.issueDate, rx + 30, dy); dy += 6;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.text('Due:', rx + 5, dy); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42); doc.text(inv.dueDate || 'N/A', rx + 30, dy); dy += 6;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.text('Currency:', rx + 5, dy); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42); doc.text(s.currency, rx + 30, dy);

  y += 45;
  doc.setFillColor(15, 23, 42); doc.roundedRect(m, y, cw, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('#', m + 3, y + 5.5); doc.text('Description', m + 12, y + 5.5); doc.text('Qty', m + cw - 55, y + 5.5, { align: 'center' }); doc.text('Price', m + cw - 38, y + 5.5, { align: 'center' }); doc.text('Total', m + cw - 5, y + 5.5, { align: 'right' });
  y += 8;
  inv.items.forEach((item, idx) => {
    if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(m, y, cw, 10, 'F'); }
    doc.setTextColor(15, 23, 42); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(String(idx + 1), m + 3, y + 6); doc.text(item.description.slice(0, 50), m + 12, y + 6);
    doc.text(String(item.quantity), m + cw - 55, y + 6, { align: 'center' });
    doc.text(`${item.unitPrice.toFixed(2)}`, m + cw - 38, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.text(`${item.total.toFixed(2)} ${s.currency}`, m + cw - 5, y + 6, { align: 'right' });
    y += 10;
  });

  y += 5;
  const tx = m + cw - 70;
  doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text('Subtotal:', tx, y); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold'); doc.text(`${inv.subtotal.toFixed(2)} ${s.currency}`, tx + 67, y, { align: 'right' }); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.text(`VAT (${s.taxRate}%):`, tx, y); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold'); doc.text(`${inv.tax.toFixed(2)} ${s.currency}`, tx + 67, y, { align: 'right' }); y += 10;
  doc.setFillColor(37, 99, 235); doc.roundedRect(tx - 3, y - 4, 73, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.text('TOTAL DUE:', tx + 3, y + 3); doc.text(`${inv.total.toFixed(2)} ${s.currency}`, tx + 67, y + 3, { align: 'right' });

  y += 20;
  doc.setFillColor(248, 250, 252); doc.roundedRect(m, y, cw, 20, 2, 2, 'F');
  doc.setFillColor(37, 99, 235); doc.roundedRect(m, y, 3, 20, 1, 1, 'F');
  doc.setTextColor(15, 23, 42); doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('PAYMENT', m + 8, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
  doc.text('Bank Transfer to AGS WEBWORKS. Include invoice # as reference.', m + 8, y + 12);
  doc.text(`Due by: ${inv.dueDate || 'Upon receipt'}`, m + 8, y + 17);

  doc.setFillColor(15, 23, 42); doc.rect(0, ph - 20, pw, 20, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.text('Thank you for your business!', m, ph - 12);
  doc.text(`${s.companyName} | ${s.companyEmail} | ${s.companyPhone}`, m, ph - 7);
  doc.setFont('helvetica', 'bold'); doc.text('agswebworks.com', pw - m, ph - 12, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.text('Dammam / Al Khobar, Saudi Arabia', pw - m, ph - 7, { align: 'right' });

  doc.save(`${s.companyName.replace(/\s+/g, '_')}_${inv.invoiceNumber}.pdf`);
}

// ============================================================================
// PAGES
// ============================================================================
function LoginPage() {
  const { login } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => { e.preventDefault(); const r = login(email, pw); if (r.success) nav('/'); else setErr(r.error || 'Failed'); };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4"><Logo size={80} variant="white" /></div>
          <h1 className="text-2xl font-bold text-white">AGS WEBWORKS</h1>
          <p className="text-blue-200 mt-1">Business Management System</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
          {err && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2"><AlertCircle size={16} />{err}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
            <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" /><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25">Sign In</button>
          </form>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-blue-200/70 text-center"><strong>Demo:</strong><br />sharjeel@agswebworks.com / AGS@CEO2024!<br />gufran@agswebworks.com / AGS@Dev2024!<br />addan@agswebworks.com / AGS@Acc2024!</p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth(); const nav = useNavigate(); const s = stats(); const dk = document.documentElement.classList.contains('dark');
  if (!s || !user) return null;
  const card = `rounded-xl p-5 border transition-all hover:shadow-lg ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const fmt = (n: number) => `${n.toLocaleString()} SAR`;
  if (user.role === 'ceo') return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-1 ${dk ? 'text-white' : 'text-gray-900'}`}>Welcome back, {user.name} 👋</h1>
      <p className={`text-sm mb-6 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Business overview</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, color: 'blue', label: 'Total Clients', value: s.tc, sub: `${s.nl} leads` },
          { icon: ShoppingCart, color: 'purple', label: 'Active Projects', value: s.ap, sub: `${s.cp} completed` },
          { icon: DollarSign, color: 'green', label: 'Revenue (Month)', value: fmt(s.tpm), sub: 'This month' },
          { icon: TrendingUp, color: 'emerald', label: 'Net Profit', value: fmt(s.np), sub: s.np >= 0 ? 'Profitable' : 'Loss' },
        ].map((c, i) => <div key={i} className={card}><div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-${c.color}-500/10`}><c.icon size={20} className={`text-${c.color}-500`} /></div><div><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{c.value}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c.label}</p></div></div></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h3>
          {s.ud.length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No deadlines</p> : <div className="space-y-2">{s.ud.map(o => { const c = getClient(o.clientId); return <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg ${dk ? 'bg-slate-700/50' : 'bg-gray-50'}`}><div><p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{o.orderNumber}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c?.businessName}</p></div><span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">{o.internalDeadline}</span></div>; })}</div>}
        </div>
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          {s.ra.length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No activity</p> : <div className="space-y-2">{s.ra.map(l => { const u = getUser(l.userId); return <div key={l.id} className={`flex items-start gap-3 p-2 rounded-lg ${dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}><div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u?.name?.[0]}</div><div><p className={`text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>{l.details}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{u?.name} • {new Date(l.createdAt).toLocaleString()}</p></div></div>; })}</div>}
        </div>
      </div>
    </div>
  );
  if (user.role === 'developer') {
    const myTasks = getTasks().filter(t => t.assignedTo === user.id);
    const myOrders = getOrders();
    return (
      <div className="animate-fade-in">
        <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Hey {user.name} 💻</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myOrders.length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>My Projects</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myTasks.filter(t => t.status === 'in_progress').length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>In Progress</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myTasks.filter(t => t.status === 'review').length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Review</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{s.ot.length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Overdue</p></div>
        </div>
      </div>
    );
  }
  // Accountant
  const pmts = getPayments(); const ords = getOrders();
  const m = new Date().toISOString().slice(0, 7);
  const mr = pmts.filter(p => p.date.startsWith(m) && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Hello {user.name} 📊</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(mr)}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue (Month)</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(ords.reduce((s, o) => s + o.remainingBalance, 0))}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Pending</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{ords.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Active Orders</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(s.mrr)}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>MRR</p></div>
      </div>
    </div>
  );
}

// Other pages (simplified for space)
function ClientsPage() { const dk = document.documentElement.classList.contains('dark'); const [cls, setCls] = useState(getClients()); const [show, setShow] = useState(false); const [edit, setEdit] = useState<Client | null>(null); const { user } = useAuth(); const canEdit = user?.role === 'ceo' || user?.role === 'accountant'; const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`; const save = (d: Partial<Client>) => { if (edit) updateClient(edit.id, d); else addClient(d); setCls(getClients()); setShow(false); setEdit(null); }; const statusColors: Record<string, string> = { lead: 'bg-gray-100 text-gray-700', contacted: 'bg-blue-100 text-blue-700', interested: 'bg-purple-100 text-purple-700', negotiation: 'bg-amber-100 text-amber-700', won: 'bg-green-100 text-green-700', active: 'bg-emerald-100 text-emerald-700', lost: 'bg-red-100 text-red-700' }; return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Clients</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{cls.length} total</p></div>{canEdit && <button onClick={() => { setEdit(null); setShow(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Plus size={16} />Add Client</button>}</div>{cls.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No clients yet</p></div> : <div className="space-y-3">{cls.map(c => (<div key={c.id} className={`p-4 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{c.businessName[0]?.toUpperCase()}</div><div><h3 className={`font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{c.businessName}</h3><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c.contactPerson} • {c.category}</p></div></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></div></div>))}</div>}{show && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}><div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>{edit ? 'Edit' : 'Add'} Client</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ businessName: fd.get('businessName') as string, category: fd.get('category') as string, contactPerson: fd.get('contactPerson') as string, phone: fd.get('phone') as string, email: fd.get('email') as string, location: fd.get('location') as string, status: (fd.get('status') as ClientStatus) || 'lead' }); }} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Business Name *</label><input name="businessName" required defaultValue={edit?.businessName} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Category</label><input name="category" defaultValue={edit?.category} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Contact</label><input name="contactPerson" defaultValue={edit?.contactPerson} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label><input name="phone" defaultValue={edit?.phone} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Email</label><input name="email" type="email" defaultValue={edit?.email} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Location</label><input name="location" defaultValue={edit?.location} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Status</label><select name="status" defaultValue={edit?.status || 'lead'} className={inp}><option value="lead">Lead</option><option value="contacted">Contacted</option><option value="interested">Interested</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="active">Active</option><option value="lost">Lost</option></select></div></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className={`px-4 py-2 rounded-lg text-sm ${dk ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Save</button></div></form></div></div>}</div>); }

function OrdersPage() { const dk = document.documentElement.classList.contains('dark'); const ords = getOrders(); const [show, setShow] = useState(false); const { user } = useAuth(); const canEdit = user?.role === 'ceo' || user?.role === 'accountant'; const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; const statusFlow = ['lead_received', 'contacted', 'quotation_sent', 'confirmed', 'in_progress', 'internal_review', 'client_review', 'revisions', 'ready_delivery', 'delivered', 'payment_completed', 'closed']; const statusLabels: Record<string, string> = { lead_received: 'Lead', contacted: 'Contacted', quotation_sent: 'Quoted', confirmed: 'Confirmed', in_progress: 'In Progress', internal_review: 'Review', client_review: 'Client Review', revisions: 'Revisions', ready_delivery: 'Ready', delivered: 'Delivered', payment_completed: 'Paid', closed: 'Closed' }; const save = (d: Partial<Order>) => { addOrder(d); setShow(false); }; return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Orders</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{ords.length} total</p></div>{canEdit && <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />New Order</button>}</div>{ords.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No orders</p></div> : <div className={`rounded-xl border overflow-hidden ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><table className="w-full text-sm"><thead className={dk ? 'bg-slate-700/50' : 'bg-gray-50'}><tr>{['Order', 'Client', 'Service', 'Price', 'Status', 'Deadline'].map(h => <th key={h} className={`text-left px-4 py-3 font-medium ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead><tbody className={`divide-y ${dk ? 'divide-slate-700' : 'divide-gray-100'}`}>{ords.map(o => { const c = getClient(o.clientId); return <tr key={o.id} className={dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}><td className="px-4 py-3 font-medium">{o.orderNumber}</td><td className="px-4 py-3">{c?.businessName || '-'}</td><td className="px-4 py-3">{o.serviceType}</td><td className="px-4 py-3 font-medium">{o.price.toLocaleString()} SAR</td><td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{statusLabels[o.status] || o.status}</span></td><td className="px-4 py-3">{o.internalDeadline || '-'}</td></tr>; })}</tbody></table></div>}{show && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}><div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Order</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ clientId: fd.get('clientId') as string, serviceType: fd.get('serviceType') as string, price: Number(fd.get('price')), advancePayment: Number(fd.get('advance') || 0), internalDeadline: fd.get('deadline') as string, priority: (fd.get('priority') as Priority) || 'medium' }); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client *</label><select name="clientId" required className={inp}><option value="">Select</option>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Service *</label><select name="serviceType" required className={inp}><option value="">Select</option><option>Business Website</option><option>Restaurant Website</option><option>Website Redesign</option><option>Maintenance</option><option>Google Business</option><option>Landing Page</option><option>Other</option></select></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Price (SAR)</label><input name="price" type="number" defaultValue={0} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Advance</label><input name="advance" type="number" defaultValue={0} className={inp} /></div></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Deadline</label><input name="deadline" type="date" className={inp} /></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className={`px-4 py-2 rounded-lg text-sm ${dk ? 'text-slate-300 hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button></div></form></div></div>}</div>); }

function TasksPage() { const dk = document.documentElement.classList.contains('dark'); const [tsk, setTsk] = useState(getTasks()); const [show, setShow] = useState(false); const { user } = useAuth(); const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; const save = (d: Partial<Task>) => { addTask(d); setTsk(getTasks()); setShow(false); }; const today = new Date().toISOString().split('T')[0]; const statusColors: Record<string, string> = { todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', waiting: 'bg-amber-100 text-amber-700', review: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700' }; return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Tasks</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{tsk.length} tasks</p></div><button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />New Task</button></div><div className="space-y-3">{tsk.map(t => { const a = getUser(t.assignedTo); const od = t.status !== 'completed' && t.deadline && t.deadline < today; return <div key={t.id} className={`p-4 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} ${od ? 'border-red-300' : ''}`}><div className="flex items-start justify-between"><div><h3 className={`font-medium ${dk ? 'text-white' : 'text-gray-900'} ${t.status === 'completed' ? 'line-through opacity-60' : ''}`}>{t.title}</h3>{t.description && <p className={`text-sm mt-1 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{t.description}</p>}<div className={`flex gap-4 mt-2 text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{a && <span>→ {a.name}</span>}{t.deadline && <span>📅 {t.deadline}</span>}{od && <span className="text-red-500 font-medium">⚠ Overdue</span>}</div></div><select value={t.status} onChange={e => { updateTask(t.id, { status: e.target.value as TaskStatus }); setTsk(getTasks()); }} className={`text-xs px-2 py-1 rounded-lg border ${statusColors[t.status]}`}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="waiting">Waiting</option><option value="review">Review</option><option value="completed">Completed</option></select></div></div>; })}</div>{show && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}><div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Task</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ title: fd.get('title') as string, description: fd.get('desc') as string, assignedTo: fd.get('assigned') as string, priority: (fd.get('priority') as Priority) || 'medium', deadline: fd.get('deadline') as string }); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Title *</label><input name="title" required className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label><select name="assigned" className={inp}>{getUsers().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label><select name="priority" className={inp}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Deadline</label><input name="deadline" type="date" className={inp} /></div></div><div className="flex justify-end"><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button></div></form></div></div>}</div>); }

function PaymentsPage() { const dk = document.documentElement.classList.contains('dark'); const [pmts, setPmts] = useState(getPayments()); const [invs, setInvs] = useState(getInvoices()); const [tab, setTab] = useState<'payments' | 'invoices'>('payments'); const [showP, setShowP] = useState(false); const [showI, setShowI] = useState(false); const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const total = pmts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0); return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Payments & Invoices</h1></div><div className="flex gap-2"><button onClick={() => setShowP(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"><Plus size={16} />Payment</button><button onClick={() => setShowI(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Invoice</button></div></div><div className="grid grid-cols-3 gap-4 mb-6"><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{total.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Total Received</p></div><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{getOrders().reduce((s, o) => s + o.remainingBalance, 0).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Outstanding</p></div><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{invs.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Invoices</p></div></div><div className={`flex gap-1 mb-4 p-1 rounded-lg ${dk ? 'bg-slate-800' : 'bg-gray-100'}`}><button onClick={() => setTab('payments')} className={`flex-1 py-2 rounded-md text-sm ${tab === 'payments' ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>Payments</button><button onClick={() => setTab('invoices')} className={`flex-1 py-2 rounded-md text-sm ${tab === 'invoices' ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>Invoices</button></div>{tab === 'payments' ? <div className={card}>{pmts.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No payments</p> : <table className="w-full text-sm"><thead><tr>{['Date', 'Client', 'Amount', 'Method', 'Status'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead><tbody>{pmts.map(p => { const c = getClient(p.clientId); return <tr key={p.id}><td className="py-3 px-2">{p.date}</td><td className="py-3 px-2">{c?.businessName}</td><td className="py-3 px-2 text-green-500 font-medium">+{p.amount.toLocaleString()} SAR</td><td className="py-3 px-2">{p.method.replace(/_/g, ' ')}</td><td className="py-3 px-2"><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{p.status}</span></td></tr>; })}</tbody></table>}</div> : <div className={card}>{invs.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No invoices</p> : <table className="w-full text-sm"><thead><tr>{['Invoice', 'Client', 'Total', 'Status', 'Due', ''].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead><tbody>{invs.map(inv => { const c = getClient(inv.clientId); return <tr key={inv.id}><td className="py-3 px-2 font-medium">{inv.invoiceNumber}</td><td className="py-3 px-2">{c?.businessName}</td><td className="py-3 px-2 font-medium">{inv.total.toLocaleString()} SAR</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{inv.status}</span></td><td className="py-3 px-2">{inv.dueDate}</td><td className="py-3 px-2"><button onClick={() => genPDF(inv.id)} className="text-xs text-blue-500 flex items-center gap-1"><Download size={12} />PDF</button></td></tr>; })}</tbody></table>}</div>}{showP && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowP(false)}><div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Record Payment</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addPayment({ clientId: fd.get('client') as string, amount: Number(fd.get('amount')), method: (fd.get('method') as PaymentMethod) || 'bank_transfer', reference: fd.get('ref') as string }); setPmts(getPayments()); setShowP(false); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Amount</label><input name="amount" type="number" required className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Method</label><select name="method" className={inp}><option value="bank_transfer">Bank</option><option value="cash">Cash</option><option value="card">Card</option></select></div></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Reference</label><input name="ref" className={inp} /></div><button type="submit" className="w-full py-2 rounded-lg bg-green-600 text-white text-sm">Record</button></form></div></div>}{showI && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowI(false)}><div className={`w-full max-w-lg rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Create Invoice</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const desc = fd.get('desc') as string; const qty = Number(fd.get('qty') || 1); const price = Number(fd.get('price') || 0); addInvoice({ clientId: fd.get('client') as string, items: [{ description: desc, quantity: qty, unitPrice: price, total: qty * price }], dueDate: fd.get('due') as string }); setInvs(getInvoices()); setShowI(false); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Description</label><input name="desc" required className={inp} /></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Qty</label><input name="qty" type="number" defaultValue={1} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Unit Price</label><input name="price" type="number" defaultValue={0} className={inp} /></div></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Due Date</label><input name="due" type="date" className={inp} /></div><button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button></form></div></div>}</div>); }

function ExpensesPage() { const dk = document.documentElement.classList.contains('dark'); const [exp, setExp] = useState(getExpenses()); const [show, setShow] = useState(false); const { user } = useAuth(); const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const tot = exp.filter(e => e.status !== 'rejected').reduce((s, e) => s + e.amount, 0); const rev = getPayments().filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0); return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Expenses & Profit</h1><button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Add</button></div><div className="grid grid-cols-3 gap-4 mb-6"><div className={card}><p className={`text-xl font-bold text-red-500`}>{tot.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p></div><div className={card}><p className={`text-xl font-bold text-green-500`}>{rev.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p></div><div className={card}><p className={`text-xl font-bold ${rev - tot >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(rev - tot).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Profit</p></div></div><div className={card}>{exp.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No expenses</p> : <table className="w-full text-sm"><thead><tr>{['Date', 'Category', 'Amount', 'Status'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead><tbody>{exp.map(e => <tr key={e.id}><td className="py-3 px-2">{e.date}</td><td className="py-3 px-2">{e.category}</td><td className="py-3 px-2 text-red-500">-{e.amount.toLocaleString()} SAR</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{e.status}</span></td></tr>)}</tbody></table>}</div>{show && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}><div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addExpense({ category: fd.get('cat') as string, amount: Number(fd.get('amount')), description: fd.get('desc') as string }); setExp(getExpenses()); setShow(false); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Category</label><select name="cat" required className={inp}><option>Hosting & Domains</option><option>Software</option><option>Marketing</option><option>Office</option><option>Other</option></select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Amount (SAR)</label><input name="amount" type="number" required className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Description</label><input name="desc" className={inp} /></div><button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Add</button></form></div></div>}</div>); }

function TeamPage() { const dk = document.documentElement.classList.contains('dark'); const users = getUsers(); const logs = getLogs(); const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const roles: Record<string, string> = { ceo: 'CEO & Marketing', developer: 'Web Developer', accountant: 'Accountant' }; return (<div className="animate-fade-in"><h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Team</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{users.map(u => (<div key={u.id} className={card}><div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">{u.name[0]}</div><div><h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{u.name}</h3><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{roles[u.role]}</p></div></div><p className={`text-sm ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{u.email}</p></div>))}</div><div className={card}><h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Activity Log</h3>{logs.length === 0 ? <p className={dk ? 'text-slate-400' : 'text-gray-500'}>No activity</p> : <div className="space-y-2 max-h-96 overflow-y-auto">{logs.slice(0, 30).map(l => { const u = getUser(l.userId); return <div key={l.id} className={`flex items-start gap-3 p-2 rounded-lg ${dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}><div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u?.name?.[0]}</div><div><p className={`text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>{l.details}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{u?.name} • {new Date(l.createdAt).toLocaleString()}</p></div></div>; })}</div>}</div></div>); }

function FilesPage() { const dk = document.documentElement.classList.contains('dark'); const [files, setFiles] = useState(getFiles()); const upload = () => { const name = prompt('File name:'); if (!name) return; addFile({ name, type: name.split('.').pop() || 'file', size: Math.floor(Math.random() * 5000), url: '#' }); setFiles(getFiles()); }; const getIcon = (t: string) => { if (['jpg', 'png', 'gif', 'svg'].includes(t)) return <Image size={20} className="text-purple-500" />; if (['pdf', 'doc'].includes(t)) return <FileText size={20} className="text-red-500" />; return <FileIcon size={20} className="text-gray-500" />; }; return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Files</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{files.length} files</p></div><button onClick={upload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Upload size={16} />Upload</button></div>{files.length === 0 ? <div className={`text-center py-16 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No files</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{files.map(f => (<div key={f.id} className={`rounded-xl p-4 border flex items-center gap-3 ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><div className={`p-3 rounded-lg ${dk ? 'bg-slate-700' : 'bg-gray-100'}`}>{getIcon(f.type)}</div><div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{f.name}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{(f.size / 1024).toFixed(1)} KB</p></div></div>))}</div>}</div>); }

function ReportsPage() { const dk = document.documentElement.classList.contains('dark'); const pmts = getPayments().filter(p => p.status === 'paid'); const exp = getExpenses().filter(e => e.status !== 'rejected'); const ords = getOrders(); const cls = getClients(); const rev = pmts.reduce((s, p) => s + p.amount, 0); const tot = exp.reduce((s, e) => s + e.amount, 0); const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const byStatus = ords.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {} as Record<string, number>); return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Reports</h1><button onClick={() => exportCSV(pmts.map(p => ({ date: p.date, amount: p.amount, client: getClient(p.clientId)?.businessName || '' })), 'report')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"><Download size={16} />Export CSV</button></div><div className="grid grid-cols-3 gap-4 mb-6"><div className={card}><p className={`text-xl font-bold text-green-500`}>{rev.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p></div><div className={card}><p className={`text-xl font-bold text-red-500`}>{tot.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p></div><div className={card}><p className={`text-xl font-bold ${rev - tot >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(rev - tot).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Profit</p></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className={card}><h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Orders by Status</h3>{Object.keys(byStatus).length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No data</p> : <div className="space-y-2">{Object.entries(byStatus).map(([s, c]) => (<div key={s} className="flex items-center gap-3"><span className={`text-sm w-32 truncate ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{s.replace(/_/g, ' ')}</span><div className="flex-1 h-6 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(c / ords.length) * 100}%` }}><span className="text-xs text-white">{c}</span></div></div></div>))}</div>}</div><div className={card}><h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Team Workload</h3><div className="space-y-3">{getUsers().map(u => { const t = getTasks().filter(x => x.assignedTo === u.id && x.status !== 'completed').length; const o = getOrders().filter(x => x.assignedDeveloper === u.id && !['closed', 'delivered', 'payment_completed'].includes(x.status)).length; return <div key={u.id} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{u.name[0]}</div><div className="flex-1"><p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{u.name}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{t} tasks • {o} projects</p></div></div>; })}</div></div></div></div>); }

function MaintenancePage() { const dk = document.documentElement.classList.contains('dark'); const [tab, setTab] = useState<'overview' | 'subs' | 'tickets' | 'plans'>('overview'); const plans = getPlans(); const subs = getSubs(); const tickets = getTickets(); const { user } = useAuth(); const [showSub, setShowSub] = useState(false); const [showTkt, setShowTkt] = useState(false); const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; const active = subs.filter(s => s.status === 'active'); const mrr = active.reduce((s, sub) => { const p = plans.find(x => x.id === sub.planId); return s + (sub.customPrice || p?.monthlyPrice || 0); }, 0); return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Maintenance</h1></div><div className="flex gap-2">{user?.role !== 'developer' && <button onClick={() => setShowSub(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Subscription</button>}<button onClick={() => setShowTkt(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"><Plus size={16} />Ticket</button></div></div><div className={`flex gap-1 mb-6 p-1 rounded-lg ${dk ? 'bg-slate-800' : 'bg-gray-100'}`}>{(['overview', 'subs', 'tickets', 'plans'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-md text-sm font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>{t}</button>)}</div>{tab === 'overview' && <div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{active.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Active Subs</p></div><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{mrr.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>MRR</p></div><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{tickets.filter(t => !['completed', 'closed'].includes(t.status)).length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Open Tickets</p></div><div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{subs.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Total Subs</p></div></div></div>}{tab === 'subs' && <div className={card}>{subs.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No subscriptions</p> : <table className="w-full text-sm"><thead><tr>{['Client', 'Website', 'Plan', 'Price', 'Status'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead><tbody>{subs.map(s => { const c = getClient(s.clientId); const p = plans.find(x => x.id === s.planId); return <tr key={s.id}><td className="py-3 px-2">{c?.businessName}</td><td className="py-3 px-2">{s.websiteDomain}</td><td className="py-3 px-2">{p?.name || s.planType}</td><td className="py-3 px-2 font-medium">{(s.customPrice || p?.monthlyPrice || 0).toLocaleString()} SAR</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{s.status}</span></td></tr>; })}</tbody></table>}</div>}{tab === 'tickets' && <div className="space-y-3">{tickets.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No tickets</p></div> : tickets.map(t => { const c = getClient(t.clientId); return <div key={t.id} className={card}><div className="flex items-start justify-between"><div><p className={`font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{t.issueDescription}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c?.businessName}</p></div><select value={t.status} onChange={e => { updateTicket(t.id, { status: e.target.value }); }} className={`text-xs px-2 py-1 rounded border ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}><option value="new">New</option><option value="in_progress">In Progress</option><option value="waiting_client">Waiting</option><option value="completed">Completed</option><option value="closed">Closed</option></select></div></div>; })}</div>}{tab === 'plans' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{plans.map(p => (<div key={p.id} className={card}><h3 className={`font-bold text-lg mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3><p className={`text-2xl font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>{p.monthlyPrice > 0 ? `${p.monthlyPrice} SAR/mo` : 'Price not set'}</p><ul className="space-y-2">{p.features.map((f, i) => <li key={i} className={`flex items-start gap-2 text-sm ${dk ? 'text-slate-300' : 'text-gray-600'}`}><span className="text-green-500">✓</span>{f}</li>)}</ul></div>))}</div>}{showSub && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSub(false)}><div className={`w-full max-w-lg rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Subscription</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addSub({ clientId: fd.get('client') as string, websiteDomain: fd.get('domain') as string, planId: fd.get('plan') as string, customPrice: Number(fd.get('price') || 0), nextBillingDate: fd.get('billing') as string }); setShowSub(false); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Domain</label><input name="domain" className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Plan</label><select name="plan" className={inp}>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Monthly Price</label><input name="price" type="number" className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Next Billing</label><input name="billing" type="date" className={inp} /></div><button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button></form></div></div>}{showTkt && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTkt(false)}><div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}><h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Ticket</h2><form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addTicket({ clientId: fd.get('client') as string, issueDescription: fd.get('issue') as string, assignedTo: fd.get('assigned') as string, priority: (fd.get('priority') as Priority) || 'medium' }); setShowTkt(false); }} className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Issue</label><textarea name="issue" required className={`${inp} h-20 resize-none`} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Assigned</label><select name="assigned" className={inp}>{getUsers().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><button type="submit" className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm">Create</button></form></div></div>}</div>); }

function NotificationsPage() { const dk = document.documentElement.classList.contains('dark'); const [notifs, setNotifs] = useState(getNotifs()); const unread = notifs.filter(n => !n.read); const icons: Record<string, React.ReactNode> = { info: <Info size={16} className="text-blue-500" />, warning: <AlertTriangle size={16} className="text-amber-500" />, assignment: <Bell size={16} className="text-purple-500" />, deadline: <AlertTriangle size={16} className="text-red-500" />, payment: <DollarSign size={16} className="text-green-500" /> }; return (<div className="animate-fade-in"><div className="flex items-center justify-between mb-6"><div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Notifications</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{unread.length} unread</p></div>{unread.length > 0 && <button onClick={() => { markAllRead(); setNotifs(getNotifs()); }} className="text-sm text-blue-500 flex items-center gap-1"><CheckCheck size={16} />Mark all read</button>}</div>{notifs.length === 0 ? <div className={`text-center py-16 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><Bell size={48} className={`mx-auto mb-4 ${dk ? 'text-slate-600' : 'text-gray-300'}`} /><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No notifications</p></div> : <div className="space-y-2">{notifs.map(n => (<div key={n.id} onClick={() => { markRead(n.id); setNotifs(getNotifs()); }} className={`rounded-xl border p-4 flex items-start gap-3 cursor-pointer ${!n.read ? (dk ? 'border-l-4 border-l-blue-500 bg-slate-800/80' : 'border-l-4 border-l-blue-500 bg-blue-50/50') : dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><div className={`p-2 rounded-lg flex-shrink-0 ${dk ? 'bg-slate-700' : 'bg-gray-100'}`}>{icons[n.type] || <Info size={16} />}</div><div className="flex-1"><p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{n.title}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{n.message}</p><p className={`text-xs mt-1 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(n.createdAt).toLocaleString()}</p></div>{!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}</div>))}</div>}</div>); }

function SettingsPage() { const { user } = useAuth(); const dk = document.documentElement.classList.contains('dark'); const [s, setS] = useState(getSettings()); const [saved, setSaved] = useState(false); if (user?.role !== 'ceo') return <div className="text-center py-16"><p className={dk ? 'text-slate-400' : 'text-gray-500'}>Access denied</p></div>; const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`; const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`; return (<div className="animate-fade-in"><h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Settings</h1><div className="max-w-2xl space-y-6"><div className={card}><div className="flex items-center gap-2 mb-4"><Building2 size={20} className="text-blue-500" /><h3 className={`font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>Company</h3></div><div className="space-y-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Name</label><input value={s.companyName} onChange={e => setS({ ...s, companyName: e.target.value })} className={inp} /></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Email</label><input value={s.companyEmail} onChange={e => setS({ ...s, companyEmail: e.target.value })} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label><input value={s.companyPhone} onChange={e => setS({ ...s, companyPhone: e.target.value })} className={inp} /></div></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Address</label><input value={s.companyAddress} onChange={e => setS({ ...s, companyAddress: e.target.value })} className={inp} /></div></div></div><div className={card}><div className="flex items-center gap-2 mb-4"><DollarSign size={20} className="text-green-500" /><h3 className={`font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>Financial</h3></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Currency</label><input value={s.currency} onChange={e => setS({ ...s, currency: e.target.value })} className={inp} /></div><div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Tax Rate (%)</label><input type="number" value={s.taxRate} onChange={e => setS({ ...s, taxRate: Number(e.target.value) })} className={inp} /></div></div></div><button onClick={() => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/25"><Save size={16} />{saved ? '✓ Saved!' : 'Save'}</button></div></div>); }

// ============================================================================
// LAYOUT
// ============================================================================
function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const loc = useLocation();
  const [sidebar, setSidebar] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('ags_dark') === 'true');
  const [nc, setNc] = useState(unread());

  useEffect(() => { if (dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem('ags_dark', String(dark)); }, [dark]);
  useEffect(() => { setNc(unread()); }, [loc.pathname]);

  const items = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/clients', label: 'Clients', icon: Users, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['ceo', 'accountant'] },
    { path: '/expenses', label: 'Expenses', icon: TrendingDown, roles: ['ceo', 'accountant'] },
    { path: '/team', label: 'Team', icon: UserCog, roles: ['ceo'] },
    { path: '/files', label: 'Files', icon: FolderOpen, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['ceo', 'accountant'] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['ceo'] },
  ];

  const filtered = items.filter(i => user && i.roles.includes(user.role));
  const roleLabels: Record<string, string> = { ceo: 'CEO & Marketing', developer: 'Web Developer', accountant: 'Accountant' };

  return (
    <div className={`min-h-screen flex ${dark ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebar ? 'translate-x-0' : '-translate-x-full'} ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        <div className={`p-5 border-b ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Logo size={40} variant={dark ? 'white' : 'default'} />
            <div><h1 className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>AGS WEBWORKS</h1><p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Management System</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {filtered.map(i => { const active = loc.pathname === i.path; const Icon = i.icon; return <button key={i.path} onClick={() => { nav(i.path); setSidebar(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}><Icon size={18} /><span>{i.label}</span>{i.path === '/notifications' && nc > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{nc}</span>}</button>; })}
        </nav>
        <div className={`p-4 border-t ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p><p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{roleLabels[user?.role || '']}</p></div>
            <button onClick={() => { logout(); nav('/login'); }} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      {sidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebar(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 border-b ${dark ? 'bg-slate-900/95 border-slate-700 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'}`}>
          <button onClick={() => setSidebar(true)} className={`lg:hidden p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => nav('/notifications')} className={`relative p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}><Bell size={18} />{nc > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{nc > 9 ? '9+' : nc}</span>}</button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

// ============================================================================
// APP
// ============================================================================
function Protected({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="text-center"><div className="w-16 h-16 mx-auto mb-4 animate-pulse"><Logo size={64} variant="white" /></div><p className="text-slate-400 text-sm">Loading...</p></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Public({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
