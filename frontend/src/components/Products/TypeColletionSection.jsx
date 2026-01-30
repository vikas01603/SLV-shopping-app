import React from 'react';
import { motion } from 'framer-motion';
import WomensCollectionImage from  "../../assets/saree-collection.jpeg";
import MensCollectionImage from  "../../assets/MensCollection.png";
import { Link } from 'react-router-dom';

const TypeColletionSection = () => {
    
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

  return (
    <section className="py-16 px-14 md:px-16 lg:px-32 bg-white transition-colors duration-300">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/** Womens Collection */}
            <motion.div 
                className="relative group overflow-hidden rounded-2xl shadow-lg border-none"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeIn}
            >
                <div className="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-square md:aspect-auto md:h-[480px] lg:h-[580px]">
                    <img 
                        src={WomensCollectionImage} 
                        alt="Womens Collection" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
                
                {/* Overlay Content */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none h-2/3"></div>
                <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-xl">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-2 font-heading tracking-wide">Womens Collection</h2>
                    <Link to="/collections/all?gender=Women" className="text-gray-200 hover:text-white transition-colors underline decoration-1 underline-offset-4 text-sm md:text-base font-medium">
                        Shop Collection →
                    </Link>
                </div>
            </motion.div>

            {/** Mens Collection */}
            <motion.div 
                className="relative group overflow-hidden rounded-2xl shadow-lg border-none"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeIn}
            >
                <div className="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-square md:aspect-auto md:h-[480px] lg:h-[580px]">
                    <img 
                        src={MensCollectionImage} 
                        alt="Mens Collection" 
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                </div>

                 {/* Overlay Content */}
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none h-2/3"></div>
                 <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-xl">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-2 font-heading tracking-wide">Mens Collection</h2>
                    <Link to="/collections/all?gender=Men" className="text-gray-200 hover:text-white transition-colors underline decoration-1 underline-offset-4 text-sm md:text-base font-medium">
                        Shop Collection →
                    </Link>
                </div>
            </motion.div>

        </div>
    </section>
  );
};

export default TypeColletionSection;
