import { format, parseISO, isValid, subMonths } from 'date-fns';

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', emoji: '🍔', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎮', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { id: 'health', label: 'Health', emoji: '💊', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  { id: 'education', label: 'Education', emoji: '📚', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { id: 'bills', label: 'Bills & Utilities', emoji: '📋', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒', color: '#84cc16', bg: 'rgba(132,204,22,0.15)' },
  { id: 'travel', label: 'Travel', emoji: '✈️', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { id: 'other', label: 'Other', emoji: '💸', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Correctly parse and format date strings into standard YYYY-MM-DD
export const normalizeDateString = (dateStr) => {
  if (!dateStr) return format(new Date(), 'yyyy-MM-dd');
  const str = String(dateStr).trim();

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const part2 = parseInt(ymdMatch[2], 10);
    const part3 = parseInt(ymdMatch[3], 10);

    // If month > 12, it's YYYY-DD-MM (e.g. 2026-15-08 -> 2026-08-15)
    if (part2 > 12 && part3 <= 12) {
      return `${y}-${String(part3).padStart(2, '0')}-${String(part2).padStart(2, '0')}`;
    }

    return `${y}-${String(part2).padStart(2, '0')}-${String(part3).padStart(2, '0')}`;
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = dmyMatch[3];
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  try {
    const d = new Date(str);
    if (isValid(d)) {
      return format(d, 'yyyy-MM-dd');
    }
  } catch {}

  return str;
};

export const parseDateSafe = (dateStr) => {
  const norm = normalizeDateString(dateStr);
  try {
    const d = parseISO(norm);
    if (isValid(d)) return d;
  } catch {}
  return new Date();
};

export const formatDate = (dateStr) => {
  try {
    const d = parseDateSafe(dateStr);
    return format(d, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

export const getMonthKey = (dateStr) => {
  try {
    const norm = normalizeDateString(dateStr);
    return norm.slice(0, 7); // 'YYYY-MM'
  } catch {
    return format(new Date(), 'yyyy-MM');
  }
};

export const getMonthExpenses = (expenses = [], monthsAgo = 0) => {
  const targetDate = subMonths(new Date(), monthsAgo);
  const targetKey = format(targetDate, 'yyyy-MM');
  return (expenses || []).filter(e => getMonthKey(e.date) === targetKey);
};

export const getMonthTotal = (expenses = [], monthsAgo = 0) =>
  getMonthExpenses(expenses, monthsAgo).reduce((sum, e) => sum + Number(e.amount || 0), 0);

export const getCategoryTotals = (expenses = []) => {
  const totals = {};
  (expenses || []).forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
  });
  return totals;
};

export const getLast6MonthsData = (expenses = []) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({
      label: format(d, 'MMM'),
      key: format(d, 'yyyy-MM'),
      total: getMonthTotal(expenses, i),
    });
  }
  return months;
};
