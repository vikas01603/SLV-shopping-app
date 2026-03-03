import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import login from "../assets/login.webp";
import { loginUser, googleLoginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from '../redux/slices/cartSlice';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, guestId, loading, error } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);

    // Get redirect parameter and check if its checkout or something else
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    useEffect(() => {
        if (user) {
            if (cartItems?.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                });
            } else {
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [user, guestId, cartItems, navigate, isCheckoutRedirect, dispatch]);

    const handleSumbit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }))
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Form Card */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-gray-100">
                <form
                    onSubmit={handleSumbit}
                    className="w-full max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 transition-all transform hover:shadow-2xl"
                >


                    <div className="text-center mb-10">
                        <h1 className="font-serif font-bold text-3xl mb-6 text-gray-900 tracking-wide">SLV</h1>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Hey there <span className="text-black inline-block font-serif">♡</span> !</h2>
                        <p className="text-gray-500 text-sm tracking-wide">Enter your username and password to Login</p>
                    </div>

                    <div className="space-y-6">
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm bg-white hover:bg-gray-50 text-base"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-3.5 rounded-lg font-bold tracking-widest hover:bg-gray-900 transform transition-all shadow-md hover:shadow-lg text-sm uppercase"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="mt-6 text-center text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                    {/* Divider */}
                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="h-px bg-gray-300 w-full"></div>
                        <span className="text-gray-500 text-sm font-medium">OR</span>
                        <div className="h-px bg-gray-300 w-full"></div>
                    </div>

                    {/* Google Login Provider */}
                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                dispatch(googleLoginUser({ credential: credentialResponse.credential }));
                            }}
                            onError={() => console.log('Google Login Failed')}
                        />
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-black font-semibold hover:underline transition-all ml-1">
                                Register now
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100 p-4">
                <div className="w-full h-[85vh] relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                    <img
                        src={login}
                        alt="Login to Account"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-white p-12 text-center">
                        <h3 className="text-4xl font-serif font-bold mb-4 tracking-wider">Elegance Redefined</h3>
                        <p className="text-lg text-white/80 max-w-md font-light tracking-wide">
                            Discover the finest collection of traditional and modern fashion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;