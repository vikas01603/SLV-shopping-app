import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderDetails } from '../redux/slices/orderSlice';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiMapPin, FiCreditCard, FiArrowLeft, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  const steps = ["Processing", "Shipped", "Delivered"];
  const currentStep = orderDetails ? steps.indexOf(orderDetails.status) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] text-red-500">
      Error: {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <FiArrowLeft /> Back to My Orders
      </Link>

      {!orderDetails ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 text-lg">Order details not found.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header & Status */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
                Order #{orderDetails._id.slice(-6).toUpperCase()}
              </h2>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <FiClock /> Placed on {new Date(orderDetails.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${orderDetails.isPaid
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                {orderDetails.isPaid ? <FiCheckCircle /> : <FiClock />}
                {orderDetails.isPaid ? "Payment Verified" : "Payment Pending"}
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${orderDetails.isDelivered
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : "bg-gray-50 text-gray-600 border-gray-100"
                }`}>
                {orderDetails.isDelivered ? <FiCheckCircle /> : <FiTruck />}
                {orderDetails.isDelivered ? "Delivered" : orderDetails.status || "Processing"}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column (Items & Delivery) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FiPackage className="text-black" /> Order Items
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {orderDetails.orderItems.map((item) => (
                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <Link to={`/product/${item.productId}`} className="flex-shrink-0 w-24 h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <div className="flex-1 w-full text-center sm:text-left">
                        <Link to={`/product/${item.productId}`} className="text-lg font-bold text-gray-900 hover:text-black transition-colors block mb-1">
                          {item.name}
                        </Link>
                        <p className="text-gray-500 text-sm mb-4">Quantity: {item.quantity}</p>
                        <p className="font-bold text-xl text-black">₹ {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Progress (Simplified Visual) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-8 flex items-center gap-2"><FiTruck /> Delivery Status</h3>
                <div className="relative flex justify-between items-center px-4 md:px-12">
                  {/* Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-black -z-0 transition-all duration-1000"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  ></div>

                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-300'
                          }`}>
                          {isCompleted && <FiCheckCircle className="text-sm" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (Info Cards) */}
            <div className="space-y-8">
              {/* Payment Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-black" /> Payment Info
                </h3>
                <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <p className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-bold text-gray-900">{orderDetails.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-bold ${orderDetails.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {orderDetails.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiMapPin className="text-black" /> Shipping Info
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <p className="font-bold text-gray-900">{orderDetails.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.country}
                  </p>
                  <p className="text-sm text-gray-600 pt-2 border-t border-gray-200 mt-2">
                    Postal Code: {orderDetails.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹ {(orderDetails.totalPrice - (orderDetails.shippingPrice || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`${orderDetails.shippingPrice > 0 ? "text-red-600" : "text-green-600"} font-medium`}>
                      {orderDetails.shippingPrice > 0 ? `₹ ${orderDetails.shippingPrice}` : "Free"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-xl text-black">
                  <span>Total</span>
                  <span>₹ {orderDetails.totalPrice.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderDetailsPage;