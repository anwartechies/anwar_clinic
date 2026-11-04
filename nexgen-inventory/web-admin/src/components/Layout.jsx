import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Boxes, Building2, ChartColumn, ClipboardList, FileText, Flag, History, LayoutDashboard, ListChecks, LogOut, Menu, Receipt, Settings, ShieldCheck, TriangleAlert, Users, ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../auth';
import { useFetch } from '../lib';
import { Avatar, IconBtn } from './ui';

const NAV = [
  ['Overview', [['/', 'Dashboard', LayoutDashboard], ['/approvals', 'Approvals', ListChecks, 'approvals'], ['/analytics', 'Analytics', ChartColumn]]],
  ['Inventory', [['/inventory', 'Catalogue', Boxes], ['/alerts', 'Stock alerts', TriangleAlert], ['/orders', 'Purchase orders', ClipboardList], ['/suppliers', 'Suppliers', Building2], ['/counts', 'Stock counts', ClipboardCheck]]],
  ['Control', [['/discrepancies', 'Discrepancies', Flag], ['/activity', 'Activity log', History], ['/invoices', 'Invoices', Receipt], ['/reports', 'Reports & export', FileText]]],
  ['Team', [['/staff', 'Staff', Users], ['/roles', 'Roles & permissions', ShieldCheck], ['/settings', 'Settings', Settings]]],
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const counts = useFetch('/approvals', { status: 'pending', _: loc.pathname });
  const notes = useFetch('/notifications', { _: loc.pathname });
  useEffect(() => setOpen(false), [loc.pathname]);
  const pending = counts.data ? counts.data.counts.all : 0;

  return (
    <div className="shell">
      <nav className={`side ${open ? 'open' : ''}`} aria-label="Main">
        <div className="brand">
          <span className="logo"><span>N</span></span>
          <div><div className="disp" style={{ fontWeight: 800, fontSize: 17 }}>Nexgen</div><div style={{ fontSize: 12, color: '#AEB8D8' }}>Inventory · Admin</div></div>
        </div>
        {NAV.map(([group, items]) => (
          <React.Fragment key={group}>
            <div className="group">{group}</div>
            {items.map(([to, label, Icon, badge]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={18} />{label}{badge === 'approvals' && pending ? <span className="count">{pending}</span> : null}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
        <div className="me">
          <Avatar initials={user.initials} bg="#14C79A" fg="#0A1633" size="sm" />
          <div className="grow"><div style={{ fontWeight: 700, fontSize: 13 }} className="ell">{user.name}</div><div style={{ fontSize: 11.5, color: '#AEB8D8' }}>Super Admin</div></div>
          <button type="button" className="iconbtn" style={{ width: 34, height: 34, background: 'rgba(255,255,255,.1)', color: '#fff', boxShadow: 'none' }} aria-label="Sign out" title="Sign out" onClick={signOut}><LogOut size={16} /></button>
        </div>
      </nav>
      <div className="main">
        <header className="topbar">
          <span className="menu-btn"><IconBtn icon={Menu} label="Menu" onClick={() => setOpen(!open)} /></span>
          <div className="grow">
            <div className="sub hide-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })} · Nexgen Hair Clinic, Patna</div>
          </div>
          <IconBtn icon={Bell} label="Notifications" badge={notes.data && notes.data.unread > 0} onClick={() => nav('/notifications')} />
          <Avatar initials={user.initials} bg="#0A1633" fg="#FFFFFF" />
        </header>
        <main className="content"><Outlet /></main>
      </div>
      {open ? <div className="scrim" style={{ zIndex: 45 }} onClick={() => setOpen(false)} /> : null}
    </div>
  );
}
