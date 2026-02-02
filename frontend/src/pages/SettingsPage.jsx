import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import { FaUser, FaLock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSave } from 'react-icons/fa';
import { toast } from 'sonner';

const SettingsPage = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.order);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!orders || orders.length === 0) {
            dispatch(fetchUserOrders());
        }
    }, [dispatch, orders?.length]);

    useEffect(() => {
        if (user) {
            // Logic: User Profile Address -> User Phone -> Order Address (Latest) as fallback
            const latestOrder = orders && orders.length > 0 ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
            const orderAddress = latestOrder?.shippingAddress;

            setFormData(prevState => ({
                ...prevState,
                name: user.name || '',
                phone: user.phone || orderAddress?.phone || '', // Check user profile first, then order
                address: user.address?.address || orderAddress?.address || '',
                city: user.address?.city || orderAddress?.city || '',
                postalCode: user.address?.postalCode || orderAddress?.postalCode || '',
                country: user.address?.country || orderAddress?.country || '',
            }));
        }
    }, [user, orders]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const updateData = {
            name: formData.name,
            phone: formData.phone,
            address: {
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country
            }
        };

        // Only include password logic if user wants to change it
        if (formData.password) {
            if (!formData.currentPassword) {
                toast.error("Current password is required to set a new password");
                return;
            }
            updateData.password = formData.password;
            updateData.currentPassword = formData.currentPassword;
        }

        try {
            await dispatch(updateProfile(updateData)).unwrap();
            toast.success("Profile updated successfully");
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }));
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : err?.message || "Failed to update profile";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                {/* Account Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaUser className="text-black" /> Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-xs text-gray-400" /> Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                disabled
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaPhone className="text-xs text-gray-400" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-black" /> Default Shipping Address
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Street address, apartment, suite, etc."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaLock className="text-black" /> Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword || ''}
                                onChange={handleChange}
                                placeholder="Required if changing password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password (Optional)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-black/20 transform active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
