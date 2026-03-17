import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaUser, FaMapMarkerAlt, FaCreditCard, FaPhone } from 'react-icons/fa';

const AdminOrderDetails = ({ order, onClose, onUpdateStatus }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    if (!order) return null;

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const handleStatusChange = (e) => {
        onUpdateStatus(order._id, e.target.value);
    };

    const handleMarkDelivered = () => {
        onUpdateStatus(order._id, 'Delivered');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Overlay */}
            <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
            >
                {/* Header (Sticky) */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-black">Order Details</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">#{order._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 space-y-8">
                    {/* Section 1: Order Header & Status */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Order Status</p>
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'Shipped' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Payment Status</p>
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                        </div>
                    </div>

                    {/* Section 2: Customer Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaUser className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Customer Information</h3>
                        </div>
                        <div className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm space-y-2">
                            <div className="flex flex-col">
                                <span className="font-bold text-black text-base">
                                    {order.user?.name || order.userSnapshot?.name || "Unknown Customer"}
                                </span>
                                <span className="text-gray-500 mt-0.5">
                                    {order.user?.email || order.userSnapshot?.email || "No email provided"}
                                </span>
                                {!order.user && order.userSnapshot && (
                                    <div 
                                        className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100 w-fit"
                                        title="This user account was deleted, but order data is preserved for records."
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Former User</span>
                                    </div>
                                )}
                            </div>
                            
                            {(order.shippingAddress?.phone || order.user?.phone) && (
                                <div className="pt-2 border-t border-gray-50">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <FaPhone size={10} /> Phone Number
                                    </p>
                                    <p className="font-medium text-black">
                                        {order.shippingAddress?.phone || order.user?.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Delivery Address */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaMapMarkerAlt className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Delivery Address</h3>
                        </div>
                        <div className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm space-y-1">
                            <p className="font-medium text-black">{order.shippingAddress?.address}</p>
                            <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            <p className="text-gray-600">{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    {/* Section 4: Payment Method */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaCreditCard className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Payment Method</h3>
                        </div>
                        <div className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm">
                            <p className="font-medium text-black capitalize">{order.paymentMethod}</p>
                        </div>
                    </div>

                    {/* Section 5: Products List */}
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-3">Products Ordered</h3>
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} className="p-3 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-black line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.color && `Color: ${item.color} | `}
                                            {item.size && `Size: ${item.size}`}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs font-medium text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-black">₹{item.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 6: Order Summary */}
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-3">Order Summary</h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal ({order.orderItems?.length} items)</span>
                                <span className="font-medium text-black">₹{(order.totalPrice - (order.shippingPrice || 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-medium text-black">₹{order.shippingPrice || 0}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 flex justify-between">
                                <span className="font-bold text-black">Total Amount</span>
                                <span className="font-bold text-black text-lg">₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 7: Admin Actions (Sticky Footer) */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 mt-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Order</h3>
                    <div className="space-y-3">
                        <select
                            value={order.status}
                            onChange={handleStatusChange}
                            className="w-full bg-gray-50 border border-gray-200 text-sm font-bold text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black/5"
                        >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                            onClick={handleMarkDelivered}
                            disabled={order.status === "Delivered"}
                            className={`w-full py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                order.status === "Delivered" 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-md"
                            }`}
                        >
                            <FaCheckCircle size={14} />
                            Mark as Delivered
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminOrderDetails;
