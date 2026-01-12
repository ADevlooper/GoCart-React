import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectWishlistItems, toggleWishlist, fetchWishlist } from '../redux/wishlistSlice';
import { selectCart, selectOrderSummary, removeFromCart, updateQuantity } from '../redux/cartSlice';
import { fetchOrders } from '../redux/orderSlice';
import { API_BASE_URL } from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import AsideMenu, { LayoutPanelLeftIcon } from '../components/AsideMenu';
import OrderFilters from '../components/OrderFilters';
import Toaster from '../components/toaster';

import AddressList from '../components/AddressList';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { updateUser, logout } from '../redux/authSlice';

// Helper to safely render content
const renderSafe = (content) => {
  if (content === null || content === undefined) return '';
  if (typeof content === 'object') return JSON.stringify(content);
  return String(content);
};

const Account = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(location.state?.activeSection || 'profile');
  const [isEditing, setIsEditing] = useState(false);

  const { currentUser } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip_code: '',
    created_at: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        // Check for multiple possible phone field names
        phone: currentUser.phone || currentUser.phoneNumber || currentUser.contactNumber || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        zip_code: currentUser.zip_code || '',
        created_at: currentUser.created_at || ''
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    showToaster('Logged out successfully');
  };

  const wishlistItems = useSelector(selectWishlistItems);

  // Normalize wishlist items for display (map image to thumbnail, ensure title)
  // Ensure uniqueness by ID to prevent React unique key warnings
  const uniqueWishlistItems = Array.from(new Map(wishlistItems.map(item => [item.id || item.productId, item])).values());

  const wishlistProducts = uniqueWishlistItems.map(item => ({
    ...item,
    title: item.title || item.name,
    thumbnail: item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`) : 'https://via.placeholder.com/150'
  }));

  const dispatch = useDispatch();
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    profileVisibility: false,
    dataSharing: true,
    darkMode: false,
    twoFactorAuth: true,
    autoSave: true,
    marketingEmails: false,
    locationTracking: true
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'debit', number: '****1234', expiry: '12/25', bank: 'HDFC Bank' },
    { id: 2, type: 'credit', number: '****5678', expiry: '08/26', bank: 'ICICI Bank' },
    { id: 3, type: 'upi', upiId: 'user@upi', provider: 'Google Pay' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    number: '',
    expiry: '',
    bank: '',
    id: '',
    provider: ''
  });
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'home', name: 'John Doe', address: '123 Main St, Apt 4B', city: 'New York', state: 'NY', zip: '10001', phone: '+1 (555) 123-4567' },
    { id: 2, type: 'work', name: 'John Doe', address: '456 Office Blvd, Suite 100', city: 'New York', state: 'NY', zip: '10002', phone: '+1 (555) 987-6543' }
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    type: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });
  const orderRedux = useSelector(state => state.order?.orders || []);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const cart = useSelector(selectCart);
  const summary = useSelector(selectOrderSummary);
  const [toaster, setToaster] = useState(null);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const showToaster = (message) => {
    setToaster(message);
    setTimeout(() => setToaster(null), 3000);
  };



  const getHeaderText = () => {
    switch (activeSection) {
      case 'profile': return 'Profile';
      case 'orders': return 'My Orders';
      case 'wishlist': return 'Wishlist';
      case 'cart': return 'Cart';
      case 'address': return 'My Address';
      case 'payment': return 'Payment Methods';
      case 'settings': return 'Settings';
      case 'help': return 'Help';
      case 'logout': return 'My Account';
      default: return 'My Account';
    }
  };

  // Wishlist fetching is handled globally in MainLayout or via derived state


  useEffect(() => {
    // Fetch orders from backend for authenticated user (server-side session used for auth)
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    // Sync Redux orders state to local state for rendering
    setOrders(orderRedux);
  }, [orderRedux]);

  useEffect(() => {
    // Load addresses and payment methods from localStorage on mount
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }

    const savedPaymentMethods = localStorage.getItem('paymentMethods');
    if (savedPaymentMethods) {
      setPaymentMethods(JSON.parse(savedPaymentMethods));
    }
  }, []);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: 'https://img.icons8.com/fluency/48/gender-neutral-user.png' },
    { id: 'orders', label: 'Orders', icon: 'https://img.icons8.com/fluency/48/package.png' },
    { id: 'wishlist', label: 'Wishlist', icon: 'https://img.icons8.com/color/48/hearts.png' },
    { id: 'cart', label: 'Cart', icon: 'https://img.icons8.com/fluency/48/shopping-cart.png' },
    { id: 'address', label: 'Address', icon: 'https://img.icons8.com/fluency/48/home.png' },
    { id: 'payment', label: 'Payment Methods', icon: 'https://img.icons8.com/fluency/48/bank-card-back-side.png' },
    { id: 'settings', label: 'Settings', icon: 'https://img.icons8.com/fluency/48/settings.png' },
    { id: 'help', label: 'Get Help', icon: 'https://img.icons8.com/fluency/48/help.png' },
    { id: 'logout', label: 'Logout', icon: 'https://img.icons8.com/fluency/48/exit.png' },
  ];

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          zipCode: profileData.zip_code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToaster(data.message || 'Update failed');
        return;
      }

      dispatch(updateUser(data.data.user));
      showToaster('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showToaster('Update failed: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        zip_code: currentUser.zip_code || '',
        created_at: currentUser.created_at || ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleEditPaymentMethod = (method) => {
    setEditingMethod(method);
    setEditForm({
      type: method.type,
      number: method.number || '',
      expiry: method.expiry || '',
      bank: method.bank || '',
      id: method.id || '',
      provider: method.provider || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === editingMethod.id
        ? { ...method, ...editForm }
        : method
    );
    setPaymentMethods(updatedMethods);
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setEditAddressForm({
      type: address.type,
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      phone: address.phone
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressEdit = () => {
    const updatedAddresses = addresses.map(addr =>
      addr.id === editingAddress.id
        ? { ...addr, ...editAddressForm }
        : addr
    );
    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleCancelAddressEdit = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleDownloadInvoice = async (order) => {
    try {
      // Create invoice HTML content
      const invoiceHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #A6192E; margin: 0;">GoCart</h1>
            <p style="color: #666; margin: 5px 0;">Order Invoice</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 10px;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dc2626;">
            <h3 style="color: #A6192E; margin: 0;">Total: $${order.total.toFixed(2)}</h3>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>Thank you for shopping with GoCart!</p>
            <p>For any questions, please contact our support team.</p>
          </div>
        </div>
      `;

      // Create a temporary div to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Use html2canvas to capture the HTML as an image
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Create PDF using jsPDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Create blob and download link for better compatibility
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToaster('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToaster('Failed to download invoice. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-primary text-left">{getHeaderText()}</h1>
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-white hover:text-primary border-2 border-primary flex items-center gap-2 group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="mb-6 flex">
              <img
                src="https://img.icons8.com/cotton/64/gender-neutral-user--v2.png"
                alt="User Avatar"
                className="w-20 h-20 mb-4 rounded-full"
              />
              <div className="my-auto ml-2">
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
                <p className="text-sm text-gray-500">{profileData.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.name)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.email)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.phone) || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.address) || 'N/A'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.city) || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">{renderSafe(profileData.zip_code) || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-baseline mb-6">
              <h1 className="text-3xl font-bold text-primary">{getHeaderText()}</h1>
              <OrderFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                showTitle={false}
              />
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-600">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter((order) => {
                    const matchesSearch =
                      searchQuery === '' ||
                      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      order.items.some((item) =>
                        item.title.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                    const now = new Date();
                    const orderDate = new Date(order.date);
                    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

                    let matchesFilter = true;
                    switch (selectedFilter) {
                      case 'last-15-days':
                        matchesFilter = daysDiff <= 15;
                        break;
                      case 'last-month':
                        matchesFilter = daysDiff <= 30;
                        break;
                      case 'this-year':
                        matchesFilter = orderDate.getFullYear() === 2025;
                        break;
                      case 'last-year':
                        matchesFilter = orderDate.getFullYear() === 2024;
                        break;
                      case 'year-before':
                        matchesFilter = orderDate.getFullYear() === 2023;
                        break;
                      default:
                        matchesFilter = true;
                    }

                    return matchesSearch && matchesFilter;
                  })
                  .map((order) => (
                    <div key={order.id} className="bg-red-50 rounded-lg shadow-md p-4 mb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        {/* Left side content */}
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-primary font-medium">Order ID:</span>
                            <span className="text-gray-900 ml-1">{order.id}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-primary font-medium">Order Placed On:</span>
                            <span className="text-gray-900 ml-1">{order.date}</span>
                          </div>
                          <div>
                            {order.status === 'Processing' && (
                              <span className="text-gray-600 font-medium">{order.status}</span>
                            )}
                            {order.status === 'Out for Delivery' && (
                              <span className="text-blue-600 font-medium">{order.status}</span>
                            )}
                            {order.status === 'Delivered' && (
                              <span className="text-green-600 font-medium">{order.status}</span>
                            )}
                            {order.status === 'Delivered on' && order.deliveryDate && (
                              <span className="text-green-600 font-medium">{order.status} {order.deliveryDate}</span>
                            )}
                          </div>
                        </div>

                        {/* Right side button */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>

            )}
          </div>
        );
      case 'wishlist':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-primary text-left mb-6">{getHeaderText()}</h1>
            {wishlistProducts.length === 0 ? (
              <p className="text-gray-600">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <div className="flex items-start gap-4">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-primary font-semibold text-sm">${product.price}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleWishlist(product.id));
                          }}
                          className="mt-2 text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'cart':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-primary text-left mb-6">{getHeaderText()}</h1>
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.images?.[0]?.thumbnail ? `${API_BASE_URL.replace('/api', '')}${item.images[0].thumbnail}` : (item.images?.[0]?.preview ? `${API_BASE_URL.replace('/api', '')}${item.images[0].preview}` : 'https://via.placeholder.com/80x80?text=No+Image')}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded border border-gray-200"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'; }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-red-500 hover:text-red-700 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total: ${summary.total.toFixed(2)}</span>
                    <button className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'address':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <AddressList />
          </div>
        );
      case 'payment':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-primary text-left mb-6">{getHeaderText()}</h1>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    {method.type === 'debit' && (
                      <img src="https://img.icons8.com/color/48/debit-card.png" alt="Debit Card" className="w-8 h-8" />
                    )}
                    {method.type === 'credit' && (
                      <img src="https://img.icons8.com/color/48/credit-card.png" alt="Credit Card" className="w-8 h-8" />
                    )}
                    {method.type === 'upi' && (
                      <img src="https://img.icons8.com/color/48/upi.png" alt="UPI" className="w-8 h-8" />
                    )}
                    <div>
                      <p className="font-medium">
                        {method.type === 'upi' ? method.id : method.number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.type === 'upi' ? method.provider : `${method.type.toUpperCase()} • ${method.bank} • Expires ${method.expiry}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPaymentMethod(method)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Add Debit Card / Credit Card / UPI
              </button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-red-800 text-left mb-6">{getHeaderText()}</h1>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                <p className="text-gray-600 mb-2">Need assistance? Our support team is here to help.</p>
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Contact Support
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">FAQ</h3>
                <p className="text-gray-600">Find answers to frequently asked questions.</p>
                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2">
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-red-800 text-left mb-6">{getHeaderText()}</h1>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.emailNotifications ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.emailNotifications ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Email notifications</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={() => handleSettingChange('pushNotifications')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.pushNotifications ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.pushNotifications ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Push notifications</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={() => handleSettingChange('smsNotifications')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.smsNotifications ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.smsNotifications ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">SMS notifications</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.profileVisibility}
                        onChange={() => handleSettingChange('profileVisibility')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.profileVisibility ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.profileVisibility ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Profile visibility</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.dataSharing}
                        onChange={() => handleSettingChange('dataSharing')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.dataSharing ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.dataSharing ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Data sharing</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">App Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={() => handleSettingChange('darkMode')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.darkMode ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.darkMode ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Dark mode</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={() => handleSettingChange('twoFactorAuth')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.twoFactorAuth ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.twoFactorAuth ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Two-factor authentication</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={() => handleSettingChange('autoSave')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.autoSave ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoSave ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Auto-save</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={() => handleSettingChange('marketingEmails')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.marketingEmails ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.marketingEmails ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Marketing emails</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.locationTracking}
                        onChange={() => handleSettingChange('locationTracking')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${settings.locationTracking ? 'bg-red-500' : ''}`}></div>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.locationTracking ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3">Location tracking</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-red-800 text-left mb-6">{getHeaderText()}</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container px-4 py-4 lg:px-8 lg:py-8">
      {/* Mobile toggle button for aside (visible on small screens) */}
      <div className="md:hidden flex items-center mb-4">
        <button
          onClick={() => setIsAsideOpen(true)}
          aria-label="Open account menu"
          className="p-2 rounded-md hover:bg-gray-100 inline-flex items-center gap-2"
        >
          <LayoutPanelLeftIcon className="w-6 h-6 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Menu</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 h-screen overflow-x-hidden">
        {/* Aside Menu */}
        <aside className="hidden md:block md:w-1/4 sticky top-0">
          <div className="bg-white md:h-[80vh] p-4 rounded-lg shadow-md">
            <nav>
              <ul className="space-y-2">
                {menuItems.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === item.id
                        ? 'bg-red-100 text-red-800 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <img src={item.icon} alt={item.label} className="w-6 h-6" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
                {menuItems.slice(5).map((item, index) => (
                  <li key={item.id} className={index === 0 ? 'mt-auto' : ''}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === item.id
                        ? 'bg-red-100 text-red-800 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <img src={item.icon} alt={item.label} className="w-6 h-6" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:w-3/4 overflow-y-auto">
          {renderContent()}
        </main>


      </div>

      {/* Mobile Aside Menu */}
      <AsideMenu
        open={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        items={menuItems}
        activeId={activeSection}
        onSelect={setActiveSection}
      />

      {/* Edit Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                >
                  <option value="debit">Debit Card</option>
                  <option value="credit">Credit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              {editForm.type !== 'upi' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                      type="text"
                      value={editForm.number}
                      onChange={(e) => setEditForm(prev => ({ ...prev, number: e.target.value }))}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="****1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      value={editForm.expiry}
                      onChange={(e) => setEditForm(prev => ({ ...prev, expiry: e.target.value }))}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank</label>
                    <input
                      type="text"
                      value={editForm.bank}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bank: e.target.value }))}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="Bank Name"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input
                      type="text"
                      value={editForm.id}
                      onChange={(e) => setEditForm(prev => ({ ...prev, id: e.target.value }))}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="user@upi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                    <input
                      type="text"
                      value={editForm.provider}
                      onChange={(e) => setEditForm(prev => ({ ...prev, provider: e.target.value }))}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="Google Pay"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-sm sm:text-lg font-bold mb-2 sm:mb-3">Edit Address</h2>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Type</label>
                <select
                  value={editAddressForm.type}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editAddressForm.name}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={editAddressForm.address}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="Street Address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={editAddressForm.city}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={editAddressForm.state}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, state: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={editAddressForm.zip}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, zip: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="ZIP Code"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editAddressForm.phone}
                  onChange={(e) => setEditAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 p-1 border border-gray-300 rounded w-full text-xs sm:text-sm"
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-4">
              <button
                onClick={handleSaveAddressEdit}
                className="bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelAddressEdit}
                className="bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-800">Order Details</h2>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Order ID</h3>
                  <p className="text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Date</h3>
                  <p className="text-gray-900">{selectedOrder.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Status</h3>
                  <p className="text-gray-900">{selectedOrder.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Total</h3>
                  <p className="text-red-800 font-bold">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.thumbnail || 'https://via.placeholder.com/64'}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-800">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-900"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toaster */}
      {toaster && (
        <Toaster message={toaster} onClose={() => setToaster(null)} />
      )}

    </div>
  );
};

export default Account;
