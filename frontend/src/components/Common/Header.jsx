import React from 'react';
import Topbar from '../Layout/Topbar';
import Navbar from './Navbar';

const Header = () => {
  return (
    <header className="border-b border-black">
        {/* Topbar */}
        <Topbar />
        {/* Navbar */}
        <Navbar />
        {/* Cart drawer */}
    </header>
  )
}

export default Header;