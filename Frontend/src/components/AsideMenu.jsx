import React from 'react';
import Logo from '../assets/icons8-shopping-bag-30.png';

// Minimal LayoutPanelLeft icon in the Lucide style (inline SVG) so we don't require an external package.
export const LayoutPanelLeftIcon = ({ className = 'w-6 h-6', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M9 3v18"></path>
  </svg>
);

const AsideMenu = ({ open, onClose, items = [], activeId, onSelect }) => {
  return (
    // overlay
    <div
      className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* semi-transparent backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* sliding panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={Logo} alt="GoCart Logo" className="h-8" />
                <span className="text-black text-lg font-bold">GoCart</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className="p-4 overflow-auto">
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => {
                      onSelect(it.id);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeId === it.id ? 'bg-red-100 text-red-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    {it.icon ? (
                      <img src={it.icon} alt={it.label} className="w-5 h-5" />
                    ) : (
                      <span className="w-5 h-5 inline-block" />
                    )}
                    <span>{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto p-4 border-t">
            <button
              onClick={() => {
                onSelect('logout');
                onClose();
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AsideMenu;
