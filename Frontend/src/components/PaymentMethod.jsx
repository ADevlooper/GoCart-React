import React, { useState, useEffect } from 'react';
import cod from '../assets/cod.png';

const PaymentMethod = ({ onPaymentValid, selectedAddress, onContinue }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Update payment validity when payment method changes
  useEffect(() => {
    if (paymentMethod === 'cod') {
      onPaymentValid(true, paymentMethod, discount);
    } else if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      const isValid = cardDetails.number && cardDetails.expiry && cardDetails.cvv && cardDetails.name &&
        !paymentErrors.number && !paymentErrors.expiry && !paymentErrors.cvv && !paymentErrors.name;
      onPaymentValid(isValid, paymentMethod, discount);
    } else if (paymentMethod === 'upi') {
      onPaymentValid(upiId.trim() !== '', paymentMethod, discount);
    } else {
      onPaymentValid(false, paymentMethod, discount);
    }
  }, [paymentMethod, cardDetails, upiId, paymentErrors, discount, onPaymentValid]);

  const validatePaymentField = (name, value) => {
    switch (name) {
      case 'number':
        if (value && !/^\d{16}$/.test(value)) return 'Card Number must be exactly 16 digits';
        break;
      case 'expiry':
        if (value && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(value)) return 'Expiry Date must be in MM/YYYY format';
        if (value) {
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const expYear = parseInt(year, 10);
          const expMonth = parseInt(month, 10);
          if (expYear < currentYear || (expYear === currentYear && expMonth <= currentMonth)) {
            return 'Expiry Date must be in the future';
          }
          if (expYear > currentYear + 20) {
            return 'Expiry Date cannot be more than 20 years in the future';
          }
        }
        break;
      case 'cvv':
        if (value && !/^\d{3}$/.test(value)) return 'CVV must be exactly 3 digits';
        break;
      case 'name':
        if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Name on Card must contain only alphabets and spaces';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleVoucherApply = () => {
    // Simple voucher logic - in real app, this would validate against backend
    if (voucher === 'DISCOUNT10') {
      setDiscount(10); // Fixed discount for simplicity
    } else {
      alert('Invalid voucher code');
    }
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPendingPaymentMethod(value);
    if (value === 'cod') {
      setPaymentMethod(value);
    } else if (value === 'credit' || value === 'debit') {
      setModalType('card');
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      setPaymentErrors({ number: '', expiry: '', cvv: '', name: '' });
      setShowModal(true);
    } else if (value === 'upi') {
      setModalType('upi');
      setUpiId('');
      setShowModal(true);
    }
  };

  const handleSavePayment = () => {
    if (modalType === 'card') {
      const errors = {};
      if (!cardDetails.number) errors.number = 'Card Number is required';
      if (!cardDetails.expiry) errors.expiry = 'Expiry Date is required';
      if (!cardDetails.cvv) errors.cvv = 'CVV is required';
      if (!cardDetails.name) errors.name = 'Name on Card is required';
      if (paymentErrors.number || paymentErrors.expiry || paymentErrors.cvv || paymentErrors.name) {
        setPaymentErrors({ ...paymentErrors, ...errors });
        return;
      }
    } else if (modalType === 'upi') {
      if (!upiId) {
        alert('Please enter your UPI ID');
        return;
      }
    }
    setPaymentMethod(pendingPaymentMethod);
    setShowModal(false);
    setPendingPaymentMethod('');
  };

  return (
    <div>
      {/* Payment Method */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-5">Payment Method</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="credit"
              checked={paymentMethod === 'credit'}
              onChange={handlePaymentChange}
              className="mr-3"
            />
            <img
              src="https://img.icons8.com/color/48/000000/credit-card.png"
              alt="Credit Card"
              className="w-10 h-9 mr-3"
            />
            Credit Card
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="debit"
              checked={paymentMethod === 'debit'}
              onChange={handlePaymentChange}
              className="mr-3"
            />
            <img
              src="https://img.icons8.com/color/48/000000/bank-card-back-side.png"
              alt="Debit Card"
              className="w-10 h-9 mr-3"
            />
            Debit Card
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={handlePaymentChange}
              className="mr-3"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png"
              alt="UPI"
              className="w-10 h-9 mr-3"
            />
            UPI
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={handlePaymentChange}
              className="mr-3"
            />
            <img
              src={cod}
              alt="Cash on Delivery"
              className="w-10 h-9 mr-3"
            />
            Cash on Delivery
          </label>
        </div>

        {/* Continue to Checkout Button */}
        <div className="mt-8">
          <button
            onClick={onContinue}
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark"
            disabled={!paymentMethod}
          >
            Continue to Checkout
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <style>
              {`
              .modal-enter {
                animation: fadeInZoom 0.3s ease-out;
              }
              @keyframes fadeInZoom {
                from {
                  opacity: 0;
                  transform: scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}
            </style>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 modal-enter">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'card' ? 'Enter Card Details' : 'Enter UPI Details'}
              </h2>
              {modalType === 'card' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCardDetails({ ...cardDetails, number: value });
                        const error = validatePaymentField('number', value);
                        setPaymentErrors({ ...paymentErrors, number: error });
                      }}
                      className={`w-full p-3 border rounded-md ${paymentErrors.number ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {paymentErrors.number && <p className="text-red-500 text-sm mt-1">{paymentErrors.number}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Expiry Date (MM/YYYY)"
                        value={cardDetails.expiry}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCardDetails({ ...cardDetails, expiry: value });
                          const error = validatePaymentField('expiry', value);
                          setPaymentErrors({ ...paymentErrors, expiry: error });
                        }}
                        className={`p-3 border rounded-md ${paymentErrors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {paymentErrors.expiry && <p className="text-red-500 text-sm mt-1">{paymentErrors.expiry}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCardDetails({ ...cardDetails, cvv: value });
                          const error = validatePaymentField('cvv', value);
                          setPaymentErrors({ ...paymentErrors, cvv: error });
                        }}
                        className={`p-3 border rounded-md ${paymentErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {paymentErrors.cvv && <p className="text-red-500 text-sm mt-1">{paymentErrors.cvv}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Name on Card"
                      value={cardDetails.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCardDetails({ ...cardDetails, name: value });
                        const error = validatePaymentField('name', value);
                        setPaymentErrors({ ...paymentErrors, name: error });
                      }}
                      className={`w-full p-3 border rounded-md ${paymentErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                    {paymentErrors.name && <p className="text-red-500 text-sm mt-1">{paymentErrors.name}</p>}
                  </div>
                </div>
              )}
              {modalType === 'upi' && (
                <input
                  type="text"
                  placeholder="Enter UPI ID or Number"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  required
                />
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setPendingPaymentMethod('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

};

export default PaymentMethod;
