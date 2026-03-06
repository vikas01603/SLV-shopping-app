import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight, HiOutlineHeart, HiOutlineBell } from "react-icons/hi2";
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import { IoMdClose } from 'react-icons/io';
import logo from "../../assets/logo.jpeg";
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications } from '../../redux/slices/notificationSlice';

const Navbar = () => {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const notificationRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (user) {
      dispatch(fetchNotifications());

      // Poll every 3 seconds to keep notifications extremely immediate
      intervalId = setInterval(() => {
        dispatch(fetchNotifications());
      }, 3000);
    }

    return () => clearInterval(intervalId);
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadNotificationsCount = notifications?.filter(n => !n.isRead).length || 0;

  const cartItemCount = cartItems.reduce((total, product) =>
    total + product.quantity, 0) || 0;

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
        {/** Left - Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="SLV Logo" className="h-6 md:h-8 w-auto" />
          <Link to="/" className="text-xl md:text-2xl font-medium">SLV </Link>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link to="/collections/all?gender=Women" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">WOMENS</Link>
          <Link to="/collections/all?gender=Men" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">MENS</Link>
          <Link to="/collections/all?category=Top Wear" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">TOP WEARS</Link>
          <Link to="/collections/all?category=Bottom Wear" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">BOTTOM WEARS</Link>
        </div>
        {/** Right - Icons */}
        <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
          {user && user.role === "admin" && (<Link to="/admin" className="block bg-black px-2 rounded text-sm text-white">Admin</Link>)}

          <Link to="/profile" className="hover:text-[#B89B5E]">
            <HiOutlineUser className='h-5 w-5 md:h-6 md:w-6 text-[#2B2B2B]' />
          </Link>

          <button onClick={toggleCartDrawer} className="relative hover:text-[#B89B5E]">
            <HiOutlineShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-[#2B2B2B]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-black text-white text-[10px] md:text-xs rounded-full px-1.5 py-0.5 md:px-2">
                {cartItemCount}
              </span>
            )}

          </button>
          <Link to="/wishlist" className="hover:text-[#B89B5E]">
            <HiOutlineHeart className='h-5 w-5 md:h-6 md:w-6 text-[#2B2B2B]' />
          </Link>
          <div className="relative" ref={notificationRef}>
            <button onClick={toggleNotification} className="hover:text-[#B89B5E] flex items-center justify-center relative">
              <HiOutlineBell className='h-5 w-5 md:h-6 md:w-6 text-[#2B2B2B]' />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#000000] text-white text-[10px] md:text-xs rounded-full px-1.5 py-0.5 md:px-2">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-[#2B2B2B]">Notifications</h3>
                </div>
                <div className="p-4 text-sm text-center">
                  {unreadNotificationsCount > 0
                    ? <span className="text-gray-700">You have {unreadNotificationsCount} unread notification(s)</span>
                    : <span className="text-gray-500">No new notifications</span>}
                </div>
                <div className="p-3 bg-gray-50 border-t">
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="block w-full text-center text-sm text-[#000000] font-medium hover:underline"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/**search icon */}
          <SearchBar />
          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-5 w-5 text-[#2B2B2B]" />
          </button>
        </div>
      </nav>

      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />
      {/** Mobile Drawer Navigation*/}
      <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full 
      bg-white shadow-lg transform transition-transform duration-300 z-50 
      ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>

        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Menu</h3>
          <nav className="space-y-4">
            <Link to="/collections/all?gender=Women" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">WOMENS</Link>
            <Link to="/collections/all?gender=Men" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">MENS</Link>
            <Link to="/collections/all?category=Top Wear" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">TOP WEARS</Link>
            <Link to="/collections/all?category=Bottom Wear" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">BOTTOM WEARS</Link>
          </nav>
        </div>
      </div>

    </>
  )
};

export default Navbar;