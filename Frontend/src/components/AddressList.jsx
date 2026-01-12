import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

const AddressList = () => {
  const addresses = useSelector(state => state.addresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        <button
          onClick={handleAddNew}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No addresses yet</h3>
          <p className="text-gray-500 mb-4">Add your first address to get started</p>
          <button
            onClick={handleAddNew}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <AddressForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingAddress={editingAddress}
      />
    </div>
  );
};

export default AddressList;
