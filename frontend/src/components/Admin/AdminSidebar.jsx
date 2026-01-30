import React from 'react';
import { FaBoxOpen, FaClipboardList, FaSignOutAlt, FaStore, FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import logo from "../../assets/lotusBNw.JPG";

const AdminSidebar = ({ closeSidebar }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        navigate("/");
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-y-auto">
            
            {/* Logo / Header - Side-by-Side Layout */}
            <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col items-center">
                 <Link to="/admin" className="group flex flex-col items-center" onClick={closeSidebar}>
                    <div className="flex items-center gap-3">
                        <img 
                            src={logo} 
                            alt="SLV Logo" 
                            className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                        <span className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
                            SLV
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-2 block pl-1">
                        Admin Dashboard
                    </span>
                </Link>
            </div>

            {/* Navigation - Cluster at top */}
            <nav className="space-y-1">
                <NavLink 
                    to="/admin/users" 
                    onClick={closeSidebar}
                    className={({isActive}) => isActive 
                        ? "bg-black text-white py-2.5 px-4 rounded-xl flex items-center space-x-3 shadow-md transition-all duration-300 transform scale-[1.01]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-black py-2.5 px-4 rounded-xl flex items-center space-x-3 transition-all duration-200"
                    }
                >
                    <FaUser className="text-base opacity-80" />
                    <span className="font-semibold tracking-tight text-sm">Users</span>
                </NavLink>

                <NavLink 
                    to="/admin/products" 
                    onClick={closeSidebar}
                    className={({isActive}) => isActive 
                        ? "bg-black text-white py-2.5 px-4 rounded-xl flex items-center space-x-3 shadow-md transition-all duration-300 transform scale-[1.01]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-black py-2.5 px-4 rounded-xl flex items-center space-x-3 transition-all duration-200"
                    }
                >
                    <FaBoxOpen className="text-base opacity-80" />
                    <span className="font-semibold tracking-tight text-sm">Catalog</span>
                </NavLink>

                <NavLink 
                    to="/admin/orders" 
                    onClick={closeSidebar}
                    className={({isActive}) => isActive 
                        ? "bg-black text-white py-2.5 px-4 rounded-xl flex items-center space-x-3 shadow-md transition-all duration-300 transform scale-[1.01]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-black py-2.5 px-4 rounded-xl flex items-center space-x-3 transition-all duration-200"
                    }
                >
                    <FaClipboardList className="text-base opacity-80" />
                    <span className="font-semibold tracking-tight text-sm">Orders</span>
                </NavLink>

                <NavLink 
                    to="/" 
                    onClick={closeSidebar}
                    className={({isActive}) => isActive 
                        ? "bg-black text-white py-2.5 px-4 rounded-xl flex items-center space-x-3 shadow-md transition-all duration-300 transform scale-[1.01]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-black py-2.5 px-4 rounded-xl flex items-center space-x-3 transition-all duration-200"
                    }
                >
                    <FaStore className="text-base opacity-80" />
                    <span className="font-semibold tracking-tight text-sm">Store</span>
                </NavLink>

                {/* Logout - Now part of the main list */}
                <button 
                    onClick={handleLogout} 
                    className="w-full text-gray-500 hover:bg-red-50 hover:text-red-500 py-2.5 px-4 rounded-xl flex items-center space-x-3 transition-all duration-200 mt-2"
                >
                    <FaSignOutAlt className="text-base opacity-80" />
                    <span className="font-semibold tracking-tight text-sm">Logout</span>
                </button>
            </nav>
        </div>
    );
}

export default AdminSidebar;