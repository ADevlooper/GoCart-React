import React from 'react';

const OrderFilters = ({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter, showTitle = true }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      {showTitle && <h1 className="text-3xl font-bold text-primary">My Orders</h1>}
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <input
            type="text"
            placeholder="Search by Order ID or Product Name..."
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
        <div className="relative">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="pl-10 pr-10 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 appearance-none bg-white"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="all">All Orders</option>
            <option value="last-15-days">Last 15 days</option>
            <option value="last-month">Last month</option>
            <option value="this-year">This Year (2025)</option>
            <option value="last-year">Last Year (2024)</option>
            <option value="year-before">Year Before (2023)</option>
          </select>
          {/* Filter Icon */}
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
