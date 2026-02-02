import React, { useEffect, useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const NewArrivals = () => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/products/new-arrivals`
                );
                setNewArrivals(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
                setNewArrivals([]);
            }
        };
        fetchNewArrivals();
    }, []);

    const updateScrollButtons = () => {
        const container = scrollRef.current;
        if (container) {
            const leftScroll = container.scrollLeft;
            const rightScrollable = container.scrollWidth > leftScroll + container.clientWidth;
            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollable);
        }
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', updateScrollButtons);
            updateScrollButtons();
            return () => container.removeEventListener('scroll', updateScrollButtons);
        }
    }, [newArrivals]);

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = direction === "left" ? -container.offsetWidth / 2 : container.offsetWidth / 2;
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    // Drag to Scroll Logic
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <section className="py-24 px-4 lg:px-8 bg-neutral-50">
            <div className="container mx-auto relative mb-12">
                <div className="flex flex-col items-center justify-between gap-4 mb-10 relative">
                    <div className="text-center max-w-2xl">
                        <h2 className="text-4xl font-bold mb-4 font-serif tracking-tight">
                            Explore New Arrivals
                        </h2>
                        <p className="text-gray-500 text-lg font-light tracking-wide">
                            Fresh off the loom. Be the first to wear our latest handcrafted masterpieces.
                        </p>
                    </div>
                    {/* Desktop Navigation Buttons */}
                    <div className="absolute right-0 bottom-2 hidden md:flex gap-3">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className={`p-3 rounded-full border border-gray-300 transition-all duration-300 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white hover:border-black"}`}
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className={`p-3 rounded-full border border-gray-300 transition-all duration-300 ${!canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white hover:border-black"}`}
                        >
                            <FiChevronRight className="text-xl" />
                        </button>
                    </div>
                </div>

                {/** Scrollable Container */}
                <div
                    ref={scrollRef}
                    className={`flex space-x-6 overflow-x-auto pb-8 hide-scrollbar ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {newArrivals.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative flex-shrink-0"
                        >
                            <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                                <div className="relative overflow-hidden h-[500px] rounded-lg mb-4 bg-gray-100">
                                    <img
                                        src={product.images[0]?.url}
                                        alt={product.images[0]?.altText || product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        draggable="false"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <Link
                                            to={`/product/${product._id}`}
                                            className="bg-white text-black text-xs font-bold px-3 py-2 rounded-full shadow-md hover:bg-black hover:text-white uppercase tracking-wider"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h4 className="font-serif font-bold text-xl text-gray-900 truncate mb-1">
                                        {product.name}
                                    </h4>
                                    <p className="text-lg font-bold text-gray-900">₹ {product.price}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {newArrivals.length === 0 && (
                        <div className="w-full text-center py-20 text-gray-400">
                            Loading new arrivals...
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;