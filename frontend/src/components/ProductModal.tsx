import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface Product {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Product) => Promise<void>;
  product?: Product | null; // If passed, we are in edit mode
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSubmit, product }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setQuantity(product.quantity);
      setPrice(product.price);
      setCategory(product.category || '');
      setDescription(product.description || '');
    } else {
      // Reset form for creating
      setName('');
      setSku('');
      setQuantity(0);
      setPrice(0);
      setCategory('');
      setDescription('');
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Validations
    if (!name.trim()) return setError('Product name is required.');
    if (!sku.trim()) return setError('Product SKU is required.');
    if (quantity < 0) return setError('Quantity cannot be negative.');
    if (price <= 0) return setError('Price must be greater than zero.');

    setLoading(true);
    try {
      const payload: Product = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        quantity: Number(quantity),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
      };

      if (product?.id) {
        payload.id = product.id;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred while saving product. Make sure SKU is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-darkblue-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-darkblue-900 border border-darkblue-800 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-darkblue-800/80 shrink-0">
          <h3 className="text-xl font-bold text-white">
            {product ? 'Edit Product Details' : 'Register New Product'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkblue-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start space-x-2 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Laser Sensor"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SKU ID Code *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. LZR-SNS-01"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Sensors"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product design metrics, inventory storage specs..."
                rows={3}
                className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2 px-3.5 text-slate-200 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-darkblue-950 px-6 py-4 border-t border-darkblue-800/80 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-darkblue-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brandorange-500 hover:bg-brandorange-400 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all duration-200 flex items-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
