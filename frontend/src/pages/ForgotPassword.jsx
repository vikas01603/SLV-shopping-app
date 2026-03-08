import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../redux/slices/authSlice";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const dispatch = useDispatch();
    const { resetLoading, resetError, resetSuccess } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 transition-all transform hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Forgot Password</h2>
                    <p className="text-gray-500 text-sm tracking-wide">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm bg-white hover:bg-gray-50 text-base"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-black text-white py-3.5 rounded-lg font-bold tracking-widest hover:bg-gray-900 transform transition-all shadow-md hover:shadow-lg text-sm uppercase disabled:bg-gray-400"
                    >
                        {resetLoading ? "Sending Link..." : "Send Reset Link"}
                    </button>
                </form>

                {resetSuccess && (
                    <p className="mt-6 text-center text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg border border-green-100">
                        If this email exists, a password reset link has been sent.
                    </p>
                )}

                {resetError && (
                    <p className="mt-6 text-center text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                        {resetError}
                    </p>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm text-black font-semibold hover:underline transition-all">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
