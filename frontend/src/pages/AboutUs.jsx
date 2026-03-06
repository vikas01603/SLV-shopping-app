// src/pages/AboutUs.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-dark pt-20 pb-12 transition-colors duration-300 flex flex-col justify-center">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto space-y-16"
                >
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark dark:text-white uppercase tracking-tight">Our Story</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Founded with a passion for elegant design and timeless fashion, SLV has grown from a humble boutique to a beloved brand dedicated to style and quality.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white uppercase">Craftsmanship & Quality</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                We believe in the power of well-made clothing. Every piece in our collection is carefully curated and crafted with attention to detail. From selecting the finest fabrics to ensuring the perfect fit, our commitment to quality is unwavering.
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-neutral-800 aspect-square rounded-2xl flex items-center justify-center p-8 shadow-inner overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Craftsmanship" className="w-full h-full object-cover rounded-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                        <div className="bg-gray-100 dark:bg-neutral-800 aspect-square rounded-2xl flex items-center justify-center p-8 shadow-inner overflow-hidden md:order-last">
                            <img src="https://images.unsplash.com/photo-1528304270437-714a2d6fbb6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Sustainability" className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white uppercase">Sustainability First</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                Fashion should not come at the cost of our planet. We are constantly exploring new ways to reduce our environmental footprint, using sustainable materials and ethical manufacturing processes to bring you clothes you can feel good about wearing.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutUs;
