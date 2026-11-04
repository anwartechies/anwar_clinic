import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './auth';
import { ToastProvider } from './lib';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Approvals from './pages/Approvals';
import Inventory, { Alerts, Counts } from './pages/Inventory';
import { Orders, Suppliers } from './pages/Purchasing';
import { Activity, Analytics, Discrepancies, Invoices, Notifications, Reports } from './pages/Insights';
import { Roles, Settings, Staff } from './pages/Team';

function App() {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--night)' }}><span className="logo"><span>N</span></span></div>;
  if (!user) return <Login />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="counts" element={<Counts />} />
        <Route path="discrepancies" element={<Discrepancies />} />
        <Route path="activity" element={<Activity />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="reports" element={<Reports />} />
        <Route path="staff" element={<Staff />} />
        <Route path="roles" element={<Roles />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
