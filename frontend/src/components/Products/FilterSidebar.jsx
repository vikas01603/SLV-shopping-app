import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: "",
        gender:"",
        color:"",
        size: [],
        material: [],
        brand:[],
        minPrice: 0,
        maxPrice: 15000
    });

    const [priceRange, setPriceRange] =useState([0,15000]);

    const categories = ["Top Wear", "Bottom Wear"];
    const colors = ["Red","Blue","Green","Yellow","Gray","White","Pink","Beige","Navy"];
    const sizes = ["XS","S","M","L","XL","XXL"];
    const materials = ["Cotton","Wool","Denim","Polyester","Silk","Linen","Viscose","Fleece"];
    const brands = ["Urban Threads","Modern Fit","Street Style","Beach Breeze","Fashioninsta","ChicStyle"];
    const genders = ["Men", "Women"];

    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        setFilters({
            category: params.category || "",
            gender: params.gender || "",
            color: params.color || "",
            size: params.size ? params.size.split(",") : [],
            material: params.material ? params.material.split(",") : [],
            brand: params.brand ? params.brand.split(",") : [],
            minPrice: params.minPrice || 0,
            maxPrice: params.maxPrice || 15000,
        });
        setPriceRange([0, params.maxPrice || 15000]);
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const {name,value,checked,type} = e.target;
        let newFilters = {...filters};

        if(type=== "checkbox"){
            if(checked){
                newFilters[name] = [...(newFilters[name] || []),value]
            }else{
                newFilters[name] = newFilters[name].filter((item) => item !== value);
            }
        }else{
            newFilters[name] = value;
        }
        setFilters(newFilters);
        updateURLParams(newFilters);
    };

    const updateURLParams = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach((key) => {
            if (Array.isArray(newFilters[key]) && newFilters[key].length > 0){
                params.append(key, newFilters[key].join(",")); 
            }else if (newFilters[key]){
                params.append(key, newFilters[key]);
            }
        });
        setSearchParams(params);
        navigate(`?${params.toString()}`);
    }

    const handlePriceChange = (e) =>{
        const newPrice = e.target.value;
        setPriceRange([0, newPrice])
        const newFilters = {...filters, minPrice:0 , maxPrice:newPrice};
        setFilters(newFilters);
        updateURLParams(newFilters);
    }

  return (
    <div className="p-5 bg-theme-gold rounded-2xl shadow-lg border border-gray-100 ml-3 mt-4 mb-6">

        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Filters
        </h3>

        {/* Category */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Category</p>
            {categories.map(category => (
                <label key={category} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                        type="radio"
                        name="category"
                        value={category}
                        onChange={handleFilterChange}
                        checked={filters.category === category}
                        className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span className="text-gray-800">{category}</span>
                </label>
            ))}
        </div>

        {/* Gender */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Gender</p>
            {genders.map(gender => (
                <label key={gender} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                        type="radio"
                        name="gender"
                        value={gender}
                        onChange={handleFilterChange}
                        checked={filters.gender === gender}
                        className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span className="text-gray-800">{gender}</span>
                </label>
            ))}
        </div>

        {/* Color */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Color</p>
            <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                    <button
                        key={color}
                        name="color"
                        value={color}
                        onClick={handleFilterChange}
                        className={`w-9 h-9 rounded-full border shadow-sm transition-all
                        hover:scale-110
                        ${filters.color === color ? "ring-2 ring-offset-2 ring-black" : ""}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                    />
                ))}
            </div>
        </div>

        {/* Size */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Size</p>
            {sizes.map(size => (
                <label key={size} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="size"
                        value={size}
                        onChange={handleFilterChange}
                        checked={filters.size.includes(size)}
                        className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span className="text-gray-800">{size}</span>
                </label>
            ))}
        </div>

        {/* Material */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Material</p>
            {materials.map(material => (
                <label key={material} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="material"
                        value={material}
                        onChange={handleFilterChange}
                        checked={filters.material.includes(material)}
                        className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span className="text-gray-800">{material}</span>
                </label>
            ))}
        </div>

        {/* Brand */}
        <div className="mb-7">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Brand</p>
            {brands.map(brand => (
                <label key={brand} className="flex items-center gap-3 mb-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="brand"
                        value={brand}
                        onChange={handleFilterChange}
                        checked={filters.brand.includes(brand)}
                        className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span className="text-gray-800">{brand}</span>
                </label>
            ))}
        </div>

        {/* Price */}
        <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Price</p>
            <input
                type="range"
                min={0}
                max={15000}
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="w-full accent-black"
            />
            <div className="flex justify-between text-sm text-gray-700 mt-2">
                <span>₹0</span>
                <span className="font-semibold">₹{priceRange[1]}</span>
            </div>
        </div>

    </div>
  );
};

export default FilterSidebar;
