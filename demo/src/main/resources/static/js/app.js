// Global State
let products = [];
let isLoginMode = true;
const API_BASE = '/api/v1';
let token = localStorage.getItem('jwt_token');
let currentPage = 0;
let pageSize = 10;
let totalElements = 0;
let currentSort = 'name';
let currentDir = 'asc';
let currentSearch = '';

// Initialize Lucide Icons
lucide.createIcons();

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const nameFields = document.getElementById('name-fields');
const authSubmitText = document.getElementById('auth-submit-text');
const authToggleLink = document.getElementById('auth-toggle-link');
const authToggleText = document.getElementById('auth-toggle-text');
const productTableBody = document.getElementById('product-table-body');
const searchInput = document.getElementById('search-input');
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

// --- Auth Functions ---

const toggleAuthMode = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
    nameFields.classList.toggle('hidden', isLoginMode);
    authSubmitText.textContent = isLoginMode ? 'Login' : 'Sign Up';
    authToggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    authToggleLink.textContent = isLoginMode ? 'Sign up' : 'Login';
};

const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/auth/authenticate' : '/auth/register';
    const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    if (!isLoginMode) {
        payload.firstname = document.getElementById('firstname').value;
        payload.lastname = document.getElementById('lastname').value;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            localStorage.setItem('jwt_token', token);
            showDashboard();
        } else {
            alert('Authentication failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred');
    }
};

const logout = () => {
    localStorage.removeItem('jwt_token');
    token = null;
    showAuth();
};

const showDashboard = () => {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    fetchProducts();
    fetchStats();
};

const showAuth = () => {
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
};

// --- Product Functions ---

const fetchProducts = async () => {
    const endpoint = currentSearch ? '/products/search' : '/products';
    const params = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        sort: `${currentSort},${currentDir}`
    });
    
    if (currentSearch) params.append('keyword', currentSearch);

    try {
        const response = await fetch(`${API_BASE}${endpoint}?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 403) return logout();
        const data = await response.json();
        
        products = data.content;
        totalElements = data.totalElements;
        renderProducts(products);
        updatePaginationUI(data);
        document.getElementById('total-products').textContent = totalElements;
    } catch (err) {
        console.error(err);
    }
};

const fetchStats = async () => {
    try {
        const [lowStockRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/products/low-stock?threshold=10`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/products/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (lowStockRes.ok && statsRes.ok) {
            const lowStock = await lowStockRes.json();
            const stats = await statsRes.json();
            
            document.getElementById('low-stock-count').textContent = lowStock.length;
            document.getElementById('category-count').textContent = Object.keys(stats).length;
        }
    } catch (err) {
        console.error(err);
    }
};

const updatePaginationUI = (data) => {
    const start = data.number * data.size + 1;
    const end = Math.min(start + data.numberOfElements - 1, data.totalElements);
    document.getElementById('pagination-info').textContent = 
        `Showing ${data.totalElements === 0 ? 0 : start} to ${end} of ${data.totalElements} products`;
    
    document.getElementById('prev-btn').disabled = data.first;
    document.getElementById('next-btn').disabled = data.last;
};

const changePage = (delta) => {
    currentPage += delta;
    fetchProducts();
};

const changeSort = (field) => {
    if (currentSort === field) {
        currentDir = currentDir === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort = field;
        currentDir = 'asc';
    }
    fetchProducts();
};

const renderProducts = (data) => {
    productTableBody.innerHTML = data.map(p => `
        <tr class="fade-in">
            <td>
                <div style="font-weight: 600;">${p.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${p.description || ''}</div>
            </td>
            <td><code>${p.sku}</code></td>
            <td><span class="glass-panel" style="padding: 2px 8px; font-size: 0.75rem;">${p.category || 'General'}</span></td>
            <td>$${p.price.toFixed(2)}</td>
            <td>
                <span style="color: ${p.quantity < 10 ? 'var(--danger)' : 'var(--accent)'}">
                    ${p.quantity}
                </span>
            </td>
            <td>
                <button onclick="editProduct(${p.id})" style="background: none; border: none; cursor: pointer; color: var(--primary);">
                    <i data-lucide="edit-3"></i>
                </button>
                <button onclick="deleteProduct(${p.id})" style="background: none; border: none; cursor: pointer; color: var(--danger); margin-left: 0.5rem;">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
};

const handleProductSubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const payload = {
        name: document.getElementById('prod-name').value,
        sku: document.getElementById('prod-sku').value,
        category: document.getElementById('prod-category').value,
        price: parseFloat(document.getElementById('prod-price').value),
        quantity: parseInt(document.getElementById('prod-quantity').value),
        description: document.getElementById('prod-description').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeModal();
            fetchProducts();
            fetchStats();
        }
    } catch (err) {
        console.error(err);
    }
};

const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchProducts();
        fetchStats();
    } catch (err) {
        console.error(err);
    }
};

const editProduct = (id) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-sku').value = p.sku;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-quantity').value = p.quantity;
    document.getElementById('prod-description').value = p.description;
    openModal();
};

const openModal = () => productModal.style.display = 'flex';
const closeModal = () => {
    productModal.style.display = 'none';
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Product';
};

// --- Event Listeners ---

authToggleLink.addEventListener('click', toggleAuthMode);
authForm.addEventListener('submit', handleAuth);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('add-product-btn').addEventListener('click', openModal);
productForm.addEventListener('submit', handleProductSubmit);
document.getElementById('prev-btn').addEventListener('click', () => changePage(-1));
document.getElementById('next-btn').addEventListener('click', () => changePage(1));

let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 0;
        fetchProducts();
    }, 300);
});

// Initialization
if (token) {
    showDashboard();
} else {
    showAuth();
}
