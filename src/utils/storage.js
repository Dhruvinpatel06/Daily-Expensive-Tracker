// Storage utility using localStorage for persistent data
// All data is automatically saved on every change

const STORAGE_KEY = 'daily_expense_tracker_v1';

export const DEFAULT_JULY_EXPENSES = [
  { id: 'july-101', category: 'food', amount: 450, date: '2026-07-28', notes: 'Dinner with friends at Olive Bistro', createdAt: '2026-07-28T19:30:00.000Z' },
  { id: 'july-102', category: 'groceries', amount: 1250, date: '2026-07-26', notes: 'Weekly organic groceries & fruits', createdAt: '2026-07-26T11:00:00.000Z' },
  { id: 'july-103', category: 'bills', amount: 2100, date: '2026-07-24', notes: 'Electricity & Wi-Fi bill payment', createdAt: '2026-07-24T09:15:00.000Z' },
  { id: 'july-104', category: 'transport', amount: 350, date: '2026-07-22', notes: 'Uber cab to office & back', createdAt: '2026-07-22T18:00:00.000Z' },
  { id: 'july-105', category: 'shopping', amount: 3499, date: '2026-07-20', notes: 'New running shoes', createdAt: '2026-07-20T16:45:00.000Z' },
  { id: 'july-106', category: 'entertainment', amount: 699, date: '2026-07-18', notes: 'Movie tickets & popcorn', createdAt: '2026-07-18T20:00:00.000Z' },
  { id: 'july-107', category: 'health', amount: 850, date: '2026-07-15', notes: 'Pharmacy & vitamins', createdAt: '2026-07-15T14:20:00.000Z' },
  { id: 'july-108', category: 'education', amount: 1999, date: '2026-07-10', notes: 'Online tech course subscription', createdAt: '2026-07-10T10:00:00.000Z' },
  { id: 'july-109', category: 'food', amount: 320, date: '2026-07-05', notes: 'Coffee & breakfast', createdAt: '2026-07-05T08:30:00.000Z' },
  { id: 'july-110', category: 'travel', amount: 4500, date: '2026-07-02', notes: 'Weekend resort stay booking', createdAt: '2026-07-02T12:00:00.000Z' },
];

export const storage = {
  // Load all expenses from localStorage
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initialData = { expenses: DEFAULT_JULY_EXPENSES, settings: { currency: '₹', name: 'My Expenses' } };
        this.save(initialData);
        return initialData;
      }
      const parsed = JSON.parse(raw);
      if (!parsed.expenses || parsed.expenses.length === 0) {
        parsed.expenses = DEFAULT_JULY_EXPENSES;
        this.save(parsed);
      }
      return parsed;
    } catch (err) {
      console.error('Failed to load from storage:', err);
      return { expenses: DEFAULT_JULY_EXPENSES, settings: { currency: '₹', name: 'My Expenses' } };
    }
  },

  // Save all data to localStorage
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Failed to save to storage:', err);
      return false;
    }
  },

  // Get all expenses
  getExpenses() {
    return this.load().expenses || [];
  },

  // Save expenses array
  saveExpenses(expenses) {
    const data = this.load();
    data.expenses = expenses;
    return this.save(data);
  },

  // Restore July sample expense data
  restoreJulyData() {
    const data = this.load();
    const existingIds = new Set(data.expenses.map(e => e.id));
    const toAdd = DEFAULT_JULY_EXPENSES.filter(e => !existingIds.has(e.id));
    data.expenses = [...toAdd, ...data.expenses];
    this.save(data);
    return data.expenses;
  },

  // Get settings
  getSettings() {
    return this.load().settings || { currency: '₹', name: 'My Expenses' };
  },

  // Save settings
  saveSettings(settings) {
    const data = this.load();
    data.settings = settings;
    return this.save(data);
  },

  // Export to CSV
  exportCSV(expenses) {
    const headers = ['Date', 'Category', 'Amount', 'Notes'];
    const rows = expenses.map(e => [
      e.date,
      e.category,
      e.amount,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
