import React from 'react';

const RazorPayButton = ({ amount, onSuccess, onError }) => {

  const handlePayment = () => {

    const options = {
      key: "rzp_test_S1isNPwO9jCokZ", // Razorpay Key
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      name: "My Shop",
      description: "Order Payment",

      handler: function (response) {
        onSuccess(response);
      },

      prefill: {
        name: "User",
        email: "user@gmail.com",
        contact: "9999999999",
      },

      theme: {
        color: "#000000",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-black text-white py-3 rounded"
    >
      Pay ₹{amount}
    </button>
  );
};

export default RazorPayButton;
