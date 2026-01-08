import { useEffect } from "react";
import { useState , useRef } from "react";
import {FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
const CollectionPage = () => {
    const [products,setProducts] = useState([]);
    const sidebarRef = useRef(null);
    const[isSidebarOpen, setIsSidebarOpen]=useState(false);

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

    useEffect(() => {
        setTimeout(() => {
            const fetchedProducts = [
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
            ]; setProducts(fetchedProducts);
        }, 1000)
    }, [])
    return <div className="flex flex-col lg:flex-row">
        {/**mobile filter button */}
        <button onClick={toggleSidebar}
         className="lg:hidden border p-2 flex justify-center items-center">
            <FaFilter className="mr-2" />Filters</button>

            {/**filter side bar for windows */}
            <div ref={sidebarRef} className={`${isSidebarOpen ? "translate-x-0" :"-translate-x-full" } fixed inset-y-0 z-50 left-0 w-64 bg-white transition-transform duration-300 overflow-y-auto h-screen  lg:static lg:translate-x-0`}>
                <FilterSidebar/>
            </div>
            <div className="flex-grow p-4">
                <h2 className ="text-2xl uppercase mt-5 ml-4 mb-0">All Collection</h2>

                {/** Sort Options*/}
                <SortOptions/>

                {/**product grid */}
                <ProductGrid  products={products}/>
            </div>
    </div>
};
export default CollectionPage;