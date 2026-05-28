// Storage utility using localStorage for persistent data
// All data is automatically saved on every change

const STORAGE_KEY = 'daily_expense_tracker_v1';

export const storage = {
  // Load all expenses from localStorage
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { expenses: [], settings: { currency: '₹', name: 'My Expenses' } };
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load from storage:', err);
      return { expenses: [], settings: { currency: '₹', name: 'My Expenses' } };
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
