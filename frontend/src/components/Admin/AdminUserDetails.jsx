import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaShieldAlt, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaTrash } from 'react-icons/fa';

const AdminUserDetails = ({ user, onClose, onRoleChange, onDeleteUser, currentUser }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    if (!user) return null;

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const handleRoleUpdate = (e) => {
        onRoleChange(user._id, e.target.value);
    };

    const handleDelete = () => {
        onDeleteUser(user._id);
        onClose(); // close modal after delete (assuming it succeeds or handles state)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Overlay */}
            <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
            >
                {/* Header (Sticky) */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-black">User Details</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {user._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 space-y-8">
                    {/* Section 1: User Header */}
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-2xl flex-shrink-0 shadow-sm">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-black">{user.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <FaShieldAlt size={10} />
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaUser className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Contact Intelligence</h3>
                        </div>
                        <div className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <FaEnvelope size={10}/> Email Address
                                </span>
                                <span className="font-medium text-black">{user.email || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <FaPhone size={10}/> Phone Number
                                </span>
                                <span className="font-medium text-black">{(user.phone && user.phone.trim() !== "") ? user.phone : "Not provided"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Address Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaMapMarkerAlt className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Registered Location</h3>
                        </div>
                        <div className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm space-y-1">
                            {user.address && (user.address.address || user.address.city || user.address.country || user.address.postalCode) ? (
                                <>
                                    {user.address.address && <p className="font-medium text-black">{user.address.address}</p>}
                                    <p className="text-gray-600">
                                        {[user.address.city, user.address.postalCode].filter(Boolean).join(', ')}
                                    </p>
                                    {user.address.country && <p className="text-gray-600">{user.address.country}</p>}
                                </>
                            ) : typeof user.address === 'string' && user.address.trim() !== '' ? (
                                <p className="font-medium text-black">{user.address}</p>
                            ) : (
                                <p className="text-gray-500 italic text-sm">No address on file.</p>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Activity & Metadata */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaCalendarAlt className="text-gray-400" size={12} />
                            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Account Activity</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Created At</span>
                                <span className="font-medium text-black text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Seen</span>
                                <span className="font-medium text-black text-sm">
                                    {user.lastSeen ? (
                                        <>{new Date(user.lastSeen).toLocaleDateString()} {new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                                    ) : (
                                        "Unknown"
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 sm:col-span-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account State</span>
                                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider w-max ${
                                    user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Admin Actions (Sticky Footer) */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 mt-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Admin Overrides</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                             <select
                                value={user.role}
                                onChange={handleRoleUpdate}
                                disabled={user._id === currentUser?._id}
                                className="w-full bg-gray-50 border border-gray-200 text-sm font-bold text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                            >
                                <option value="customer">Customer Privilege</option>
                                <option value="admin">Admin Privilege</option>
                            </select>
                        </div>

                        <button
                            onClick={handleDelete}
                            disabled={user._id === currentUser?._id}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                user._id === currentUser?._id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm"
                            }`}
                        >
                            <FaTrash size={14} />
                            Terminate Account
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminUserDetails;
