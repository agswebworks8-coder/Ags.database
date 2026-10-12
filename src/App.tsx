import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './lib/auth';
import Logo from './components/Logo';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import OrdersPage from './pages/Orders';
import TasksPage from './pages/Tasks';
import PaymentsPage from './pages/Payments';
import ExpensesPage from './pages/Expenses';
import TeamPage from './pages/Team';
import FilesPage from './pages/Files';
import ReportsPage from './pages/Reports';
import MaintenancePage from './pages/Maintenance';
import NotificationsPage from './pages/Notifications';
import SettingsPage from './pages/Settings';

function Protected({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 animate-pulse"><Logo size={64} variant="white" /></div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
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
