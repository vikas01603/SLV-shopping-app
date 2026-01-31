import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RazorPayButton from './RazorPayButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { createCheckoutSession } from '../../redux/slices/checkoutSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineArrowPath } from "react-icons/hi2";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaPhone, FaCreditCard, FaShippingFast, FaAngleRight } from 'react-icons/fa';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cartItems, loading, error } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const cartTotal = cartItems ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;
    const shippingAmount = cartTotal > 2000 ? 0 : 80;
    const finalTotal = cartTotal + shippingAmount;

    const [isOrdered, setIsOrdered] = useState(false);
    const [checkoutId, setCheckoutId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
    });

    //Ensure cart is loaded before proceeding
    useEffect(() => {
        if (!isOrdered && (!cartItems || cartItems.length === 0)) {
            navigate("/");
        }
    }, [cartItems, navigate, isOrdered]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if (cartItems && cartItems.length > 0) {
            const res = await dispatch(createCheckoutSession({
                checkoutItems: cartItems,
                shippingAddress,
                paymentMethod: "RazorPay",
                totalPrice: finalTotal,
                shippingPrice: shippingAmount,
            })).unwrap();

            if (res && res._id) {
                setCheckoutId(res._id);
            }
        }
    };

    const handlePaymentSuccess = async (details) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/checkout/${checkoutId}/pay`,
                { paymentStatus: "paid", paymentDetails: details },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    }
                }
            );
            if (response.status === 200) {
                await handleFinalizeCheckout(checkoutId);
            } else {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinalizeCheckout = async (checkoutId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/checkout/${checkoutId}/finalize`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    }
                });
            setIsOrdered(true);
            dispatch(clearCart());
            navigate("/order-confirmation");
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
                Error : {error}
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Your cart is empty</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
                {/* Left Column: Checkout Form */}
                <div className="space-y-8 lg:order-1 order-2">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/" className="hover:text-black transition-colors">Home</Link>
                        <FaAngleRight className="text-xs" />
                        <span className="text-black font-medium">Checkout</span>
                    </nav>

                    <div className="text-left">
                        <h2 className="text-4xl font-serif font-bold text-gray-900 border-b-2 border-black inline-block pb-1">Checkout</h2>
                    </div>

                    <form onSubmit={handleCreateCheckout} className="space-y-6">

                        {/* Contact Info */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" /> Contact Information
                            </h3>
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={user ? user.email : ""}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Shipping Details */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-gray-400" /> Shipping Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.firstName}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.lastName}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={shippingAddress.address}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FaCity className="text-gray-300 text-xs" /> City</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.postalCode}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FaGlobe className="text-gray-300 text-xs" /> Country</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.country}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FaPhone className="text-gray-300 text-xs" /> Phone</label>
                                    <input
                                        type="tel"
                                        value={shippingAddress.phone}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Button / RazorPay */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <FaCreditCard className="text-gray-400" /> Payment Method
                            </h3>
                            {!checkoutId ? (
                                <button type="submit" className="w-full bg-black text-white py-4 rounded-full font-bold tracking-widest uppercase hover:bg-neutral-800 transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-3">
                                    Continue to Payment <FaAngleRight />
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-sm bg-gray-50 p-4 rounded-lg text-gray-600 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                                                alt="Razorpay"
                                                className="h-4 w-auto"
                                            />
                                        </div>
                                        <span>Proceeding with Razorpay secure checkout...</span>
                                    </div>
                                    <div className="w-full">
                                        <RazorPayButton
                                            amount={finalTotal}
                                            onSuccess={handlePaymentSuccess}
                                            onError={(err) => alert("Payment failed. Please try again.")}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:sticky lg:top-24 space-y-6 lg:order-2 order-1">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

                        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((product, index) => (
                                <div key={index} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-b-0">
                                    <img src={product.image} alt={product.name} className="w-20 h-24 object-cover rounded-lg bg-gray-50" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Size: {product.size} | Color: {product.color}</p>
                                        <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-900">₹ {(product.price * product.quantity)?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal</span>
                                <span>₹ {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="flex items-center gap-2"><FaShippingFast className="text-gray-800" /> Shipping</span>
                                {shippingAmount > 0 ? (
                                    <span className="text-red-500">₹ {shippingAmount}</span>
                                ) : (
                                    <span className="text-green-600">Free</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹ {finalTotal.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">Including all taxes</p>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-colors hover:border-black">
                            <HiOutlineShieldCheck className="w-6 h-6 text-black" />
                            <span>Secure Pay</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-colors hover:border-black">
                            <HiOutlineTruck className="w-6 h-6 text-black" />
                            <span>Fast Delivery</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 transition-colors hover:border-black">
                            <HiOutlineArrowPath className="w-6 h-6 text-black" />
                            <span>Easy Returns</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Checkout;




