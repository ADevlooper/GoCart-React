import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectOrderSummary, clearLocalCart } from '../redux/cartSlice';
import { createOrder } from '../redux/orderSlice';
import { useNavigate } from 'react-router-dom';
import DeliveryAddress from '../components/DeliveryAddress';
import PaymentMethod from '../components/PaymentMethod';
import OrderSummary from '../components/OrderSummary';

function Payment() {
  const cart = useSelector(selectCartItems);
  const summary = useSelector(selectOrderSummary);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1); // 1: Delivery Address, 2: Payment & Summary
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load saved addresses from localStorage
  useEffect(() => {
    const addresses = localStorage.getItem('addresses');
    if (addresses) {
      const parsedAddresses = JSON.parse(addresses);
      setSavedAddresses(parsedAddresses);
      if (parsedAddresses.length > 0) {
        setSelectedAddress(parsedAddresses[0]); // Default to first address
      }
    }
  }, []);

  const handleAddressSaved = (addresses) => {
    setSavedAddresses(addresses);
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
    setCurrentStep(2); // Move to payment step
  };

  const handlePaymentValid = (valid, method, discount) => {
    setIsPaymentValid(valid);
    setPaymentMethod(method);
    setVoucherDiscount(discount);
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      alert('Please provide a valid delivery address');
      return;
    }
    if (!isPaymentValid) {
      alert('Please select and complete a valid payment method');
      return;
    }

    // Calculate totals
    // Calculate totals with safe fallback to 0
    const subtotal = cart.reduce((sum, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity || item.cartQuantity || 1);
      if (isNaN(price)) return sum; // Skip invalid priced items
      return sum + (price * qty);
    }, 0);

    const tax = Number(summary.tax) || 0;
    const shipping = Number(summary.shipping) || 0;
    const totalAmount = subtotal + tax + shipping;

    // Build shipping info from selected address
    const shippingInfo = {
      name: selectedAddress?.name || 'Guest',
      email: selectedAddress?.email || '',
      address: selectedAddress?.address || '',
      city: selectedAddress?.city || '',
      zip: selectedAddress?.zip || selectedAddress?.zipCode || '',
      phone: selectedAddress?.phone || '',
    };

    // Create order payload matching backend requirements
    const orderPayload = {
      subtotal,
      tax,
      shipping,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      shippingInfo,
    };

    dispatch(createOrder({ payload: orderPayload }))
      .then((result) => {
        if (createOrder.fulfilled.match(result)) {
          dispatch(clearLocalCart());
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate('/account', { state: { activeSection: 'orders' } });
          }, 3000);
        } else {
          // This handles the rejected case from the thunk if usage conforms to RTK patterns
          // But createAsyncThunk with errors usually lands in rejected or payload is error
          alert(result.error?.message || 'Failed to place order. Please try again.');
        }
      })
      .catch((err) => {
        console.error('Failed to create order:', err);
        alert(err.message || 'Failed to place order. Please try again.');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {currentStep === 1 ? (
        <DeliveryAddress onAddressSaved={handleAddressSaved} />
      ) : (
        <PaymentMethod onPaymentValid={handlePaymentValid} selectedAddress={selectedAddress} onContinue={handleContinue} />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Order Placed Successfully!</h2>
            <p className="mb-4">Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
