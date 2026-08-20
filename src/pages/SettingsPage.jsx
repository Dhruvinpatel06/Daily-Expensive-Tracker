import { useState, useRef, useEffect } from 'react';
import { Save, Trash2, AlertTriangle, Upload, Download, Plus, Database, Check, Eye, Sparkles } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { storage } from '../utils/storage';
import { CATEGORIES, getTodayString } from '../utils/helpers';

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
  const {
    settings,
    updateSettings,
    expenses,
    exportCSV,
    exportJSON,
    importJSON,
    importCSV,
    deduplicate,
    addBatchExpenses,
    extractAndRestoreFromRaw,
  } = useExpenses();

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Live Browser Storage Inspector State
  const [rawStorageItems, setRawStorageItems] = useState([]);
  const [selectedRawKey, setSelectedRawKey] = useState(null);
  const [pasteText, setPasteText] = useState('');

  // Fast Batch Entry Table State
  const [batchRows, setBatchRows] = useState([
    { date: getTodayString(), category: 'food', amount: '', notes: '' },
    { date: getTodayString(), category: 'groceries', amount: '', notes: '' },
    { date: getTodayString(), category: 'bills', amount: '', notes: '' },
  ]);

  const refreshStorageInspector = () => {
    setRawStorageItems(storage.getRawStorageInspector());
  };

  useEffect(() => {
    refreshStorageInspector();
  }, [expenses.length]);

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      if (file.name.endsWith('.json')) {
        importJSON(text);
      } else if (file.name.endsWith('.csv')) {
        importCSV(text);
      } else {
        try {
          JSON.parse(text);
          importJSON(text);
        } catch {
          importCSV(text);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddBatchRow = () => {
    setBatchRows(prev => [...prev, { date: getTodayString(), category: 'other', amount: '', notes: '' }]);
  };

  const handleUpdateBatchRow = (idx, field, val) => {
    setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const handleRemoveBatchRow = (idx) => {
    setBatchRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveBatchRows = () => {
    const valid = batchRows.filter(r => Number(r.amount) > 0);
    if (valid.length === 0) return;
    addBatchExpenses(valid);
    setBatchRows([
      { date: getTodayString(), category: 'food', amount: '', notes: '' },
      { date: getTodayString(), category: 'groceries', amount: '', notes: '' },
    ]);
  };

  const dataSize = new Blob([JSON.stringify(storage.load())]).size;
  const formatBytes = b => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
          Settings & Data Control
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Manage your expenses, clean duplicates, backup files, and recovery tools
        </p>
      </div>

      {/* General settings */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          ⚙️ General Preferences
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            id="save-settings-btn"
            className="btn-primary"
            onClick={handleSave}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {saved ? '✅ Saved!' : <><Save size={14} /> Save Settings</>}
          </button>

          <button
            id="deduplicate-btn"
            className="btn-edit"
            onClick={deduplicate}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={14} /> Deduplicate & Clean All Transactions
          </button>
        </div>
      </div>

      {/* Live Browser Storage Inspector & Recovery */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="var(--accent-light)" /> Browser Storage Inspector & Recovery
          </h2>
          <button
            onClick={refreshStorageInspector}
            className="btn-edit"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            🔄 Refresh Inspector
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          Shows all data slots inside your active browser. If your previous July 6 - August 16 records exist under any slot, click <strong>Restore</strong> to extract them.
        </p>

        {rawStorageItems.length === 0 ? (
          <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', fontSize: '13px', color: 'var(--text-muted)' }}>
            No storage keys found in this browser origin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rawStorageItems.map(item => (
              <div
                key={`${item.storage}_${item.key}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {item.key} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>({formatBytes(item.size)})</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.value.slice(0, 80)}...
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-edit"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => setSelectedRawKey(selectedRawKey === item.key ? null : item.key)}
                  >
                    <Eye size={12} /> {selectedRawKey === item.key ? 'Hide' : 'Inspect'}
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => extractAndRestoreFromRaw(item.value)}
                  >
                    📥 Restore
                  </button>
                </div>
              </div>
            ))}

            {selectedRawKey && (
              <div style={{ padding: '12px', borderRadius: '8px', background: '#0f0f18', border: '1px solid var(--border)', maxHeight: '180px', overflowY: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '11px', color: '#a0a0c0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {rawStorageItems.find(i => i.key === selectedRawKey)?.value}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Paste raw JSON/CSV string */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Or Paste Any Previous Text / JSON / CSV Backup:
          </label>
          <textarea
            className="custom-input"
            rows={2}
            placeholder="Paste raw JSON or CSV text here to extract and restore your transactions..."
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            style={{ fontSize: '12px', resize: 'vertical' }}
          />
          {pasteText.trim() && (
            <button
              className="btn-primary"
              onClick={() => {
                extractAndRestoreFromRaw(pasteText);
                setPasteText('');
              }}
              style={{ alignSelf: 'flex-start', padding: '8px 14px', fontSize: '12px' }}
            >
              Extract & Restore Pasted Data
            </button>
          )}
        </div>
      </div>

      {/* Fast Multi-Entry Spreadsheet Table for July 6 - August 16 */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              ⚡ Quick Multi-Row Entry Table
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Rapidly type or update your expenses for July & August all at once.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={handleSaveBatchRows}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={14} /> Save All Rows
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {batchRows.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 140px 110px 1fr 36px', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                className="custom-input"
                value={row.date}
                onChange={e => handleUpdateBatchRow(idx, 'date', e.target.value)}
                style={{ padding: '6px 8px', fontSize: '12px', colorScheme: 'dark' }}
              />
              <select
                className="custom-input"
                value={row.category}
                onChange={e => handleUpdateBatchRow(idx, 'category', e.target.value)}
                style={{ padding: '6px 8px', fontSize: '12px' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (₹)"
                className="custom-input"
                value={row.amount}
                onChange={e => handleUpdateBatchRow(idx, 'amount', e.target.value)}
                style={{ padding: '6px 8px', fontSize: '12px', fontWeight: '700' }}
              />
              <input
                type="text"
                placeholder="Note / Description"
                className="custom-input"
                value={row.notes}
                onChange={e => handleUpdateBatchRow(idx, 'notes', e.target.value)}
                style={{ padding: '6px 8px', fontSize: '12px' }}
              />
              <button
                className="btn-danger"
                onClick={() => handleRemoveBatchRow(idx)}
                style={{ padding: '6px', height: '34px', width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Remove Row"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn-edit"
          onClick={handleAddBatchRow}
          style={{ alignSelf: 'flex-start', padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={13} /> Add Another Row
        </button>
      </div>

      {/* Backup & Import */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          💾 File Backup & Import
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          Export your actual records to CSV spreadsheet or JSON backup, or import an existing file.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv,.json"
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="import-btn"
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={14} /> Import Backup File (CSV / JSON)
          </button>

          <button
            id="settings-export-btn"
            onClick={exportCSV}
            className="btn-edit"
            style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={14} /> Export to CSV
          </button>

          <button
            id="settings-export-json-btn"
            onClick={exportJSON}
            className="btn-edit"
            style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={14} /> Export JSON Backup
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
          Permanently clear all records in this tracker.
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
    </div>
  );
}
