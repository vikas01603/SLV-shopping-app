import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import { motion } from 'framer-motion';
import { FiBox, FiClock, FiSearch, FiChevronRight } from 'react-icons/fi';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
                <p>Error loading orders: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiBox className="text-gray-400" /> My Orders
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {orders.length}
                    </span>
                </h2>
                {/* Search Placeholder - Functional logic can be added later */}
                <div className="relative hidden md:block">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-black transition-colors w-64"
                    />
                </div>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order, index) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleRowClick(order._id)}
                            className="bg-white group p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Product Images Preview */}
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    {order.orderItems.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="relative w-16 h-20 rounded-lg shadow-sm border border-white overflow-hidden flex-shrink-0 z-10 transition-transform hover:z-20 hover:scale-105">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                    {order.orderItems.length > 3 && (
                                        <div className="w-16 h-20 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500 z-0">
                                            +{order.orderItems.length - 3}
                                        </div>
                                    )}
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                        <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </h3>
                                        <span className="text-xs text-gray-400 flex items-center gap-1 justify-center md:justify-start">
                                            <FiClock /> {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-500 mb-2">
                                        {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'} • ₹ {order.totalPrice.toLocaleString('en-IN')}
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        {/* Payment Status Badge */}
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.isPaid
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {order.isPaid ? 'Paid' : 'Payment Pending'}
                                        </span>

                                        {/* Order Status Badge */}
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.isDelivered
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : 'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {order.isDelivered ? 'Delivered' : 'Processing'}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow Indicator */}
                                <div className="hidden md:flex items-center justify-center px-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                        <FiChevronRight className="text-lg" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FiBox className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;