import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser, updateUser, fetchUsers, createUser } from '../../redux/slices/adminSlice';
import { fetchAllOrders } from '../../redux/slices/adminOrderSlice';
import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaTrash, FaShieldAlt, FaEnvelope, FaUser, FaChevronDown } from "react-icons/fa";
import AdminUserDetails from './AdminUserDetails';

const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { users, loading, error } = useSelector((state) => state.admin);
    const { orders } = useSelector((state) => state.adminOrders);

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && user.role === "admin") {
            dispatch(fetchUsers());
            dispatch(fetchAllOrders());
        }
    }, [user, dispatch]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createUser(formData));
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "customer",
        });
    };

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUser({ id: userId, role: newRole }));
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId));
        }
    };

    const [sortOption, setSortOption] = useState("newest");
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredUsers = [...users].sort((a, b) => {
        if (sortOption === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortOption === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
    }).map(u => {
        // Find user's latest order to extract phone and address
        const userOrders = orders?.filter(o => o.user?._id === u._id) || [];
        const latestOrder = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        return {
            ...u,
            // Only override if the user model doesn't already have them
            phone: u.phone || latestOrder?.shippingAddress?.phone || u.phone, 
            address: u.address?.address ? u.address : latestOrder?.shippingAddress || u.address
        };
    });

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Header Section - Compact */}
            <div className="px-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">User Administration</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-widest">
                        Account management & access level control
                    </p>
                </div>
                {/* Sorting Dropdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 relative min-w-[200px]">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider pl-2">Sort:</span>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-bold text-black appearance-none cursor-pointer z-10"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    <FaChevronDown className="absolute right-3 text-gray-400" size={10} />
                </div>
            </div>

            {/* New User Form - Compact Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-black text-white rounded-lg shadow-md">
                            <FaUserPlus size={14} />
                        </div>
                        <h3 className="text-lg font-bold text-black">New User</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Full Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                                    placeholder="Name" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                                    placeholder="Email" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                                placeholder="Password" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all font-bold text-[11px] uppercase tracking-wider text-gray-600 appearance-none cursor-pointer flex-grow"
                                    required>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-bold text-transparent select-none uppercase tracking-[0.15em] px-1">Action</label>
                                <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-md active:scale-95 flex-grow">
                                    Create
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* User Table - Perfect Symmetry */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                    </div>
                )}
                {error && <div className="p-8 bg-red-50 border-b border-red-100 text-red-600 text-sm font-medium">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold border-b border-gray-50">
                                <th className="py-6 px-10 w-1/4">User Identity</th>
                                <th className="py-6 px-10 w-1/4">Email Address</th>
                                <th className="py-6 px-10 w-1/4">Privileges</th>
                                <th className="py-6 px-10 text-right w-1/4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u) => (
                                <tr 
                                    key={u._id} 
                                    onClick={() => setSelectedUser(u)}
                                    className="group hover:bg-gray-50/20 transition-colors cursor-pointer"
                                >
                                    <td className="py-6 px-10 text-sm">
                                        <div className="flex items-center gap-4 truncate">
                                            <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-[12px] group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 flex-shrink-0 shadow-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-bold text-black truncate">{u.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-xs text-gray-400 font-bold truncate">
                                        {u.email}
                                    </td>
                                    <td className="py-6 px-10 text-xs">
                                        <div className="flex items-center gap-3">
                                            <FaShieldAlt className={u.role === 'admin' ? 'text-black' : 'text-gray-200'} size={14} />
                                            <select 
                                                value={u.role} 
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-transparent outline-none cursor-pointer transition-all ${u.role === 'admin'
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteUser(u._id);
                                            }}
                                            disabled={u._id === user?._id}
                                            className={`p-3 rounded-xl transition-all ${u._id === user?._id
                                                ? "bg-gray-50 text-gray-200 cursor-not-allowed"
                                                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm font-bold active:scale-90"
                                                }`}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <AdminUserDetails 
                        user={selectedUser} 
                        onClose={() => setSelectedUser(null)} 
                        onRoleChange={handleRoleChange}
                        onDeleteUser={handleDeleteUser}
                        currentUser={user}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default UserManagement;