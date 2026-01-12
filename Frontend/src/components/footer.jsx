import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white px-3 text-2xl py-20 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Email</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Phone</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Address</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Shipping</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Secure Payment</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Visa</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">MasterCard</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">PayPal</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
