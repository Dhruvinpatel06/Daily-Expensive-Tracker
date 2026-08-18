// Storage utility using localStorage for persistent data
// All data is automatically saved on every change and backed up

import { normalizeDateString } from './helpers';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'daily_expense_tracker_v1';
const BACKUP_KEY = 'daily_expense_tracker_backup';

export const DEFAULT_AUGUST_EXPENSES = [
  { id: 'aug-101', category: 'food', amount: 380, date: '2026-08-18', notes: 'Lunch with colleagues at Subway', createdAt: '2026-08-18T13:15:00.000Z' },
  { id: 'aug-102', category: 'transport', amount: 280, date: '2026-08-16', notes: 'Metro smart card recharge & auto', createdAt: '2026-08-16T09:30:00.000Z' },
  { id: 'aug-103', category: 'groceries', amount: 1850, date: '2026-08-15', notes: 'Independence Day festival grocery shopping', createdAt: '2026-08-15T11:45:00.000Z' },
  { id: 'aug-104', category: 'shopping', amount: 2499, date: '2026-08-13', notes: 'Amazon Prime electronics & desk accessories', createdAt: '2026-08-13T17:20:00.000Z' },
  { id: 'aug-105', category: 'bills', amount: 1650, date: '2026-08-10', notes: 'Mobile postpaid & DTH subscription', createdAt: '2026-08-10T10:00:00.000Z' },
  { id: 'aug-106', category: 'food', amount: 750, date: '2026-08-08', notes: 'Weekend family dinner & dessert', createdAt: '2026-08-08T20:30:00.000Z' },
  { id: 'aug-107', category: 'health', amount: 600, date: '2026-08-06', notes: 'Dental checkup & medicine', createdAt: '2026-08-06T15:10:00.000Z' },
  { id: 'aug-108', category: 'transport', amount: 420, date: '2026-08-04', notes: 'Fuel petrol refill', createdAt: '2026-08-04T08:45:00.000Z' },
  { id: 'aug-109', category: 'entertainment', amount: 499, date: '2026-08-02', notes: 'Netflix & Spotify family subscription', createdAt: '2026-08-02T19:00:00.000Z' },
  { id: 'aug-110', category: 'groceries', amount: 980, date: '2026-08-01', notes: 'Monthly supermarket provisions', createdAt: '2026-08-01T10:30:00.000Z' },
];

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

export const DEFAULT_ALL_EXPENSES = [
  ...DEFAULT_AUGUST_EXPENSES,
  ...DEFAULT_JULY_EXPENSES,
];

// Helper to sanitize an individual expense object without losing any custom data
function sanitizeExpenseItem(item) {
  if (!item || typeof item !== 'object') return null;
  const amount = Number(item.amount);
  if (isNaN(amount) || amount <= 0) return null;

  return {
    id: item.id || uuidv4(),
    category: item.category || 'other',
    amount: amount,
    date: normalizeDateString(item.date),
    notes: String(item.notes || '').trim(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

// Deep scanner across all browser localStorage & sessionStorage keys
function recoverExpensesFromAllKeys() {
  const recoveredList = [];
  const seenSignatures = new Set();

  function addItem(rawItem) {
    const sanitized = sanitizeExpenseItem(rawItem);
    if (!sanitized) return;
    // Signature based on date + amount + category to prevent duplicate recovery
    const sig = `${sanitized.date}_${sanitized.amount}_${sanitized.category}_${sanitized.notes.slice(0, 15)}`;
    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      recoveredList.push(sanitized);
    }
  }

  function checkString(str) {
    if (!str || typeof str !== 'string') return;
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        parsed.forEach(addItem);
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.expenses)) parsed.expenses.forEach(addItem);
        if (Array.isArray(parsed.data)) parsed.data.forEach(addItem);
      }
    } catch {}
  }

  // Scan localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        checkString(localStorage.getItem(key));
      }
    }
  } catch {}

  // Scan sessionStorage
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        checkString(sessionStorage.getItem(key));
      }
    }
  } catch {}

  return recoveredList;
}

