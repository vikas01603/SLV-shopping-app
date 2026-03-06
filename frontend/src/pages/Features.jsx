// src/pages/Features.jsx
import React from 'react';
import { motion } from 'framer-motion';

const featuresList = [
    {
        title: "Premium Materials",
        description: "We source only the finest fabrics and materials to ensure every piece feels luxurious and lasts longer.",
        icon: (
            <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
    {
        title: "Fast Global Delivery",
        description: "Get your style delivered to your doorstep quickly, no matter where you are in the world.",
        icon: (
            <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5z" />
            </svg>
        )
    },
    {
        title: "24/7 Support",
        description: "Our dedicated support team is always available to help you with sizing, orders, or any inquiries.",
        icon: (
            <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        )
    },
    {
        title: "Secure Checkout",
        description: "Experience a seamless and fully encrypted checkout process for your peace of mind.",
        icon: (
            <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        )
    }
];

const Features = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-dark pt-20 pb-12 transition-colors duration-300">
            <div className="container mx-auto px-6 lg:px-12 pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16 space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark dark:text-white uppercase tracking-tight">Why Choose Us</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Discover the benefits of shopping with SLV. We are dedicated to providing you with the best experience possible.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuresList.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="p-8 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="w-16 h-16 bg-white dark:bg-neutral-700 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
