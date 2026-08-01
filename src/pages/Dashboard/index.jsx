import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar } from 'react-icons/fi';
import useAuth from '@hooks/useAuth';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import styles from './Dashboard.module.css';

// Modular Dashboard Subcomponents
import DashboardSidebar from './components/DashboardSidebar';
import DashboardNavbar from './components/DashboardNavbar';
import DashboardOverview from './components/DashboardOverview';
import ProductsSection from './components/ProductsSection';
import CategoriesSection from './components/CategoriesSection';
import OrdersSection from './components/OrdersSection';
import CorporateQuotesSection from './components/CorporateQuotesSection';
import CustomersSection from './components/CustomersSection';
import EnquiriesSection from './components/EnquiriesSection';
import CouponsSection from './components/CouponsSection';
import UsersRolesSection from './components/UsersRolesSection';
import SettingsSection from './components/SettingsSection';
import ReportsSection from './components/ReportsSection';

const INITIAL_ENQUIRIES = [
  { id: 'ENQ-301', name: 'Tech Solutions Pvt. Ltd.', email: 'contact@techsolutions.com', phone: '+91 98765 43210', category: 'Corporate Gifts', subject: 'Bulk Executive Hampers Inquiry', message: 'Looking for 200 executive leather gift hampers with custom logo engraving.', status: 'New', createdAt: '01 Aug 2026' },
  { id: 'ENQ-302', name: 'Apex Global Mobility', email: 'procurement@apex.in', phone: '+91 98220 11990', category: 'Corporate Gifts', subject: 'Employee Welcome Back Kits', message: 'Need 300 onboarding backpacks and metallic drinkware sets for new joiners.', status: 'In Progress', createdAt: '31 Jul 2026' },
  { id: 'ENQ-303', name: 'Rahul Verma', email: 'rahul.v@gmail.com', phone: '+91 91234 56789', category: 'Personalized Gifts', subject: 'Custom Monogram Leather Diaries', message: 'Need gold foil embossing for individual employee names on executive notebooks.', status: 'New', createdAt: '01 Aug 2026' },
  { id: 'ENQ-304', name: 'Sneha Kapoor', email: 'sneha.k@designstudio.com', phone: '+91 97112 33445', category: 'Personalized Gifts', subject: 'Engraved Wooden Desk Accessories', message: 'Requesting custom laser etched nameplates and pen holder sets for directors.', status: 'Resolved', createdAt: '29 Jul 2026' },
  { id: 'ENQ-305', name: 'Little Explorers Preschool', email: 'admin@littleexplorers.edu', phone: '+91 99887 11223', category: 'Toys', subject: 'Educational Wooden Puzzle Sets', message: 'Bulk requirement of 80 wooden puzzle sets and building blocks for learning kits.', status: 'New', createdAt: '01 Aug 2026' },
  { id: 'ENQ-306', name: 'Karan Malhotra', email: 'karan.m@startupspace.in', phone: '+91 98100 44556', category: 'Toys', subject: 'Executive Desk Board Games', message: 'Need 40 magnetic chess sets and miniature desk games for company recreation room.', status: 'In Progress', createdAt: '30 Jul 2026' },
];

const INITIAL_COUPONS = [
  { id: 'c-1', code: 'LUXURY20', discount: '20% OFF', category: 'Corporate Gifts', status: 'Active' },
  { id: 'c-2', code: 'WELCOME10', discount: '$10 OFF', category: 'First Purchase', status: 'Active' },
];

const INITIAL_CORPORATE_QUOTES = [
  { id: 'Q-8492', name: 'Vikram Mehta', company: 'Apex Infotech Ltd.', email: 'v.mehta@apex.com', phone: '+91 98200 11223', quantity: '100 – 500 Units', notes: 'Requesting custom laser logo engraving on leather diaries & metallic pens for annual conference.', date: '01 Aug 2026', status: 'New' },
  { id: 'Q-3910', name: 'Priya Sundaram', company: 'Global Brands India', email: 'priya.s@globalbrands.in', phone: '+91 97111 88990', quantity: '50 – 100 Units', notes: 'Interested in Eco-friendly bamboo hampers for client appreciation gifts.', date: '31 Jul 2026', status: 'In Progress' },
];

