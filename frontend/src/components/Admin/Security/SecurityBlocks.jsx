import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlocks, createBlock, removeBlock } from "../../../redux/slices/securitySlice";
import { FaUnlockAlt, FaBan, FaSearch, FaUserAlt, FaGlobe } from "react-icons/fa";

const SecurityBlocks = () => {
    const dispatch = useDispatch();
    const { blocks } = useSelector((state) => state.security);
    const [formData, setFormData] = useState({ type: "IP", value: "", reason: "", durationHours: 24 });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        dispatch(fetchBlocks());
    }, [dispatch]);

    const handleAddBlock = (e) => {
        e.preventDefault();
        dispatch(createBlock(formData));
        setShowForm(false);
        setFormData({ type: "IP", value: "", reason: "", durationHours: 24 });
    };

    const handleUnblock = (id) => {
        dispatch(removeBlock(id));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    Blocked Entities
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {blocks.length} ACTIVE
                    </span>
                </h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                    + Add Block
                </button>
            </div>

            {showForm && (
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <form onSubmit={handleAddBlock} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <select 
                            className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="IP">IP Address</option>
                            <option value="USER">User ID</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder={formData.type === "IP" ? "e.g. 192.168.1.1" : "User ID (Mongo ID)"} 
                            className="col-span-1 md:col-span-1 text-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            value={formData.value}
                            required
                            onChange={(e) => setFormData({...formData, value: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Reason..." 
                            className="text-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            value={formData.reason}
                            required
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        />
                        <input 
                            type="number" 
                            placeholder="Hours (24 by default)" 
                            className="text-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
                            value={formData.durationHours}
                            onChange={(e) => setFormData({...formData, durationHours: e.target.value})}
                        />
                        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                            Block Access
                        </button>
                    </form>
                </div>
            )}

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blocks.length > 0 ? (
                        blocks.map((block) => (
                            <div key={block._id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${block.type === 'IP' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {block.type === 'IP' ? <FaGlobe title="IP Address" /> : <FaUserAlt title="User ID" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black">{block.value}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">{block.reason}</p>
                                        <p className="text-[10px] font-medium text-red-500 mt-1">
                                            {block.expiresAt ? `Expires: ${new Date(block.expiresAt).toLocaleString()}` : 'Permanent Block'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleUnblock(block._id)}
                                    className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Unblock"
                                >
                                    <FaUnlockAlt />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-6 text-gray-400 text-xs font-medium">
                            No entities are currently blocked.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityBlocks;
