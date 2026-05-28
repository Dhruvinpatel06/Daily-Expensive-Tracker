import { useState } from 'react';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
// Note: All styles are in index.css - App.css from default Vite template is unused
import Sidebar from './components/Sidebar';
import ExpenseModal from './components/ExpenseModal';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { toast, exportCSV } = useExpenses();

  const openAddModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddNew={openAddModal} setActiveTab={setActiveTab} />;
      case 'expenses':
        return <ExpensesPage onEdit={openEditModal} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onAddNew={openAddModal} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNew={openAddModal}
        onExport={exportCSV}
      />

      {/* Main content area */}
      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
        {renderPage()}
      </main>

      {/* Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingExpense={editingExpense}
      />

      {/* Toast notifications */}
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppInner />
    </ExpenseProvider>
  );
}
