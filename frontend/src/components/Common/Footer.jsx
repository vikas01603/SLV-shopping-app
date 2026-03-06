import React from 'react';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { TbBrandMeta } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from "framer-motion";

const Footer = () => {
    const footerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <footer className="bg-neutral-light dark:bg-neutral-dark border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-6 lg:px-12 py-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 min-w-full"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={footerVariants}
                >

                    {/* Newsletter Section */}
                    <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-1">
                        <h3 className="text-xl font-bold text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">Newsletter</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                            Be the first to hear about our new collections, exclusive events, and online offers.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-neutral-dark dark:text-white"
                            />
                            <button
                                type="submit"
                                className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-sm font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors whitespace-nowrap w-full"
                            >
                                Subscribe
                            </button>
                        </form>
                    </motion.div>

                    {/* Shop Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-bold text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">Shop</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link to="/collections/all" className="hover:text-black dark:hover:text-white transition-colors">Sarees</Link></li>
                            <li><Link to="/collections/all" className="hover:text-black dark:hover:text-white transition-colors">Dresses</Link></li>
                            <li><Link to="/collections/all" className="hover:text-black dark:hover:text-white transition-colors">Materials</Link></li>
                            <li><Link to="/collections/all" className="hover:text-black dark:hover:text-white transition-colors">Top Wear</Link></li>
                        </ul>
                    </motion.div>

                    {/* Support Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-bold text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">Support</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link to="/about-us" className="hover:text-black dark:hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/faqs" className="hover:text-black dark:hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link to="/features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link></li>
                        </ul>
                    </motion.div>
                    {/* Follow Us & Contact */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-bold text-neutral-dark dark:text-white mb-6 uppercase tracking-wide">Follow Us</h3>
                        <div className="flex items-center space-x-5 mb-8">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <TbBrandMeta className="h-6 w-6" />
                            </a>
                            <a href="https://www.instagram.com/slv_ifashions?igsh=cHB0emV4ZXFvNXZ6" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <IoLogoInstagram className="h-6 w-6" />
                            </a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <RiTwitterXLine className="h-5 w-5" />
                            </a>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-neutral-dark dark:text-white mb-2 uppercase">WhatsApp Support</h4>
                            <a
                                href="https://wa.me/917337847118"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-[#25D366] transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <FaWhatsapp className="h-4 w-4" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-center items-center">
                    <p className="text-gray-500 dark:text-gray-500 text-sm tracking-wide text-center">
                        © 2026 SLV. All rights reserved. Built with precision.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;