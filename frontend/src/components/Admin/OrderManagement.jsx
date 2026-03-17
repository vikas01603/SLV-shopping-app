import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/adminOrderSlice';
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaChevronDown } from "react-icons/fa";
import AdminOrderDetails from './AdminOrderDetails';

const OrderManagement = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.adminOrders);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
        } else {
            dispatch(fetchAllOrders());
        }
    }, [dispatch, user, navigate]);

    const handleStatusChange = (orderId, status) => {
        dispatch(updateOrderStatus({ id: orderId, status }));
    }

    const [sortOption, setSortOption] = React.useState("newest");
    const [selectedOrder, setSelectedOrder] = React.useState(null);

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortOption === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortOption === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortOption === "highPrice") {
            return b.totalPrice - a.totalPrice;
        } else if (sortOption === "lowPrice") {
            return a.totalPrice - b.totalPrice;
        }
        return 0;
    });

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Header Section - Compact */}
            <div className="px-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Order Management</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-widest">
                        Customer transactions & fulfilment
                    </p>
                </div>

                {/* Sorting Dropdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 relative min-w-[200px]">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider pl-2">Sort:</span>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-bold text-black appearance-none cursor-pointer z-10"
                    >
                        <option value="newest">Newest Orders</option>
                        <option value="oldest">Oldest Orders</option>
                        <option value="highPrice">Highest Amount</option>
                        <option value="lowPrice">Lowest Amount</option>
                    </select>
                    <FaChevronDown className="absolute right-3 text-gray-400" size={10} />
                </div>
            </div>

            {/* Content Table - Compact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : error ? (
                    <div className="p-6 text-red-500 text-sm font-medium">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                                    <th className="py-4 px-6 w-1/5">Ref</th>
                                    <th className="py-4 px-6 w-1/5">Customer</th>
                                    <th className="py-4 px-6 w-1/5">Amount</th>
                                    <th className="py-4 px-6 w-1/5">Status</th>
                                    <th className="py-4 px-6 w-1/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sortedOrders.length > 0 ? (
                                    sortedOrders.map((order) => (
                                        <tr 
                                            key={order._id} 
                                            onClick={() => setSelectedOrder(order)}
                                            className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="py-4 px-6 font-mono text-[10px] text-gray-400 group-hover:text-black transition-colors truncate">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <div className="flex flex-col">
                                                    <div className="font-bold text-black truncate">
                                                        {order.user?.name || order.userSnapshot?.name || "Unknown User"}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 font-medium uppercase truncate">
                                                        {order.user?.email || order.userSnapshot?.email || "No Email"}
                                                    </div>
                                                    {!order.user && order.userSnapshot && (
                                                        <span 
                                                            className="mt-1 text-[9px] text-gray-400 flex items-center gap-1 font-bold uppercase tracking-tighter"
                                                            title="This user account was deleted, but order data is preserved for records."
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                            Former User
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-black text-sm">
                                                ₹{order.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <select
                                                    value={order.status}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition-colors max-w-full ${order.status === 'Delivered'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : order.status === 'Processing'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : order.status === 'Shipped'
                                                                ? 'bg-orange-50 text-orange-600'
                                                                : 'bg-red-50 text-red-600'
                                                        }`}
                                                >
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(order._id, "Delivered");
                                                        }}
                                                        disabled={order.status === "Delivered"}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap overflow-hidden ${order.status === "Delivered"
                                                            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                                            : "bg-black text-white hover:bg-neutral-800 active:scale-95"
                                                            }`}
                                                    >
                                                        <FaCheckCircle size={10} className="flex-shrink-0" />
                                                        <span className="truncate">Mark as Delivered</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400 text-sm font-medium">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Order Details Drawer */}
            <AnimatePresence>
                {selectedOrder && (
                    <AdminOrderDetails 
                        order={selectedOrder} 
                        onClose={() => setSelectedOrder(null)} 
                        onUpdateStatus={handleStatusChange} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default OrderManagement;