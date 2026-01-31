import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../redux/slices/wishlistSlice'; // Ensure toggleWishlist is exported
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaShoppingCart, FaChevronRight } from 'react-icons/fa';
import { toast } from 'sonner';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { wishlist, loading, error } = useSelector((state) => state.wishlist);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemoveFromWishlist = (productId) => {
        dispatch(toggleWishlist({ productId }));
        toast.success("Product removed from wishlist");
    };

    if (loading && wishlist.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <p className="text-red-500 text-lg">Error: {error}</p>
                    <button
                        onClick={() => dispatch(fetchWishlist())}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex mb-8 text-sm text-gray-500 items-center">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <FaChevronRight className="mx-2 text-xs" />
                    <span className="text-black font-medium">Wishlist</span>
                </nav>

                <div className="text-left mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-500">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>

                {wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">💔</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Browsing around and saving items you like will show them here.
                        </p>
                        <Link
                            to="/collections/all"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-black hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
                        >
                            Start Shopping
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence>
                            {wishlist.map((product) => (
                                <motion.div
                                    key={product._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col"
                                >
                                    <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
                                        <img
                                            src={product?.images?.[0]?.url || "https://via.placeholder.com/400"}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {!product.countInStock && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                Out of Stock
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <Link to={`/product/${product._id}`} className="block mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-gray-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹ {product.price?.toLocaleString()}
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹ {product.originalPrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex gap-3">
                                            {/* We can't easily add to cart here because we need size/color. 
                                                So we link to product page for now, or just provide a remove button.
                                                Ideally we might open a modal to select size, but Keep It Simple:
                                                View Product is better.
                                            */}
                                            <Link
                                                to={`/product/${product._id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
                                            >
                                                <FaShoppingCart className="text-xs" /> View
                                            </Link>

                                            <button
                                                onClick={() => handleRemoveFromWishlist(product._id)}
                                                className="flex-none flex items-center justify-center w-11 h-11 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                title="Remove from Wishlist"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
