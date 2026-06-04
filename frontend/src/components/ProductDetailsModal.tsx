import React from 'react';
import { X, Calendar, DollarSign, Tag, Archive, Layers, AlignLeft } from 'lucide-react';

interface Product {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const totalValue = product.price * product.quantity;
  const isLowStock = product.quantity <= 5;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-darkblue-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-darkblue-900 border border-darkblue-800 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-darkblue-800/85 shrink-0 bg-darkblue-900/40">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 bg-brandorange-500/10 text-brandorange-500 border border-brandorange-500/20 text-xs font-bold rounded-md uppercase tracking-wider">
              SKU Specs
            </span>
            <span className="text-slate-400 font-medium text-xs">{product.sku}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkblue-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Main Info */}
          <div>
            <h3 className="text-2xl font-black text-white leading-tight">{product.name}</h3>
            <span className="inline-flex items-center space-x-1 mt-2 text-xs font-semibold px-3 py-1 bg-darkblue-800 text-slate-300 border border-darkblue-750 rounded-full capitalize">
              <Tag className="h-3 w-3 text-brandorange-500" />
              <span>{product.category || 'General'}</span>
            </span>
          </div>

          {/* Pricing & Quantity Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Unit Price */}
            <div className="bg-darkblue-950/40 border border-darkblue-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Unit Price</span>
              </div>
              <p className="text-lg font-bold text-white">${product.price.toFixed(2)}</p>
            </div>

            {/* Quantity */}
            <div className="bg-darkblue-950/40 border border-darkblue-800/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                <Archive className="h-4 w-4 text-brandorange-500" />
                <span>Stock Units</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-lg font-bold text-white">{product.quantity}</p>
                {isLowStock ? (
                  <span className="text-xxs font-bold text-brandorange-500 animate-pulse uppercase tracking-wider">
                    Low Stock
                  </span>
                ) : (
                  <span className="text-xxs font-bold text-green-500 uppercase tracking-wider">
                    Available
                  </span>
                )}
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-darkblue-950/40 border border-darkblue-800/50 rounded-xl p-4 col-span-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>Asset Valuation</span>
              </div>
              <p className="text-xl font-black text-brandorange-400">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-slate-500 text-xxs mt-0.5">Calculated as (Price * Quantity)</p>
            </div>

          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <AlignLeft className="h-4 w-4 text-slate-500" />
                <span>Product Description</span>
              </div>
              <p className="text-sm text-slate-300 bg-darkblue-950/30 border border-darkblue-800/40 rounded-xl p-4 leading-relaxed max-h-[120px] overflow-y-auto">
                {product.description}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-darkblue-800/80 pt-4 text-xxs text-slate-500 space-y-1.5 bg-slate-900/10 px-2 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-650" />
                <span>Registered At:</span>
              </span>
              <span className="font-semibold text-slate-400">{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-slate-650" />
                <span>Last Updated:</span>
              </span>
              <span className="font-semibold text-slate-400">{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-darkblue-950 px-6 py-4 border-t border-darkblue-800/80 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-darkblue-900 hover:bg-darkblue-850 text-slate-200 font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider border border-darkblue-800 hover:border-slate-600 transition-colors"
          >
            Close Spec Card
          </button>
        </div>
      </div>
    </div>
  );
};
