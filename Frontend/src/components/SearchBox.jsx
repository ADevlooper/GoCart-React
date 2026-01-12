import React from 'react';

const SearchBox = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative flex-1 md:w-80">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-4 pr-10 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-red-800"
      />
      <svg
        className="absolute right-3 top-2.5 h-5 w-5 text-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default SearchBox;
