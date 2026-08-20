import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, deduplicateExpenses } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({ currency: '₹', name: 'My Expenses' });
  const [toast, setToast] = useState(null);

  // Load genuine user data with automatic deduplication on mount
  useEffect(() => {
    const data = storage.load();
    setExpenses(data.expenses || []);
    setSettings(data.settings || { currency: '₹', name: 'My Expenses' });
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Add expense - auto-saves
  const addExpense = useCallback((expense) => {
    const newExpense = {
      ...expense,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => {
      const updated = deduplicateExpenses([newExpense, ...prev]);
      storage.saveExpenses(updated);
      return updated;
    });
    showToast('Expense added successfully!');
    return newExpense;
  }, [showToast]);

  // Add batch expenses
  const addBatchExpenses = useCallback((newItems) => {
    const updated = storage.addBatchExpenses(newItems);
    setExpenses(updated);
    showToast(`Added ${newItems.length} expenses successfully!`);
    return updated;
  }, [showToast]);

  // Edit expense - auto-saves
  const editExpense = useCallback((id, updates) => {
    setExpenses(prev => {
      const updated = deduplicateExpenses(
        prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );
      storage.saveExpenses(updated);
      return updated;
    });
    showToast('Expense updated!');
  }, [showToast]);

  // Delete expense - auto-saves
  const deleteExpense = useCallback((id) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      storage.saveExpenses(updated);
      return updated;
    });
    showToast('Expense deleted', 'danger');
  }, [showToast]);

  // Explicit deduplicate function
  const deduplicate = useCallback(() => {
    const updated = storage.deduplicate();
    setExpenses(updated);
    showToast('All duplicate transactions merged!');
  }, [showToast]);

  // Import JSON
  const importJSON = useCallback((jsonStr) => {
    const res = storage.importJSON(jsonStr);
    if (res.success) {
      const updated = storage.getExpenses();
      setExpenses(updated);
      showToast(`Imported ${res.count} records successfully!`);
    } else {
      showToast(res.error || 'Failed to import JSON', 'danger');
    }
  }, [showToast]);

  // Import CSV
  const importCSV = useCallback((csvStr) => {
    const res = storage.importCSV(csvStr);
    if (res.success) {
      const updated = storage.getExpenses();
      setExpenses(updated);
      showToast(`Imported ${res.count} records successfully!`);
    } else {
      showToast(res.error || 'Failed to import CSV', 'danger');
    }
  }, [showToast]);

  // Extract from raw string
  const extractAndRestoreFromRaw = useCallback((rawString) => {
    const res = storage.extractAndRestoreFromRaw(rawString);
    if (res.success) {
      const updated = storage.getExpenses();
      setExpenses(updated);
      showToast(`Extracted and restored ${res.count} records!`);
    } else {
      showToast('No valid expense records found in text', 'danger');
    }
  }, [showToast]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    storage.saveSettings(merged);
  }, [settings]);

  // Export CSV
  const exportCSV = useCallback(() => {
    storage.exportCSV(expenses);
    showToast('CSV exported!');
  }, [expenses, showToast]);

  // Export JSON
  const exportJSON = useCallback(() => {
    storage.exportJSON(expenses);
    showToast('JSON Backup exported!');
  }, [expenses, showToast]);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      settings,
      addExpense,
      addBatchExpenses,
      editExpense,
      deleteExpense,
      deduplicate,
      importJSON,
      importCSV,
      extractAndRestoreFromRaw,
      updateSettings,
      exportCSV,
      exportJSON,
      toast,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
};
