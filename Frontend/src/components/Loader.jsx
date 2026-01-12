import React from 'react';

function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        {/* Cart Icon */}
        <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {/* Dropping Item */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
