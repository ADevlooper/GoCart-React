import React, { useState, useEffect } from 'react';

const Toaster = ({ message, onClose, position = 'top-right' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow time for slide out animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const slideClasses = {
    'top-right': visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
    'bottom-right': visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
    'top-left': visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
    'bottom-left': visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} bg-green-500 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center gap-3 transition-all duration-300 ease-in-out ${slideClasses[position]}`}
    >
      {/* Success Icon */}
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      {/* Message */}
      <span className="flex-1">{message}</span>
      {/* Close Button */}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toaster;
