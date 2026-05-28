import { useState, useEffect } from 'react';
import { X, Calendar, Tag, DollarSign, FileText } from 'lucide-react';
import { CATEGORIES, getTodayString } from '../utils/helpers';
import { useExpenses } from '../context/ExpenseContext';

const emptyForm = {
  amount: '',
  category: 'food',
  date: getTodayString(),
  notes: '',
};

export default function ExpenseModal({ isOpen, onClose, editingExpense }) {
  const { addExpense, editExpense } = useExpenses();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editingExpense);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount: editingExpense.amount,
        category: editingExpense.category,
        date: editingExpense.date,
        notes: editingExpense.notes || '',
      });
    } else {
      setForm({ ...emptyForm, date: getTodayString() });
    }
    setErrors({});
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }
    if (!form.date) errs.date = 'Select a date';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 150)); // brief animation
    const data = {
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      notes: form.notes.trim(),
    };
    if (isEditing) {
      editExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setSaving(false);
    onClose();
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content glass-card"
        style={{ width: '100%', maxWidth: '460px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {isEditing ? 'Update expense details' : 'Record a new expense'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Amount */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={13} /> Amount *
              </span>
            </label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              className="custom-input"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              style={{
                fontSize: '20px',
                fontWeight: '700',
                ...(errors.amount ? { borderColor: 'var(--danger)' } : {}),
              }}
              autoFocus
            />
            {errors.amount && (
              <p style={{ color: 'var(--danger)', fontSize: '12px', margin: '4px 0 0' }}>{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={13} /> Category
              </span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  id={`cat-${cat.id}`}
                  onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                  title={cat.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 6px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: form.category === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                    background: form.category === cat.id ? cat.bg : 'var(--bg-secondary)',
                    transition: 'all 0.15s ease',
                    fontSize: '18px',
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span style={{ fontSize: '9px', color: form.category === cat.id ? cat.color : 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} /> Date *
              </span>
            </label>
            <input
              id="expense-date"
              type="date"
              className="custom-input"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              style={{
                colorScheme: 'dark',
                ...(errors.date ? { borderColor: 'var(--danger)' } : {}),
              }}
            />
            {errors.date && (
              <p style={{ color: 'var(--danger)', fontSize: '12px', margin: '4px 0 0' }}>{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={13} /> Notes (optional)
              </span>
            </label>
            <textarea
              id="expense-notes"
              className="custom-input"
              placeholder="Add a note..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              style={{ resize: 'none', lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              id="save-expense-btn"
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{
                flex: 2,
                padding: '12px',
                fontSize: '14px',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? '⏳ Saving...' : isEditing ? '✅ Update Expense' : '✅ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
