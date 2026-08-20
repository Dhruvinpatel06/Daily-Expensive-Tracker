// Pure persistent storage using localStorage - only stores real user data with automatic deduplication

import { normalizeDateString } from './helpers';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'daily_expense_tracker_v1';
const BACKUP_KEY = 'daily_expense_tracker_backup';

export function sanitizeExpenseItem(item) {
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

// Automatically collapse multiple identical records into one single original record
export function deduplicateExpenses(list = []) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const s = sanitizeExpenseItem(item);
    if (!s) continue;
    const sig = `${s.date}_${s.category}_${s.amount.toFixed(2)}_${s.notes}`;
    if (!seen.has(sig)) {
      seen.add(sig);
      unique.push(s);
    }
  }
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  return unique;
}

export const storage = {
  // Load real user expenses from localStorage with auto-deduplication
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let expenses = [];
      let settings = { currency: '₹', name: 'My Expenses' };

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.expenses)) {
            expenses = parsed.expenses;
          } else if (Array.isArray(parsed)) {
            expenses = parsed;
          }
          if (parsed.settings) settings = parsed.settings;
        } catch {}
      }

      // Check backup key if main was empty
      if (expenses.length === 0) {
        const backupRaw = localStorage.getItem(BACKUP_KEY);
        if (backupRaw) {
          try {
            const backupParsed = JSON.parse(backupRaw);
            if (Array.isArray(backupParsed.expenses)) {
              expenses = backupParsed.expenses;
            } else if (Array.isArray(backupParsed)) {
              expenses = backupParsed;
            }
          } catch {}
        }
      }

      // Deduplicate to eliminate any duplicate multiplication
      const cleanExpenses = deduplicateExpenses(expenses);

      // If deduplication removed duplicates, save the clean version back immediately
      if (cleanExpenses.length !== expenses.length) {
        const cleanData = { expenses: cleanExpenses, settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
        localStorage.setItem(BACKUP_KEY, JSON.stringify(cleanData));
      }

      return { expenses: cleanExpenses, settings };
    } catch (err) {
      console.error('Storage load failed:', err);
      return { expenses: [], settings: { currency: '₹', name: 'My Expenses' } };
    }
  },

  // Save all data to localStorage & backup key
  save(data) {
    try {
      const cleanExpenses = deduplicateExpenses(data.expenses || []);
      const cleanData = {
        expenses: cleanExpenses,
        settings: data.settings || { currency: '₹', name: 'My Expenses' }
      };
      const json = JSON.stringify(cleanData);
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
    this.save(data);
    return data.expenses;
  },

  // Deduplicate all expenses explicitly
  deduplicate() {
    const data = this.load();
    data.expenses = deduplicateExpenses(data.expenses);
    this.save(data);
    return data.expenses;
  },

  // Add multiple expenses at once (Batch add)
  addBatchExpenses(newItems) {
    const data = this.load();
    const combined = [...(newItems || []), ...data.expenses];
    data.expenses = deduplicateExpenses(combined);
    this.save(data);
    return data.expenses;
  },

  // Inspect all raw localStorage & sessionStorage keys in the browser
  getRawStorageInspector() {
    const results = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          results.push({ storage: 'localStorage', key, value, size: value.length });
        }
      }
    } catch {}
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          results.push({ storage: 'sessionStorage', key, value, size: value.length });
        }
      }
    } catch {}
    return results;
  },

  // Extract and restore any expenses from arbitrary raw text/JSON
  extractAndRestoreFromRaw(rawString) {
    if (!rawString) return { success: false, count: 0 };
    const items = [];
    
    try {
      const parsed = JSON.parse(rawString);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => {
          const s = sanitizeExpenseItem(p);
          if (s) items.push(s);
        });
      } else if (parsed && typeof parsed === 'object') {
        const arr = parsed.expenses || parsed.data || Object.values(parsed);
        if (Array.isArray(arr)) {
          arr.forEach(p => {
            const s = sanitizeExpenseItem(p);
            if (s) items.push(s);
          });
        }
      }
    } catch {}

    if (items.length > 0) {
      this.addBatchExpenses(items);
      return { success: true, count: items.length };
    }
    return { success: false, count: 0 };
  },

  // Import expenses from JSON string
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const rawList = Array.isArray(parsed) ? parsed : (parsed.expenses || []);
      const sanitized = rawList.map(sanitizeExpenseItem).filter(Boolean);
      if (sanitized.length === 0) return { success: false, count: 0 };

      this.addBatchExpenses(sanitized);
      return { success: true, count: sanitized.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Import expenses from CSV string
  importCSV(csvString) {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) return { success: false, count: 0 };

      const items = [];
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
            items.push({
              id: uuidv4(),
              date,
              category,
              amount,
              notes,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      if (items.length > 0) {
        this.addBatchExpenses(items);
        return { success: true, count: items.length };
      }
      return { success: false, count: 0 };
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
    const cleanExpenses = deduplicateExpenses(expenses || []);
    const headers = ['Date', 'Category', 'Amount', 'Notes'];
    const rows = cleanExpenses.map(e => [
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
    const cleanExpenses = deduplicateExpenses(expenses || []);
    const data = { expenses: cleanExpenses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
