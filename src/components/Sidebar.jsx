import { useState } from 'react';
import { LayoutDashboard, ListOrdered, BarChart2, Settings, Plus, Download, X, TrendingUp } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: ListOrdered },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, onAddNew, onExport }) {
  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
        gap: '4px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '8px 14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            💰
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              Expense
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-light)' }}>
              Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense button */}
      <button
        id="add-expense-btn"
        className="btn-primary"
        onClick={onAddNew}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 14px',
          marginBottom: '16px',
          fontSize: '14px',
          width: '100%',
        }}
      >
        <Plus size={16} />
        Add Expense
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      {/* Export button */}
      <button
        id="export-csv-btn"
        onClick={onExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '10px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: '1px solid var(--border)',
          fontSize: '14px',
          fontFamily: 'inherit',
          fontWeight: '500',
          transition: 'all 0.2s',
          marginTop: '8px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <Download size={15} />
        Export CSV
      </button>

      {/* Footer */}
      <div style={{
        marginTop: '16px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: 'var(--accent-glow)',
        border: '1px solid rgba(124,92,252,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <TrendingUp size={14} color="var(--accent-light)" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-light)' }}>Auto-saved</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          All data saved locally & persists after restart
        </p>
      </div>
    </aside>
  );
}
