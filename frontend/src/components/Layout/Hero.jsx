import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "../../assets/hero-image.jpg";

const Hero = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative w-full md:h-screen overflow-hidden bg-neutral-900">
      {/* Background Image */}
      <div className="relative md:absolute inset-0 w-full h-auto md:h-full">
        <img
          src={heroImg}
          alt="Shopping Hero"
          className="w-full h-auto md:h-full md:object-cover object-contain"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center text-white px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          variants={itemVariants}
          whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(255,255,255,0.5)" }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-4xl sm:text-6xl lg:text-9xl font-bold tracking-tight mb-4 sm:mb-6 uppercase cursor-default"
        >
          Tradition <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-50 to-white">Ready</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-lg sm:max-w-2xl font-light tracking-wide px-4"
        >
          Explore our traditional outfits with worldwide shipping.
        </motion.p>

        <motion.div
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              to="/collections/all"
              className="bg-white text-black px-12 py-4 rounded-full font-semibold text-lg shadow-2xl hover:bg-neutral-dark hover:text-white transition-all duration-300 transform border border-transparent hover:border-white"
            >
              Shop Now
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
