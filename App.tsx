
import React, { useState, useCallback } from 'react';
import type { View, MainCategory, CategoryDetailData } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AccountsPage from './components/AccountsPage';
import BudgetPage from './components/BudgetPage';
import AddExpenseModal from './components/AddExpenseModal';
import TemplateManagerModal from './components/TemplateManagerModal';
import CycleReportModal from './components/CycleReportModal';
import CategoryDetailModal from './components/CategoryDetailModal';
import Login from './components/Login';
import SubscriptionModal from './components/SubscriptionModal';
import ConfirmDialog from './components/ConfirmDialog';
import NotificationContainer from './components/NotificationContainer';
import { PlusCircleIcon } from './components/Icons';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { ErrorProvider } from './contexts/ErrorContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile, isProActive, updateSubscription } = useProfile(user);
  const { transactions, totalExpenses, addTransaction, clearAllTransactions } = useTransactions(user);
  const {
    budgetPlan,
    budgetCategories,
    budgetTemplates,
    setBudgetPlan,
    uploadBudgetPDF,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    clearBudgetPlan
  } = useBudget(user);
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentMethods(user);

  const [view, setView] = useState<View>('dashboard');

  // Modals state
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState<boolean>(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState<boolean>(false);
  const [isCycleReportOpen, setIsCycleReportOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CategoryDetailData | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const handleSelectCategory = useCallback((categoryName: MainCategory) => {
    const categoryInfo = budgetCategories.find(c => c.name === categoryName);
    if (!categoryInfo) return;

    const categoryTransactions = transactions.filter(t => t.category === categoryName);

    setSelectedCategoryData({
      name: categoryName,
      subcategories: categoryInfo.subcategories,
      transactions: categoryTransactions,
      budgetPlan: budgetPlan
    });
  }, [budgetCategories, transactions, budgetPlan]);

  const handleCloseCategoryDetail = useCallback(() => {
    setSelectedCategoryData(null);
  }, []);

  const handleSubscribe = async () => {
    try {
      await updateSubscription();
      setIsSubscriptionModalOpen(false);
      setTimeout(() => setIsAddExpenseModalOpen(true), 300);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteSubcategoryWithConfirm = (mainCategory: MainCategory, subcategoryName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Subcategoría',
      message: `¿Estás seguro de que quieres eliminar la subcategoría "${subcategoryName}"?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await deleteSubcategory(mainCategory, subcategoryName);
      }
    });
  };

  const handleDeletePaymentMethodWithConfirm = (name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Método de Pago',
      message: `¿Estás seguro de que quieres eliminar el método de pago "${name}"?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await deletePaymentMethod(name, transactions);
      }
    });
  };

  const handleDeleteTemplateWithConfirm = (templateName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Plantilla',
      message: `¿Estás seguro de que quieres eliminar la plantilla "${templateName}"?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await deleteTemplate(templateName);
      }
    });
  };

  const handleStartNewCycle = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Iniciar Nuevo Ciclo',
      message: 'Esto eliminará todas las transacciones para el nuevo período. ¿Estás seguro?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await clearAllTransactions();
        setIsCycleReportOpen(false);
      }
    });
  };

  const handleClearBudgetWithConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Borrar Presupuesto',
      message: '¿Estás seguro de que quieres borrar todos los datos del presupuesto actual? Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await clearBudgetPlan();
      }
    });
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            totalExpenses={totalExpenses}
            budgetCategories={budgetCategories}
            budgetPlan={budgetPlan}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'accounts':
        return (
          <AccountsPage
            paymentMethods={paymentMethods}
            onAddPaymentMethod={addPaymentMethod}
            onUpdatePaymentMethod={updatePaymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethodWithConfirm}
          />
        );
      case 'budget':
        return (
          <BudgetPage
            budgetCategories={budgetCategories}
            transactions={transactions}
            budgetPlan={budgetPlan}
            setBudgetPlan={setBudgetPlan}
            onBudgetUpload={uploadBudgetPDF}
            onAddSubcategory={addSubcategory}
            onUpdateSubcategory={updateSubcategory}
            onDeleteSubcategory={handleDeleteSubcategoryWithConfirm}
            onClearBudget={handleClearBudgetWithConfirm}
            onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
            onOpenCycleReport={() => setIsCycleReportOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-base-200 font-sans">
      <NotificationContainer />
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
          aria-label="Añadir gasto"
        >
          <PlusCircleIcon className="h-8 w-8" />
        </button>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAddTransaction={addTransaction}
        categories={budgetCategories}
        paymentMethods={paymentMethods}
        isProActive={isProActive}
        onOpenSubscriptionModal={() => {
          setIsAddExpenseModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
      />

      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        templates={budgetTemplates}
        onSave={saveTemplate}
        onLoad={loadTemplate}
        onDelete={handleDeleteTemplateWithConfirm}
      />

      <CycleReportModal
        isOpen={isCycleReportOpen}
        onClose={() => setIsCycleReportOpen(false)}
        transactions={transactions}
        budgetPlan={budgetPlan}
        budgetCategories={budgetCategories}
        onConfirmNewCycle={handleStartNewCycle}
      />

      <CategoryDetailModal
        isOpen={!!selectedCategoryData}
        onClose={handleCloseCategoryDetail}
        categoryData={selectedCategoryData}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <AppContent />
    </ErrorProvider>
  );
};

export default App;
