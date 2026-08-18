import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import {
  formatCurrency,
  formatDate,
  getMonthTotal,
  getMonthExpenses,
  getCategoryById,
  getCategoryTotals,
  normalizeDateString,
} from '../utils/helpers';
import { format } from 'date-fns';

function StatCard({ title, value, subtitle, icon, gradient, trend }) {
  return (
    <div className="stat-card fade-in-up" style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '600',
            color: trend >= 0 ? 'var(--danger)' : 'var(--success)',
            background: trend >= 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            padding: '4px 8px',
            borderRadius: '20px',
          }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}
        className="amount-text">
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>
      )}
    </div>
  );
}

export default function Dashboard({ onAddNew, setActiveTab }) {
  const { expenses, settings } = useExpenses();
  const currency = settings.currency;

  const currentMonthTotal = useMemo(() => getMonthTotal(expenses, 0), [expenses]);
  const lastMonthTotal = useMemo(() => getMonthTotal(expenses, 1), [expenses]);
  const totalAll = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);

  const trend = lastMonthTotal === 0 ? 0 :
    ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

  const thisMonthExpenses = useMemo(() => getMonthExpenses(expenses, 0), [expenses]);
  const recentExpenses = useMemo(() =>
    [...expenses]
      .sort((a, b) => new Date(normalizeDateString(b.date)) - new Date(normalizeDateString(a.date)))
      .slice(0, 5),
    [expenses]
  );

  const categoryTotals = useMemo(() => getCategoryTotals(thisMonthExpenses), [thisMonthExpenses]);
  const sortedCategories = useMemo(() =>
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    [categoryTotals]
  );

  const maxCatAmount = sortedCategories[0]?.[1] || 1;
  const todayTotal = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return expenses
      .filter(e => normalizeDateString(e.date) === today)
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {settings.name}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          id="dashboard-add-btn"
          className="btn-primary"
          onClick={onAddNew}
          style={{ padding: '12px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          + Add Expense
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard
          title="This Month"
          value={formatCurrency(currentMonthTotal, currency)}
          subtitle={`${thisMonthExpenses.length} transactions`}
          gradient="var(--gradient-1)"
          icon={<Wallet size={18} color="white" />}
          trend={trend}
        />
        <StatCard
          title="Today's Spending"
          value={formatCurrency(todayTotal, currency)}
          subtitle="Spent today"
          gradient="var(--gradient-2)"
          icon={<Calendar size={18} color="white" />}
        />
        <StatCard
          title="All Time Total"
          value={formatCurrency(totalAll, currency)}
          subtitle={`${expenses.length} total expenses`}
          gradient="var(--gradient-3)"
          icon={<TrendingUp size={18} color="white" />}
        />
      </div>

      {/* Main content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent transactions */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('expenses')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--accent-light)', fontSize: '13px', fontWeight: '600',
                fontFamily: 'inherit',
              }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div style={{ fontSize: '36px' }}>💸</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                No expenses yet. Add your first one!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentExpenses.map(expense => {
                const cat = getCategoryById(expense.category);
                return (
                  <div key={expense.id} className="expense-row" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0,
                      }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatDate(expense.date)}
                          {expense.notes && ` • ${expense.notes.slice(0, 25)}${expense.notes.length > 25 ? '…' : ''}`}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}
                      className="amount-text">
                      -{formatCurrency(expense.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top categories this month */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Top Categories This Month
            </h3>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--accent-light)', fontSize: '13px', fontWeight: '600',
                fontFamily: 'inherit',
              }}
            >
              Charts <ArrowRight size={14} />
            </button>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div style={{ fontSize: '36px' }}>📊</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                No data for this month yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sortedCategories.map(([catId, amount]) => {
                const cat = getCategoryById(catId);
                const pct = (amount / maxCatAmount) * 100;
                return (
                  <div key={catId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <span>{cat.emoji}</span>{cat.label}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}
                        className="amount-text">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
