import { createSlice } from '@reduxjs/toolkit';

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Load addresses from localStorage
const loadAddressesFromStorage = () => {
  try {
    const addresses = localStorage.getItem('addresses');
    return addresses ? JSON.parse(addresses) : [];
  } catch (error) {
    console.error('Error loading addresses from localStorage:', error);
    return [];
  }
};

// Save addresses to localStorage
const saveAddressesToStorage = (addresses) => {
  try {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  } catch (error) {
    console.error('Error saving addresses to localStorage:', error);
  }
};

const addressSlice = createSlice({
  name: 'addresses',
  initialState: loadAddressesFromStorage(),
  reducers: {
    addAddress: (state, action) => {
      const newAddress = { ...action.payload, id: generateId() };
      state.push(newAddress);
      saveAddressesToStorage(state);
    },
    editAddress: (state, action) => {
      const { id, ...updatedAddress } = action.payload;
      const index = state.findIndex(addr => addr.id === id);
      if (index !== -1) {
        state[index] = { ...state[index], ...updatedAddress };
        saveAddressesToStorage(state);
      }
    },
    deleteAddress: (state, action) => {
      const index = state.findIndex(addr => addr.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
        saveAddressesToStorage(state);
      }
    },
    setAddressType: (state, action) => {
      const { id, type } = action.payload;
      const index = state.findIndex(addr => addr.id === id);
      if (index !== -1) {
        state[index].type = type;
        saveAddressesToStorage(state);
      }
    },
  },
});

export const { addAddress, editAddress, deleteAddress, setAddressType } = addressSlice.actions;
export default addressSlice.reducer;
