import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAddress, editAddress } from '../redux/addressSlice';

const AddressForm = ({ isOpen, onClose, editingAddress = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAddress) {
      setFormData(editingAddress);
    } else {
      setFormData({
        label: 'Home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: ''
      });
    }
    setErrors({});
  }, [editingAddress, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5,6}$/.test(formData.postalCode.replace(/\D/g, ''))) {
      newErrors.postalCode = 'Please enter a valid postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingAddress) {
      dispatch(editAddress({ id: editingAddress.id, ...formData }));
    } else {
      dispatch(addAddress(formData));
    }

    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <select
              value={formData.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter 10-digit phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Street address"
            />
            {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="City"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="State"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter postal code"
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              style={{ backgroundColor: '#A6192E' }}
            >
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
