# AGS WEBWORKS — Business Management System

## Overview

A complete internal business management web application for AGS WEBWORKS, a website development and digital services agency based in Dammam and Al Khobar, Saudi Arabia.

**Website:** https://agswebworks.com

## Features

- **Client Database** — Full CRM with lead tracking, contact management, and status pipeline
- **Orders & Projects** — Complete project lifecycle management with Kanban board
- **Tasks & Assignments** — Team task management with deadlines and priorities
- **Payments & Invoices** — Financial tracking with invoice generation
- **Expenses & Profit** — Business expense tracking and profitability analysis
- **Website Maintenance** — Subscription management, billing, and support tickets
- **Reports & Analytics** — Business insights with date-range filtering and CSV export
- **Team Management** — Role-based access control with activity logging
- **Notifications** — Real-time alerts for assignments, deadlines, and payments
- **Files & Documents** — Organized file management linked to clients and projects

## Team Accounts

| Name | Role | Email | Initial Password |
|------|------|-------|-----------------|
| Sharjeel | CEO & Marketing | sharjeel@agswebworks.com | AGS@CEO2024! |
| Gufran | Web Developer | gufran@agswebworks.com | AGS@Dev2024! |
| Addan | Accountant | addan@agswebworks.com | AGS@Acc2024! |

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Vite
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth with Row Level Security
- **Currency:** Saudi Riyal (SAR)
- **Timezone:** Asia/Riyadh

## Demo Mode

The application runs in demo mode using browser localStorage when no Supabase connection is configured. All data persists across page refreshes.

## Production Setup with Supabase

### 1. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL migration at `supabase/migrations/001_initial_schema.sql`
3. This creates all tables, indexes, RLS policies, and seed data

### 3. Authentication Setup

1. Enable Email authentication in Supabase Dashboard
2. Disable public signups
3. Create the three team member accounts through the Supabase dashboard or use the seed script
4. Set up password policies (minimum 8 characters, require special characters)

### 4. Storage Setup (for file uploads)

1. Create a private bucket called `ags-files`
2. Set up storage policies to restrict access by role

### 5. Deploy

```bash
npm install
npm run build
```

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

## Database Schema

### Core Tables
- `profiles` — User accounts with roles
- `clients` — Client/customer database
- `orders` — Project orders with workflow tracking
- `tasks` — Team task assignments
- `payments` — Financial transactions
- `expenses` — Business expenses
- `invoices` — Client invoices
- `files` — Document/file storage records
- `notifications` — In-app notifications
- `activity_logs` — Audit trail

### Maintenance Tables
- `maintenance_plans` — Service plan definitions
- `maintenance_subscriptions` — Client subscriptions
- `maintenance_invoices` — Recurring billing
- `maintenance_tickets` — Support requests

### Settings
- `business_settings` — Company configuration

## Role Permissions

### Sharjeel (CEO)
- Full access to all modules
- Manage team permissions
- Approve expenses
- Configure business settings and maintenance plans
- View activity logs

### Gufran (Developer)
- View assigned projects and tasks only
- Update project status and links
- Manage maintenance tickets assigned to him
- Upload project files
- Cannot access financial records or settings

### Addan (Accountant)
- Manage payments, invoices, and expense records
- Track order deadlines and delivery
- Generate maintenance invoices
- View reports and analytics
- Cannot modify user permissions or settings

## Recurring Billing Scheduler

For automatic monthly invoice generation in production:

1. **Supabase Edge Functions** — Set up a cron-triggered function
2. **External Scheduler** — Use GitHub Actions, cron-job.org, or a serverless scheduler
3. **Manual Generation** — Use the "Generate Invoice" button in the maintenance module

The system prevents duplicate invoices through database constraints on `(subscription_id, billing_period_start)`.

## Security

- Passwords are never stored in plain text
- Row Level Security (RLS) policies enforce data access
- API keys are stored in environment variables only
- No sensitive data exposed to unauthorized roles
- Activity logging for audit trail
- Session management with secure tokens

## Support

For technical support or questions about this system, contact the development team.

---

*Built for AGS WEBWORKS — Dammam / Al Khobar, Saudi Arabia*
