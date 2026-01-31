import React from 'react';
import { FaStar } from "react-icons/fa";

const InfoBanner = () => {
    const text = "Free shipping for orders upto 2000";
    const repeats = 8; // Adjust based on screen width requirements

    return (
        <div className="bg-black text-white py-2 overflow-hidden relative z-40">
            <div className="flex whitespace-nowrap animate-marquee items-center">
                {/* We need enough duplicates to ensure it covers the screen width x2 for the loop */}
                {[...Array(repeats)].map((_, index) => (
                    <div key={index} className="flex items-center mx-4">
                        <span className="text-sm font-medium tracking-widest uppercase">{text}</span>
                        <FaStar className="w-3 h-3 mx-4 text-yellow-400" />
                    </div>
                ))}
                {/* Duplicate set for seamless loop done by having enough repeats and translateX -50%? 
            Wait, if I use -50%, the container must be exactly 200% of the visible width?
            No, -50% of the element's width.
            So I need exactly TWO sets of the SAME content.
            Let's restructure:
        */}
            </div>
        </div>
    );
};

// Refactored to secure seamless loop
const SeamlessInfoBanner = () => {
    const items = [
        "Free shipping for orders upto 2000",
        "Free shipping for orders upto 2000",
        "Free shipping for orders upto 2000",
        "Free shipping for orders upto 2000",
    ];

    return (
        <div className="bg-black text-white py-2 overflow-hidden border-t border-gray-800">
            <div className="flex whitespace-nowrap animate-marquee">
                {/* First Set */}
                <div className="flex items-center shrink-0">
                    {items.map((text, i) => (
                        <div key={`a-${i}`} className="flex items-center px-8">
                            <span className="text-xs md:text-sm font-medium tracking-widest uppercase">{text}</span>
                            <FaStar className="w-2 h-2 ml-8 text-gray-400" />
                        </div>
                    ))}
                </div>
                {/* Second Set (Duplicate) */}
                <div className="flex items-center shrink-0">
                    {items.map((text, i) => (
                        <div key={`b-${i}`} className="flex items-center px-8">
                            <span className="text-xs md:text-sm font-medium tracking-widest uppercase">{text}</span>
                            <FaStar className="w-2 h-2 ml-8 text-gray-400" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SeamlessInfoBanner;
