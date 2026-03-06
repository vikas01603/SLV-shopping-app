// src/pages/FAQs.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unworn and unwashed items with tags attached. Please visit our Returns page to initiate a return request."
    },
    {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days within the contiguous US. Express options are available at checkout."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. International shipping rates and times vary depending on the destination."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you will receive an email with a tracking number and a link to track your package's progress."
    },
    {
        question: "Are your sizes true to fit?",
        answer: "Our sizing generally follows standard measurements. However, we recommend checking our detailed Size Guide linked on every product page for specific measurements."
    }
];

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-dark pt-20 pb-12 transition-colors duration-300">
            <div className="container mx-auto px-6 lg:px-12 max-w-4xl pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-neutral-dark dark:text-white mb-12 uppercase tracking-tight">Frequently Asked Questions</h1>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                                >
                                    <span className="font-semibold text-neutral-900 dark:text-white text-lg">{faq.question}</span>
                                    <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQs;