const INITIAL_CUSTOMERS = [
  { id: 'usr-1001', name: 'Ananya Sharma', email: 'ananya.s@gmail.com', phone: '+91 98765 43210', role: 'CUSTOMER', ordersCount: 4, totalSpent: 12490, joinedDate: '15 Jul 2026', status: 'Active' },
  { id: 'usr-1002', name: 'Rajesh Kumar', email: 'rajesh.k@techcorp.in', phone: '+91 91234 56789', role: 'VIP Customer', ordersCount: 8, totalSpent: 45800, joinedDate: '20 May 2026', status: 'Active' },
  { id: 'usr-1003', name: 'Meera Patel', email: 'meera.patel@outlook.com', phone: '+91 99887 76655', role: 'CUSTOMER', ordersCount: 2, totalSpent: 3499, joinedDate: '28 Jun 2026', status: 'Active' },
  { id: 'usr-1004', name: 'Siddharth Nair', email: 'sid.nair@innovate.co', phone: '+91 98111 22334', role: 'CUSTOMER', ordersCount: 1, totalSpent: 1899, joinedDate: '01 Aug 2026', status: 'Active' },
];

const INITIAL_ADMIN_ROLES = [
  { id: 'role-1', name: 'SUPER_ADMIN', title: 'Super Admin', badgeColor: '#d99b26', description: 'Full unrestricted system access & store configuration', userCount: 1, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes', 'Customers', 'Enquiries', 'Coupons', 'Users & Roles', 'Settings'] },
  { id: 'role-2', name: 'STORE_ADMIN', title: 'Store Manager', badgeColor: '#2563eb', description: 'Full access to products, categories, orders, quotes & customers', userCount: 2, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes', 'Customers', 'Enquiries', 'Coupons'] },
  { id: 'role-3', name: 'ORDER_MANAGER', title: 'Order & Inventory Manager', badgeColor: '#059669', description: 'Manage store orders, products, catalog & quote responses', userCount: 3, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes'] },
  { id: 'role-4', name: 'SUPPORT_AGENT', title: 'Customer Support Agent', badgeColor: '#d97706', description: 'Manage customer enquiries, quote followups & support', userCount: 2, permissions: ['Dashboard', 'Quotes', 'Customers', 'Enquiries'] },
];

const INITIAL_ADMIN_USERS = [
  { id: 'adm-01', name: 'Ponraj (Super Admin)', email: 'admin@giftery.com', phone: '+91 98765 00001', role: 'SUPER_ADMIN', permissions: ['All Modules'], lastLogin: '01 Aug 2026, 04:30 PM', status: 'Active' },
  { id: 'adm-02', name: 'Rahul Sharma', email: 'rahul.s@giftery.com', phone: '+91 98765 00002', role: 'STORE_ADMIN', permissions: ['Products', 'Orders', 'Quotes', 'Customers'], lastLogin: '01 Aug 2026, 02:15 PM', status: 'Active' },
  { id: 'adm-03', name: 'Priya Patel', email: 'priya.p@giftery.com', phone: '+91 98765 00003', role: 'ORDER_MANAGER', permissions: ['Products', 'Orders', 'Quotes'], lastLogin: '31 Jul 2026, 11:40 AM', status: 'Active' },
  { id: 'adm-04', name: 'Karthik Raja', email: 'karthik.r@giftery.com', phone: '+91 98765 00004', role: 'SUPPORT_AGENT', permissions: ['Quotes', 'Enquiries', 'Customers'], lastLogin: '30 Jul 2026, 05:20 PM', status: 'Active' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Tab State with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab) return hashTab;
      const storedTab = localStorage.getItem('admin_dashboard_active_tab');
      if (storedTab) return storedTab;
    } catch (e) {}
    return 'dashboard';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    try {
      localStorage.setItem('admin_dashboard_active_tab', tabId);
      window.location.hash = tabId;
    } catch (e) {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('admin_dashboard_active_tab', activeTab);
      window.location.hash = activeTab;
    } catch (e) {}
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);

  // Admin Roles & Users State
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_users_roles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ADMIN_USERS;
  });

  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STORE_ADMIN',
    permissions: ['Products', 'Orders', 'Quotes'],
  });

  const handleAddAdminUserSubmit = (e) => {
    e.preventDefault();
    if (!roleForm.name || !roleForm.email) {
      toast.error('Name and Email are required');
      return;
    }
    const newAdmin = {
      id: 'adm-' + Math.floor(100 + Math.random() * 900),
      name: roleForm.name,
      email: roleForm.email,
      phone: roleForm.phone || '+91 98765 00000',
      role: roleForm.role,
      permissions: roleForm.permissions,
      lastLogin: 'Just now',
      status: 'Active',
    };

    const updated = [newAdmin, ...adminUsers];
    setAdminUsers(updated);
    localStorage.setItem('admin_users_roles', JSON.stringify(updated));
    toast.success(`🎉 ${roleForm.name} assigned ${roleForm.role} role & permissions!`);
    setShowAddRoleModal(false);
    setRoleForm({ name: '', email: '', phone: '', role: 'STORE_ADMIN', permissions: ['Products', 'Orders', 'Quotes'] });
  };

  const handleDeleteAdminUser = (id) => {
    const updated = adminUsers.filter(a => a.id !== id);
    setAdminUsers(updated);
    localStorage.setItem('admin_users_roles', JSON.stringify(updated));
    toast.success('Admin user access revoked!');
  };

  const handleToggleAdminStatus = (id) => {
    const updated = adminUsers.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a);
    setAdminUsers(updated);
    localStorage.setItem('admin_users_roles', JSON.stringify(updated));
    toast.success('Admin user access status updated!');
  };

  const handlePermissionCheckboxToggle = (perm) => {
    setRoleForm(prev => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm],
      };
    });
  };

  // Enquiries & Customers State
  const [enquiriesList, setEnquiriesList] = useState(INITIAL_ENQUIRIES);
  const [customersList, setCustomersList] = useState(() => {
    try {
      const stored = localStorage.getItem('registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_CUSTOMERS];
        }
      }
    } catch (e) {}
    return INITIAL_CUSTOMERS;
  });

  // Corporate Quotes State
  const [corporateQuotes, setCorporateQuotes] = useState(() => {
    try {
      const stored = localStorage.getItem('corporate_quotes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CORPORATE_QUOTES;
  });

  const handleDeleteQuote = (id) => {
    const updated = corporateQuotes.filter(q => q.id !== id);
    setCorporateQuotes(updated);
    localStorage.setItem('corporate_quotes', JSON.stringify(updated));
    toast.success('Quote record deleted');
  };

  const handleUpdateQuoteStatus = (id, newStatus) => {
    const updated = corporateQuotes.map(q => q.id === id ? { ...q, status: newStatus } : q);
    setCorporateQuotes(updated);
    localStorage.setItem('corporate_quotes', JSON.stringify(updated));
    toast.success(`Quote ${id} status updated to ${newStatus}`);
  };

  // Settings State with LocalStorage Persistence
  const [settingsForm, setSettingsForm] = useState(() => {
    try {
      const stored = localStorage.getItem('store_basic_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      storeName: 'GIFTERYS',
      storeTagline: 'PREMIUM GIFTS, LASTING IMPRESSIONS',
      supportEmail: 'support@giftery.com',
      supportPhone: '+91 98765 43210',
      storeAddress: '104, Luxury Tower, MG Road, Bengaluru, India',
      currency: 'INR (₹)',
      freeShippingThreshold: '999',
      standardShippingFee: '99',
      taxPercentage: '18',
      enableCOD: true,
      requireEmailOTP: true,
      allowRegistrations: true,
      maintenanceMode: false,
      sessionTimeout: '60',
      smtpHost: 'smtp.giftery.com',
      smtpPort: '587',
      senderName: 'GIFTERYS Order Notifications',
    };
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      localStorage.setItem('store_basic_settings', JSON.stringify(settingsForm));
      window.dispatchEvent(new Event('store_settings_updated'));
      await axiosInstance.put(ENDPOINTS.SETTINGS.UPDATE || '/settings', settingsForm);
      toast.success('⚙️ Store Basic Settings saved successfully!');
    } catch {
      localStorage.setItem('store_basic_settings', JSON.stringify(settingsForm));
      window.dispatchEvent(new Event('store_settings_updated'));
      toast.success('⚙️ Store Basic Settings saved successfully!');
    } finally {
      setSavingSettings(false);
    }
  };

  // Products & Categories State
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '0',
    images: '', sku: '', weight: '', featured: false, categoryId: '', isActive: true,
  });

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', image: '', sortOrder: '0', isActive: true, parentId: '',
  });

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.HOME);
    } catch {
      toast.success('Logged out successfully');
      navigate(ROUTES.HOME);
    }
  };

  // Fetch API Data
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await axiosInstance.get(ENDPOINTS.ENQUIRIES.LIST);
        const data = res.data || res;
        if (Array.isArray(data)) setEnquiriesList(data);
      } catch (err) {
        console.warn('Backend enquiry fetch warning:', err.message);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get(ENDPOINTS.SETTINGS.GET);
        const data = res.data || res;
        if (data && typeof data === 'object') setSettingsForm(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.warn('Settings API fetch warning:', err.message);
      }
    };

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=200&showAll=true');
        const data = res.data || res;
        if (data && Array.isArray(data.data)) setProductsList(data.data);
        else if (Array.isArray(data)) setProductsList(data);
      } catch (err) {
        console.warn('Products fetch error:', err.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(ENDPOINTS.CATEGORIES.LIST);
        const data = res.data || res;
        if (data && Array.isArray(data.categories)) setCategories(data.categories);
        else if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.warn('Categories fetch error:', err.message);
      }
    };

    fetchEnquiries();
    fetchSettings();
    fetchProducts();
    fetchCategories();
  }, []);

  // Product CRUD Handlers
  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', comparePrice: '', stock: '0', images: '', sku: '', weight: '', featured: false, categoryId: '', isActive: true });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleOpenAddProduct = () => {
    resetProductForm();
    setShowProductForm(true);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      comparePrice: product.comparePrice?.toString() || '',
      stock: product.stock?.toString() || '0',
      images: (product.images || []).join(', '),
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      featured: product.featured || false,
      categoryId: product.categoryId || '',
      isActive: product.isActive !== false,
    });
    setShowProductForm(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Name, Price, and Category are required');
      return;
    }
    setSavingProduct(true);
    const imagesArr = productForm.images.split(',').map(s => s.trim()).filter(Boolean);
    if (imagesArr.length === 0) {
      toast.error('At least one image URL is required');
      setSavingProduct(false);
      return;
    }
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      comparePrice: productForm.comparePrice ? parseFloat(productForm.comparePrice) : undefined,
      stock: parseInt(productForm.stock) || 0,
      images: imagesArr,
      sku: productForm.sku || undefined,
      weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
      featured: productForm.featured,
      categoryId: productForm.categoryId,
      isActive: productForm.isActive,
    };
    try {
      if (editingProduct) {
        const res = await axiosInstance.put(ENDPOINTS.PRODUCTS.UPDATE(editingProduct.id), payload);
        const updated = (res.data || res).product || (res.data || res);
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
        toast.success('✅ Product updated successfully!');
      } else {
        const res = await axiosInstance.post(ENDPOINTS.PRODUCTS.CREATE, payload);
        const created = (res.data || res).product || (res.data || res);
        setProductsList(prev => [created, ...prev]);
        toast.success('✅ Product added to the store!');
      }
      resetProductForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(ENDPOINTS.PRODUCTS.DELETE(productId));
      setProductsList(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  // Category CRUD Handlers
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: '', sortOrder: '0', isActive: true, parentId: '' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleOpenAddCategory = () => {
    resetCategoryForm();
    setShowCategoryForm(true);
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: cat.sortOrder?.toString() || '0',
      isActive: cat.isActive !== false,
      parentId: cat.parentId || '',
    });
    setShowCategoryForm(true);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCategoryForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category Name is required');
      return;
    }
    setSavingCategory(true);
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || undefined,
      image: categoryForm.image.trim() || undefined,
      sortOrder: parseInt(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
      parentId: categoryForm.parentId || undefined,
    };
    try {
      if (editingCategory) {
        const res = await axiosInstance.put(ENDPOINTS.CATEGORIES.UPDATE(editingCategory.id), payload);
        const updated = (res.data || res).category || (res.data || res);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updated } : c));
        toast.success('✅ Category updated successfully!');
      } else {
        const res = await axiosInstance.post(ENDPOINTS.CATEGORIES.CREATE, payload);
        const created = (res.data || res).category || (res.data || res);
        setCategories(prev => [...prev, created]);
        toast.success('✅ Category created successfully!');
      }
      resetCategoryForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(ENDPOINTS.CATEGORIES.DELETE(catId));
      setCategories(prev => prev.filter(c => c.id !== catId));
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleUpdateEnquiryStatus = async (id, newStatus) => {
    try {
      await axiosInstance.patch(ENDPOINTS.ENQUIRIES.UPDATE_STATUS(id), { status: newStatus });
      setEnquiriesList(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast.success(`Enquiry status updated to ${newStatus}`);
    } catch {
      setEnquiriesList(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast.success(`Enquiry status updated to ${newStatus}`);
    }
  };

  // CSV Exports
  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📥 ${filename} CSV downloaded successfully!`);
  };

  const handleExportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Total Amount (INR)', 'Items Count', 'Order Date', 'Status'];
    const rows = [
      ['ORD-1256', 'Tech Solutions Pvt Ltd', '45600', '4', '18 May 2025', 'Delivered'],
      ['ORD-1255', 'Rahul Verma', '12450', '1', '18 May 2025', 'Processing'],
      ['ORD-1254', 'ABC Corporation', '78900', '15', '17 May 2025', 'Pending'],
    ];
    downloadCSV('Store_Orders_Sales_Report', headers, rows);
  };

  const handleExportProductsCSV = () => {
    const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Price (INR)', 'Compare Price (INR)', 'Stock', 'Status'];
    const rows = (productsList || []).map(p => [
      p.id, p.name, p.sku || 'N/A', p.category?.name || 'General', p.price || 0, p.comparePrice || 0, p.stock || 0, p.isActive ? 'Active' : 'Inactive',
    ]);
    downloadCSV('Products_Inventory_Report', headers, rows);
  };

  const handleExportQuotesCSV = () => {
    const headers = ['Quote ID', 'Customer Name', 'Company Name', 'Email', 'Phone', 'Quantity Requested', 'Submitted Date', 'Status'];
    const rows = (corporateQuotes || []).map(q => [
      q.id, q.name, q.company, q.email, q.phone, q.quantity, q.date, q.status,
    ]);
    downloadCSV('Corporate_Quotes_Report', headers, rows);
  };

  const handleExportCustomersCSV = () => {
    const headers = ['Customer ID', 'Customer Name', 'Email Address', 'Phone Number', 'Account Role', 'Total Orders', 'Total Spent (INR)', 'Joined Date', 'Status'];
    const rows = (customersList || []).map(c => [
      c.id, c.name, c.email, c.phone || 'N/A', c.role || 'CUSTOMER', c.ordersCount || 0, c.totalSpent || 0, c.joinedDate || 'Recent', c.status || 'Active',
    ]);
    downloadCSV('Customer_Database_Report', headers, rows);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar Component */}
      <DashboardSidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Workspace */}
      <main className={styles.mainWorkspace}>
        {/* Top Navbar Component */}
        <DashboardNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Inner Content Workspace */}
        <div className={styles.workspaceInner}>
          {/* Header Banner */}
          <div className={styles.headerBanner}>
            <div>
              <h1 className={styles.pageHeaderTitle}>
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Products Management'}
                {activeTab === 'categories' && 'Categories Management'}
                {activeTab === 'orders' && 'Orders Management'}
                {activeTab === 'corporate-quotes' && 'Corporate Gift Quote Requests'}
                {activeTab === 'customers' && 'Customers & Registered Users'}
                {activeTab === 'enquiries' && 'Customer Enquiries & Contact Messages'}
                {activeTab === 'coupons' && 'Coupons & Promotional Offers'}
                {activeTab === 'reports' && 'Store Analytics & Downloadable Reports'}
                {activeTab === 'users-roles' && 'Users & Roles Access Control'}
                {activeTab === 'settings' && 'Super Admin Store Settings & Security Controls'}
              </h1>
              <p className={styles.pageHeaderSub}>
                Welcome back, Admin! Here's what's happening with your store today.
              </p>
            </div>

            <div className={styles.datePickerPill}>
              <FiCalendar style={{ color: '#64748b' }} />
              <span>May 12, 2025 - May 18, 2025</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▼</span>
            </div>
          </div>

          {/* Section Router */}
          {activeTab === 'dashboard' && (
            <DashboardOverview handleTabChange={handleTabChange} />
          )}

          {activeTab === 'products' && (
            <ProductsSection
              productsList={productsList}
              categories={categories}
              loadingProducts={loadingProducts}
              showProductForm={showProductForm}
              editingProduct={editingProduct}
              savingProduct={savingProduct}
              productForm={productForm}
              resetProductForm={resetProductForm}
              handleOpenAddProduct={handleOpenAddProduct}
              handleEditProductClick={handleEditProductClick}
              handleProductFormChange={handleProductFormChange}
              handleProductSubmit={handleProductSubmit}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesSection
              categories={categories}
              showCategoryForm={showCategoryForm}
              editingCategory={editingCategory}
              savingCategory={savingCategory}
              categoryForm={categoryForm}
              resetCategoryForm={resetCategoryForm}
              handleOpenAddCategory={handleOpenAddCategory}
              handleEditCategoryClick={handleEditCategoryClick}
              handleCategoryFormChange={handleCategoryFormChange}
              handleCategoryImageFileChange={handleCategoryImageFileChange}
              handleCategorySubmit={handleCategorySubmit}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersSection handleExportOrdersCSV={handleExportOrdersCSV} />
          )}

          {activeTab === 'corporate-quotes' && (
            <CorporateQuotesSection
              corporateQuotes={corporateQuotes}
              handleUpdateQuoteStatus={handleUpdateQuoteStatus}
              handleDeleteQuote={handleDeleteQuote}
              handleExportQuotesCSV={handleExportQuotesCSV}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersSection
              customersList={customersList}
              selectedCustomerModal={selectedCustomerModal}
              setSelectedCustomerModal={setSelectedCustomerModal}
              handleExportCustomersCSV={handleExportCustomersCSV}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesSection
              enquiriesList={enquiriesList}
              handleUpdateEnquiryStatus={handleUpdateEnquiryStatus}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsSection initialCoupons={INITIAL_COUPONS} />
          )}

          {activeTab === 'reports' && (
            <ReportsSection
              productsList={productsList}
              corporateQuotes={corporateQuotes}
              customersList={customersList}
              handleExportOrdersCSV={handleExportOrdersCSV}
              handleExportProductsCSV={handleExportProductsCSV}
              handleExportQuotesCSV={handleExportQuotesCSV}
              handleExportCustomersCSV={handleExportCustomersCSV}
            />
          )}

          {activeTab === 'users-roles' && (
            <UsersRolesSection
              adminUsers={adminUsers}
              initialAdminRoles={INITIAL_ADMIN_ROLES}
              showAddRoleModal={showAddRoleModal}
              setShowAddRoleModal={setShowAddRoleModal}
              roleForm={roleForm}
              setRoleForm={setRoleForm}
              handleAddAdminUserSubmit={handleAddAdminUserSubmit}
              handleDeleteAdminUser={handleDeleteAdminUser}
              handleToggleAdminStatus={handleToggleAdminStatus}
              handlePermissionCheckboxToggle={handlePermissionCheckboxToggle}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection
              settingsForm={settingsForm}
              handleSettingsChange={handleSettingsChange}
              handleSaveSettings={handleSaveSettings}
              savingSettings={savingSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
