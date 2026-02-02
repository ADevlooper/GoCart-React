import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, removeFromCart, updateQuantity, removeFromCartAsync, updateCartItemAsync } from '../redux/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import Toaster from '../components/toaster';
import DeleteButton from '../components/DeleteButton';

import { API_BASE_URL } from '../config/api';
import ProductImage from '../components/ProductImage';

function Cart() {
  const cart = useSelector(selectCartItems);
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toaster, setToaster] = useState(null);

  const summary = cart.reduce((acc, item) => {
    acc.subtotal += Number(item.price) * (item.quantity || item.cartQuantity || 1);
    return acc;
  }, { subtotal: 0, shipping: 5.00, tax: 0 });
  summary.total = summary.subtotal + summary.shipping + summary.tax;

  const showToaster = (message) => {
    setToaster(message);
    setTimeout(() => setToaster(null), 3000);
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    const qty = Math.max(1, newQuantity);
    // Optimistic update
    dispatch(updateQuantity({ id: item.id, quantity: qty }));

    // Sync with backend if logged in
    if (currentUser && item.cartId) {
      dispatch(updateCartItemAsync({ id: item.cartId, payload: { quantity: qty } }));
    }
  };

  const handleRemoveItem = (item) => {
    if (currentUser && item.cartId) {
      dispatch(removeFromCartAsync({ id: item.cartId }));
    } else {
      dispatch(removeFromCart({ id: item.id }));
    }
    showToaster(`${item.name} removed from cart`);
  };

  return (
    <div className="container md:px-10 px-3 py-12 max-w-screen-2xl">

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="p-6 ">
            <div className="grid gap-6">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-5 h-35 shadow-sm">
                  <div className="flex items-start gap-4">
                    <DeleteButton
                      onClick={() => handleRemoveItem(item)}
                    />
                    <ProductImage
                      product={item}
                      alt={item.name}
                      className="w-16 h-25 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-semibold text-lg break-words">{item.name || item.title}</h3>
                          <span className="text-xs font-medium">Price: ${Number(item.price).toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">QTY:</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateQuantity(item, (item.quantity || item.cartQuantity || 1) - 1)}
                                className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark text-xs flex-shrink-0"
                              >
                                -
                              </button>
                              <span className="px-2 min-w-[2rem] text-center text-sm">{item.quantity || item.cartQuantity || 1}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item, (item.quantity || item.cartQuantity || 1) + 1)}
                                className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark text-xs flex-shrink-0"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-primary">Total: ${(Number(item.price) * (item.quantity || item.cartQuantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 bg-white mx-6 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-9">
              <h2 className="text-2xl text-primary font-bold">Order Summary</h2>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Voucher Code" className="px-2 py-1 border rounded text-md" />
                <button className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark text-md">Apply</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${summary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t mt-6 pt-2">
                <span>Total</span>
                <span>${summary.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => {
                    navigate('/payment');
                    showToaster('Proceeding to delivery address...');
                  }}
                  className="bg-primary text-white px-10 py-2.5 rounded-md hover:bg-primary-dark text-sm"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toaster && <Toaster message={toaster} onClose={() => setToaster(null)} />}

    </div>
  );
}

export default Cart;
