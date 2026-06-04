import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addAuditLog } from '../services/auditLogger';
import { ProductModal } from '../components/ProductModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  FolderOpen,
  Filter,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

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

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch unique categories for filtering
  const fetchCategories = async () => {
    try {
      const statsRes = await api.get('/products/stats');
      if (statsRes.data) {
        setCategories(Object.keys(statsRes.data).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const sortParam = `${sortField},${sortDir}`;
      
      // Determine if we should hit search endpoint or paginated fetch endpoint
      const activeKeyword = searchQuery.trim() || categoryFilter;
      
      if (activeKeyword) {
        response = await api.get('/products/search', {
          params: {
            keyword: activeKeyword,
            page,
            size,
            sort: sortParam
          }
        });
      } else {
        response = await api.get('/products', {
          params: {
            page,
            size,
            sort: sortParam
          }
        });
      }

      if (response.data) {
        setProducts(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Could not retrieve product list. Verify your backend server and database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sortField, sortDir, categoryFilter]);

  // Debounced/Triggered Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(0);
      fetchProducts();
    }, 450); // Debounce search calls

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [products]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  // Create or Update submit handler
  const handleProductSubmit = async (productData: Product) => {
    try {
      if (productData.id) {
        // Edit product
        const response = await api.put(`/products/${productData.id}`, productData);
        if (response.status === 200) {
          addAuditLog('UPDATE', productData.sku, productData.name, user?.email || 'System');
        }
      } else {
        // Add new product
        const response = await api.post('/products', productData);
        if (response.data) {
          addAuditLog('CREATE', productData.sku, productData.name, user?.email || 'System');
        }
      }
      fetchProducts();
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving product:', err);
      throw err; // Propagate to modal to show error
    }
  };

  // Delete product confirmation handler
  const handleDeleteProduct = async () => {
    if (!selectedProduct?.id) return;
    setConfirmLoading(true);
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      addAuditLog('DELETE', selectedProduct.sku, selectedProduct.name, user?.email || 'System');
      setIsConfirmOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // CSV Exporter using current filters & search (max 1000 items)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const sortParam = `${sortField},${sortDir}`;
      const activeKeyword = searchQuery.trim() || categoryFilter;
      let response;
      
      if (activeKeyword) {
        response = await api.get('/products/search', {
          params: { keyword: activeKeyword, page: 0, size: 1000, sort: sortParam }
        });
      } else {
        response = await api.get('/products', {
          params: { page: 0, size: 1000, sort: sortParam }
        });
      }
      
      const exportList = response.data?.content || [];
      if (exportList.length === 0) return;
      
      const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Price ($)', 'Description', 'Registered At'];
      const csvRows = [headers.join(',')];
      
      exportList.forEach((p: any) => {
        const row = [
          `"${p.sku.replace(/"/g, '""')}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          p.quantity,
          p.price,
          `"${(p.description || '').replace(/"/g, '""')}"`,
          `"${(p.createdAt || '').substring(0, 10)}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `aetherinv_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  };

  const openDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search products by Name, SKU, Category..."
              value={searchQuery}
              onChange={(e) => {
                setCategoryFilter(''); // clear category filter when typing search
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-darkblue-900 border border-darkblue-800/80 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 transition-all outline-none text-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setSearchQuery(''); // clear query when selecting category
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
              className="bg-darkblue-900 border border-darkblue-800/80 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500 rounded-xl py-2.5 pl-9 pr-8 text-slate-300 outline-none text-sm cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat || 'General'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Panel */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* CSV Exporter */}
          <button
            onClick={handleExportCSV}
            disabled={products.length === 0 || exporting}
            className="border border-darkblue-800 hover:border-brandorange-500/40 bg-darkblue-900 hover:bg-darkblue-850 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all font-semibold text-sm flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Download Full Inventory CSV"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-green-500" />
            <span>Export CSV</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-brandorange-600 to-brandorange-500 hover:from-brandorange-500 hover:to-brandorange-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brandorange-500/20 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Table Wrapper */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-darkblue-800 bg-darkblue-900/30">
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('sku')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>SKU Code</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('category')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>Category</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('quantity')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>Quantity</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('price')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <span>Unit Price</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkblue-800/40">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-darkblue-800 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-darkblue-800 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-darkblue-800 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-darkblue-800 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-darkblue-800 rounded w-14"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-darkblue-800 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No Products Found</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search terms or insert some products.</p>
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLow = prod.quantity <= 5;
                  return (
                    <tr 
                      key={prod.id} 
                      className="hover:bg-darkblue-900/20 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-300">
                        {prod.sku}
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <p className="font-bold text-white text-sm sm:text-base">{prod.name}</p>
                        {prod.description && (
                          <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">{prod.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold capitalize text-slate-400">
                        <span className="px-2.5 py-1 bg-darkblue-800 border border-darkblue-700/60 rounded-full">
                          {prod.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`font-extrabold text-base ${isLow ? 'text-brandorange-500' : 'text-slate-200'}`}>
                            {prod.quantity}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded text-xxs font-semibold bg-brandorange-500/10 text-brandorange-500 border border-brandorange-500/25 flex items-center space-x-1 animate-pulse">
                              <span>Low</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">
                        ${prod.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          {/* Details Eye Button */}
                          <button
                            onClick={() => openDetailsModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-darkblue-850 rounded-lg transition-colors border border-transparent hover:border-darkblue-800"
                            title="Inspect SKU Specifications"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-darkblue-850 rounded-lg transition-colors border border-transparent hover:border-darkblue-800"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteConfirm(prod)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="bg-darkblue-900/30 px-6 py-4 border-t border-darkblue-800 flex items-center justify-between text-sm shrink-0">
            <span className="text-slate-400 text-xs">
              Showing page <strong className="text-slate-200">{page + 1}</strong> of <strong className="text-slate-200">{totalPages}</strong> ({totalElements} items)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-darkblue-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-darkblue-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Remove Inventory SKU?"
        message={`Are you sure you want to permanently delete SKU "${selectedProduct?.sku}" (${selectedProduct?.name})? This action cannot be reversed.`}
        loading={confirmLoading}
      />

      {/* Details Specification Modal */}
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};
