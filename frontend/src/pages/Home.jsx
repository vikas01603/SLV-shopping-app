import React, { useEffect, useState } from 'react';
import Hero from '../components/Layout/Hero';
import TypeColletionSection from '../components/Products/TypeColletionSection';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import ProductGrid from '../components/Products/ProductGrid';
import FeaturedCollection from '../components/Products/FeaturedCollection';
import FeaturesSection from '../components/Products/FeaturesSection';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProductsByFilters} from '../redux/slices/productsSlice';
import axios from 'axios';

const Home = () => {
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state) => state.products);
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
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
        setBestSellerProducts(response.data);
      } catch (error) {
        console.error("Error fetching best seller products", error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <div>
        <Hero />
        <TypeColletionSection />
        <NewArrivals />
        
        {/**Best Seller */}
        <h2 className="text-3xl text-center font-bold mb-4">
          Best Seller
        </h2>
        {bestSellerProduct ? (<ProductDetails productId={bestSellerProduct._id}/>) : (<p className ="text-center">Loading best seller products... </p>)}
        <div className="container mx-auto">
          <h2 className="text-3xl text-center font-bold mb-4">
            Top Dresses Collection
          </h2>
          <ProductGrid products={products} loading={loading} error={error}/>
        </div>
        <FeaturedCollection/>
        <FeaturesSection/>
    </div>
  );
};

export default Home;