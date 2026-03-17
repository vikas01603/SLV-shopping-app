import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminProducts } from '../redux/slices/adminProductsSlice';
import { fetchAllOrders } from '../redux/slices/adminOrderSlice';
import { motion } from "framer-motion";
import { FaWallet, FaShoppingBag, FaBox, FaArrowRight } from "react-icons/fa";

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const {products, loading: productsLoading, error: productsError} = useSelector((state)=> state.adminProducts);
    const {orders, totalOrders, totalSales, loading: ordersLoading, error: ordersError} = useSelector((state)=> state.adminOrders);

    useEffect(() => {
        dispatch(fetchAdminProducts());
        dispatch(fetchAllOrders());
    }, [dispatch])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 py-2">
            {/* Header & Welcome Banner - Compact */}
            <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-black to-neutral-800 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
                    >
                        Store Overview & Analytics
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 text-sm md:text-base max-w-xl font-light"
                    >
                        Real-time insights into your business performance.
                    </motion.p>
                </div>
                {/* Abstract shape */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </div>

            {productsLoading || ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                </div>
            ) : productsError || ordersError ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    {productsError || ordersError}
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* Revenue Card - Compact */}
                    <motion.div variants={cardVariants} className="group bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform text-sm">
                                <FaWallet size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Revenue</span>
                        </div>
                        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-1">Total Sales</h3>
                        <p className="text-2xl font-bold text-black tracking-tight">₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </motion.div>

                    {/* Orders Card - Compact */}
                    <motion.div variants={cardVariants} className="group bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform text-sm">
                                <FaShoppingBag size={20} />
                            </div>
                            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 transition-colors">
                                <FaArrowRight size={14} />
                            </Link>
                        </div>
                        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-1">Total Orders</h3>
                        <p className="text-2xl font-bold text-black tracking-tight">{totalOrders}</p>
                    </motion.div>

                    {/* Products Card - Compact */}
                    <motion.div variants={cardVariants} className="group bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform text-sm">
                                <FaBox size={20} />
                            </div>
                            <Link to="/admin/products" className="text-orange-600 hover:text-orange-800 transition-colors">
                                <FaArrowRight size={14} />
                            </Link>
                        </div>
                        <h3 className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mb-1">Inventory</h3>
                        <p className="text-2xl font-bold text-black tracking-tight">{products.length} Items</p>
                    </motion.div>
                </motion.div>
            )}
            
            {/* Recent Orders Table - Compact */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-black tracking-tight">Recent Transactions</h2>
                    <Link to="/admin/orders" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2">
                        View More <FaArrowRight size={10} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                                <th className="py-4 px-8">Ref</th>
                                <th className="py-4 px-8">Customer</th>
                                <th className="py-4 px-8">Amount</th>
                                <th className="py-4 px-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.length > 0 ? (
                                orders.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-8 font-mono text-[10px] text-gray-400 group-hover:text-black transition-colors">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="py-4 px-8 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-black">
                                                    {order.user?.name || order.userSnapshot?.name || "Unknown User"}
                                                </span>
                                                {!order.user && order.userSnapshot && (
                                                    <span 
                                                        className="text-[10px] text-gray-400 flex items-center gap-1"
                                                        title="This user account was deleted, but order data is preserved for records."
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        Former User
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8 font-bold text-black text-sm">
                                            ₹{order.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-8">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                order.status === 'Delivered' 
                                                ? 'bg-emerald-50 text-emerald-600' 
                                                : order.status === 'Processing' 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'bg-orange-50 text-orange-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm font-medium">
                                        No recent transactions.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

export default AdminHomePage;