import React from 'react';
import Hero from '../components/Layout/Hero';
import TypeColletionSection from '../components/Products/TypeColletionSection';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import ProductGrid from '../components/Products/ProductGrid';
import FeaturedCollection from '../components/Products/FeaturedCollection';
import FeaturesSection from '../components/Products/FeaturesSection';

const placeholderProducts = [
  {
        _id:1,
        name:"Product 1",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=11"}],
    },
    {
        _id:2,
        name:"Product 2",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=12"}],
    },
    {
        _id:3,
        name:"Product 3",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=10"}],
    },
    {
        _id:4,
        name:"Product 4",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=7"}],
    },
    {
        _id:5,
        name:"Product 5",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=5"}],
    },
    {
        _id:6,
        name:"Product 6",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=6"}],
    },
    {
        _id:7,
        name:"Product 7",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=7"}],
    },
    {
        _id:8,
        name:"Product 8",
        price:100,
        images:[{
            url:"https://picsum.photos/500/500?random=8"}],
    },
]

const Home = () => {
  return (
    <div>
        <Hero />
        <TypeColletionSection />
        <NewArrivals />
        
        {/**Best Seller */}
        <h2 className="text-3xl text-center font-bold mb-4">
          Best Seller
        </h2>
        <ProductDetails />
        <div className="container mx-auto">
          <h2 className="text-3xl text-center font-bold mb-4">
            Top Dresses Collection
          </h2>
          <ProductGrid products={placeholderProducts}/>
        </div>
        <FeaturedCollection/>
        <FeaturesSection/>
    </div>
  );
};

export default Home;