export const storage = {
  // Load all expenses from localStorage with auto-recovery and deep preservation
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let expenses = [];
      let settings = { currency: '₹', name: 'My Expenses' };

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.expenses)) {
            expenses = parsed.expenses.map(sanitizeExpenseItem).filter(Boolean);
          }
          if (parsed.settings) settings = parsed.settings;
        } catch {}
      }

      // Also scan for any orphaned custom expenses in other storage keys/backups
      const allRecovered = recoverExpensesFromAllKeys();
      const existingSignatures = new Set(
        expenses.map(e => `${e.date}_${e.amount}_${e.category}_${e.notes.slice(0, 15)}`)
      );

      allRecovered.forEach(rec => {
        const sig = `${rec.date}_${rec.amount}_${rec.category}_${rec.notes.slice(0, 15)}`;
        if (!existingSignatures.has(sig)) {
          existingSignatures.add(sig);
          expenses.push(rec);
        }
      });

      // If storage was completely empty, populate with default July & August dataset
      if (expenses.length === 0) {
        expenses = [...DEFAULT_ALL_EXPENSES];
      } else {
        // Ensure default July & August base items exist if user wants full records
        const existingIds = new Set(expenses.map(e => e.id));
        DEFAULT_ALL_EXPENSES.forEach(def => {
          const sig = `${def.date}_${def.amount}_${def.category}_${def.notes.slice(0, 15)}`;
          if (!existingIds.has(def.id) && !existingSignatures.has(sig)) {
            expenses.push(def);
          }
        });
      }

      // Sort newest first
      expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

      const finalData = { expenses, settings };
      this.save(finalData);
      return finalData;
    } catch (err) {
      console.error('Storage load failed, creating fallback:', err);
      const fallback = {
        expenses: [...DEFAULT_ALL_EXPENSES],
        settings: { currency: '₹', name: 'My Expenses' }
      };
      this.save(fallback);
      return fallback;
    }
  },

  // Save all data to localStorage & backup key
  save(data) {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(BACKUP_KEY, json);
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

  // Full scan and restore all custom + standard July & August expenses
  scanAndRecoverAllData() {
    const recovered = recoverExpensesFromAllKeys();
    const current = this.load().expenses;
    const existingSignatures = new Set(
      current.map(e => `${e.date}_${e.amount}_${e.category}_${e.notes.slice(0, 15)}`)
    );

    recovered.forEach(item => {
      const sig = `${item.date}_${item.amount}_${item.category}_${item.notes.slice(0, 15)}`;
      if (!existingSignatures.has(sig)) {
        existingSignatures.add(sig);
        current.push(item);
      }
    });

    DEFAULT_ALL_EXPENSES.forEach(def => {
      const sig = `${def.date}_${def.amount}_${def.category}_${def.notes.slice(0, 15)}`;
      if (!existingSignatures.has(sig)) {
        existingSignatures.add(sig);
        current.push(def);
      }
    });

    current.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.saveExpenses(current);
    return current;
  },

  // Restore July and August expense data fully
  restoreJulyAndAugustData() {
    return this.scanAndRecoverAllData();
  },

  // Restore July sample expense data
  restoreJulyData() {
    const data = this.load();
    const existingSignatures = new Set(
      data.expenses.map(e => `${e.date}_${e.amount}_${e.category}`)
    );
    DEFAULT_JULY_EXPENSES.forEach(j => {
      const sig = `${j.date}_${j.amount}_${j.category}`;
      if (!existingSignatures.has(sig)) {
        data.expenses.push(j);
      }
    });
    data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.save(data);
    return data.expenses;
  },

  // Restore August sample expense data
  restoreAugustData() {
    const data = this.load();
    const existingSignatures = new Set(
      data.expenses.map(e => `${e.date}_${e.amount}_${e.category}`)
    );
    DEFAULT_AUGUST_EXPENSES.forEach(a => {
      const sig = `${a.date}_${a.amount}_${a.category}`;
      if (!existingSignatures.has(sig)) {
        data.expenses.push(a);
      }
    });
    data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.save(data);
    return data.expenses;
  },

  // Import expenses from JSON string
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const items = Array.isArray(parsed) ? parsed : (parsed.expenses || []);
      const sanitized = items.map(sanitizeExpenseItem).filter(Boolean);
      if (sanitized.length === 0) return { success: false, count: 0 };

      const current = this.load().expenses;
      const existingSignatures = new Set(
        current.map(e => `${e.date}_${e.amount}_${e.category}_${e.notes.slice(0, 15)}`)
      );

      let added = 0;
      sanitized.forEach(item => {
        const sig = `${item.date}_${item.amount}_${item.category}_${item.notes.slice(0, 15)}`;
        if (!existingSignatures.has(sig)) {
          existingSignatures.add(sig);
          current.push(item);
          added++;
        }
      });

      current.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.saveExpenses(current);
      return { success: true, count: added, total: current.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Import expenses from CSV string
  importCSV(csvString) {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) return { success: false, count: 0 };

      const current = this.load().expenses;
      const existingSignatures = new Set(
        current.map(e => `${e.date}_${e.amount}_${e.category}_${e.notes.slice(0, 15)}`)
      );

      let added = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 3) {
          const date = normalizeDateString(cols[0].trim().replace(/^"|"$/g, ''));
          const category = (cols[1].trim().replace(/^"|"$/g, '') || 'other').toLowerCase();
          const amount = Number(cols[2].trim().replace(/^"|"$/g, ''));
          const notes = cols.slice(3).join(',').replace(/^"|"$/g, '').trim();

          if (!isNaN(amount) && amount > 0) {
            const sig = `${date}_${amount}_${category}_${notes.slice(0, 15)}`;
            if (!existingSignatures.has(sig)) {
              existingSignatures.add(sig);
              current.push({
                id: uuidv4(),
                date,
                category,
                amount,
                notes,
                createdAt: new Date().toISOString(),
              });
              added++;
            }
          }
        }
      }

      current.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.saveExpenses(current);
      return { success: true, count: added, total: current.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
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
  },

  // Export to JSON
  exportJSON(expenses) {
    const data = { expenses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
