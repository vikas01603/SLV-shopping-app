import React from 'react';

const RazorPayButton = ({ amount, onSuccess, onError }) => {

  const handlePayment = () => {

    const options = {
      key: import.meta.env.VITE_RAZORPAY_CLIENT_ID, // Razorpay Key
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      name: "SLV",
      description: "Order Payment",

      handler: function (response) {
        onSuccess(response);
      },

      prefill: {
        name: "Kalpana",
        email: "kalpana10@gmail.com",
        contact: "7337847118",
      },

      theme: {
        color: "#2f5bea",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full flex items-center rounded-lg overflow-hidden border border-blue-600 shadow-sm hover:shadow-md transition"
    >
      {/* Right content */}
      <div className="flex-1 bg-[#0439cb] py-3 px-4 text-center">
        <p className="text-[#ffffff] font-semibold text-base leading-tight">
          Pay  ₹{amount}
        </p>
        <p className="text-xs text-white">
          Secured by Razorpay
        </p>
      </div>
    </button>
  );
};

export default RazorPayButton;
