import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../redux/slices/adminProductsSlice';
import { motion } from "framer-motion";
import { FaCloudUploadAlt, FaTimes, FaPlusCircle } from "react-icons/fa";
import axios from 'axios';

const CreateProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.adminProducts);

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        countInStock: 0,
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: [],
    });

    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(`${API_URL}/api/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    },
                }
            );
            setProductData((prevData) => ({
                ...prevData,
                images: [...prevData.images, { url: data.imageUrl, altText: "" }],
            }));
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const handleDeleteImage = (index) => {
        const updatedImages = productData.images.filter((_, i) => i !== index);
        setProductData((prevData) => ({
            ...prevData,
            images: updatedImages,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createProduct(productData));
        navigate('/admin/products');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-10 py-4 pb-20"
        >
            {/* Header Section */}
            <div className="px-2">
                <h2 className="text-3xl font-bold text-black tracking-tight">Launch New Product</h2>
                <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest">
                    Insert a new product into the Catelog
                </p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                {error && <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Primary Info */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Product Name</label>
                            <input type="text" name="name" value={productData.name} onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-lg"
                                placeholder="e.g. Premium Silk Saree" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Detailed Description</label>
                            <textarea name="description" value={productData.description} onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium text-sm"
                                rows={4} placeholder="Describe the material, craft, and feel..." required />
                        </div>
                    </div>

                    {/* Financials & Stock */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Price (₹)</label>
                        <input type="number" name="price" value={productData.price} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-xl"
                            placeholder="0.00" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Count in Stock</label>
                        <input type="number" name="countInStock" value={productData.countInStock} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-xl"
                            required />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">SKU Code</label>
                        <input type="text" name="sku" value={productData.sku} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-mono text-sm"
                            placeholder="SLV-XXXX-XXXX" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Product Category</label>
                        <input type="text" name="category" value={productData.category} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                            placeholder="e.g. Sarees" required />
                    </div>

                    {/* Branding & Materials */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Brand</label>
                        <input type="text" name="brand" value={productData.brand} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                            placeholder="e.g. SLV Originals" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Material</label>
                        <input type="text" name="material" value={productData.material} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                            placeholder="e.g. Pure Georgette" />
                    </div>

                    {/* Variation Metrics */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Sizes</label>
                        <input type="text" name="sizes" value={productData.sizes.join(",")}
                            onChange={(e) => setProductData({ ...productData, sizes: e.target.value.split(",").map((size) => size.trim()) })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-xs"
                            placeholder="S, M, L, XL" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Color</label>
                        <input type="text" name="colors" value={productData.colors.join(",")}
                            onChange={(e) => setProductData({ ...productData, colors: e.target.value.split(",").map((color) => color.trim()) })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-xs"
                            placeholder="Red, Blue, Gold" required />
                    </div>

                    {/* Classifications */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Collection</label>
                        <input type="text" name="collections" value={productData.collections} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                            placeholder="e.g. Summer 2026" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Gender</label>
                        <select name="gender" value={productData.gender} onChange={handleChange}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-[11px] uppercase tracking-wider text-gray-600 appearance-none cursor-pointer"
                        >
                            <option value="">Select Gender</option>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>

                    {/* Image Assets - Grand Aesthetic */}
                    <div className="md:col-span-2 space-y-6 pt-4 border-t border-gray-50 mt-4">
                        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] group hover:border-black/20 hover:bg-neutral-50 transition-all relative">
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                    <FaCloudUploadAlt size={32} className="text-neutral-400" />
                                </div>
                                <span className="font-bold text-black italic">Click or drag images here</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">High resolution assets preferred</span>
                            </div>
                        </div>

                        {uploading && (
                            <div className="flex items-center gap-3 text-sm font-bold text-blue-500 animate-pulse">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                Synchronizing Media...
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                            {productData.images.map((image, index) => (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={index}
                                    className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm"
                                >
                                    <img src={image.url} alt={image.altText || "Product Image"}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(index)}
                                        className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white rounded-full p-2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                    ><FaTimes /></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 pt-10 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white py-4 px-12 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-3"
                        >
                            <FaPlusCircle size={14} /> {loading ? "Authorizing Content..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default CreateProductPage;
