import React, { useEffect, useState } from 'react';
import MyOrdersPage from './MyOrdersPage';
import SettingsPage from './SettingsPage';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import { logout } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { FiUser, FiBox, FiLogOut, FiSettings } from 'react-icons/fi';
import { FaAngleRight } from 'react-icons/fa';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="flex-grow container mx-auto px-4 md:px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <FaAngleRight className="text-xs" />
                    <span className="text-black font-medium">My Profile</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full lg:w-1/4 flex-shrink-0"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            {/* User Header */}
                            <div className="p-8 text-center border-b border-gray-100 bg-gray-50/50">
                                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl font-serif text-gray-500 shadow-inner">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                                </div>
                                <h1 className="text-xl font-bold text-gray-900 font-serif tracking-tight">
                                    {user?.name}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="p-4 space-y-2">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'orders'
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                        }`}
                                >
                                    <FiBox className="text-lg" />
                                    <span>My Orders</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'settings'
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                        }`}
                                >
                                    <FiSettings className="text-lg" />
                                    <span>Settings</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium flex items-center gap-3 transition-all mt-4"
                                >
                                    <FiLogOut className="text-lg" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <div className="w-full lg:w-3/4">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {activeTab === 'orders' ? <MyOrdersPage /> : <SettingsPage />}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;