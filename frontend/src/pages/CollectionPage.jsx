import { useEffect } from "react";
import { useState , useRef } from "react";
import {FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
const CollectionPage = () => {
    const {collection} = useParams();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const {products, loading,error} = useSelector((state) => state.products);
    const queryParams = Object.fromEntries([...searchParams]);
    const sidebarRef = useRef(null);
    const[isSidebarOpen, setIsSidebarOpen]=useState(false);

    useEffect(() => {
        dispatch(fetchProductsByFilters({collection, ...queryParams}));
    }, [dispatch, collection, searchParams]);

    const handleClickOutside = (e) => {
        if(sidebarRef.current && !sidebarRef.current.contains(e.target)){
            setIsSidebarOpen(false);
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    useEffect(() => {
        //Add event listener for click
        document.addEventListener("mousedown", handleClickOutside);

        return () =>{
            //Clean event listener
        document.removeEventListener("mousedown" ,handleClickOutside);
        };
    
    },[]);

    return <div className="flex flex-col lg:flex-row">
        {/**mobile filter button */}
        <button onClick={toggleSidebar}
         className="lg:hidden border p-2 flex justify-center items-center">
            <FaFilter className="mr-2" />Filters</button>

            {/**filter side bar for windows */}
            <div ref={sidebarRef} 
            className={`${isSidebarOpen ? "translate-x-0" :"-translate-x-full" } 
            fixed inset-y-0 z-50 left-0 w-64 bg-white transition-transform duration-300 overflow-y-auto h-screen lg:static lg:translate-x-0`}>
                <FilterSidebar/>
            </div>
            <div className="flex-grow p-4">
                <h2 className ="text-2xl uppercase mt-5 ml-4 mb-0">All Collection</h2>

                {/** Sort Options*/}
                <SortOptions/>

                {/**product grid */}
                <ProductGrid  products={products} loading={loading} error={error}/>
            </div>
    </div>
};
export default CollectionPage;