import React from 'react';
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";

const Topbar = () => {
  return (
    <div className="bg-neutral-dark text-white"> 

        <div className="container mx-auto flex justify-between items-center py-3 px-4">

            <div className="hidden md:flex items-center space-x-4">
                <a href="#" className="hover:text-gray-300 transition-colors">
                    <TbBrandMeta className="h-5 w-5"/>
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors">
                    <IoLogoInstagram className="h-5 w-5"/>
                </a>
                <a href="#" className="hover:text-gray-300 transition-colors">
                    <RiTwitterXLine className="h-4 w-4"/>
                </a>
            </div>

            <div className="text-sm text-center flex-grow font-medium italic tracking-wide">
                <span>We Ship Top Quality - Sarees and Dress Materials!</span>
            </div>

            <div className="text-sm hidden md:block font-medium">
                <a 
                    href="https://wa.me/917337847118" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 hover:text-[#25D366] transition-colors group"
                >
                    <FaWhatsapp className="h-4 w-4 text-gray-400 group-hover:text-[#25D366] transition-colors" />
                    <span>Chat on WhatsApp</span>
                </a>
            </div>

        </div>
    </div>
  )
}

export default Topbar;
