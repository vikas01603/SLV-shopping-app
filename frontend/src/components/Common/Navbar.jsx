import React, { useState } from 'react';
import { Link } from "react-router-dom";
import {HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight} from "react-icons/hi2";
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import { IoMdClose } from 'react-icons/io';
import logo from "../../assets/logo.jpeg";

const Navbar = () => {

  const [drawerOpen, setDrawerOpen] =useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };
  
      const toggleCartDrawer = () => {
          setDrawerOpen(!drawerOpen);
      };

  return (
    <>
    <nav className="container mx-auto flex items-center justify-between py-4 px-6">
      {/** Left - Logo */}
      <div className="flex items-center space-x-2">
        <img src={logo} alt="SLV Logo" className="h-8 w-auto" />
        <Link to="/" className="text-2xl font-medium">SLV </Link>
      </div>
      <div className="hidden md:flex space-x-6">
        <Link to="/collections/all" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">SAREES</Link>
        <Link to="" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">DRESS</Link>
        <Link to="" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">MATERIALS</Link>
        <Link to="" className="text-[#2B2B2B] hover:text-[#B89B5E] text-sm font-medium uppercase">TOP WEARS</Link>
      </div>
      {/** Right - Icons */}
      <div className="flex items-center space-x-4">
        <Link to="/profile" className="hover:text-[#B89B5E]">
        <HiOutlineUser className='h-6 w-6 text-[#2B2B2B]'/>
        </Link>
        <button onClick={toggleCartDrawer} className="relative hover:text-[#B89B5E]">
          <HiOutlineShoppingBag className="h-6 w-6 text-[#2B2B2B]" />
          <span className="absolute -top-1 bg-theme-gold text-white text-xs rounded-full px-2 py-0.5">4</span>
        </button>
        {/**search icon */}
        <div className="overflow-hidden">
        <SearchBar />
        </div>
        <button onClick={toggleNavDrawer} className="md:hidden">
          <HiBars3BottomRight className="h-6 w-6 text-[#2B2B2B] "/>
        </button>
      </div>
    </nav>

    <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>
    {/** Mobile Drawer Navigation*/}
    <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full 
      bg-white shadow-lg transform transition-transform duration-300 z-50 
      ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>

      <div className="flex justify-end p-4">
        <button onClick={toggleNavDrawer}>
          <IoMdClose className="h-6 w-6 text-gray-600"/>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4">Menu</h3>
        <nav className="space-y-4">
          <Link to="#" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">SAREES</Link>
          <Link to="#" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">DRESS</Link>
          <Link to="#" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">MATERIALS</Link>
          <Link to="#" onClick={toggleNavDrawer} className="block text-[#2B2B2B] hover:text-[#B89B5E]">TOP WEARS</Link>
        </nav>
      </div>
    </div>

    </>
  )
}

export default Navbar;