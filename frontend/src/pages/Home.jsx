import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Layout/Hero';
import TypeColletionSection from '../components/Products/TypeColletionSection';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import ProductGrid from '../components/Products/ProductGrid';
import FeaturedCollection from '../components/Products/FeaturedCollection';
import FeaturesSection from '../components/Products/FeaturesSection';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../redux/slices/productsSlice';
import axios from 'axios';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProducts] = useState(null);

  useEffect(() => {
    //Fetch productsfor a specific collectino
    dispatch(fetchProductsByFilters({
      gender: "Women",
      category: "Bottom Wear",
      limit: 8,
    }));

    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/products/best-seller`);
        setBestSellerProducts(response.data);
      } catch (error) {
        console.error("Error fetching best seller products", error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <TypeColletionSection />
      <NewArrivals />

      {/**Best Seller Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-0 font-serif tracking-tight">
              Best Seller
            </h2>
            <p className="text-gray-500 text-lg font-light tracking-wide">
              Our most loved pieces, curated just for you.
            </p>
          </div>
          {bestSellerProduct ? (
            <ProductDetails productId={bestSellerProduct._id} hideBreadcrumbs={true} isEmbedded={true} />
          ) : (
            <p className="text-center text-gray-500">Loading best seller products...</p>
          )}
        </div>
      </section>
      {/** Top Dresses Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 font-serif tracking-tight">
              Top Dresses Collection
            </h2>
            <p className="text-gray-500 text-lg font-light tracking-wide">
              Explore the latest trends in womenswear with our curated selection.
            </p>
          </div>
          <ProductGrid products={products} loading={loading} error={error} />
        </div>
      </section>
      <FeaturedCollection />
      <FeaturesSection />
    </motion.div>
  );
};

export default Home;