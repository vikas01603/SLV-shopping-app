import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
    const navigate = useNavigate();
    const { user, guestId } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const userId = user?._id || null;
    const handleCheckout = () => {
        toggleCartDrawer();
        if (!user) {
            navigate("/login?redirect=/checkout");
        } else {
            navigate("/checkout");
        }
    }
    return (
        <>
            {/* Backdrop */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[40] transition-opacity duration-300"
                    onClick={toggleCartDrawer}
                ></div>
            )}

            <div className={`fixed top-0 right-0 w-full sm:w-[28rem] h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col z-50 
        ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>

                {/** Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-serif font-bold tracking-wide">Cart Items ({cartItems?.length || 0})</h2>
                    <button onClick={toggleCartDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <IoMdClose className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/**Cart Content with scrollable area */}
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {cartItems && cartItems.length > 0 ? (
                        <CartContents cart={{ products: cartItems }} userId={userId} guestId={guestId} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
                            <p className="text-gray-400 text-sm">Time to start shopping!</p>
                        </div>
                    )}
                </div>

                {/**Checkout button fixed at the bottom */}
                <div className="p-6 bg-white border-t border-gray-100 mb-20 md:mb-0">
                    {cartItems && cartItems.length > 0 && (
                        <>
                            <button onClick={handleCheckout}
                                className="w-full bg-black text-white py-4 rounded-full font-bold tracking-widest uppercase hover:bg-gray-900 transition-all transform active:scale-[0.98] shadow-lg">
                                Checkout
                            </button>
                            <p className="text-xs tracking-wide text-gray-500 mt-4 text-center">
                                Shipping, taxes, and discount codes calculated at checkout.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer