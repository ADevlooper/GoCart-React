import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addAddress, editAddress, setAddressType } from '../redux/addressSlice';

const DeliveryAddress = ({ onAddressSaved }) => {
  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });
  const [selectedType, setSelectedType] = useState('plus');
  const [isEditing, setIsEditing] = useState(true);

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'India',
    'China',
    'Japan',
    'Brazil'
  ];

  const savedAddresses = useSelector(state => state.addresses);
  const [addressErrors, setAddressErrors] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (value && !/^[a-zA-Z]+$/.test(value)) return 'Full Name must contain only alphabets';
        break;
      case 'street':
        if (value && !/^[a-zA-Z0-9, ]+$/.test(value)) return 'Street Address can only contain alphabets, numbers, commas, and spaces';
        break;
      case 'city':
        if (value && !/^[a-zA-Z,]+$/.test(value)) return 'City can only contain alphabets and commas';
        break;
      case 'state':
        if (value && !/^[a-zA-Z]+$/.test(value)) return 'State must contain only alphabets';
        break;
      case 'zip':
        if (value && !/^[0-9]+$/.test(value)) return 'ZIP Code must contain only numbers';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    const error = validateField(name, value);
    setAddressErrors({ ...addressErrors, [name]: error });
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'plus') {
      setAddress({ name: '', street: '', city: '', state: '', zip: '', country: '', phone: '' });
      setIsEditing(true);
    } else {
      const savedAddress = savedAddresses.find(addr => addr.type === type);
      if (savedAddress) {
        setAddress(savedAddress);
        setIsEditing(false);
      } else {
        setAddress({ name: '', street: '', city: '', state: '', zip: '', country: '', phone: '' });
        setIsEditing(true);
      }
    }
  };



  const dispatch = useDispatch();

  const handleContinue = () => {
    const errors = {};
    if (!address.name) errors.name = 'Full Name is required';
    if (!address.street) errors.street = 'Street Address is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zip) errors.zip = 'ZIP Code is required';
    if (!address.country) errors.country = 'Country is required';
    if (!address.phone) errors.phone = 'Phone is required';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    const addressWithType = { ...address, type: selectedType };
    dispatch(addAddress(addressWithType));
    onAddressSaved([addressWithType]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleTypeSelect('home')}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedType === 'home' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          🏠 Home
        </button>
        <button
          onClick={() => handleTypeSelect('work')}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedType === 'work' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          💼 Work
        </button>
        <button
          onClick={() => handleTypeSelect('plus')}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedType === 'plus' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          ➕ Plus
        </button>
      </div>
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={address.name}
              onChange={handleAddressChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-md ${addressErrors.name ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
            {addressErrors.name && <p className="text-red-500 text-sm mt-1">{addressErrors.name}</p>}
          </div>
          <div>
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={address.street}
              onChange={handleAddressChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-md ${addressErrors.street ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
            {addressErrors.street && <p className="text-red-500 text-sm mt-1">{addressErrors.street}</p>}
          </div>
          <div>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-md ${addressErrors.city ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
            {addressErrors.city && <p className="text-red-500 text-sm mt-1">{addressErrors.city}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={address.state}
                onChange={handleAddressChange}
                disabled={!isEditing}
                className={`p-3 border rounded-md ${addressErrors.state ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              />
              {addressErrors.state && <p className="text-red-500 text-sm mt-1">{addressErrors.state}</p>}
            </div>
            <div>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={address.zip}
                onChange={handleAddressChange}
                disabled={!isEditing}
                className={`p-3 border rounded-md ${addressErrors.zip ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              />
              {addressErrors.zip && <p className="text-red-500 text-sm mt-1">{addressErrors.zip}</p>}
            </div>
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleAddressChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-md ${addressErrors.phone ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
            {addressErrors.phone && <p className="text-red-500 text-sm mt-1">{addressErrors.phone}</p>}
          </div>
          <div>
            <select
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-md ${addressErrors.country ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {addressErrors.country && <p className="text-red-500 text-sm mt-1">{addressErrors.country}</p>}
          </div>
          <button
            onClick={handleContinue}
            className="w-40 bg-red-800 text-white py-2 rounded-md hover:bg-red-900"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddress;
