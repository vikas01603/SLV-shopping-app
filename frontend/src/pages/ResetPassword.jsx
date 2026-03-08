import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../redux/slices/authSlice";
import { toast } from "sonner";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetLoading, resetError, resetSuccess } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        dispatch(resetPassword({ token, password }));
    };

    useEffect(() => {
        if (resetSuccess) {
            toast.success("Password reset successfully. Please login with your new password.");
            navigate("/login");
        }
    }, [resetSuccess, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 transition-all transform hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Reset Password</h2>
                    <p className="text-gray-500 text-sm tracking-wide">
                        Enter your new password below to reset your account access.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm bg-white hover:bg-gray-50 text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm bg-white hover:bg-gray-50 text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-black text-white py-3.5 rounded-lg font-bold tracking-widest hover:bg-gray-900 transform transition-all shadow-md hover:shadow-lg text-sm uppercase disabled:bg-gray-400"
                    >
                        {resetLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {resetError && (
                    <p className="mt-6 text-center text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                        {resetError}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
