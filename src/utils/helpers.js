import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';

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
  `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (dateStr) => {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

export const getMonthExpenses = (expenses, monthsAgo = 0) => {
  const targetDate = subMonths(new Date(), monthsAgo);
  const start = startOfMonth(targetDate);
  const end = endOfMonth(targetDate);
  return expenses.filter(e => {
    try {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start, end });
    } catch {
      return false;
    }
  });
};

export const getMonthTotal = (expenses, monthsAgo = 0) =>
  getMonthExpenses(expenses, monthsAgo).reduce((sum, e) => sum + Number(e.amount), 0);

export const getCategoryTotals = (expenses) => {
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return totals;
};

export const getLast6MonthsData = (expenses) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({
      label: format(d, 'MMM'),
      total: getMonthTotal(expenses, i),
    });
  }
  return months;
};
