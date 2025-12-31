import React, { useEffect, useState } from 'react'
import logo from '../assets/logo-designs/preevent-logo-main.svg'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from './DisplayCartItem';
import Search from './Search';
import isAdmin from '../utils/isAdmin';

const Header = () => {
  const [isMobile] = useMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector((state) => state?.user) || {}
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const cartItem = useSelector(state => state?.cartItem?.cart) || []
  const globalContext = useGlobalContext()
  const totalPrice = globalContext?.totalPrice ?? 0
  const totalQty = globalContext?.totalQty ?? 0
  const [openCartSection, setOpenCartSection] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const redirectToLoginPage = () => {
    navigate("/login")
  }

  const handleCloseMenu = () => {
    setOpenUserMenu(false)
  }

  const handleMobileUser = () => {
    if (!user?._id) {
      navigate("/login")
      return
    }
    navigate("/user")
  }

  const handleNavClick = (path) => {
    if (path === '#categories' || path === '#services') {
      const element = document.querySelector(path)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(path)
    }
    setMobileMenuOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className='bg-white shadow-md sticky top-0 z-50 border-b border-gray-100'>
      {/* Main Navigation Bar */}
      <nav className='bg-white'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          {/* Desktop Layout */}
          <div className='hidden lg:block'>
            <div className='flex items-center justify-between gap-6 py-4'>
              {/* Logo Section */}
              <div className='flex-shrink-0'>
                <Link
                  to="/"
                  className='flex items-center hover:opacity-90 transition-opacity'
                  aria-label="PreEvent - Professional Event Planning Services"
                >
                  <img
                    src={logo}
                    alt='PreEvent Logo'
                    className='h-12 w-auto'
                  />
                </Link>
              </div>

              {/* Navigation Links */}
              <ul className='flex items-center gap-1 list-none'>
                <li>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg text-[#111827] font-medium text-sm hover:text-[#DC2626] hover:bg-red-50 transition-all duration-200 ${
                      location.pathname === '/' ? 'text-[#DC2626] bg-red-50' : ''
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('#categories')}
                    className='px-4 py-2 rounded-lg text-[#111827] font-medium text-sm hover:text-[#DC2626] hover:bg-red-50 transition-all duration-200'
                  >
                    Categories
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('#services')}
                    className='px-4 py-2 rounded-lg text-[#111827] font-medium text-sm hover:text-[#DC2626] hover:bg-red-50 transition-all duration-200'
                  >
                    Services
                  </button>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`px-4 py-2 rounded-lg text-[#111827] font-medium text-sm hover:text-[#DC2626] hover:bg-red-50 transition-all duration-200 ${
                      location.pathname === '/about' ? 'text-[#DC2626] bg-red-50' : ''
                    }`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className={`px-4 py-2 rounded-lg text-[#111827] font-medium text-sm hover:text-[#DC2626] hover:bg-red-50 transition-all duration-200 ${
                      location.pathname === '/support' ? 'text-[#DC2626] bg-red-50' : ''
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              {/* Search Box - Desktop */}
              <div className='flex-1 max-w-md mx-4'>
                <Search />
              </div>

              {/* Action Buttons - Desktop */}
              <div className='flex items-center gap-3 flex-shrink-0'>
                {/* Cart Button */}
                {!isAdmin(user?.role) && (
                <button
                  onClick={() => setOpenCartSection(true)}
                  className='relative p-2.5 text-[#374151] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-all duration-200'
                  aria-label="Cart"
                >
                  <BsCart4 size={22} />
                  {totalQty > 0 && (
                    <span className='absolute -top-1 -right-1 bg-[#DC2626] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-md'>
                      {totalQty}
                    </span>
                  )}
                </button>
                )}

                {/* User/Login Button */}
                {user?._id ? (
                  <div className='relative'>
                    <button
                      onClick={() => setOpenUserMenu(prev => !prev)}
                      className='flex items-center gap-1.5 px-3 py-2 text-[#111827] font-medium hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-all duration-200'
                    >
                      <span className='text-sm'>Account</span>
                      {openUserMenu ? (
                        <GoTriangleUp size={14} />
                      ) : (
                        <GoTriangleDown size={14} />
                      )}
                    </button>
                    {openUserMenu && (
                      <div className='absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl min-w-[220px] p-2 z-50 border border-gray-100'>
                        <UserMenu close={handleCloseMenu} />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={redirectToLoginPage}
                    className='px-4 py-2 text-[#111827] font-medium hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-all duration-200 text-sm'
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className='lg:hidden'>
            <div className='flex items-center justify-between py-3'>
              {/* Logo */}
              <Link
                to="/"
                className='flex items-center flex-shrink-0'
                aria-label="PreEvent - Professional Event Planning Services"
              >
                <img
                  src={logo}
                  alt='PreEvent Logo'
                  className='h-10 w-auto'
                />
              </Link>

              {/* Mobile Action Buttons */}
              <div className='flex items-center gap-1.5 flex-shrink-0'>
                {/* Cart Button - Mobile */}
                {!isAdmin(user?.role) && (
                <button
                  onClick={() => setOpenCartSection(true)}
                  className='relative p-2.5 text-[#374151] hover:text-[#DC2626] rounded-lg transition-all duration-200'
                  aria-label="Cart"
                >
                  <BsCart4 size={20} />
                  {totalQty > 0 && (
                    <span className='absolute -top-1 -right-1 bg-[#DC2626] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center'>
                      {totalQty}
                    </span>
                  )}
                </button>
                )}

                {/* User Icon - Mobile */}
                <button
                  className='p-2.5 text-[#374151] hover:text-[#DC2626] rounded-lg transition-all duration-200'
                  onClick={handleMobileUser}
                  aria-label="User"
                >
                  <FaUserCircle size={20} />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  className='p-2.5 text-[#374151] hover:text-[#DC2626] rounded-lg transition-all duration-200'
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                </button>
              </div>
            </div>

            {/* Search Box - Mobile */}
            <div className='pb-3 flex items-center gap-2'>
              <button
                onClick={() => navigate(-1)}
                className='p-2.5 text-[#374151] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0'
                aria-label="Go back"
              >
                <FaArrowLeft size={18} />
              </button>
              <div className='flex-1 min-w-0'>
              <Search />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden bg-white border-t border-gray-200 shadow-lg'>
          <div className='container mx-auto px-4 py-3'>
            <ul className='space-y-0.5'>
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-[#374151] font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-red-50 text-[#DC2626]' 
                      : 'hover:bg-red-50 hover:text-[#DC2626]'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#categories')}
                  className='block w-full text-left px-4 py-3 text-[#374151] font-medium rounded-lg hover:bg-red-50 hover:text-[#DC2626] transition-all duration-200'
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('#services')}
                  className='block w-full text-left px-4 py-3 text-[#374151] font-medium rounded-lg hover:bg-red-50 hover:text-[#DC2626] transition-all duration-200'
                >
                  Services
                </button>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-[#374151] font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === '/about' 
                      ? 'bg-red-50 text-[#DC2626]' 
                      : 'hover:bg-red-50 hover:text-[#DC2626]'
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-[#374151] font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === '/support' 
                      ? 'bg-red-50 text-[#DC2626]' 
                      : 'hover:bg-red-50 hover:text-[#DC2626]'
                  }`}
                >
                  Contact
                </Link>
              </li>
              {user?._id && (
                <li>
                  <Link
                    to="/user"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-[#374151] font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === '/user' 
                        ? 'bg-red-50 text-[#DC2626]' 
                        : 'hover:bg-red-50 hover:text-[#DC2626]'
                    }`}
                  >
                    My Account
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {openCartSection && (
        <DisplayCartItem close={() => setOpenCartSection(false)} />
      )}
    </header>
  )
}

export default Header
