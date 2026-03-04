import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, deleteProduct } from '../../redux/slices/adminProductsSlice';
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown } from "react-icons/fa";

const ProductManagement = () => {

    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.adminProducts);

    const [searchTerm, setSearchTerm] = React.useState("");

    useEffect(() => {
        dispatch(fetchAdminProducts());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            dispatch(deleteProduct(id));
        }
    };

    const [sortOption, setSortOption] = React.useState("newest");

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (sortOption === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortOption === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortOption === "highPrice") {
            return b.price - a.price;
        } else if (sortOption === "lowPrice") {
            return a.price - b.price;
        }
        return 0;
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Product Catalog</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-widest">
                        Inventory & listings management
                    </p>
                </div>
                <Link
                    to="/admin/products/create"
                    className="bg-black text-white py-2.5 px-5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                >
                    <FaPlus size={12} /> Add Product
                </Link>
            </div>

            {/* Search bar & Sorting - Compact */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                    <FaSearch className="text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-medium text-black placeholder:text-gray-400"
                    />
                </div>

                <div className="w-full md:w-56 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 relative">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Sort:</span>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-bold text-black appearance-none cursor-pointer z-10"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highPrice">Highest Price</option>
                        <option value="lowPrice">Lowest Price</option>
                    </select>
                    <FaChevronDown className="absolute right-4 text-gray-400" size={12} />
                </div>
            </div>

            {/* Content Table - Perfect Symmetry */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                    </div>
                ) : error ? (
                    <div className="p-8 text-red-600 text-sm font-medium">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold border-b border-gray-50">
                                    <th className="py-6 px-10 w-1/4">Product Identity</th>
                                    <th className="py-6 px-10 w-1/4">Price Point</th>
                                    <th className="py-6 px-10 w-1/4">SKU</th>
                                    <th className="py-6 px-10 text-right w-1/4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product._id} className="group hover:bg-gray-50/20 transition-colors">
                                            <td className="py-6 px-10 text-sm font-bold text-black truncate">
                                                {product.name}
                                            </td>
                                            <td className="py-6 px-10 text-sm font-black text-black whitespace-nowrap">
                                                ₹ {product.price.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-6 px-10 font-mono text-[11px] text-gray-400 font-bold truncate">
                                                {product.sku}
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        to={`/admin/products/${product._id}/edit`}
                                                        className="p-3 bg-gray-50 text-black border border-gray-100 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all shadow-sm group/btn"
                                                        title="Edit Product"
                                                    >
                                                        <FaEdit size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                                                        title="Delete Product"
                                                    >
                                                        <FaTrash size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-gray-400 text-sm font-medium italic">
                                            The catalog is currently empty.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default ProductManagement;