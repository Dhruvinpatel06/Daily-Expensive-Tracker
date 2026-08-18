import { useState, useMemo } from 'react';
import { Search, Pencil, Trash2, ChevronDown, Filter } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate, getCategoryById, CATEGORIES, getMonthKey, normalizeDateString } from '../utils/helpers';
import { format } from 'date-fns';

export default function ExpensesPage({ onEdit }) {
  const { expenses, deleteExpense, settings } = useExpenses();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const currency = settings.currency;

  // Get unique months from expenses
  const months = useMemo(() => {
    const seen = new Set();
    expenses.forEach(e => {
      const m = getMonthKey(e.date);
      if (m && m.length === 7) {
        seen.add(m);
      }
    });
    return [...seen].sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    let list = [...expenses];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        getCategoryById(e.category).label.toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q) ||
        String(e.amount).includes(q)
      );
    }

    // Category filter
    if (filterCat !== 'all') {
      list = list.filter(e => e.category === filterCat);
    }

    // Month filter
    if (filterMonth !== 'all') {
      list = list.filter(e => getMonthKey(e.date) === filterMonth);
    }

    // Sort
    switch (sortBy) {
      case 'date-desc': list.sort((a, b) => new Date(normalizeDateString(b.date)) - new Date(normalizeDateString(a.date))); break;
      case 'date-asc': list.sort((a, b) => new Date(normalizeDateString(a.date)) - new Date(normalizeDateString(b.date))); break;
      case 'amount-desc': list.sort((a, b) => Number(b.amount) - Number(a.amount)); break;
      case 'amount-asc': list.sort((a, b) => Number(a.amount) - Number(b.amount)); break;
    }

    return list;
  }, [expenses, search, filterCat, filterMonth, sortBy]);

  const total = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount), 0), [filtered]);

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deleteExpense(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
          All Expenses
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          {filtered.length} records • Total: {formatCurrency(total, currency)}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="search-container" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" />
          <input
            id="expense-search"
            className="custom-input"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          id="filter-category"
          className="custom-input"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>

        {/* Month filter */}
        <select
          id="filter-month"
          className="custom-input"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="all">All Months</option>
          {months.map(m => (
            <option key={m} value={m}>
              {format(new Date(m + '-01'), 'MMMM yyyy')}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          id="sort-expenses"
          className="custom-input"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Expense list */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px 120px 80px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          fontSize: '12px',
          fontWeight: '700',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          <span>Expense</span>
          <span>Date</span>
          <span>Amount</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px' }}>🔍</div>
            <h3 style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>No expenses found</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
              {expenses.length === 0 ? 'Add your first expense to get started!' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((expense, idx) => {
              const cat = getCategoryById(expense.category);
              const isDeleting = confirmDelete === expense.id;
              return (
                <div
                  key={expense.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 120px 80px',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                    background: isDeleting ? 'rgba(239,68,68,0.05)' : 'transparent',
                  }}
                  onMouseEnter={e => !isDeleting && (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => !isDeleting && (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Category + notes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: cat.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {cat.label}
                      </div>
                      {expense.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {expense.notes.length > 40 ? expense.notes.slice(0, 40) + '…' : expense.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatDate(expense.date)}
                  </span>

                  {/* Amount */}
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}
                    className="amount-text">
                    -{formatCurrency(expense.amount, currency)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      id={`edit-${expense.id}`}
                      className="btn-edit"
                      onClick={() => onEdit(expense)}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      id={`delete-${expense.id}`}
                      className="btn-danger"
                      onClick={() => handleDelete(expense.id)}
                      title={isDeleting ? 'Click again to confirm' : 'Delete'}
                      style={{ minWidth: isDeleting ? '64px' : undefined, gap: isDeleting ? '4px' : undefined }}
                    >
                      {isDeleting ? (
                        <>
                          <Trash2 size={12} />
                          <span style={{ fontSize: '11px', fontWeight: '700' }}>Sure?</span>
                        </>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer total */}
        {filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 120px 80px',
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
          }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              {filtered.length} expense{filtered.length !== 1 ? 's' : ''} shown
            </span>
            <span></span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-light)' }}
              className="amount-text">
              {formatCurrency(total, currency)}
            </span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );
}
