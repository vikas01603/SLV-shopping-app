import { useEffect, useState, useRef } from "react";
import { FaFilter, FaAngleRight } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import { motion } from "framer-motion";

const CollectionPage = () => {
    const { collection } = useParams();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const queryParams = Object.fromEntries([...searchParams]);
    const sidebarRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProductsByFilters({ collection, ...queryParams }));
    }, [dispatch, collection, searchParams]);

    const handleClickOutside = (e) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setIsSidebarOpen(false);
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    useEffect(() => {
        //Add event listener for click
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            //Clean event listener
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Main Container */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 lowercase font-medium tracking-wide">
                    <Link to="/" className="hover:text-black transition-colors">home</Link>
                    <FaAngleRight className="text-xs text-gray-400" />
                    <Link to="/collection" className="hover:text-black transition-colors">collection</Link>
                    {collection && (
                        <>
                            <FaAngleRight className="text-xs text-gray-400" />
                            <span className="text-black">{collection}</span>
                        </>
                    )}
                </nav>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">

                    {/* Mobile Filter Button */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden w-full bg-black text-white px-4 py-3 rounded-lg flex justify-center items-center gap-2 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                        <FaFilter className="text-xs" /> Filter
                    </button>

                    {/* Filter Sidebar */}
                    <aside
                        ref={sidebarRef}
                        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} z-50 fixed inset-y-0 left-0 w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:shadow-none lg:block h-full overflow-y-auto lg:overflow-visible lg:bg-transparent lg:z-auto p-6 lg:p-0 border-r lg:border-none border-gray-100`}
                    >
                        <h3 className="text-xl font-serif font-bold mb-6 hidden lg:block border-b border-gray-200 pb-4">Filters</h3>
                        <FilterSidebar />
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-gray-100 pb-6"
                        >
                            <div>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight capitalize mb-2">
                                    {collection ? `${collection} Collection` : "All Collection"}
                                </h2>
                                <p className="text-gray-500 text-sm tracking-wide">
                                    {products?.length || 0} Products found in this collection
                                </p>
                            </div>
                            <div className="w-full sm:w-auto">
                                <SortOptions />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <ProductGrid products={products} loading={loading} error={error} />
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};
export default CollectionPage;