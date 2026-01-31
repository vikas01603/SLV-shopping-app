import React from 'react';
import Topbar from '../Layout/Topbar';
import Navbar from './Navbar';
import InfoBanner from '../Layout/InfoBanner';

const Header = () => {
  return (
    <header className="border-b border-black">
      {/* Topbar */}
      <Topbar />
      {/* Navbar */}
      <Navbar />
      {/* Info Banner */}
      <InfoBanner />
      {/* Cart drawer */}
    </header>
  )
}

export default Header;