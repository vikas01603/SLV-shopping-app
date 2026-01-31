import React, { useState } from 'react';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProductsByFilters, setFilters } from '../../redux/slices/productsSlice';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handelSearchToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setFilters({ search: searchTerm }));
        dispatch(fetchProductsByFilters({ search: searchTerm }));
        navigate(`/collections/all?search=${searchTerm}`);
        setIsOpen(false);
    }

    return (
        <div className="flex items-center justify-center">
            {/* Search Toggle Button */}
            <button onClick={handelSearchToggle} className="hover:text-black">
                <HiMagnifyingGlass className="h-6 w-6 text-[#2B2B2B]" />
            </button>

            {/* Search Overlay */}
            <div className={`fixed top-0 left-0 w-full h-24 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-center relative">
                    <form onSubmit={handleSearch} className="w-full max-w-3xl flex items-center relative h-full">
                        {/* Search Icon */}
                        <HiMagnifyingGlass className="h-6 w-6 text-gray-400 absolute left-0 top-1/2 transform -translate-y-1/2" />

                        {/* Input */}
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-gray-200 py-3 pl-10 pr-10 text-xl text-gray-900 focus:border-black focus:outline-none placeholder:text-gray-400 font-serif tracking-wide transition-all"
                        />
                    </form>

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={handelSearchToggle}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-black hover:scale-110 transition-all"
                    >
                        <HiMiniXMark className="h-7 w-7" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;