import React from 'react';
import WomensCollectionImage from  "../../assets/saree-collection.jpeg";
import MensCollectionImage from  "../../assets/MensCollection.png";
import { Link } from 'react-router-dom';
const TypeColletionSection = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto flex flex-col md:flex-row gap-8">
            {/**Saree collection */}
            <div className="relative flex-1">
                <img src={WomensCollectionImage} alt="Womens Collection" className="w-full h-[700px] object-cover"/>
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Womens Collection</h2>
                    <Link to="/collections/all?Collection=Saree" className="text-gray-900 underline">
                        Shop Now
                    </Link>
                </div>
            </div>
            {/**Dress Collection */}
            <div className="relative flex-1">
                <img src={MensCollectionImage} alt="Mens Collection" className="w-full h-[700px] object-center"/>
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Mens Collection</h2>
                    <Link to="/collections/all?Collection=Dress" className="text-gray-900 underline">
                        Shop Now
                    </Link>
                </div>
            </div>
        </div>
    </section>
  );
};

export default TypeColletionSection;
