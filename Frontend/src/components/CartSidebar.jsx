import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectOrderSummary, removeFromCart, updateQuantity } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import DeleteButton from './DeleteButton';

function CartSidebar() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const summary = useSelector(selectOrderSummary);
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-80">
      <h2 className="text-xl font-bold mb-4 text-red-800">Your Cart</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 border-b pb-2 mb-2">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.id, newQuantity: item.quantity - 1 }))}
                    className="w-6 h-6 bg-red-800 text-white rounded-full flex items-center justify-center hover:bg-red-900 text-xs"
                  >
                    -
                  </button>
                  <span className="px-1 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.id, newQuantity: item.quantity + 1 }))}
                    className="w-6 h-6 bg-red-800 text-white rounded-full flex items-center justify-center hover:bg-red-900 text-xs"
                  >
                    +
                  </button>
                </div>
                <DeleteButton
                  onClick={() => dispatch(removeFromCart(item.id))}
                />
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>${summary.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${summary.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${summary.total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-red-800 text-white py-2 rounded-md hover:bg-red-900 text-sm"
            >
              View Full Cart
            </button>
            <button
              onClick={() => navigate('/payment')}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm mt-2"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSidebar;
