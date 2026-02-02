import React from 'react';
import ProductImage from './ProductImage';

const OrderSummary = ({ cart, summary, voucherDiscount, selectedAddress, paymentMethod, isOrder = false, order }) => {
  const items = isOrder ? order.items : cart;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = isOrder ? (order.total || order.totalAmount) : (subtotal + summary.shipping + summary.tax - summary.discount - voucherDiscount);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{isOrder ? 'Order Details' : 'Order Summary'}</h2><br />
      {/* Deliver To Section */}
      {selectedAddress && !isOrder && (
        <div className="mb-6 pb-6 border-b flex justify-between items-start">
          <div>
            <h2 className="font-bold mb-4">Deliver To :</h2>
            <div className="text-left">
              <p className="font-semibold">{selectedAddress.name}</p>
              <p>{selectedAddress.street}</p>
              <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
              <p>{selectedAddress.country}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p><strong>Order ID:</strong> ORD-{Date.now()}</p>
            <p><strong>Placed on:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Payment:</strong> {paymentMethod ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : 'N/A'}</p>
          </div>
        </div>
      )}
      {isOrder && (
        <div className="mb-6 pb-6 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Order ID</h3>
              <p className="text-gray-900">{order.id}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Date</h3>
              <p className="text-gray-900">{order.date}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className="text-gray-900">{order.status}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Total</h3>
              <p className="text-primary font-bold">${Number(order.total || order.totalAmount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Product</th>
              <th className="text-left py-2 px-4">Quantity</th>
              <th className="text-left py-2 px-2 hidden sm:table-cell">Per Item</th>
              <th className="text-right py-2 px-2 w-auto">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id || item.title} className="even:bg-red-50">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-4">
                    {!isOrder && (
                      <ProductImage
                        product={item}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm break-words">{item.title}</h3>
                      {!isOrder && <p className="text-xs text-gray-500">{item.selectedColor || 'Default Color'}</p>}
                      <p className="text-xs text-gray-600 sm:hidden">${Number(item.price).toFixed(2)} per item</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2">{item.quantity}</span>
                </td>
                <td className="py-4 px-2">
                  <span>${Number(item.price).toFixed(2)}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isOrder && (
          <div className="border-t pt-2 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${summary.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${summary.discount.toFixed(2)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Voucher Discount</span>
                <span>-${voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
        {isOrder && (
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${Number(order.total || order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
