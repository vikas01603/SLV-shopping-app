import React from 'react';
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";

const Topbar = () => {
  return (
    <div className="bg-theme-gold text-[#2B2B2B]"> 

        <div className="container mx-auto flex justify-between items-center py-3 px-4">

            <div className="hidden md:flex items-center space-x-4">
                <a href="#" className="hover:text-[#B89B5E]">
                    <TbBrandMeta className="h-5 w-5"/>
                </a>
                <a href="#" className="hover:text-[#B89B5E]">
                    <IoLogoInstagram className="h-5 w-5"/>
                </a>
                <a href="#" className="hover:text-[#B89B5E]">
                    <RiTwitterXLine className="h-4 w-4"/>
                </a>
            </div>

            <div className="text-sm text-center flex-grow font-medium">
                <span>We Ship Top Quality - Sarees and Dress Materials!</span>
            </div>

            <div className="text-sm hidden md:block font-medium">
                <a href="tel:+1234567890" className="hover:text-[#2B2B2B]">
                    +91 7337847118
                </a>
            </div>

        </div>
    </div>
  )
}

export default Topbar;
