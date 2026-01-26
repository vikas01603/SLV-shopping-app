import React from 'react';
import { useState } from 'react';
import { useRef, useEffect} from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom'; 
import axios from 'axios';

const NewArrivals = () => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0); //indexing dor the dotted scroll 
    const [isPaused, setIsPaused] = useState(false); // auto scroll pausing when user interacts with the scroll

    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
                );

                setNewArrivals(Array.isArray(response.data) ? response.data : []); // ✅ FIX
            } catch (error) {
                console.log("Error fetching new arrivals:", error);
                setNewArrivals([]); // safety fallback
            }
        };
        fetchNewArrivals();
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft)
    }
    const handleMouseMove = (e) => {
        if(!isDragging) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - startX;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }
    const handleMouseUpOrLeave = (e) => {
        setIsDragging(false);
    }  

    const scroll = (direction) => {
        const scrollAmount = direction === "left" ? -600 : 600;
        scrollRef.current.scrollBy({left: scrollAmount, behavior: "smooth"})
    }

    //update scroll buttons
    const updateScrollButtons = () => {
        const container = scrollRef.current;
        
        if (container){
            const leftScroll = container.scrollLeft;
            const rightScrollable = container.scrollWidth > leftScroll + container.clientWidth;

            setCanScrollLeft(leftScroll > 0);
            setCanScrollRight(rightScrollable);
        }

    };

    // Function to sync dots with the scroll position
    const handleScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const percentage = scrollLeft / maxScroll;     
            // This maps any number of items to index 0, 1, or 2
            setActiveIndex(Math.round(percentage * 2));
        }
    };


    useEffect(() => {
    // Only start the interval if the user is NOT dragging and NOT hovering
    if (!isDragging && !isPaused) {
        const interval = setInterval(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            
            // If we are at the end, go back to start, otherwise scroll by one view width
            if (scrollLeft >= maxScroll - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
            } else {
            scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
            }
        }
        }, 2000); // 2 seconds

        return () => clearInterval(interval);
    }
    }, [isDragging, isPaused, newArrivals]);

  return (
    <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto text-center mb-10 relative">
            <h2 className="text-3xl font-bold mb-4">
                Explore New Arrivals
            </h2>
            <p className="text-lg text-gray-600 mb-8">
                Discover the latest styles straight off the release,freshly added to keep your traditional game on top.
            </p>
            {/**Scroll Buttons bro */}
            <div className="absolute right-0 bottom-[-30px] flex space-x-2">

                <button onClick={() => scroll("left")} disabled={!canScrollLeft} className={`p-2 rounded border ${canScrollLeft ? "bg-white text-black" : "bg-gray-200 text-gray-400 cursor-not-allowed"} `}>
                    <FiChevronLeft className="text-2xl" />
                </button>

                <button onClick={() => scroll("right")}  disabled={!canScrollRight} className={`p-2 rounded border ${canScrollRight ? "bg-white text-black" : "bg-gray-200 text-gray-400 cursor-not-allowed"} `}>
                    <FiChevronRight className="text-2xl" />
                </button>
            </div>
        </div>

        {/** Container */}
        <div className="relative group">
            {/** Scrollable Content */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onMouseEnter={() => setIsPaused(true)} 
                className={`container mx-auto flex space-x-6 overflow-x-auto scroll-smooth hide-scrollbar ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={(e) => {
                    handleMouseUpOrLeave(e); // 1. Handle drag logic
                    setIsPaused(false);      // 2. Resume auto-scroll
                }}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
        {newArrivals.map((product) => (
            <div key={product._id} className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative flex-shrink-0">
                <img 
                    src={product.images[0]?.url} 
                    alt={product.images[0]?.altText || product.name}
                    className="w-full h-[500px] object-cover rounded-lg" 
                    draggable="false"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-opacity-50 backdrop-blur-md text-white p-4 rounded-b-lg">
                    <Link to={`/product/${product._id}`} className="block">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="mt-1">₹ {product.price}</p>
                    </Link>
                </div>
            </div>
        ))}
    </div>

    {/** The Dotted "Scrollbar" */}
    {/** Fixed 3-Dot Navigation */}
    <div className="flex justify-center space-x-2 mt-6">
        {[0, 1, 2].map((dotIndex) => (
            <button
                key={dotIndex}
                onClick={() => {
                    const { scrollWidth, clientWidth } = scrollRef.current;
                    const maxScroll = scrollWidth - clientWidth;
                    // Target: 0% for dot 0, 50% for dot 1, 100% for dot 2
                    const targetScroll = maxScroll * (dotIndex / 2);
                    
                    scrollRef.current.scrollTo({
                        left: targetScroll,
                        behavior: "smooth",
                    });
                }}
                className={`transition-all duration-300 rounded-full ${
                    activeIndex === dotIndex 
                    ? "bg-black w-6 h-2"  // Active dot (pill)
                    : "bg-gray-300 w-2 h-2" // Inactive dot
                }`}
            />
            ))}
        </div>
    </div>
    </section>
  );
};

export default NewArrivals;