-- AGS WEBWORKS Business Management System
-- Database Schema for PostgreSQL / Supabase
-- Run this migration to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES & AUTH
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ceo', 'developer', 'accountant')),
  avatar_url TEXT,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  category TEXT,
  contact_person TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  location TEXT,
  google_maps_link TEXT,
  website_url TEXT,
  social_media TEXT,
  service_requested TEXT,
  quoted_price NUMERIC(12,2) DEFAULT 0,
  agreed_price NUMERIC(12,2) DEFAULT 0,
  lead_source TEXT,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  assigned_to UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'contacted', 'interested', 'negotiation', 'won', 'active', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_assigned ON clients(assigned_to);
CREATE INDEX idx_clients_phone ON clients(phone);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_developer UUID REFERENCES profiles(id),
  assigned_coordinator UUID REFERENCES profiles(id),
  price NUMERIC(12,2) DEFAULT 0,
  advance_payment NUMERIC(12,2) DEFAULT 0,
  remaining_balance NUMERIC(12,2) DEFAULT 0,
  start_date DATE,
  internal_deadline DATE,
  delivery_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'lead_received' CHECK (status IN (
    'lead_received', 'contacted', 'quotation_sent', 'confirmed',
    'in_progress', 'internal_review', 'client_review', 'revisions',
    'ready_delivery', 'delivered', 'payment_completed', 'closed'
  )),
  preview_url TEXT,
  live_url TEXT,
  repository_url TEXT,
  notes TEXT,
  revision_history TEXT
);

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_developer ON orders(assigned_developer);
CREATE INDEX idx_orders_deadline ON orders(internal_deadline);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting', 'review', 'completed')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'bank_transfer' CHECK (method IN ('bank_transfer', 'cash', 'card', 'other')),
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
  reference TEXT,
  notes TEXT,
  type TEXT DEFAULT 'project_payment' CHECK (type IN ('project_payment', 'maintenance_payment', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_date ON payments(date);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  payment_method TEXT,
  reference TEXT,
  approved_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subscription_id UUID,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partial', 'paid', 'overdue', 'void')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0
);

-- ============================================
-- MAINTENANCE PLANS
-- ============================================
CREATE TABLE maintenance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('value', 'pro', 'custom')),
  monthly_price NUMERIC(12,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  max_updates INTEGER DEFAULT 5,
  max_support_tickets INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAINTENANCE SUBSCRIPTIONS
-- ============================================
CREATE TABLE maintenance_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  website_domain TEXT,
  website_url TEXT,
  plan_id UUID REFERENCES maintenance_plans(id),
  plan_type TEXT DEFAULT 'value',
  custom_price NUMERIC(12,2) DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  next_billing_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'payment_due', 'overdue', 'paused', 'cancelled', 'expired')),
  payment_method TEXT,
  last_payment_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  contract_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, website_domain)
);

CREATE INDEX idx_maint_subs_client ON maintenance_subscriptions(client_id);
CREATE INDEX idx_maint_subs_status ON maintenance_subscriptions(status);
CREATE INDEX idx_maint_subs_billing ON maintenance_subscriptions(next_billing_date);

-- ============================================
-- MAINTENANCE INVOICES
-- ============================================
CREATE TABLE maintenance_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES maintenance_subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partial', 'paid', 'overdue', 'void')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, billing_period_start) -- Prevent duplicate invoices
);

-- ============================================
-- MAINTENANCE TICKETS
-- ============================================
CREATE TABLE maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES maintenance_subscriptions(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  issue_description TEXT NOT NULL,
  request_date DATE DEFAULT CURRENT_DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id),
  expected_completion DATE,
  work_performed TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_client', 'completed', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maint_tickets_client ON maintenance_tickets(client_id);
CREATE INDEX idx_maint_tickets_status ON maintenance_tickets(status);

-- ============================================
-- FILES
-- ============================================
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_type TEXT,
  size_bytes BIGINT DEFAULT 0,
  storage_path TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'assignment', 'deadline', 'payment')),
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- ACTIVITY LOGS
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- ============================================
-- BUSINESS SETTINGS
-- ============================================
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT DEFAULT 'AGS WEBWORKS',
  company_email TEXT,
  company_phone TEXT,
  company_address TEXT,
  currency TEXT DEFAULT 'SAR',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  tax_rate NUMERIC(5,2) DEFAULT 15,
  invoice_prefix TEXT DEFAULT 'INV',
  order_prefix TEXT DEFAULT 'ORD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO business_settings (company_name, company_email, company_phone, company_address, currency, timezone, tax_rate, invoice_prefix, order_prefix)
VALUES ('AGS WEBWORKS', 'info@agswebworks.com', '+966 XX XXX XXXX', 'Dammam / Al Khobar, Saudi Arabia', 'SAR', 'Asia/Riyadh', 15, 'INV', 'ORD');

-- ============================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- CEO can do everything
CREATE POLICY "CEO full access" ON profiles FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access clients" ON clients FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access orders" ON orders FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access tasks" ON tasks FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access payments" ON payments FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access expenses" ON expenses FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access invoices" ON invoices FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');
CREATE POLICY "CEO full access notifications" ON notifications FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ceo');

-- Developer can view assigned orders and clients
CREATE POLICY "Developer view assigned orders" ON orders FOR SELECT USING (assigned_developer = auth.uid());
CREATE POLICY "Developer update own orders" ON orders FOR UPDATE USING (assigned_developer = auth.uid());
CREATE POLICY "Developer view assigned tasks" ON tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Developer update own tasks" ON tasks FOR UPDATE USING (assigned_to = auth.uid());

-- Accountant can view and manage financial records
CREATE POLICY "Accountant view payments" ON payments FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'accountant');
CREATE POLICY "Accountant view invoices" ON invoices FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'accountant');
CREATE POLICY "Accountant view expenses" ON expenses FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'accountant');

-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- All authenticated users can view clients (basic info)
CREATE POLICY "Auth users view clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DEFAULT USERS
-- ============================================
-- NOTE: In production, use proper password hashing (bcrypt/argon2)
-- These are placeholder inserts - actual passwords should be set through the admin setup process
-- INSERT INTO profiles (name, email, role, password_hash) VALUES
--   ('Sharjeel', 'sharjeel@agswebworks.com', 'ceo', '$2b$12$...hashed...'),
--   ('Gufran', 'gufran@agswebworks.com', 'developer', '$2b$12$...hashed...'),
--   ('Addan', 'addan@agswebworks.com', 'accountant', '$2b$12$...hashed...');

-- ============================================
-- MAINTENANCE PLANS SEED
-- ============================================
INSERT INTO maintenance_plans (name, type, monthly_price, features, max_updates, max_support_tickets) VALUES
('Value Maintenance Plan', 'value', 0, '["Basic website maintenance and health checks", "Minor text and image updates", "Basic bug fixes", "Website uptime and functionality checks", "Basic technical support", "Monthly maintenance summary"]'::jsonb, 5, 3),
('Pro Maintenance Plan', 'pro', 0, '["Everything in Value plan", "Priority technical support", "More frequent website checks", "Minor design and layout improvements", "Content and image updates", "Performance and functionality checks", "Backup checks and recovery assistance", "Monthly maintenance report", "Priority handling of reported issues"]'::jsonb, 15, 10);
