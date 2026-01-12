import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../redux/cartSlice';
import Logo from '../assets/bag-icon-white.png';

const NavLinks = ({ onClick, mobile = false }) => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (mobile) {
      return `menu-link text-primary ${isActive ? 'font-bold' : 'font-semibold'}`;
    } else {
      return `menu-link ${isActive ? 'text-primary font-bold' : ''}`;
    }
  };

  return (
    <>
      <Link
        to="/"
        className={getLinkClass('/')}
        onClick={onClick}
      >
        Home
      </Link>
      <Link
        to="/products"
        className={getLinkClass('/products')}
        onClick={onClick}
      >
        Products
      </Link>
      <Link
        to="/about"
        className={getLinkClass('/about')}
        onClick={onClick}
      >
        About
      </Link>
      <Link
        to="/contact"
        className={getLinkClass('/contact')}
        onClick={onClick}
      >
        Contact
      </Link>
    </>
  );
};

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cart = useSelector(selectCartItems);
  const { currentUser } = useSelector((state) => state.auth);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="flex justify-between items-center p-4 text-white bg-primary-dark backdrop-blur-2xl sticky top-0 z-10 shadow-md">
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-5">
        <NavLinks />
      </div>

      <Link to="/">
        <div className="flex items-center">
          <img src={Logo} alt="GoCart Logo" className="mr-auto md:mr-0 md:ml-[-75%] h-12" />
          <span className="text-white text-xl font-bold">GoCart</span>
        </div>
      </Link>

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {/* Desktop Buttons */}
      <div className="hidden md:flex gap-3">
        {!currentUser && (
          <Link
            to="/auth"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-semibold"
          >
            Login/Register
          </Link>
        )}

        {currentUser && (
          <Link
            to="/account"
            className="px-2 py-2 border-2 border-transparent rounded-[50%] hover:bg-primary transition-colors flex items-center justify-center"
          >
            <img className="w-7 h-auto" src="https://img.icons8.com/cotton/64/gender-neutral-user--v2.png" alt="Profile" />
          </Link>
        )}

        {currentUser && (
          <Link
            to="/cart"
            className="relative p-2 border-2 border-transparent rounded-[50%] hover:bg-primary transition-colors flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-primary-dark shadow-lg z-50">
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Nav Links */}
            <NavLinks onClick={toggleMenu} mobile={true} />

            {/* Login Button */}
            {!currentUser && (
              <Link
                to="/auth"
                onClick={toggleMenu}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-semibold w-3/4 text-center"
              >
                Login/Register
              </Link>
            )}

            {/* Profile & Cart in same line */}
            <div className="flex items-center justify-center gap-5 mt-3">
              {/* Profile */}
              {currentUser && (
                <Link
                  to="/account"
                  onClick={toggleMenu}
                  className="p-2 border-2 border-transparent rounded-full hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <img
                    className="w-7 h-auto"
                    src="https://img.icons8.com/cotton/64/gender-neutral-user--v2.png"
                    alt="Profile"
                  />
                </Link>
              )}

              {/* Cart - Only show if user is logged in */}
              {currentUser && (
                <Link
                  to="/cart"
                  onClick={toggleMenu}
                  className="relative p-2 border-2 border-transparent rounded-full hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
