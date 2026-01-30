import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between p-4 bg-white shadow-sm border-b border-gray-200 z-30 relative">
        <button onClick={toggleSidebar} className="text-gray-700 hover:text-black transition-colors">
          <FaBars size={20} />
        </button>
        <h1 className="text-lg font-bold tracking-wide text-gray-900 uppercase">Admin Dashboard</h1>
         <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity" 
            onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar closeSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;