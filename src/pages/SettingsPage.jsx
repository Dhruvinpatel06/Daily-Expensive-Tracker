import { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { storage } from '../utils/storage';

const CURRENCIES = [
  { symbol: '₹', label: 'Indian Rupee (₹)' },
  { symbol: '$', label: 'US Dollar ($)' },
  { symbol: '€', label: 'Euro (€)' },
  { symbol: '£', label: 'British Pound (£)' },
  { symbol: '¥', label: 'Japanese Yen (¥)' },
  { symbol: 'A$', label: 'Australian Dollar (A$)' },
  { symbol: 'C$', label: 'Canadian Dollar (C$)' },
];

export default function SettingsPage() {
  const { settings, updateSettings, expenses, exportCSV } = useExpenses();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      storage.save({ expenses: [], settings: form });
      window.location.reload();
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  const dataSize = new Blob([JSON.stringify(storage.load())]).size;
  const formatBytes = b => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Customize your expense tracker
        </p>
      </div>

      {/* General settings */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          ⚙️ General
        </h2>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Dashboard Title
          </label>
          <input
            id="settings-name"
            className="custom-input"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="My Expenses"
          />
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            This shows as the title on your dashboard
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Currency
          </label>
          <select
            id="settings-currency"
            className="custom-input"
            value={form.currency}
            onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
          >
            {CURRENCIES.map(c => (
              <option key={c.symbol} value={c.symbol}>{c.label}</option>
            ))}
          </select>
        </div>

        <button
          id="save-settings-btn"
          className="btn-primary"
          onClick={handleSave}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            minWidth: '140px',
            justifyContent: 'center',
          }}
        >
          {saved ? '✅ Saved!' : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      {/* Data management */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          💾 Data Management
        </h2>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Total Expenses', value: expenses.length },
            { label: 'Storage Used', value: formatBytes(dataSize) },
            { label: 'Auto-Save', value: '✅ Active' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Export Data
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Download all your expenses as a CSV file you can open in Excel or Google Sheets.
          </p>
          <button
            id="settings-export-btn"
            onClick={exportCSV}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderColor: 'rgba(239,68,68,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Danger Zone
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          This will permanently delete all {expenses.length} expense records. This action cannot be undone.
        </p>
        <button
          id="clear-all-btn"
          onClick={handleClearAll}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${showClearConfirm ? 'var(--danger)' : 'rgba(239,68,68,0.3)'}`,
            background: showClearConfirm ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)',
            color: 'var(--danger)',
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            alignSelf: 'flex-start',
          }}
        >
          <Trash2 size={14} />
          {showClearConfirm ? '⚠️ Click again to confirm deletion' : 'Clear All Data'}
        </button>
      </div>

      {/* About */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>
          ℹ️ About
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Daily Expense Tracker</strong> — Your personal spending companion.
          All data is stored locally in your browser's localStorage. No internet connection or backend required.
          Data persists across browser closes, refreshes, and laptop restarts.
        </p>
      </div>
    </div>
  );
}
