
import React, { useState, useEffect, useCallback } from 'react';
import type { Transaction, MainCategory, PaymentMethod, ReceiptData, MutableBudgetCategory } from '../types';
import { analyzeReceipt } from '../services/geminiService';
import { XMarkIcon, SparklesIcon, PhotoIcon } from './Icons';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  categories: MutableBudgetCategory[];
  paymentMethods: string[];
  isProActive: boolean;
  onOpenSubscriptionModal: () => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAddTransaction, categories, paymentMethods, isProActive, onOpenSubscriptionModal }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<MainCategory>(categories[0]?.name);
  const [subcategory, setSubcategory] = useState<string>(categories[0]?.subcategories[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0] || '');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subcategoriesForSelectedCategory = categories.find(c => c.name === category)?.subcategories || [];

  useEffect(() => {
    // Resetear subcategoría cuando la categoría cambia, o si la subcategoría actual ya no existe
    const currentCategory = categories.find(c => c.name === category);
    if (currentCategory) {
      if (!currentCategory.subcategories.includes(subcategory)) {
        setSubcategory(currentCategory.subcategories[0] || '');
      }
    } else if (categories.length > 0) {
      // Si la categoría principal ya no existe, volver a la primera
      setCategory(categories[0]?.name);
    }
  }, [category, subcategory, categories]);
  
  useEffect(() => {
    if (paymentMethods && !paymentMethods.includes(paymentMethod)) {
      setPaymentMethod(paymentMethods[0] || '');
    }
  }, [paymentMethods, paymentMethod]);


  const resetForm = useCallback(() => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(categories[0]?.name || '');
    setSubcategory(categories[0]?.subcategories[0] || '');
    setPaymentMethod(paymentMethods[0] || '');
    setImagePreview(null);
    setBase64Image(null);
    setIsAnalyzing(false);
    setError(null);
  }, [categories, paymentMethods]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount && date && category && subcategory && paymentMethod) {
      onAddTransaction({
        description,
        amount: parseFloat(amount),
        date,
        category,
        subcategory,
        paymentMethod,
      });
      onClose();
    }
  };

  const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const dataUri = await fileToDataUri(file);
      setImagePreview(dataUri);
      const base64 = dataUri.split(',')[1];
      setBase64Image(base64);
    }
  };
  
  const handleAnalyzeReceipt = async () => {
    if (!isProActive) {
      onOpenSubscriptionModal();
      return;
    }
    if (!base64Image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result: ReceiptData = await analyzeReceipt(base64Image);
      setDescription(result.merchant);
      setAmount(result.amount.toString());
      const resultDate = new Date(result.date);
      if (!isNaN(resultDate.getTime())) {
        resultDate.setDate(resultDate.getDate() + 1);
        setDate(resultDate.toISOString().split('T')[0]);
      }
      setCategory(result.category);
      setSubcategory(result.subcategory);

    } catch (err) {
      setError('Error al analizar el recibo. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary">Añadir Gasto</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <label htmlFor="receipt-upload" className="block text-sm font-medium text-text-secondary mb-2">Escanear Recibo (Función Pro)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa del recibo" className="mx-auto h-32 w-auto object-contain rounded-md"/>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-text-secondary"/>
                    )}
                    <div className="flex text-sm justify-center">
                      <label htmlFor="receipt-upload" className="relative cursor-pointer bg-base-100 rounded-md font-medium text-brand-primary hover:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary px-1">
                        <span>Sube un archivo</span>
                        <input id="receipt-upload" name="receipt-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1 text-text-secondary">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-text-secondary">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                </div>
                {base64Image && (
                  <button
                    onClick={handleAnalyzeReceipt}
                    disabled={isAnalyzing}
                    className="mt-3 w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? <Spinner /> : <SparklesIcon className="h-5 w-5" />}
                    {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
                  </button>
                )}
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Descripción</label>
                <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Monto ($)</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-secondary">Fecha</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Categoría</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as MainCategory)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50">
                  {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-text-secondary">Subcategoría</label>
                <select id="subcategory" value={subcategory} onChange={e => setSubcategory(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" disabled={subcategoriesForSelectedCategory.length === 0}>
                  {subcategoriesForSelectedCategory.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-text-secondary">Método de Pago</label>
                <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50">
                   {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-base-300 rounded-md hover:bg-slate-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-indigo-500">Añadir Gasto</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
