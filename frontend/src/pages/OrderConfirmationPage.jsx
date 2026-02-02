import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiCreditCard, FiArrowRight, FiShoppingBag, FiCalendar } from 'react-icons/fi';

const OrderConfirmationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { checkout } = useSelector((state) => state.checkout);

    // Trigger confetti and clear cart
    useEffect(() => {
        if (checkout && checkout._id) {
            dispatch(clearCart());
            localStorage.removeItem("cartItems");

            // Fire confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

        } else {
            navigate("/profile");
        }
    }, [checkout, navigate, dispatch]);

    const calculateEstimatedDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 10);
        return orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    if (!checkout) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-black text-white p-8 text-center relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg z-10 relative"
                    >
                        <FiCheckCircle className="text-5xl text-black" />
                    </motion.div>
                    <h1 className="text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-300">Thank you for shopping with SLV.</p>

                    {/* Decorative Blur */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-1/2 opacity-20"></div>
                </div>

                <div className="p-8">
                    {/* Order Meta */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <FiShoppingBag className="text-xl text-black" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Order ID</p>
                                <p className="font-mono font-bold text-lg text-gray-900">#{checkout._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <FiCalendar className="text-xl text-black" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Estimated Delivery</p>
                                <p className="font-bold text-gray-900">{calculateEstimatedDelivery(checkout.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Shipping */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
                                <FiMapPin className="text-black" /> Shipping Address
                            </h3>
                            <p className="font-medium text-gray-900 mb-1">{checkout.shippingAddress.address}</p>
                            <p className="text-gray-500">{checkout.shippingAddress.city}, {checkout.shippingAddress.country}</p>
                            <p className="text-gray-500 text-sm mt-2">{checkout.shippingAddress.postalCode}</p>
                        </div>

                        {/* Payment */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
                                <FiCreditCard className="text-black" /> Payment Information
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">Method</span>
                                <span className="font-bold text-gray-900">RazorPay</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Paid</span>
                                <span className="font-bold text-xl text-black">₹ {checkout.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
                            <FiPackage className="text-black" /> Items Ordered ({checkout.checkoutItems.length})
                        </h3>
                        <div className="space-y-4">
                            {checkout.checkoutItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Color: {item.color}</p>
                                    </div>
                                    <p className="font-bold text-gray-900">₹ {item.price.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/profile" className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-black/20 text-center">
                            Track Order
                        </Link>
                        <Link to="/" className="px-8 py-3 bg-white text-black border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2">
                            Continue Shopping <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default OrderConfirmationPage;