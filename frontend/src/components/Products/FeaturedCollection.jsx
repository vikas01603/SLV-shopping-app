import React from 'react';
import { Link } from 'react-router-dom';
import featured from "../../assets/featured.jpg";
const FeaturedCollection = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center bg-theme-gold rounded-3xl">
            {/**Left content */}
            <div className="lg:w-1/2 p-8 text-center lg:text-left">
                <h2 className="text-lg font-semibold text-[#2B2B2B]">
                    Comfort And Tradition
                </h2>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                    Apparel made for your daily comfort
                </h2>
                <p className="text-lg text-[#2B2B2B] mb-6">
                    Discover high-quality, luxury traditional wear that effortlessly blends fashion with tradition.Designed to make you look heart throbbing very occasion.
                </p>
                <Link to="/collections/all" className="bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800">
                Shop Now
                </Link>
            </div>
            {/**Right Content */}
            <div className="lg:w-1/2">
            <img src={featured} alt="Featurred Collection" 
            className="w-full h-full object-cover lg:rounded-lg lg:rounded-br-3xl" />
            </div>
        </div>
    </section>
  );
};

export default FeaturedCollection;