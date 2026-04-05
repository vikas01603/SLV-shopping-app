import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchProductDetails, fetchSimilarProducts } from '../../redux/slices/productsSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaHeart, FaRegHeart, FaShare, FaChevronRight, FaMinus, FaPlus, FaRulerHorizontal, FaPalette } from "react-icons/fa";

const ProductDetails = ({ productId, hideBreadcrumbs = false, isEmbedded = false }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct, loading, error, similarProducts } = useSelector((state) => state.products);
    const { user, guestId } = useSelector((state) => state.auth);
    const { wishlist } = useSelector((state) => state.wishlist);

    const [mainImage, setMainImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [isLiked, setIsLiked] = useState(false);

    const productColors = {
        "Red": "#EF4444",
        "Blue": "#3B82F6",
        "Yellow": "#EAB308",
        "Black": "#171717",
        "Navy Blue": "#1E3A8A",
        "Burgundy": "#7F1D1D",
        "Light Blue": "#BAE6FD",
        "Dark Wash": "#1E293B",
        "Tropical Print": "#F97316",
        "Navy Palms": "#1E3A8A",
        "White": "#FFFFFF",
        "Gray": "#6B7280",
        "Heather Gray": "#9CA3AF",
        "Olive": "#4D7C0F",
        "Charcoal": "#374151",
        "Dark Green": "#14532D",
        "Navy": "#172554",
        "Beige": "#F5F5DC",
        "Khaki": "#FDE047",
        "Pink": "#F9A8D4",
        "Brown": "#78350F",
    };

    const productFetchId = productId || id;

    // Check if the product is a Saree to hide size selection
    const isSaree = selectedProduct && (
        selectedProduct.name?.toLowerCase().includes("saree") ||
        selectedProduct.category?.toLowerCase().includes("saree") ||
        selectedProduct.type?.toLowerCase().includes("saree") ||
        selectedProduct.description?.toLowerCase().includes("saree")
    );

    useEffect(() => {
        if (productFetchId) {
            dispatch(fetchProductDetails(productFetchId));
            dispatch(fetchSimilarProducts({ id: productFetchId }));
        }
    }, [dispatch, productFetchId]);

    useEffect(() => {
        if (selectedProduct?.images?.length > 0) {
            setMainImage(selectedProduct.images[0].url);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (user && wishlist.length > 0 && selectedProduct) {
            const isProductInWishlist = wishlist.some(item => item._id === selectedProduct._id);
            setIsLiked(isProductInWishlist);
        } else {
            setIsLiked(false);
        }
    }, [wishlist, selectedProduct, user]);

    const handleQuantityChange = (action) => {
        if (action === "plus") setQuantity((prev) => prev + 1);
        if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = () => {
        if (!selectedColor) {
            toast.error("Please select a color preferred.", { duration: 1500 });
            return;
        }

        // Only validate size if it's NOT a saree
        if (!isSaree && !selectedSize) {
            toast.error("Please select a size.", { duration: 1500 });
            return;
        }

        setIsButtonDisabled(true);

        dispatch(
            addToCart({
                _id: productFetchId,
                name: selectedProduct?.name,
                price: selectedProduct?.price,
                image: mainImage,
                size: isSaree ? "Free Size" : selectedSize, // Default for Sarees
                color: selectedColor,
                quantity,
                userId: user?._id,
                guestId,
            })
        );

        toast.success("Successfully added to Cart!", { duration: 1500 });
        setIsButtonDisabled(false);
    };

    const handleWishlistToggle = () => {
        if (!user) {
            toast.error("Please login to add to wishlist");
            return;
        }
        dispatch(toggleWishlist({
            productId: selectedProduct._id,
            product: selectedProduct
        }));
        setIsLiked(!isLiked); // Optimistic UI update
        if (isLiked) {
            toast.success("Removed from Wishlist");
        } else {
            toast.success("Added to Wishlist");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
                    <p className="text-red-500 font-medium">Error loading product: {error}</p>
                    <Link to="/" className="mt-4 inline-block text-black underline text-sm hover:text-gray-600">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isEmbedded ? 'w-full' : 'bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8'} font-sans`}>
            {selectedProduct && (
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    {!hideBreadcrumbs && (
                        <nav className="flex mb-8 text-sm text-gray-500 items-center animate-fadeIn">
                            <Link to="/" className="hover:text-black transition-colors">Home</Link>
                            <FaChevronRight className="mx-2 text-xs" />
                            <Link to="/collections/all" className="hover:text-black transition-colors">Shop</Link>
                            <FaChevronRight className="mx-2 text-xs" />
                            <span className="text-black font-medium truncate max-w-[200px]">{selectedProduct.name}</span>
                        </nav>
                    )}

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-12 p-6 md:p-10">

                            {/* Product Gallery Section */}
                            <div className="space-y-6">
                                {/* Main Image */}
                                <motion.div
                                    className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 group"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {mainImage && (
                                        <img
                                            src={mainImage}
                                            alt={selectedProduct.name}
                                            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                                        />
                                    )}
                                    <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="bg-white/90 backdrop-blur p-2.5 rounded-full shadow-sm hover:bg-black hover:text-white transition-all">
                                            <FaShare size={16} />
                                        </button>
                                        <button onClick={handleWishlistToggle} className={`bg-white/90 backdrop-blur p-2.5 rounded-full shadow-sm hover:scale-110 transition-all ${isLiked ? 'text-red-500' : 'text-black hover:text-red-500'}`}>
                                            {isLiked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Thumbnails */}
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {selectedProduct.images.length > 1 && selectedProduct.images.map((image, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setMainImage(image.url)}
                                            className={`relative flex-shrink-0 h-24 w-24 overflow-hidden rounded-xl border-2 transition-all ${mainImage === image.url ? 'border-black ring-1 ring-black ring-offset-2' : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {image.url && (
                                                <img
                                                    src={image.url}
                                                    alt={`View ${index + 1}`}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info Section */}
                            <div className="flex flex-col pt-2 lg:pt-0">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase mb-2">
                                        {selectedProduct.brand || "SLV Collections"}
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                                        {selectedProduct.name}
                                    </h1>

                                    <div className="flex items-baseline gap-4 mb-6 border-b border-gray-100 pb-6">
                                        <p className="text-3xl font-bold text-gray-900">
                                            ₹ {selectedProduct.price.toLocaleString('en-IN')}
                                        </p>
                                        {selectedProduct.originalPrice && (
                                            <>
                                                <p className="text-lg text-gray-400 line-through">
                                                    ₹ {selectedProduct.originalPrice.toLocaleString('en-IN')}
                                                </p>
                                                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide">
                                                    Sale
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Description Preview */}
                                    <p className="text-gray-600 leading-relaxed mb-8">
                                        {selectedProduct.description}
                                    </p>

                                    {/* Selection Controls */}
                                    <div className="space-y-8 mb-10">
                                        {/* Colors */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FaPalette className="text-gray-400 text-sm" /> Color
                                                </h3>
                                                <span className="text-gray-500 text-sm font-medium">{selectedColor || 'Select a color'}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {selectedProduct.colors.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            setSelectedColor(color);
                                                            const colorIndex = selectedProduct.colors.indexOf(color);
                                                            if (colorIndex !== -1 && selectedProduct.images[colorIndex]) {
                                                                setMainImage(selectedProduct.images[colorIndex].url);
                                                            }
                                                        }}
                                                        className={`group relative h-10 w-10 rounded-full shadow-sm ring-1 ring-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${selectedColor === color ? 'bg-white ring-2 ring-black ring-offset-2 scale-110' : ''}`}
                                                        title={color}
                                                    >
                                                        <span
                                                            className="absolute inset-1 rounded-full border border-black/5"
                                                            style={{
                                                                backgroundColor: productColors[color] || color.toLowerCase(),
                                                                filter: color === 'White' ? 'brightness(0.95)' : 'none'
                                                            }}
                                                        />
                                                        {selectedColor === color && (
                                                            <span className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm ring-1 ring-black/10" />
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sizes - Hidden for Sarees */}
                                        {!isSaree && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        <FaRulerHorizontal className="text-gray-400 text-sm" /> Size
                                                    </h3>
                                                    <button className="text-xs font-medium text-gray-500 underline hover:text-black">
                                                        Size Guide
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                    {selectedProduct.sizes.map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() => setSelectedSize(size)}
                                                            className={`py-2.5 text-sm font-medium rounded-xl border transition-all ${selectedSize === size
                                                                ? 'bg-black text-white border-black shadow-md'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:text-black'
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity & CTA */}
                                        <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-5">
                                            <div className="inline-flex items-center justify-between border border-gray-200 rounded-xl bg-gray-50 p-1 w-full sm:w-auto min-w-[140px]">
                                                <button
                                                    onClick={() => handleQuantityChange("minus")}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all disabled:opacity-50"
                                                    disabled={quantity <= 1}
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange("plus")}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-black hover:shadow-md transition-all"
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isButtonDisabled}
                                                className={`flex-1 bg-black text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isButtonDisabled ? 'opacity-70 cursor-wait' : ''}`}
                                            >
                                                <FaShoppingCart className={`${isButtonDisabled ? 'hidden' : 'animate-bounce'}`} />
                                                {isButtonDisabled ? "Adding to Cart..." : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Characteristics / Details Tabs */}
                                    <div className="mt-8">
                                        <div className="flex gap-6 border-b border-gray-200 mb-6">
                                            <button
                                                onClick={() => setActiveTab('details')}
                                                className={`pb-3 text-sm font-bold tracking-wide uppercase border-b-2 transition-all ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Product Details
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('shipping')}
                                                className={`pb-3 text-sm font-bold tracking-wide uppercase border-b-2 transition-all ${activeTab === 'shipping' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Shipping & Returns
                                            </button>
                                        </div>

                                        <div className="min-h-[150px]">
                                            {activeTab === 'details' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                                    <div className="bg-gray-50 rounded-2xl p-6">
                                                        <table className="w-full text-sm">
                                                            <tbody className="divide-y divide-gray-100">
                                                                <tr className="flex justify-between py-3">
                                                                    <td className="text-gray-500 font-medium">Brand</td>
                                                                    <td className="font-bold text-gray-900">{selectedProduct.brand}</td>
                                                                </tr>
                                                                <tr className="flex justify-between py-3">
                                                                    <td className="text-gray-500 font-medium">Material</td>
                                                                    <td className="font-bold text-gray-900">{selectedProduct.material}</td>
                                                                </tr>
                                                                <tr className="flex justify-between py-3">
                                                                    <td className="text-gray-500 font-medium">Category</td>
                                                                    <td className="font-bold text-gray-900">{selectedProduct.category}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {activeTab === 'shipping' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600 text-sm leading-relaxed">
                                                    <p className="mb-4">
                                                        We offer free shipping on all orders over ₹2000. All orders are processed within 1-2 business days.
                                                    </p>
                                                    <p>
                                                        Returns are accepted within 7 days of delivery for all unworn items with original tags attached.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Products */}
                    {!isEmbedded && (
                        <div className="mt-20 mb-16">
                            <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">You May Also Like</h2>
                            <ProductGrid products={similarProducts} loading={loading} error={error} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetails;