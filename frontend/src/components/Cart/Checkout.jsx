import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import RazorPayButton from './RazorPayButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { createCheckoutSession } from '../../redux/slices/checkoutSlice';
import { clearCart } from '../../redux/slices/cartSlice';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {cartItems, loading, error} = useSelector((state)=> state.cart);
    const {user} = useSelector((state)=> state.auth); 

    const cartTotal = cartItems ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0; 


    const [isOrdered, setIsOrdered] = useState(false);
    const [checkoutId, setCheckoutId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city:"",
        postalCode: "",
        country: "",
        phone: "",
    });

    //Ensure cart is loaded before proceeding
    useEffect(()=> {
        if(!isOrdered && (!cartItems || cartItems.length === 0)){
            navigate("/");
        }
    }, [cartItems , navigate, isOrdered]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if(cartItems && cartItems.length > 0){
            const res = await dispatch(createCheckoutSession({
                checkoutItems : cartItems,
                shippingAddress,
                paymentMethod: "RazorPay",
                totalPrice: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            })).unwrap();
             
             // The unwrap() will throw if the action is rejected, or return the payload if fulfilled.
            if(res && res._id) {
                setCheckoutId(res._id); 
            }
        }
    };

    const handlePaymentSuccess = async(details) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`, 
                {paymentStatus: "paid" , paymentDetails: details},
                {
                    headers:{
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    }
                }
            );
            if(response.status === 200) {
                await handleFinalizeCheckout(checkoutId); // finalize checkout if payment was successful
            }else{
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinalizeCheckout = async(checkoutId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`, 
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

    if(loading){
        return <p>Loading Cart...</p>
    }
    if(error){
        return <p>Error : {error}</p>
    }
    if(!cartItems || cartItems.length === 0){
        return <p>Your cart is empty</p>
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
        <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl uppercase mb-6">Checkout</h2>
            <form onSubmit={handleCreateCheckout}>
                <h3 className="text-lg mb-4">
                    Contact Details
                </h3>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input type="email" value={user? user.email : ""} className="w-full p-2 border rounded" disabled/>
                </div>
                <h3 className="text-lg mb-4">Delivery</h3>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">First Name</label>
                        <input type="text" value={shippingAddress.firstName} 
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value,})}
                        className="w-full p-2 border rounded" required/>
                    </div>
                    <div>
                        <label className="block text-gray-700">Last Name</label>
                        <input type="text" value={shippingAddress.lastName} 
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value,})}
                        className="w-full p-2 border rounded" required/>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Address</label>
                    <input type="text" value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value,})}
                    className="w-full p-2 border rounded"
                    required/>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">City</label>
                        <input type="text" value={shippingAddress.city} 
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value,})}
                        className="w-full p-2 border rounded" required/>
                    </div>
                    <div>
                        <label className="block text-gray-700">Postal Code</label>
                        <input type="text" value={shippingAddress.postalCode} 
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value,})}
                        className="w-full p-2 border rounded" required/>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Country</label>
                    <input type="text" value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value,})}
                    className="w-full p-2 border rounded"
                    required/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Phone No.</label>
                    <input type="tel" value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value,})}
                    className="w-full p-2 border rounded"
                    required/>
                </div>
                <div className="mt-6">
                    {!checkoutId ? (
                            <button type="submit" className="w-full bg-black text-white py-3 rounded">
                                Continue to Payment
                            </button>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-semibold text-gray-600">Pay using</span>
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                                        alt="Razorpay"
                                        className="h-7"
                                    />
                                </div>
                                <RazorPayButton
                                    amount={cartTotal}
                                    onSuccess={handlePaymentSuccess}
                                    onError={(err) => alert("Payment failed. Please try again.")}
                                />
                            </div>
                        )}
                </div>
            </form>
        </div>
        {/**order section */}
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg mb-4">Order Summary</h3>
            <div className="border-t py-4 mb-4">
                {cartItems.map((product, index) => (
                    <div key={index} className="flex items-start justify-between py-2 border-b">
                        <div className="flex items-start">
                            <img src={product.image} alt={product.name} className="w-20 h-24 object-cover mr-4" />
                            <div>
                                <h3 className="text-md">{product.name}</h3>
                                <p className="text-gray-500">Size: {product.size}</p>
                                <p className="text-gray-500">Color: {product.color}</p>
                            </div>
                        </div>
                        <p className="text-xl">₹ {product.price?.toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center text-lg mb-4">
                <p>Subtotal</p>
                <p>₹ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center text-lg">
                <p>Shipping</p>
                <p>Free</p>
            </div>
            <div className="flex justify-between items-center text-lg mt-5 border-t pt-4">
                <p>Total</p>
                <p>₹ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)?.toLocaleString()}</p>
            </div>
        </div>
    </div>
  );
};

export default Checkout;




