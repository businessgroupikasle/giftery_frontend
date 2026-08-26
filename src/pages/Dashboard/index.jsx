import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiRefreshCw, FiDownload, FiFilter, FiChevronDown } from 'react-icons/fi';
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
const ADMIN_ROLES = [
  { id: 'role-1', name: 'SUPER_ADMIN', title: 'Super Admin', badgeColor: '#d99b26', description: 'Full unrestricted system access & store configuration', userCount: 1, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes', 'Customers', 'Enquiries', 'Coupons', 'Users & Roles', 'Settings'] },
  { id: 'role-2', name: 'STORE_ADMIN', title: 'Store Manager', badgeColor: '#2563eb', description: 'Full access to products, categories, orders, quotes & customers', userCount: 1, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes', 'Customers', 'Enquiries', 'Coupons'] },
  { id: 'role-3', name: 'ORDER_MANAGER', title: 'Order & Inventory Manager', badgeColor: '#059669', description: 'Manage store orders, products, catalog & quote responses', userCount: 0, permissions: ['Dashboard', 'Products', 'Categories', 'Orders', 'Quotes'] },
  { id: 'role-4', name: 'SUPPORT_AGENT', title: 'Customer Support Agent', badgeColor: '#d97706', description: 'Manage customer enquiries, quote followups & support', userCount: 0, permissions: ['Dashboard', 'Quotes', 'Customers', 'Enquiries'] },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Automatic legacy mock cache purge on initial load
  useEffect(() => {
    try {
      const hasCleaned = localStorage.getItem('giftery_cleaned_mock_v2');
      if (!hasCleaned) {
        localStorage.removeItem('giftery_enquiries');
        localStorage.removeItem('customer_enquiries');
        localStorage.removeItem('registered_users');
        localStorage.removeItem('corporate_quotes');
        localStorage.removeItem('admin_coupons');
        localStorage.removeItem('admin_users_roles');
        localStorage.removeItem('giftery_orders');
        localStorage.setItem('giftery_cleaned_mock_v2', 'true');
      }
    } catch (e) {}
  }, []);

  // Sidebar Mobile Toggle State
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Header Action Controls State & Click Outside Handler
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filterWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Admin Roles & Users State (Driven by current DB authenticated profile)
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_users_roles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      return [{
        id: user.id || 'adm-01',
        name: user.name || 'Admin',
        email: user.email || 'admin@giftery.com',
        phone: user.phone || '+91 98765 00001',
        role: user.role || 'SUPER_ADMIN',
        permissions: ['All Modules'],
        lastLogin: 'Active Now',
        status: 'Active',
      }];
    }
    return [];
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
    toast.success(`${roleForm.name} assigned ${roleForm.role} role & permissions!`);
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

  // Enquiries & Customers State (Pure Live Database Driven)
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Helper to merge & de-duplicate customers from backend + localStorage
  const loadCustomers = async () => {
    setLoadingCustomers(true);
    let backendUsers = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.USERS.LIST + '?role=USER&limit=500');
      const data = res.data || res;
      const arr = Array.isArray(data) ? data : (data?.users || data?.data || []);
      backendUsers = arr
        .filter(u => u.role === 'USER' || u.role === 'CUSTOMER')
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'Not provided',
          role: 'CUSTOMER',
          ordersCount: u.ordersCount || 0,
          totalSpent: u.totalSpent || 0,
          joinedDate: u.joinedDate || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'),
          status: u.status || (u.isActive !== undefined ? (u.isActive ? 'Active' : 'Inactive') : 'Active'),
        }));
    } catch (err) {
      console.warn('Users API fetch warning:', err.message);
    }

    let localUsers = [];
    try {
      const stored = localStorage.getItem('registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localUsers = parsed;
      }
    } catch (e) {}

    const map = new Map();
    localUsers.forEach(lu => map.set(lu.email, lu));
    backendUsers.forEach(bu => map.set(bu.email, bu));

    setCustomersList(Array.from(map.values()));
    setLoadingCustomers(false);
  };

  // Corporate Quotes State (Live DB / Submitted Quotes)
  const [corporateQuotes, setCorporateQuotes] = useState(() => {
    try {
      const stored = localStorage.getItem('corporate_quotes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
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
      if (settingsForm.storeLogo) {
        localStorage.setItem('giftery_store_logo', settingsForm.storeLogo);
      } else {
        localStorage.removeItem('giftery_store_logo');
      }
      // Dispatch events with slight delay to ensure DOM is updated
      setTimeout(() => {
        window.dispatchEvent(new Event('store_settings_updated'));
        window.dispatchEvent(new Event('store_logo_updated'));
      }, 50);

      await axiosInstance.put(ENDPOINTS.SETTINGS.UPDATE || '/settings', settingsForm);
      toast.success('Store Settings & Logo saved successfully!');
    } catch {
      localStorage.setItem('store_basic_settings', JSON.stringify(settingsForm));
      if (settingsForm.storeLogo) {
        localStorage.setItem('giftery_store_logo', settingsForm.storeLogo);
      } else {
        localStorage.removeItem('giftery_store_logo');
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('store_settings_updated'));
        window.dispatchEvent(new Event('store_logo_updated'));
      }, 50);
      toast.success('Store Settings & Logo saved successfully!');
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
    images: '', sku: '', tags: '', featured: false, isFeatured: false, isBestseller: false,
    isPopular: false, isNewArrival: false, isMostLoved: false, isGiftSet: false,
    categoryId: '', subCategoryId: '', isActive: true,
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

  // Orders & Backend Dashboard Stats State (Pure Live Database Driven)
  const [ordersList, setOrdersList] = useState([]);
  const [backendStats, setBackendStats] = useState(null);

  // Fetch API Data
  const fetchDashboardStats = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.DASHBOARD.STATS);
      const data = res.data?.data || res.data || res;
      if (data && typeof data === 'object') setBackendStats(data);
    } catch (err) {
      console.warn('Dashboard stats fetch warning:', err.message);
    }
  };

  const fetchOrders = async () => {
    let apiOrders = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.ORDERS.LIST);
      const responseData = res.data?.data || res.data || res;
      apiOrders = Array.isArray(responseData?.data)
        ? responseData.data
        : (Array.isArray(responseData)
          ? responseData
          : (Array.isArray(responseData?.orders) ? responseData.orders : []));
    } catch (err) {
      console.warn('Orders fetch warning:', err.message);
    }

    const localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
    const map = new Map();

    // 1. Add local orders
    localOrders.forEach((lo) => {
      const key = String(lo.id || lo.orderId || '');
      if (key) map.set(key, lo);
    });

    // 2. Add / override with PostgreSQL DB orders (DB is single source of truth)
    apiOrders.forEach((ao) => {
      const key = String(ao.id || ao.orderId || '');
      if (key) {
        const local = map.get(key);
        map.set(key, {
          ...local,
          ...ao,
          id: ao.id,
          orderId: ao.id,
          status: (ao.status || local?.status || 'PENDING').toUpperCase(),
        });
      }
    });

    const combined = Array.from(map.values());

    const formatted = combined.map(o => {
      const customerName = o.customerName || o.customer || o.user?.name || o.shippingAddress?.fullName || o.shippingAddress?.name || o.customerEmail || o.user?.email || 'Customer';
      const dateStr = o.createdAt || o.date;
      let formattedDate = 'Recent';
      if (dateStr) {
        try {
          formattedDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch (e) {}
      }

      const itemsArr = Array.isArray(o.items) ? o.items : [];
      const itemsCount = o.itemsCount || (itemsArr.length > 0 ? itemsArr.length : 1);
      const itemsDetails = itemsArr.length > 0
        ? itemsArr.map(i => `${i.name || i.product?.name || 'Gift Item'} ×${i.quantity || 1}`).join(', ')
        : '1 Item';

      const totalNum = Number(o.totalAmount || o.rawAmount || o.total || 0);

      let statusStr = 'Pending';
      if (o.status) {
        const s = String(o.status).toUpperCase();
        if (s === 'DELIVERED') statusStr = 'Delivered';
        else if (s === 'CONFIRMED') statusStr = 'Confirmed';
        else if (s === 'PROCESSING') statusStr = 'Processing';
        else if (s === 'SHIPPED') statusStr = 'Shipped';
        else if (s === 'CANCELLED') statusStr = 'Cancelled';
        else if (s === 'REFUNDED') statusStr = 'Refunded';
        else statusStr = 'Pending';
      }

      return {
        id: o.id || o.orderId || `ORD-${Date.now()}`,
        orderId: o.orderId || o.id,
        customer: customerName,
        customerEmail: o.customerEmail || o.user?.email || '',
        date: formattedDate,
        createdAt: dateStr || new Date().toISOString(),
        itemsCount,
        itemsDetails,
        items: itemsArr,
        amount: `₹${totalNum.toLocaleString('en-IN')}`,
        rawAmount: totalNum,
        status: statusStr,
        shippingAddress: o.shippingAddress || null,
      };
    });
    setOrdersList(formatted);
  };

  const fetchEnquiries = async () => {
    let backendEnquiries = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.ENQUIRIES.LIST);
      const responseData = res.data?.data || res.data || res;
      const arr = Array.isArray(responseData)
        ? responseData
        : (Array.isArray(responseData?.data) ? responseData.data : []);
      backendEnquiries = arr;
    } catch (err) {
      console.warn('Backend enquiry fetch warning:', err.message);
    }

    const localEnquiries = JSON.parse(localStorage.getItem('giftery_enquiries') || '[]');
    const map = new Map();
    localEnquiries.forEach(le => map.set(le.id, le));
    backendEnquiries.forEach(be => map.set(be.id, be));

    setEnquiriesList(Array.from(map.values()));
  };

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.SETTINGS.GET);
      const data = res.data?.data || res.data || res;
      if (data && typeof data === 'object') {
        setSettingsForm(prev => ({ ...prev, ...data }));
        // Sync logo to localStorage for Header & Footer
        if (data.storeLogo) {
          localStorage.setItem('giftery_store_logo', data.storeLogo);
          window.dispatchEvent(new Event('store_logo_updated'));
        }
      }
    } catch (err) {
      console.warn('Settings API fetch warning:', err.message);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=200&showAll=true');
      let extracted = [];
      if (Array.isArray(res)) extracted = res;
      else if (res?.data && Array.isArray(res.data)) extracted = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) extracted = res.data.data;
      else if (res?.data?.products && Array.isArray(res.data.products)) extracted = res.data.products;
      else if (res?.products && Array.isArray(res.products)) extracted = res.products;
      setProductsList(extracted);
    } catch (err) {
      console.warn('Products fetch error:', err.message);
      toast.error(`Failed to fetch live products: ${err.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    let apiCats = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.CATEGORIES.LIST);
      const data = res.data || res;
      if (data && Array.isArray(data.categories)) apiCats = data.categories;
      else if (Array.isArray(data.data)) apiCats = data.data;
      else if (Array.isArray(data)) apiCats = data;
    } catch (err) {
      console.warn('Categories fetch error:', err.message);
    } finally {
      const localCats = JSON.parse(localStorage.getItem('giftery_categories') || '[]');
      const merged = [...localCats];
      apiCats.forEach(ac => {
        if (!merged.find(m => m.id === ac.id || m.slug === ac.slug)) {
          merged.push(ac);
        }
      });
      setCategories(merged);
    }
  };

  const fetchAllDashboardData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchDashboardStats(),
        fetchOrders(),
        fetchEnquiries(),
        fetchSettings(),
        fetchProducts(),
        fetchCategories(),
        loadCustomers(),
      ]);
      toast.success('Dashboard data refreshed successfully!');
    } catch (err) {
      toast.error('Failed to refresh store data');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
    fetchEnquiries();
    fetchSettings();
    fetchProducts();
    fetchCategories();
    loadCustomers();
  }, []);

  // Listen for new registrations, enquiries, and orders from localStorage / live events
  useEffect(() => {
    const handleNewUser = () => loadCustomers();
    const handleNewEnquiry = () => fetchEnquiries();
    const handleOrdersUpdated = () => fetchOrders();
    const handleProductsUpdated = () => fetchProducts();

    window.addEventListener('registered_users_updated', handleNewUser);
    window.addEventListener('enquiries_updated', handleNewEnquiry);
    window.addEventListener('orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);
    window.addEventListener('products_updated', handleProductsUpdated);

    return () => {
      window.removeEventListener('registered_users_updated', handleNewUser);
      window.removeEventListener('enquiries_updated', handleNewEnquiry);
      window.removeEventListener('orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
      window.removeEventListener('products_updated', handleProductsUpdated);
    };
  }, []);

  // Product CRUD Handlers
  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      specifications: '',
      customization: '',
      shippingReturns: '',
      tags: '',
      rating: '4.8',
      reviewsCount: '128',
      price: '',
      comparePrice: '',
      stock: '0',
      images: '',
      sku: '',
      featured: false,
      isFeatured: false,
      isBestseller: false,
      isPopular: false,
      isNewArrival: false,
      isMostLoved: false,
      isGiftSet: false,
      categoryId: '',
      subCategoryId: '',
      isActive: true,
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleOpenAddProduct = (categoryId = '', subCategoryId = '') => {
    resetProductForm();
    if (categoryId || subCategoryId) {
      setProductForm(prev => ({
        ...prev,
        categoryId: categoryId || prev.categoryId,
        subCategoryId: subCategoryId || prev.subCategoryId,
      }));
    }
    setShowProductForm(true);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);

    // Robustly resolve main category ID and subcategory ID for the form
    let resolvedMainId = '';
    let resolvedSubId = '';

    const catId = product.categoryId || (typeof product.category === 'object' ? product.category?.id : product.category);
    const subId = product.subCategoryId;

    const matchedCat = categories.find(c => c.id === catId || c.slug === catId);
    if (matchedCat) {
      if (!matchedCat.parentId) {
        // Direct main category
        resolvedMainId = matchedCat.id;
        resolvedSubId = subId || '';
      } else {
        // catId is actually a subcategory!
        resolvedMainId = matchedCat.parentId;
        resolvedSubId = matchedCat.id;
      }
    } else {
      resolvedMainId = catId || '';
      resolvedSubId = subId || '';
    }

    if (subId && !resolvedSubId) {
      const matchedSub = categories.find(c => c.id === subId || c.slug === subId);
      if (matchedSub) {
        resolvedSubId = matchedSub.id;
        if (matchedSub.parentId && !resolvedMainId) {
          resolvedMainId = matchedSub.parentId;
        }
      }
    }

    setProductForm({
      name: product.name || '',
      description: product.description || '',
      specifications: typeof product.specifications === 'object' ? JSON.stringify(product.specifications, null, 2) : (product.specifications || ''),
      customization: product.customization || '',
      shippingReturns: product.shippingReturns || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      rating: product.rating?.toString() || '4.8',
      reviewsCount: product.reviewsCount?.toString() || '128',
      price: product.price?.toString() || '',
      comparePrice: product.comparePrice?.toString() || '',
      stock: product.stock?.toString() || '0',
      images: Array.isArray(product.images) ? product.images.join('|||') : (product.images || ''),
      sku: product.sku || '',
      featured: Boolean(product.featured || product.isFeatured),
      isFeatured: Boolean(product.isFeatured || product.featured),
      isBestseller: Boolean(product.isBestseller),
      isPopular: Boolean(product.isPopular),
      isNewArrival: Boolean(product.isNewArrival),
      isMostLoved: Boolean(product.isMostLoved),
      isGiftSet: Boolean(product.isGiftSet),
      categoryId: resolvedMainId,
      subCategoryId: resolvedSubId,
      isActive: product.isActive !== false,
    });
    setShowProductForm(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'categoryId') {
        updated.subCategoryId = '';
      }
      return updated;
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Name, Price, and Category are required');
      return;
    }
    setSavingProduct(true);
    const parseFormImages = (imgs) => {
      if (!imgs) return [];
      if (Array.isArray(imgs)) return imgs.map((s) => String(s).trim()).filter(Boolean);
      if (typeof imgs === 'string') {
        const trimmed = imgs.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
          } catch (err) {}
        }
        if (trimmed.includes('|||')) {
          return trimmed.split('|||').map((s) => s.trim()).filter(Boolean);
        }
        if (trimmed.startsWith('data:')) {
          return [trimmed];
        }
        return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };
    const imagesArr = parseFormImages(productForm.images);
    if (imagesArr.length === 0) {
      toast.error('At least one image is required');
      setSavingProduct(false);
      return;
    }
    const tagsArr = productForm.tags
      ? productForm.tags.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const isFeaturedVal = Boolean(productForm.isFeatured || productForm.featured);
    const isBestsellerVal = Boolean(productForm.isBestseller);
    const isPopularVal = Boolean(productForm.isPopular);
    const isNewArrivalVal = Boolean(productForm.isNewArrival);
    const isMostLovedVal = Boolean(productForm.isMostLoved);
    const isGiftSetVal = Boolean(productForm.isGiftSet);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description ? productForm.description.trim() : productForm.name.trim(),
      specifications: productForm.specifications || undefined,
      customization: productForm.customization || undefined,
      shippingReturns: productForm.shippingReturns || undefined,
      tags: tagsArr,
      rating: parseFloat(productForm.rating) || 4.8,
      reviewsCount: parseInt(productForm.reviewsCount, 10) || 128,
      price: parseFloat(productForm.price),
      comparePrice: productForm.comparePrice ? parseFloat(productForm.comparePrice) : null,
      stock: parseInt(productForm.stock, 10) || 0,
      images: imagesArr,
      sku: productForm.sku ? productForm.sku.trim() : undefined,
      featured: isFeaturedVal,
      isFeatured: isFeaturedVal,
      isBestseller: isBestsellerVal,
      isPopular: isPopularVal,
      isNewArrival: isNewArrivalVal,
      isMostLoved: isMostLovedVal,
      isGiftSet: isGiftSetVal,
      categoryId: productForm.categoryId,
      subCategoryId: productForm.subCategoryId || null,
      isActive: productForm.isActive !== false,
    };

    try {
      if (editingProduct && editingProduct.id && !editingProduct.id.startsWith('prod-')) {
        await axiosInstance.put(ENDPOINTS.PRODUCTS.UPDATE(editingProduct.id), payload);
        toast.success(`Product "${payload.name}" updated successfully in database!`);
      } else {
        await axiosInstance.post(ENDPOINTS.PRODUCTS.CREATE, payload);
        toast.success(`Product "${payload.name}" created and saved to database!`);
      }

      await fetchProducts();
      window.dispatchEvent(new Event('products_updated'));
      resetProductForm();
    } catch (err) {
      console.error('Database product save error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save product to database';
      toast.error(`Database Error: ${errMsg}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete Confirmation Modal State & Handlers
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  const handleDeleteProduct = (productId, productName) => {
    setDeleteConfirmModal({
      type: 'product',
      id: productId,
      name: productName,
    });
  };

  // Category CRUD Handlers
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: '', sortOrder: '0', isActive: true, parentId: '' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleOpenAddCategory = (parentId = '') => {
    resetCategoryForm();
    if (parentId) {
      setCategoryForm(prev => ({ ...prev, parentId }));
    }
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
    if (!categoryForm.name || !categoryForm.name.trim()) {
      toast.error('Category Name is required');
      return;
    }
    setSavingCategory(true);

    const generatedSlug = categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description ? categoryForm.description.trim() : undefined,
      image: categoryForm.image ? categoryForm.image.trim() : undefined,
      sortOrder: parseInt(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
      parentId: categoryForm.parentId || undefined,
    };

    const savedCat = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: payload.name,
      slug: (editingCategory && editingCategory.slug) || generatedSlug,
      description: payload.description || '',
      image: payload.image || '/images/cat_corporate.png',
      sortOrder: payload.sortOrder || 0,
      isActive: payload.isActive !== false,
      parentId: payload.parentId || null,
      createdAt: editingCategory ? editingCategory.createdAt : new Date().toISOString(),
    };

    // Save locally to localStorage so it syncs immediately & works offline
    const existingCustomCats = JSON.parse(localStorage.getItem('giftery_categories') || '[]');
    let updatedCustomCats;
    if (editingCategory) {
      updatedCustomCats = existingCustomCats.map(c => (c.id === editingCategory.id || c.slug === savedCat.slug) ? { ...c, ...savedCat } : c);
    } else {
      updatedCustomCats = [savedCat, ...existingCustomCats.filter(c => c.id !== savedCat.id)];
    }
    localStorage.setItem('giftery_categories', JSON.stringify(updatedCustomCats));
    window.dispatchEvent(new Event('categories_updated'));

    try {
      if (editingCategory) {
        const res = await axiosInstance.put(ENDPOINTS.CATEGORIES.UPDATE(editingCategory.id), payload);
        const updated = (res.data || res).category || (res.data || res);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...savedCat, ...updated } : c));
        toast.success('Category updated successfully!');
      } else {
        const res = await axiosInstance.post(ENDPOINTS.CATEGORIES.CREATE, payload);
        const created = (res.data || res).category || (res.data || res);
        setCategories(prev => [...prev.filter(c => c.id !== savedCat.id), created || savedCat]);
        toast.success('Category created successfully!');
      }
      resetCategoryForm();
    } catch (err) {
      console.warn('Backend API category save warning, category saved to store:', err.message);
      setCategories(prev => [...prev.filter(c => c.id !== savedCat.id), savedCat]);
      toast.success('Category saved to store!');
      resetCategoryForm();
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = (catId, catName) => {
    setDeleteConfirmModal({
      type: 'category',
      id: catId,
      name: catName,
    });
  };

  const confirmExecuteDelete = async () => {
    if (!deleteConfirmModal) return;
    const { type, id, name } = deleteConfirmModal;
    setDeleteConfirmModal(null);

    if (type === 'product') {
      try {
        await axiosInstance.delete(ENDPOINTS.PRODUCTS.DELETE(id));
        setProductsList(prev => prev.filter(p => p.id !== id && p.slug !== id));
        toast.success(`Product "${name}" deleted successfully from database!`);
        window.dispatchEvent(new Event('products_updated'));
      } catch (err) {
        console.error('Backend API delete error:', err);
        const errMsg = err.response?.data?.message || err.message || 'Failed to delete product from database';
        toast.error(`Delete Error: ${errMsg}`);
      }
    } else if (type === 'category') {
      // 1. Save to deleted categories list
      const deletedCats = JSON.parse(localStorage.getItem('giftery_deleted_categories') || '[]');
      if (!deletedCats.includes(id)) deletedCats.push(id);
      localStorage.setItem('giftery_deleted_categories', JSON.stringify(deletedCats));

      // 2. Clean from localStorage & component state
      const existingCustomCats = JSON.parse(localStorage.getItem('giftery_categories') || '[]');
      const updatedCustomCats = existingCustomCats.filter(c => c.id !== id && c.slug !== id);
      localStorage.setItem('giftery_categories', JSON.stringify(updatedCustomCats));
      setCategories(prev => prev.filter(c => c.id !== id && c.slug !== id));
      window.dispatchEvent(new Event('categories_updated'));

      // 3. Sync backend API delete
      try {
        await axiosInstance.delete(ENDPOINTS.CATEGORIES.DELETE(id));
        toast.success(`Category "${name}" deleted successfully!`);
      } catch (err) {
        console.warn('Backend API category delete warning:', err.message);
        toast.success(`Category "${name}" removed from store`);
      }
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

  // Download Confirmation & File Preview Modal Window State
  const [downloadModalData, setDownloadModalData] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Executed when user clicks "Confirm & Download Now" inside the popup modal window
  const executeDownload = () => {
    if (!downloadModalData) return;
    const { filename, headers, rows } = downloadModalData;

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

    toast.success(`${filename.replace(/_/g, ' ')} downloaded successfully!`);
    setDownloadModalData(null);
    setShowFilePreview(false);
  };

  const triggerDownloadConfirmation = (filename, reportTitle, headers, rows) => {
    setShowFilePreview(false);
    setDownloadModalData({
      filename,
      reportTitle,
      headers,
      rows,
      recordsCount: rows.length,
    });
  };

  const handleExportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Total Amount (INR)', 'Items Count', 'Order Date', 'Status'];
    const rows = (ordersList || []).map(o => [
      o.id,
      o.customer || 'Customer',
      o.rawAmount || (o.amount || '0').replace(/[^0-9.]/g, ''),
      o.itemsCount || 1,
      o.date || '',
      o.status || 'Pending',
    ]);
    triggerDownloadConfirmation('Store_Orders_Sales_Report', 'Orders & Sales Report', headers, rows);
  };

  const handleExportProductsCSV = () => {
    const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Price (INR)', 'Compare Price (INR)', 'Stock', 'Status'];
    const rows = (productsList || []).map(p => [
      p.id, p.name, p.sku || 'N/A', p.category?.name || 'General', p.price || 0, p.comparePrice || 0, p.stock || 0, p.isActive ? 'Active' : 'Inactive',
    ]);
    triggerDownloadConfirmation('Products_Inventory_Report', 'Products Inventory Report', headers, rows);
  };

  const handleExportQuotesCSV = () => {
    const headers = ['Quote ID', 'Customer Name', 'Company Name', 'Email', 'Phone', 'Quantity Requested', 'Submitted Date', 'Status'];
    const rows = (corporateQuotes || []).map(q => [
      q.id, q.name, q.company, q.email, q.phone, q.quantity, q.date, q.status,
    ]);
    triggerDownloadConfirmation('Corporate_Quotes_Report', 'Corporate Quotes Report', headers, rows);
  };

  const handleExportCustomersCSV = () => {
    const headers = ['Customer ID', 'Customer Name', 'Email Address', 'Phone Number', 'Account Role', 'Total Orders', 'Total Spent (INR)', 'Joined Date', 'Status'];
    const rows = (customersList || []).map(c => [
      c.id, c.name, c.email, c.phone || 'N/A', c.role || 'CUSTOMER', c.ordersCount || 0, c.totalSpent || 0, c.joinedDate || 'Recent', c.status || 'Active',
    ]);
    triggerDownloadConfirmation('Customer_Database_Report', 'Customer Database Report', headers, rows);
  };

  const handleExportEnquiriesCSV = () => {
    const headers = ['Enquiry ID', 'Customer Name', 'Email Address', 'Phone Number', 'Category / Subject', 'Enquiry Message', 'Submitted Date', 'Status'];
    const rows = (enquiriesList || []).map(e => [
      e.id, e.name, e.email, e.phone || 'N/A', e.subject || e.category || 'General Inquiry', e.message || '', e.createdAt || e.date || 'Recent', e.status || 'New',
    ]);
    triggerDownloadConfirmation('Customer_Enquiries_Report', 'Customer Enquiries Report', headers, rows);
  };

  const handleHeaderExport = () => {
    if (activeTab === 'products') {
      handleExportProductsCSV();
    } else if (activeTab === 'customers') {
      handleExportCustomersCSV();
    } else if (activeTab === 'corporate-quotes') {
      handleExportQuotesCSV();
    } else if (activeTab === 'enquiries') {
      handleExportEnquiriesCSV();
    } else {
      handleExportOrdersCSV();
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${sidebarOpen ? styles.sidebarOpen : ''}`}
      onClick={(e) => {
        if (sidebarOpen && window.innerWidth <= 768 && e.target === e.currentTarget) {
          setSidebarOpen(false);
        }
      }}
    >
      {/* Sidebar Component */}
      <DashboardSidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        user={user}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Workspace */}
      <main className={styles.mainWorkspace}>
        {/* Top Navbar Component */}
        <DashboardNavbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          handleLogout={handleLogout}
          setActiveTab={handleTabChange}
          ordersList={ordersList}
          enquiriesList={enquiriesList}
          corporateQuotes={corporateQuotes}
          customersList={customersList}
          productsList={productsList}
          categories={categories}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
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

            {/* Header Action Controls */}
            <div className={styles.headerActions}>
              {/* Filter Dropdown */}
              <div className={styles.filterWrapper} ref={filterWrapperRef}>
                <button
                  className={`${styles.headerActionBtn} ${styles.filterBtn}`}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  title="Filter data"
                >
                  <FiFilter />
                  <span>Filter</span>
                  <FiChevronDown className={showFilterMenu ? styles.chevronUp : ''} />
                </button>
                {showFilterMenu && (
                  <div className={styles.filterMenu}>
                    <p className={styles.filterMenuLabel}>Date Range</p>
                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'].map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.filterMenuItem} ${selectedFilter === opt ? styles.filterMenuItemActive : ''}`}
                        onClick={() => { setSelectedFilter(opt); setShowFilterMenu(false); toast.info(`Filter: ${opt}`); }}
                      >
                        {opt}
                        {selectedFilter === opt && <span className={styles.filterCheckmark}>✓</span>}
                      </button>
                    ))}
                    <div className={styles.filterMenuDivider} />
                    <p className={styles.filterMenuLabel}>Status</p>
                    {['All', 'Pending', 'Completed', 'Cancelled'].map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.filterMenuItem} ${selectedStatus === opt ? styles.filterMenuItemActive : ''}`}
                        onClick={() => { setSelectedStatus(opt); setShowFilterMenu(false); toast.info(`Status: ${opt}`); }}
                      >
                        {opt}
                        {selectedStatus === opt && <span className={styles.filterCheckmark}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Picker Pill */}
              <div className={styles.datePickerPill}>
                <FiCalendar style={{ color: '#64748b' }} />
                <span>{selectedFilter === 'Today' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : selectedFilter === 'Custom Range' ? 'May 12 - May 18, 2025' : selectedFilter}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▼</span>
              </div>

              {/* Refresh Button */}
              <button
                className={`${styles.headerActionBtn} ${styles.refreshBtn} ${isRefreshing ? styles.refreshSpinning : ''}`}
                onClick={fetchAllDashboardData}
                title="Refresh data"
                disabled={isRefreshing}
              >
                <FiRefreshCw />
              </button>

              {/* Export Excel Button */}
              <button
                className={`${styles.headerActionBtn} ${styles.excelBtn}`}
                onClick={handleHeaderExport}
                title="Export to Excel / CSV"
              >
                <FiDownload />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Section Router */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              handleTabChange={handleTabChange}
              productsList={productsList}
              categories={categories}
              enquiriesList={enquiriesList}
              corporateQuotes={corporateQuotes}
              customersList={customersList}
              ordersList={ordersList}
              backendStats={backendStats}
            />
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
              products={productsList}
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
            <OrdersSection
              ordersList={ordersList}
              handleExportOrdersCSV={handleExportOrdersCSV}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersSection
              customersList={customersList}
              selectedCustomerModal={selectedCustomerModal}
              setSelectedCustomerModal={setSelectedCustomerModal}
              handleExportCustomersCSV={handleExportCustomersCSV}
              loadingCustomers={loadingCustomers}
              onRefresh={loadCustomers}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesSection
              enquiriesList={enquiriesList}
              handleUpdateEnquiryStatus={handleUpdateEnquiryStatus}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsSection initialCoupons={[]} />
          )}

          {activeTab === 'reports' && (
            <ReportsSection
              productsList={productsList}
              corporateQuotes={corporateQuotes}
              customersList={customersList}
              enquiriesList={enquiriesList}
              handleExportOrdersCSV={handleExportOrdersCSV}
              handleExportProductsCSV={handleExportProductsCSV}
              handleExportQuotesCSV={handleExportQuotesCSV}
              handleExportCustomersCSV={handleExportCustomersCSV}
              handleExportEnquiriesCSV={handleExportEnquiriesCSV}
            />
          )}

          {activeTab === 'users-roles' && (
            <UsersRolesSection
              adminUsers={adminUsers}
              initialAdminRoles={ADMIN_ROLES}
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

      {/* ── DOWNLOAD CONFIRMATION & FILE PREVIEW MODAL POPUP WINDOW ── */}
      {downloadModalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              maxWidth: showFilePreview ? '820px' : '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                View & Download Report File
              </h4>
              <button
                type="button"
                onClick={() => setDownloadModalData(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* File Info Box */}
            <div style={{ background: '#fffcf5', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#92400e' }}>
                {downloadModalData.reportTitle}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Filename: <code style={{ background: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600 }}>{downloadModalData.filename}_{new Date().toISOString().slice(0, 10)}.csv</code>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.78rem', color: '#b45309', fontWeight: '600' }}>
                <span>Format: CSV Document (.csv)</span>
                <span>•</span>
                <span>Total Records: {downloadModalData.recordsCount} Rows</span>
              </div>
            </div>

            {/* Interactive View Data Preview Section */}
            {showFilePreview && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Report Data Records ({downloadModalData.recordsCount} Total)</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Live Data Preview</span>
                </div>

                <div style={{ maxHeight: '250px', overflowX: 'auto', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fafafa' }}>
                  <table className={styles.ordersTable} style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        {downloadModalData.headers.map((h, i) => (
                          <th key={i} style={{ padding: '0.55rem 0.75rem', background: '#f1f5f9', whiteSpace: 'nowrap', color: '#1e293b' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {downloadModalData.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.45rem 0.75rem', whiteSpace: 'nowrap', color: '#334155' }}>{String(cell || '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowFilePreview(!showFilePreview)}
                style={{ padding: '0.6rem 1.1rem', background: showFilePreview ? '#eff6ff' : '#ffffff', border: showFilePreview ? '1.5px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', color: showFilePreview ? '#1d4ed8' : '#334155', fontSize: '0.85rem' }}
              >
                {showFilePreview ? 'Hide Data Preview' : 'View File Data'}
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDownloadModalData(null)}
                  style={{ padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDownload}
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #d99b26 0%, #b87c12 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 155, 38, 0.3)', fontSize: '0.85rem' }}
                >
                  Download File Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── CUSTOM MODERN DELETE CONFIRMATION MODAL POPUP WINDOW ── */}
      {deleteConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setDeleteConfirmModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.85rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            {/* Warning Icon Circle */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.18)',
              }}
            >
              ⚠️
            </div>

            <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Are you sure you want to delete?
            </h3>

            <p style={{ margin: '0 0 1.6rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              Delete <strong style={{ color: '#0f172a' }}>"{deleteConfirmModal.name}"</strong>? This action cannot be undone and will permanently remove this {deleteConfirmModal.type} from the store catalog.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmExecuteDelete}
                style={{
                  padding: '0.65rem 1.6rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
