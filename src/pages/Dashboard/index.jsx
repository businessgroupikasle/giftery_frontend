import { useState, useEffect } from 'react';
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

  // Header Action Controls State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const [customersList, setCustomersList] = useState(INITIAL_CUSTOMERS);
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
          joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
          status: u.isActive ? 'Active' : 'Inactive',
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

    const merged = [...backendUsers];
    localUsers.forEach(lu => {
      if (!merged.find(u => u.email === lu.email)) merged.push(lu);
    });

    const allUsers = merged.length > 0 ? [...merged, ...INITIAL_CUSTOMERS.filter(ic => !merged.find(u => u.email === ic.email))] : INITIAL_CUSTOMERS;
    setCustomersList(allUsers);
    setLoadingCustomers(false);
  };

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
    images: '', sku: '', weight: '', featured: false, categoryId: '', subCategoryId: '', isActive: true,
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

  // Orders & Backend Dashboard Stats State
  const [ordersList, setOrdersList] = useState([
    { id: 'ORD-1256', customer: 'Tech Solutions Pvt. Ltd.', date: 'May 18, 2025', itemsCount: 4, amount: '₹45,600', rawAmount: 45600, status: 'Delivered' },
    { id: 'ORD-1255', customer: 'Rahul Verma', date: 'May 18, 2025', itemsCount: 1, amount: '₹12,450', rawAmount: 12450, status: 'Processing' },
    { id: 'ORD-1254', customer: 'ABC Corporation', date: 'May 17, 2025', itemsCount: 15, amount: '₹78,900', rawAmount: 78900, status: 'Pending' },
    { id: 'ORD-1253', customer: 'Sneha Iyer', date: 'May 17, 2025', itemsCount: 2, amount: '₹5,250', rawAmount: 5250, status: 'Delivered' },
    { id: 'ORD-1252', customer: 'Global Enterprises', date: 'May 16, 2025', itemsCount: 8, amount: '₹32,750', rawAmount: 32750, status: 'Processing' },
    { id: 'ORD-1251', customer: 'Ananya Sharma', date: 'May 15, 2025', itemsCount: 3, amount: '₹18,400', rawAmount: 18400, status: 'Cancelled' },
  ]);
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
      const data = res.data?.data || res.data || res;
      if (Array.isArray(data)) apiOrders = data;
    } catch (err) {
      console.warn('Orders fetch warning:', err.message);
    }

    const localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
    const combined = [...localOrders];
    apiOrders.forEach(ao => {
      if (!combined.find(c => c.id === ao.id || c.orderId === ao.id)) {
        combined.push(ao);
      }
    });

    if (combined.length > 0) {
      const formatted = combined.map(o => ({
        id: o.id?.toString().startsWith('ORD-') ? o.id : `ORD-${o.id}`,
        customer: o.customerName || o.user?.name || o.shippingAddress?.fullName || 'Customer',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
        itemsCount: o.items?.length || 1,
        amount: `₹${(o.totalAmount || 0).toLocaleString('en-IN')}`,
        rawAmount: o.totalAmount || 0,
        status: o.status ? (o.status === 'DELIVERED' ? 'Delivered' : o.status === 'PROCESSING' ? 'Processing' : o.status === 'CANCELLED' ? 'Cancelled' : 'Pending') : 'Pending',
      }));
      setOrdersList(formatted);
    }
  };

  const fetchEnquiries = async () => {
    let backendEnquiries = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.ENQUIRIES.LIST);
      const responseData = res.data || res;
      const arr = Array.isArray(responseData)
        ? responseData
        : (Array.isArray(responseData?.data) ? responseData.data : []);
      backendEnquiries = arr;
    } catch (err) {
      console.warn('Backend enquiry fetch warning:', err.message);
    }

    let localEnquiries = [];
    try {
      const stored = localStorage.getItem('customer_enquiries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localEnquiries = parsed;
      }
    } catch (e) {}

    const merged = [...backendEnquiries];
    localEnquiries.forEach((le) => {
      if (!merged.find((e) => e.id === le.id || (e.email === le.email && e.message === le.message))) {
        merged.push(le);
      }
    });

    const finalEnquiries = merged.length > 0
      ? [...merged, ...INITIAL_ENQUIRIES.filter((ie) => !merged.find((m) => m.id === ie.id))]
      : INITIAL_ENQUIRIES;

    setEnquiriesList(finalEnquiries);
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
    let apiProducts = [];
    try {
      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=200&showAll=true');
      let extracted = [];
      if (Array.isArray(res)) extracted = res;
      else if (res?.data && Array.isArray(res.data)) extracted = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) extracted = res.data.data;
      else if (res?.data?.products && Array.isArray(res.data.products)) extracted = res.data.products;
      else if (res?.products && Array.isArray(res.products)) extracted = res.products;
      apiProducts = extracted;
    } catch (err) {
      console.warn('Products fetch error:', err.message);
    } finally {
      const localProducts = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const merged = [...localProducts];
      apiProducts.forEach(ap => {
        if (!merged.find(m => m.id === ap.id || m.slug === ap.slug)) {
          merged.push(ap);
        }
      });
      setProductsList(merged);
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
    toast.info('Refreshing store data...', { autoClose: 1200 });
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
      toast.success('🔄 Dashboard data refreshed successfully!');
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

  // Listen for new registrations, enquiries, and orders from localStorage events
  useEffect(() => {
    const handleNewUser = () => {
      loadCustomers();
    };
    const handleNewEnquiry = () => {
      loadCustomers();
    };
    const handleNewOrder = () => {
      const fetchOrders = async () => {
        let apiOrders = [];
        try {
          const res = await axiosInstance.get(ENDPOINTS.ORDERS.LIST);
          const data = res.data?.data || res.data || res;
          if (Array.isArray(data)) apiOrders = data;
        } catch (err) {
          console.warn('Orders fetch warning:', err.message);
        }

        const localOrders = JSON.parse(localStorage.getItem('giftery_orders') || '[]');
        const combined = [...localOrders];
        apiOrders.forEach(ao => {
          if (!combined.find(c => c.id === ao.id || c.orderId === ao.id)) {
            combined.push(ao);
          }
        });

        if (combined.length > 0) {
          const formatted = combined.map(o => ({
            id: o.id?.toString().startsWith('ORD-') ? o.id : `ORD-${o.id}`,
            customer: o.customerName || o.user?.name || o.shippingAddress?.fullName || 'Customer',
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
            itemsCount: o.items?.length || 1,
            amount: `₹${(o.totalAmount || 0).toLocaleString('en-IN')}`,
            rawAmount: o.totalAmount || 0,
            status: o.status ? (o.status === 'DELIVERED' ? 'Delivered' : o.status === 'PROCESSING' ? 'Processing' : o.status === 'CANCELLED' ? 'Cancelled' : 'Pending') : 'Pending',
          }));
          setOrdersList(formatted);
        }
      };
      fetchOrders();
    };
    window.addEventListener('registered_users_updated', handleNewUser);
    window.addEventListener('enquiries_updated', handleNewEnquiry);
    window.addEventListener('orders_updated', handleNewOrder);
    return () => {
      window.removeEventListener('registered_users_updated', handleNewUser);
      window.removeEventListener('enquiries_updated', handleNewEnquiry);
      window.removeEventListener('orders_updated', handleNewOrder);
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
      weight: '',
      featured: false,
      categoryId: '',
      subCategoryId: '',
      isActive: true,
    });
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
      weight: product.weight?.toString() || '',
      featured: product.featured || false,
      categoryId: product.categoryId || '',
      subCategoryId: product.subCategoryId || '',
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
    const payload = {
      name: productForm.name,
      description: productForm.description,
      specifications: productForm.specifications,
      customization: productForm.customization,
      shippingReturns: productForm.shippingReturns,
      tags: tagsArr,
      rating: parseFloat(productForm.rating) || 4.8,
      reviewsCount: parseInt(productForm.reviewsCount) || 128,
      price: parseFloat(productForm.price),
      comparePrice: productForm.comparePrice ? parseFloat(productForm.comparePrice) : undefined,
      stock: parseInt(productForm.stock) || 0,
      images: imagesArr,
      sku: productForm.sku || undefined,
      weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
      featured: productForm.featured,
      categoryId: productForm.categoryId,
      subCategoryId: productForm.subCategoryId || undefined,
      isActive: productForm.isActive,
    };
    // Save locally to localStorage so it works offline & syncs immediately across all pages!
    const generatedSlug = payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `prod-${Date.now()}`;
    const selectedCatObj = categories.find(c => c.id === payload.categoryId);
    const selectedSubCatObj = categories.find(c => c.id === payload.subCategoryId);
    const savedProduct = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      slug: (editingProduct && editingProduct.slug) || generatedSlug,
      name: payload.name,
      price: payload.price,
      comparePrice: payload.comparePrice,
      stock: payload.stock,
      images: payload.images,
      description: payload.description,
      specifications: payload.specifications,
      customization: payload.customization,
      shippingReturns: payload.shippingReturns,
      rating: payload.rating,
      reviewsCount: payload.reviewsCount,
      tags: payload.tags,
      featured: payload.featured,
      categoryId: payload.categoryId,
      subCategoryId: payload.subCategoryId,
      categoryName: selectedCatObj ? selectedCatObj.name : (editingProduct ? editingProduct.categoryName : ''),
      categorySlug: selectedCatObj ? selectedCatObj.slug : (editingProduct ? editingProduct.categorySlug : ''),
      category: selectedCatObj ? { id: selectedCatObj.id, name: selectedCatObj.name, slug: selectedCatObj.slug } : undefined,
      subCategoryName: selectedSubCatObj ? selectedSubCatObj.name : (editingProduct ? editingProduct.subCategoryName : ''),
      subCategorySlug: selectedSubCatObj ? selectedSubCatObj.slug : (editingProduct ? editingProduct.subCategorySlug : ''),
      isActive: payload.isActive,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    const existingCustom = JSON.parse(localStorage.getItem('giftery_products') || '[]');
    let updatedCustom;
    if (editingProduct) {
      updatedCustom = existingCustom.map(p => (p.id === editingProduct.id || p.slug === savedProduct.slug) ? { ...p, ...savedProduct } : p);
    } else {
      updatedCustom = [savedProduct, ...existingCustom.filter(p => p.id !== savedProduct.id)];
    }
    localStorage.setItem('giftery_products', JSON.stringify(updatedCustom));
    window.dispatchEvent(new Event('products_updated'));

    try {
      if (editingProduct) {
        const res = await axiosInstance.put(ENDPOINTS.PRODUCTS.UPDATE(editingProduct.id), payload);
        const updated = (res.data || res).product || (res.data || res);
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...savedProduct, ...updated } : p));
        toast.success('Product updated successfully!');
      } else {
        const res = await axiosInstance.post(ENDPOINTS.PRODUCTS.CREATE, payload);
        const created = (res.data || res).product || (res.data || res);
        setProductsList(prev => [created || savedProduct, ...prev.filter(p => p.id !== savedProduct.id)]);
        toast.success('Product added to the store!');
      }
      resetProductForm();
    } catch (err) {
      console.warn('Backend API save warning, product saved to localStorage:', err.message);
      setProductsList(prev => [savedProduct, ...prev.filter(p => p.id !== savedProduct.id)]);
      toast.success('Product saved to store!');
      resetProductForm();
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

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? This cannot be undone.`)) return;

    const existingCustomCats = JSON.parse(localStorage.getItem('giftery_categories') || '[]');
    const updatedCustomCats = existingCustomCats.filter(c => c.id !== catId);
    localStorage.setItem('giftery_categories', JSON.stringify(updatedCustomCats));
    window.dispatchEvent(new Event('categories_updated'));

    setCategories(prev => prev.filter(c => c.id !== catId));

    try {
      await axiosInstance.delete(ENDPOINTS.CATEGORIES.DELETE(catId));
      toast.success('Category deleted successfully');
    } catch (err) {
      console.warn('Backend API category delete warning:', err.message);
      toast.success('Category removed from store');
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
    const rows = (ordersList || []).map(o => [
      o.id,
      o.customer || 'Customer',
      o.rawAmount || (o.amount || '0').replace(/[^0-9.]/g, ''),
      o.itemsCount || 1,
      o.date || '',
      o.status || 'Pending',
    ]);
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

  const handleHeaderExport = () => {
    if (activeTab === 'products') {
      handleExportProductsCSV();
    } else if (activeTab === 'customers') {
      handleExportCustomersCSV();
    } else if (activeTab === 'corporate-quotes') {
      handleExportQuotesCSV();
    } else if (activeTab === 'enquiries') {
      const headers = ['Enquiry ID', 'Name', 'Email', 'Phone', 'Category', 'Subject', 'Status', 'Date'];
      const rows = (enquiriesList || []).map(e => [
        e.id, e.name, e.email, e.phone || '', e.category || '', e.subject || '', e.status || 'New', e.createdAt || ''
      ]);
      downloadCSV('Enquiries_Report', headers, rows);
    } else {
      handleExportOrdersCSV();
    }
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
          setActiveTab={handleTabChange}
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
              <div className={styles.filterWrapper}>
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
