import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { useExpenses } from '../context/ExpenseContext';
import {
  formatCurrency,
  getCategoryById,
  getCategoryTotals,
  getLast6MonthsData,
} from '../utils/helpers';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler
);

const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: '#8b8ba8',
        font: { family: 'Inter', size: 12, weight: '500' },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#16161f',
      borderColor: '#2a2a3d',
      borderWidth: 1,
      titleColor: '#f0f0ff',
      bodyColor: '#8b8ba8',
      padding: 12,
      cornerRadius: 10,
      titleFont: { family: 'Inter', weight: '700', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
    },
  },
};

export default function AnalyticsPage() {
  const { expenses, settings } = useExpenses();
  const currency = settings.currency;
  const [selectedMonth, setSelectedMonth] = useState('current');

  const currentMonthKey = useMemo(() => format(new Date(), 'yyyy-MM'), []);

  // Compute all available unique months from expense history
  const availableMonths = useMemo(() => {
    const set = new Set();
    set.add(currentMonthKey);
    expenses.forEach(e => {
      try {
        const m = format(parseISO(e.date), 'yyyy-MM');
        set.add(m);
      } catch (err) {
        void err;
      }
    });
    return [...set].sort().reverse();
  }, [expenses, currentMonthKey]);

  // Expenses filtered by selected month option
  const selectedExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    const targetMonth = selectedMonth === 'current' ? currentMonthKey : selectedMonth;
    return expenses.filter(e => {
      try {
        return format(parseISO(e.date), 'yyyy-MM') === targetMonth;
      } catch {
        return false;
      }
    });
  }, [expenses, selectedMonth, currentMonthKey]);

  const categoryTotals = useMemo(() => getCategoryTotals(selectedExpenses), [selectedExpenses]);
  const last6Months = useMemo(() => getLast6MonthsData(expenses), [expenses]);

  // Human-readable label for selected month
  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'All Time';
    const targetMonth = selectedMonth === 'current' ? currentMonthKey : selectedMonth;
    if (targetMonth === currentMonthKey) return 'This Month';
    try {
      return format(new Date(targetMonth + '-01'), 'MMMM yyyy');
    } catch {
      return targetMonth;
    }
  }, [selectedMonth, currentMonthKey]);

  // Pie chart data
  const pieData = useMemo(() => {
    const cats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    return {
      labels: cats.map(([id]) => {
        const cat = getCategoryById(id);
        return `${cat.emoji} ${cat.label}`;
      }),
      datasets: [{
        data: cats.map(([, amount]) => amount),
        backgroundColor: cats.map(([id]) => getCategoryById(id).color + 'cc'),
        borderColor: cats.map(([id]) => getCategoryById(id).color),
        borderWidth: 2,
        hoverOffset: 8,
      }],
    };
  }, [categoryTotals]);

  // Line chart data
  const lineData = useMemo(() => ({
    labels: last6Months.map(m => m.label),
    datasets: [{
      label: 'Monthly Spending',
      data: last6Months.map(m => m.total),
      borderColor: '#7c5cfc',
      backgroundColor: 'rgba(124,92,252,0.12)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#7c5cfc',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#9d84fd',
    }],
  }), [last6Months]);

  const lineOptions = {
    ...chartDefaults,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: '#2a2a3d' },
        ticks: { color: '#8b8ba8', font: { family: 'Inter', size: 12 } },
      },
      y: {
        grid: { color: '#2a2a3d' },
        ticks: {
          color: '#8b8ba8',
          font: { family: 'Inter', size: 12 },
          callback: v => `${currency}${v.toLocaleString('en-IN')}`,
        },
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.raw, currency)}`,
        },
      },
    },
  };

  const pieOptions = {
    ...chartDefaults,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        ...chartDefaults.plugins.legend,
        position: 'bottom',
      },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: ctx => ` ${formatCurrency(ctx.raw, currency)} (${((ctx.raw / (Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  const totalSelectedPeriod = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const maxMonth = Math.max(...last6Months.map(m => m.total));
  const avgMonth = last6Months.filter(m => m.total > 0).reduce((s, m) => s + m.total, 0) /
    (last6Months.filter(m => m.total > 0).length || 1);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Analytics
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Visual breakdown of your spending patterns
          </p>
        </div>

        {/* Global Month Filter for Category Breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Select Period:
          </label>
          <select
            id="analytics-month-select"
            className="custom-input"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="current">This Month ({format(new Date(), 'MMM yyyy')})</option>
            <option value="all">All Time</option>
            {availableMonths
              .filter(m => m !== currentMonthKey)
              .map(m => (
                <option key={m} value={m}>
                  {format(new Date(m + '-01'), 'MMMM yyyy')}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {[
          { label: selectedMonthLabel, value: formatCurrency(totalSelectedPeriod, currency), emoji: '📅' },
          { label: 'Peak Month', value: formatCurrency(maxMonth, currency), emoji: '🔝' },
          { label: '6-Month Avg', value: formatCurrency(avgMonth, currency), emoji: '📊' },
          { label: 'Total Expenses', value: expenses.length, emoji: '📋' },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass-card"
            style={{ flex: 1, padding: '18px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.emoji}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}
              className="amount-text">
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie chart */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {selectedMonthLabel} by Category
            </h3>
          </div>
          {Object.keys(categoryTotals).length === 0 ? (
            <div className="empty-state" style={{ height: '280px' }}>
              <div style={{ fontSize: '48px' }}>📊</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                No data for {selectedMonthLabel.toLowerCase()}
              </p>
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
        </div>

        {/* Line chart */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
            6-Month Spending Trend
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Category Breakdown — {selectedMonthLabel}
        </h3>
        {Object.keys(categoryTotals).length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No expenses for {selectedMonthLabel.toLowerCase()}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([catId, amount]) => {
                const cat = getCategoryById(catId);
                const pct = totalSelectedPeriod ? ((amount / totalSelectedPeriod) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={catId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: cat.bg,
                      border: `1px solid ${cat.color}33`,
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{cat.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {pct}% of total
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: cat.color }}
                      className="amount-text">
                      {formatCurrency(amount, currency)}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

