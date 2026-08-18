import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({ currency: '₹', name: 'My Expenses' });
  const [toast, setToast] = useState(null);

  // Load and sanitize data from storage on mount
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
      const updated = [newExpense, ...prev];
      storage.saveExpenses(updated);
      return updated;
    });
    showToast('Expense added successfully!');
    return newExpense;
  }, [showToast]);

  // Edit expense - auto-saves
  const editExpense = useCallback((id, updates) => {
    setExpenses(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
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

  // Scan & recover all data from all browser storage
  const scanAndRecoverAllData = useCallback(() => {
    const updated = storage.scanAndRecoverAllData();
    setExpenses(updated);
    showToast(`Recovered ${updated.length} expense records!`);
  }, [showToast]);

  // Restore July & August expense records
  const restoreJulyAndAugustData = useCallback(() => {
    const updated = storage.restoreJulyAndAugustData();
    setExpenses(updated);
    showToast('July & August 2026 data fully restored!');
  }, [showToast]);

  // Restore July expense records
  const restoreJulyData = useCallback(() => {
    const updated = storage.restoreJulyData();
    setExpenses(updated);
    showToast('July 2026 expense data restored!');
  }, [showToast]);

  // Restore August expense records
  const restoreAugustData = useCallback(() => {
    const updated = storage.restoreAugustData();
    setExpenses(updated);
    showToast('August 2026 expense data restored!');
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
      editExpense,
      deleteExpense,
      scanAndRecoverAllData,
      restoreJulyAndAugustData,
      restoreJulyData,
      restoreAugustData,
      importJSON,
      importCSV,
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
