import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteAddress } from '../redux/addressSlice';

const AddressCard = ({ address, onEdit }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(address.id));
    }
  };

  return (
    <div className="bg-red-50 rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 capitalize">
          {address.label}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            style={{ color: '#007BFF' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 transition-colors"
            style={{ color: '#DC3545' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2 text-gray-700">
        <p className="font-medium">{address.name}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{address.city}, {address.state} {address.postalCode}</p>
        <p className="text-gray-600">{address.phone}</p>
      </div>
    </div>
  );
};

export default AddressCard;
