import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../redux/slices/adminProductSlice';
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
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

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createProduct(productData));
        navigate('/admin/products');
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-6">Create New Product</h2>
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Product Name</label>
                    <input type="text" name="name"
                        value={productData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Description */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea name="description" value={productData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows={4}
                        required />
                </div>
                {/* Price */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Price</label>
                    <input type="number" name="price" value={productData.price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Count in Stock */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Count in Stock</label>
                    <input type="number" name="countInStock" value={productData.countInStock}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* SKU */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">SKU</label>
                    <input type="text" name="sku" value={productData.sku}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Category */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Category</label>
                    <input type="text" name="category" value={productData.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Brand */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Brand</label>
                    <input type="text" name="brand" value={productData.brand}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Sizes */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Sizes (comma separated)</label>
                    <input type="text" name="sizes" value={productData.sizes.join(",")}
                        onChange={(e) => setProductData({ ...productData, sizes: e.target.value.split(",").map((size) => size.trim()) })}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Colors */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Colors (comma separated)</label>
                    <input type="text" name="colors" value={productData.colors.join(",")}
                        onChange={(e) => setProductData({ ...productData, colors: e.target.value.split(",").map((color) => color.trim()) })}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Collections */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Collections</label>
                    <input type="text" name="collections" value={productData.collections}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required />
                </div>
                {/* Material */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Material</label>
                    <input type="text" name="material" value={productData.material}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {/* Gender */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Gender</label>
                    <select name="gender" value={productData.gender}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Select Gender</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>
                {/* Image Upload */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Upload Image</label>
                    <input type="file" onChange={handleImageUpload} />
                    {uploading && <p>Uploading image...</p>}
                    <div className="flex gap-4 mt-4">
                        {productData.images.map((image, index) => (
                            <div key={index}>
                                <img src={image.url} alt={image.altText || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-md shadow-md" />
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full bg-theme-gold text-black py-2 rounded-md hover:bg-yellow-600 transition-colors">
                    Create Product
                </button>
            </form>
        </div>
    );
};

export default CreateProductPage;
